import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
import { SITE } from './policy.mjs'

export async function verifyPublic({ release, config, output, credentials, expectOff = false }) {
  assert.equal(config.site, SITE)
  const adminPath = config.adminPath || '/tokri-backoffice'
  assert.match(adminPath, /^\/[A-Za-z0-9_-]+$/)
  const require = createRequire(path.join(release, 'package.json'))
  const { chromium } = require('playwright-core')
  const { getDiwaliStatus } = await import(pathToFileURL(path.join(release, 'src/lib/diwaliConfig.js')))
  const festive = getDiwaliStatus({ env: config.diwaliEnv }).isActive
  fs.mkdirSync(output, { recursive: true, mode: 0o700 })
  const browser = await chromium.launch({ executablePath: config.browserExecutable, headless: true })
  const problems = [], liveActivity = []
  let automaticDiscountEnabled
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
    await context.route('**/*', route => {
      const url = new URL(route.request().url())
      const host = url.hostname
      if (!['http:', 'https:'].includes(url.protocol)) return route.continue()
      if (/facebook|doubleclick|google-analytics|googletagmanager|razorpay|msg91/.test(host)) {
        liveActivity.push(host); return route.abort()
      }
      if (url.origin === SITE) return route.continue()
      // Existing public product photos may live on these image hosts. Never permit APIs.
      const publicImage = route.request().resourceType() === 'image' &&
        (['images.unsplash.com', 'www.bbassets.com'].includes(host) || host === 'tokriii.com' && url.pathname.startsWith('/uploads/'))
      if (publicImage) return route.continue()
      problems.push(`Unexpected remote request: ${url.origin}${url.pathname}`)
      return route.abort()
    })
    const page = await context.newPage()
    page.on('pageerror', error => problems.push(error.message))
    page.on('console', message => { if (message.type() === 'error') problems.push(message.text()) })
    page.on('response', response => {
      if (response.url().startsWith(`${SITE}/`) && response.status() >= 400) problems.push(`Broken staging response: ${response.status()} ${new URL(response.url()).pathname}`)
    })
    const response = await page.goto(`${SITE}/`, { waitUntil: 'domcontentloaded' })
    assert.equal(response.status(), 200)
    assert.match(response.headers()['x-robots-tag'] || '', /noindex/)
    assert.match(response.headers()['x-robots-tag'] || '', /nofollow/)
    assert.match(await page.locator('meta[name="robots"]').getAttribute('content'), /noindex.*nofollow/)
    const marker = await context.request.get(`${SITE}/__tokri_staging_release.json?sha=${path.basename(release)}`)
    assert.equal((await marker.json()).sha, path.basename(release))
    for (const alt of ['Home banner', 'Home highlight']) {
      const image = page.getByAltText(alt, { exact: true })
      await image.scrollIntoViewIfNeeded()
      await image.evaluate(img => img.decode())
      assert.ok(await image.evaluate(img => img.naturalWidth > 0))
    }
    await page.locator('a[href="https://play.google.com/store/apps/details?id=com.tokriii.app&hl=en_IN"]').waitFor({ state: 'attached' })
    const logo = page.locator('header img[src*="tokri-logo"]').filter({ visible: true }).first()
    await logo.waitFor()
    const logoResponse = await context.request.get(new URL(await logo.getAttribute('src'), SITE).href)
    assert.equal(createHash('sha256').update(await logoResponse.body()).digest('hex'), createHash('sha256').update(fs.readFileSync(path.join(release, 'src/assets/tokri-logo.png'))).digest('hex'))
    assert.equal((await context.request.get(`${SITE}/favicon.ico?v=2`)).status(), 200)
    assert.equal(await page.evaluate(async () => {
      const image = new Image(); image.src = '/favicon-32x32.png?v=2'; await image.decode()
      const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height
      const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0)
      const data = ctx.getImageData(0, 0, image.width, image.height).data
      return data.some((value, index) => index % 4 === 3 && value === 0)
    }), true, 'Favicon must retain transparent pixels')
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 }); await page.evaluate(() => scrollTo(0, 0))
      if (festive) {
        await page.locator('[data-testid="diwali-navbar-atmosphere"]').filter({ visible: true }).first().waitFor()
        await page.locator('[data-testid="diwali-atmosphere"] svg').filter({ visible: true }).first().waitFor()
        for (const side of ['leftWing', 'rightWing']) await page.locator(`[data-testid="diwali-atmosphere"] [class*="${side}"] svg`).filter({ visible: true }).first().waitFor()
        if (width === 390) for (const side of ['mobileLeftDiya', 'mobileRightDiya']) await page.locator(`[data-testid="diwali-navbar-atmosphere"] [class*="${side}"] svg`).filter({ visible: true }).first().waitFor()
        const geometry = await page.getByAltText('Home banner', { exact: true }).evaluate(img => {
          const section = img.closest('section'), decoration = section.querySelector('[class*="ambientBackdrop"]')
          return { headerBottom: document.querySelector('header').getBoundingClientRect().bottom, top: decoration.getBoundingClientRect().top }
        })
        assert.ok(Math.abs(geometry.headerBottom - geometry.top) <= 1, 'Gap between navbar and hero decoration')
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
      await page.screenshot({ path: path.join(output, `homepage-${width}.png`), fullPage: true })
    }
    const productsResponse = await context.request.get(`${SITE}/api/v1/products?limit=1`)
    assert.equal(productsResponse.status(), 200)
    const products = await productsResponse.json()
    const product = (Array.isArray(products) ? products : products.products)?.[0]
    assert.ok(product?.slug || product?.id, 'Staging catalog is empty; do not seed it automatically')
    const body = { items: [{ slug: product.slug || product.id, quantity: 1 }], deliveryOption: 'morning' }
    const quoteResponse = await context.request.post(`${SITE}/api/v1/checkout/quote`, { data: body })
    assert.equal(quoteResponse.status(), 200)
    const quote = await quoteResponse.json()
    assert.equal(quote.totals.itemsTotal, Number(product.priceValue))
    assert.ok(Object.hasOwn(quote.totals, 'automaticDiscount'))
    const tampered = await context.request.post(`${SITE}/api/v1/checkout/quote`, { data: { ...body, discount: 999999 } })
    assert.equal((await tampered.json()).totals.grandTotal, quote.totals.grandTotal)
    // Guest cart storage is browser-local: verify both rendered totals without writing an order.
    await page.evaluate(product => localStorage.setItem('tokri_cart_v1', JSON.stringify([
      { id: product.slug || product.id, name: product.name, priceValue: Number(product.priceValue), quantity: 1 },
    ])), product)
    const money = `₹${Number(quote.totals.grandTotal).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
    for (const route of ['cart', 'checkout']) {
      const quoteReady = page.waitForResponse(response => new URL(response.url()).pathname === '/api/v1/checkout/quote' && response.ok())
      await page.goto(`${SITE}/${route}`)
      assert.equal((await (await quoteReady).json()).totals.grandTotal, quote.totals.grandTotal)
      await page.getByText(money, { exact: true }).filter({ visible: true }).first().waitFor()
      await page.screenshot({ path: path.join(output, `${route}.png`), fullPage: true })
    }
    // Login only to a purpose-created staging admin; never create an order, request OTP or pay.
    await page.goto(`${SITE}${adminPath}/login`)
    await page.locator('input[name="email"]').fill(credentials.STAGING_SMOKE_ADMIN_EMAIL)
    await page.locator('input[name="password"]').fill(credentials.STAGING_SMOKE_ADMIN_PASSWORD)
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    await page.waitForURL(url => url.origin === SITE && !url.pathname.endsWith('/login'))
    await page.goto(`${SITE}${adminPath}/resources/AutomaticDiscount/records/1/edit`)
    const enabled = page.getByRole('checkbox', { name: 'Enable automatic discounts', exact: true })
    await enabled.waitFor()
    automaticDiscountEnabled = await enabled.isChecked()
    if (expectOff) assert.equal(automaticDiscountEnabled, false, 'Initial discount configuration must stay OFF')
    await page.screenshot({ path: path.join(output, 'admin-automatic-discounts.png'), fullPage: true })
    assert.deepEqual(problems, [], 'Browser/asset verification failed')
    assert.deepEqual(liveActivity, [], 'Staging attempted production analytics, payment or messaging activity')
    fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify({ sha: path.basename(release), site: SITE, festive, automaticDiscountEnabled, verifiedAt: new Date().toISOString(), screenshots: ['homepage-1440.png', 'homepage-390.png', 'admin-automatic-discounts.png', 'cart.png', 'checkout.png'], liveActivity, problems }), { mode: 0o600 })
  } finally { await browser.close() }
}
