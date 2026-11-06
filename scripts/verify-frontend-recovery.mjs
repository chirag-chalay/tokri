// Run against an isolated Next production build. Only public GETs reach staging.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { spawn } from 'node:child_process'
import { chromium } from 'playwright-core'
import { createFrontendErrorsRouter } from '../server/src/routes/frontendErrors.js'
import { createFrontendErrorWriter } from '../server/src/services/frontendErrors.js'
const require = createRequire(new URL('../server/package.json', import.meta.url))
const express = require('express')
const build = process.env.VERIFY_BUILD_DIR
assert.ok(build && build.startsWith(os.tmpdir() + '/tokri-frontend-verify-'), 'Supply isolated VERIFY_BUILD_DIR')
const staging = 'http://127.0.0.1:5222'
const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'tokri-browser-logs-'))
const app = express()
app.use('/api/v1/frontend-errors', createFrontendErrorsRouter({ allowedOrigins: ['https://tokriii.com'], write: createFrontendErrorWriter({ directory }) }))
app.use('/api/v1/diagnostic-fail', (_req, res) => res.sendStatus(503))
app.use(async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Test permits public GETs only' })
  const response = await fetch(staging + req.originalUrl)
  res.status(response.status).type(response.headers.get('content-type') || 'application/json').send(Buffer.from(await response.arrayBuffer()))
})
const bridge = app.listen(5342, '127.0.0.1')
const next = spawn(process.execPath, [path.resolve('node_modules/next/dist/bin/next'), 'start', '--hostname', '127.0.0.1', '--port', '5341'], { cwd: build, env: { ...process.env, TOKRIII_SERVER_API_ORIGIN: staging, TOKRIII_META_PIXEL_ENABLED: 'false', NEXT_TELEMETRY_DISABLED: '1' }, stdio: ['ignore', 'pipe', 'pipe'] })
let output = ''
next.stdout.on('data', (chunk) => { output += chunk }); next.stderr.on('data', (chunk) => { output += chunk })
let browser
const summary = { cases: [], logDirectory: directory }
try {
  for (let attempt = 0; attempt < 100; attempt++) {
    try { if ((await fetch('http://127.0.0.1:5341/robots.txt')).ok) break } catch { /* Booting. */ }
    if (attempt === 99) throw new Error(output)
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || path.join(os.homedir(), '.cache/ms-playwright/chromium-1243/chrome-linux64/chrome'), headless: true, ignoreDefaultArgs: ['--disable-back-forward-cache'], args: ['--no-sandbox'] })
  for (const [name, mobile, consent] of [['mobile-granted', true, 'granted'], ['mobile-denied', true, 'denied'], ['desktop-granted', false, 'granted']]) {
    const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 }, isMobile: mobile, hasTouch: true, deviceScaleFactor: 2 })
    await context.addCookies([{ name: 'tokriii_marketing_consent', value: consent, domain: 'tokriii.com', path: '/', secure: true }])
    let metaRequests = 0
    await context.route('**/*', async (route) => {
      const url = new URL(route.request().url())
      if (/facebook\.net|facebook\.com/.test(url.hostname)) { metaRequests++; return route.abort() }
      if (url.hostname === 'tokriii.com') {
        if (url.pathname === '/api/v1/diagnostic-network') return route.abort('failed')
        return route.fulfill({ response: await route.fetch({ url: 'http://127.0.0.1:5341' + url.pathname + url.search }) })
      }
      if (url.hostname === 'server.tokriii.com' && url.pathname.startsWith('/uploads/')) {
        return route.fulfill({ response: await route.fetch({ url: staging + url.pathname }) })
      }
      return route.abort()
    })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    const cdp = await context.newCDPSession(page)
    if (mobile) await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
    await page.goto('https://tokriii.com/', { waitUntil: 'networkidle' })
    assert.ok(await page.evaluate(() => !!window.__tokriFrontendErrors))
    const firstProduct = (await (await fetch(staging + '/api/v1/products?flag=bestSeller&limit=12')).json())[0]
    const href = `/product/${firstProduct.slug || firstProduct.id}`
    const cycles = mobile ? 10 : 3
    for (let index = 0; index < cycles; index++) {
      await page.locator('article[role="link"]').filter({ has: page.getByRole('heading', { name: firstProduct.name, exact: true }) }).first().locator('h3').click()
      await page.waitForURL('**' + href)
      const control = page.locator('main').getByRole('button', { name: 'Add to cart', exact: true })
      if (index === 0) await control.click()
      await page.locator('main').getByRole('button', { name: 'Increase quantity', exact: true }).first().click()
      await page.locator('main').getByRole('button', { name: 'Decrease quantity', exact: true }).first().click()
      if (mobile && index % 2) await page.getByRole('button', { name: 'Go back', exact: true }).click()
      else await page.goBack()
      await page.waitForURL('https://tokriii.com/')
      const search = page.locator('header input[type="text"]').filter({ visible: true }).first()
      await search.fill('banana')
      assert.equal(await search.inputValue(), 'banana')
      await search.fill('')
      await search.blur()
      if (mobile) {
        const before = await page.evaluate(() => window.scrollY)
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 300, y: 720 }] })
        for (let step = 1; step <= 8; step++) {
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 300, y: 720 - step * 35 }] })
          await page.waitForTimeout(16)
        }
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
        await page.waitForTimeout(100)
        assert.ok(await page.evaluate(() => window.scrollY) > before, 'Touch scroll must respond after return')
      }
      const cart = await page.evaluate(() => JSON.parse(localStorage.getItem('tokri_cart_v1')))
      assert.equal(cart[0].quantity, 1)
      assert.equal(await page.locator('iframe[src*="facebook"], form[action*="facebook"]').count(), 0)
    }
    await page.reload({ waitUntil: 'networkidle' })
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('tokri_cart_v1'))[0].quantity), 1)
    assert.deepEqual(errors, [])
    assert.equal(metaRequests, 0)
    summary.cases.push({ name, completedReturns: cycles, exceptions: errors.length, metaRequests, cartPersisted: true })
    console.log(`${name}: ${cycles} returns, zero exceptions, cart persisted, no Meta requests`)
    if (name === 'mobile-granted') {
      await page.evaluate(() => {
        setTimeout(() => { throw new Error('diagnostic-js token=private-value') }, 0)
        Promise.reject(new Error('diagnostic-rejection'))
        console.error('diagnostic-console', new Error('diagnostic-react-style'))
        const image = new Image(); document.body.appendChild(image); image.src = '/api/v1/diagnostic-fail'
        fetch('/api/v1/diagnostic-fail?token=private-value')
        fetch('/api/v1/diagnostic-network').catch(() => {})
        const xhr = new XMLHttpRequest(); xhr.open('GET', '/api/v1/diagnostic-fail'); xhr.send()
      })
      await page.waitForTimeout(4500)
      const content = await fs.readFile(path.join(directory, 'website-frontend-errors.jsonl'), 'utf8')
      const events = content.trim().split('\n').map(JSON.parse)
      for (const kind of ['javascript', 'unhandledrejection', 'console', 'resource', 'http', 'network']) assert.ok(events.some((event) => event.kind === kind), 'Missing log category ' + kind)
      assert.doesNotMatch(content, /private-value/)
      summary.capturedErrorKinds = [...new Set(events.map((event) => event.kind))]
      // A repeated error storm must be deduplicated without blocking input.
      await page.evaluate(() => { for (let index = 0; index < 200; index++) window.__tokriFrontendErrors.capture('console', 'diagnostic-repeat') })
      await page.waitForTimeout(1500)
      const afterBurst = (await fs.readFile(path.join(directory, 'website-frontend-errors.jsonl'), 'utf8')).trim().split('\n').map(JSON.parse)
      assert.equal(afterBurst.filter((event) => event.message === 'diagnostic-repeat').length, 1)
      summary.errorStormDeduplicated = true
    }
    await context.close()
  }
  summary.environment = 'Isolated production build; Chromium mobile emulation; public staging GET data; no physical-device or live deployment validation'
  if (process.env.VERIFY_REPORT_FILE) await fs.writeFile(process.env.VERIFY_REPORT_FILE, JSON.stringify(summary, null, 2) + '\n')
  console.log(JSON.stringify(summary, null, 2))
} finally {
  await browser?.close()
  next.kill('SIGTERM')
  bridge.closeAllConnections()
  await new Promise((resolve) => bridge.close(resolve))
}
