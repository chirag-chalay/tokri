import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright-core'
const url = new URL(process.env.DATABASE_URL || 'mysql://invalid')
assert.equal(url.hostname, '127.0.0.1')
assert.equal(url.port, '13318')
assert.equal(url.pathname, '/tokri_manual_coupons_test')
const { prisma } = await import('../server/src/lib/prisma.js')
const { replaceCart } = await import('../server/src/services/cart.js')
const { signCustomerToken } = await import('../server/src/services/jwt.js')
const web = process.env.TOKRIII_TEST_SITE || 'http://localhost:5241',
  shots =
    process.env.TOKRIII_TEST_SCREENSHOTS || 'docs/manual-coupons/screenshots'
assert.ok(
  ['localhost', '127.0.0.1'].includes(new URL(web).hostname),
  'Browser regression must target a local test server',
)
await mkdir(shots, { recursive: true })
const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: true,
})
const errors = []
try {
  const customer = await prisma.customer.findUnique({
    where: { phone: '9999900511' },
  })
  await replaceCart(customer.id, [{ slug: 'manual-fruit', quantity: 1 }])
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
  })
  const page = await context.newPage()
  page.on('pageerror', (e) => errors.push(e.message))
  let latest
  page.on('response', async (r) => {
    if (r.url().endsWith('/checkout/quote') && r.ok()) latest = await r.json()
  })
  await page.addInitScript(
    ({ customer, token }) => {
      if (!localStorage.getItem('coupon-browser-initialized')) {
        localStorage.setItem(
          'tokri_user',
          JSON.stringify({ ...customer, token }),
        )
        localStorage.setItem(
          `tokri_selected_address_${customer.phone}`,
          'coupon-address',
        )
        localStorage.setItem('coupon-browser-initialized', '1')
      }
    },
    { customer, token: signCustomerToken(customer) },
  )
  const section = () => page.getByRole('region', { name: 'Available Coupons' })
  const card = (percent) =>
    section()
      .locator('article')
      .filter({ has: page.getByText(`${percent}% OFF`, { exact: true }) })
  const ready = async () => {
    await section()
      .getByRole('button', { name: 'Apply', exact: true })
      .first()
      .waitFor()
    await page.waitForFunction(
      () =>
        !document.body.innerText.includes('Checking available coupons…') &&
        document
          .querySelector('section[aria-label="Available Coupons"]')
          ?.parentElement.getAttribute('aria-busy') !== 'true',
    )
  }
  const apply = async (percent) => {
    await card(percent)
      .getByRole('button', { name: 'Apply', exact: true })
      .click()
    await card(percent).getByText('Applied', { exact: true }).waitFor()
    await page.waitForFunction(
      () =>
        !document.body.innerText.includes('Checking available coupons…') &&
        document
          .querySelector('section[aria-label="Available Coupons"]')
          ?.parentElement.getAttribute('aria-busy') !== 'true',
    )
  }
  await page.goto(`${web}/checkout`)
  await ready()
  assert.equal(latest.totals.discount, 0)
  assert.equal(await section().locator('article').count(), 3)
  await page.screenshot({
    path: `${shots}/checkout-unselected-desktop.png`,
    fullPage: true,
  })
  for (const [percent, expected] of [
    [5, 75],
    [10, 150],
    [15, 225],
  ]) {
    await apply(percent)
    assert.equal(latest.totals.discount, expected)
    assert.equal(
      await section().getByText('Applied', { exact: true }).count(),
      1,
    )
  }
  await page.screenshot({
    path: `${shots}/checkout-selected-desktop.png`,
    fullPage: true,
  })
  await page.reload()
  await card(15).getByText('Applied', { exact: true }).waitFor()
  console.log('PASS refresh restores valid explicit selection')
  // Real backend price update invalidates a selected coupon; the browser receives the current authoritative quote.
  await prisma.product.update({
    where: { slug: 'manual-fruit' },
    data: { priceValue: 1200 },
  })
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await page
    .getByText(
      'Your 15% coupon was removed because your cart is now below ₹1,500.',
      { exact: true },
    )
    .waitFor()
  await card(10).getByRole('button', { name: 'Apply', exact: true }).waitFor()
  assert.equal(latest.totals.discount, 0)
  assert.equal(await section().getByText('Applied', { exact: true }).count(), 0)
  await page.screenshot({
    path: `${shots}/checkout-invalidated.png`,
    fullPage: true,
  })
  await prisma.product.update({
    where: { slug: 'manual-fruit' },
    data: { priceValue: 1600 },
  })
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await card(15).getByRole('button', { name: 'Apply', exact: true }).waitFor()
  assert.equal(latest.totals.discount, 0)
  await apply(10)
  assert.equal(latest.totals.discount, 160)
  await prisma.product.update({
    where: { slug: 'manual-fruit' },
    data: { priceValue: 1200 },
  })
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await page.waitForResponse(
    async (r) =>
      r.url().endsWith('/checkout/quote') &&
      r.ok() &&
      (await r.json()).totals.couponDiscount === 120,
  )
  await card(10)
    .getByText('Save ₹120', { exact: false })
    .waitFor()
    .catch(() => card(10).getByText('You save ₹120', { exact: true }).waitFor())
  assert.equal(latest.totals.discount, 120)
  await card(10).getByRole('button', { name: 'Remove', exact: true }).click()
  await card(10).getByRole('button', { name: 'Apply', exact: true }).waitFor()
  assert.equal(latest.totals.discount, 0)
  // Manual code can replace a selected offer; it remains one coupon.
  await page.getByPlaceholder('Enter code').fill('PRIVATE50')
  await page
    .locator('form')
    .filter({ has: page.getByPlaceholder('Enter code') })
    .getByRole('button', { name: 'Apply', exact: true })
    .click()
  await page.getByText('Selected: PRIVATE50', { exact: true }).waitFor()
  await ready()
  assert.equal(latest.totals.discount, 50)
  await page.getByRole('button', { name: 'Remove coupon', exact: true }).click()
  await ready()
  await prisma.product.update({
    where: { slug: 'manual-fruit' },
    data: { priceValue: 800 },
  })
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await page.getByText('Locked — Add ₹300 more', { exact: true }).waitFor()
  await page.getByText('Locked — Add ₹700 more', { exact: true }).waitFor()
  await page.setViewportSize({ width: 360, height: 900 })
  await page.screenshot({
    path: `${shots}/checkout-locked-mobile.png`,
    fullPage: true,
  })
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  )
  await page.reload()
  await ready()
  assert.equal(latest.totals.discount, 0)
  console.log(
    'PASS selection, switching, invalidation, no reapply, eligible retention, manual entry, refresh, mobile overflow',
  )
  // Real cart item removal: 1200 base + 400 addon, selected 15%, remove addon.
  for (const data of [
    { slug: 'coupon-base', name: 'Coupon base', priceValue: 1200 },
    { slug: 'coupon-addon', name: 'Coupon addon', priceValue: 400 },
  ])
    await prisma.product.upsert({
      where: { slug: data.slug },
      create: data,
      update: data,
    })
  await replaceCart(customer.id, [
    { slug: 'coupon-base', quantity: 1 },
    { slug: 'coupon-addon', quantity: 1 },
  ])
  await page.setViewportSize({ width: 1440, height: 1100 })
  await page.goto(`${web}/checkout`)
  await ready()
  await apply(15)
  assert.equal(latest.totals.discount, 240)
  await page.goto(`${web}/cart`)
  // Scope Remove to the product row, not the selected coupon's Remove action.
  const productRow = page
    .getByRole('heading', { name: 'Coupon addon', exact: true })
    .locator('xpath=ancestor::div[.//button[normalize-space(.)="Remove"]][1]')
  await productRow.getByRole('button', { name: 'Remove', exact: true }).click()
  await page
    .getByText(
      'Your 15% coupon was removed because your cart is now below ₹1,500.',
      { exact: true },
    )
    .filter({ visible: true })
    .first()
    .waitFor()
  assert.equal(latest.totals.discount, 0)
  console.log('PASS real item removal invalidates selected coupon')
  // Real quantity updates, including a delayed apply response for an old cart.
  await replaceCart(customer.id, [{ slug: 'coupon-addon', quantity: 4 }])
  await page.goto(`${web}/cart`)
  await ready()
  await apply(15)
  await page.getByRole('button', { name: '–', exact: true }).click()
  await page
    .getByText(
      'Your 15% coupon was removed because your cart is now below ₹1,500.',
      { exact: true },
    )
    .filter({ visible: true })
    .first()
    .waitFor()
  assert.equal(latest.totals.discount, 0)
  await page.getByRole('button', { name: '+', exact: true }).click()
  await card(15).getByRole('button', { name: 'Apply', exact: true }).waitFor()
  assert.equal(latest.totals.discount, 0)
  await apply(10)
  await page.getByRole('button', { name: '–', exact: true }).click()
  await card(10).getByText('You save ₹120', { exact: true }).waitFor()
  await card(10).getByRole('button', { name: 'Remove', exact: true }).click()
  await page.getByRole('button', { name: '+', exact: true }).click()
  await card(15).getByRole('button', { name: 'Apply', exact: true }).waitFor()
  let releasePreview, previewStarted
  const started = new Promise((resolve) => {
    previewStarted = resolve
  })
  const held = new Promise((resolve) => {
    releasePreview = resolve
  })
  const holdPreview = async (route) => {
    const response = await route.fetch()
    previewStarted()
    await held
    await route.fulfill({ response })
  }
  await page.route('**/checkout/preview-coupon', holdPreview)
  await card(15).getByRole('button', { name: 'Apply', exact: true }).click()
  await started
  await page.getByRole('button', { name: '–', exact: true }).click()
  await card(15).getByRole('button', { name: 'Locked', exact: true }).waitFor()
  // Return to the original quantities before the old response arrives. A cart
  // revision still invalidates that old request even though the key matches again.
  await page.getByRole('button', { name: '+', exact: true }).click()
  await card(15).getByRole('button', { name: 'Apply', exact: true }).waitFor()
  const completed = page.waitForResponse((response) =>
    response.url().endsWith('/checkout/preview-coupon'),
  )
  releasePreview()
  await completed
  await card(10)
    .getByRole('button', { name: 'Apply', exact: true })
    .waitFor({ state: 'visible' })
  await page.waitForFunction(() =>
    [
      ...document.querySelectorAll(
        'section[aria-label="Available Coupons"] button',
      ),
    ].some(
      (button) =>
        button.textContent === 'Apply' &&
        !button.disabled &&
        button.getAttribute('aria-disabled') !== 'true',
    ),
  )
  assert.equal(await section().getByText('Applied', { exact: true }).count(), 0)
  assert.equal(latest.totals.discount, 0)
  await page.unroute('**/checkout/preview-coupon', holdPreview)
  console.log(
    'PASS quantity decrease/increase, eligible retention, delayed apply response cannot resurrect removed coupon',
  )
  const admin = await browser.newPage({
    viewport: { width: 1440, height: 1050 },
  })
  admin.on('pageerror', (e) => errors.push(e.message))
  await admin.goto(`${web}/tokri-backoffice/login`)
  await admin.locator('input[name="email"]').fill('admin@tokriii.com')
  await admin
    .locator('input[name="password"]')
    .fill(process.env.TOKRIII_TEST_ADMIN_PASSWORD || 'local-coupon-preview')
  await admin.getByRole('button', { name: 'Sign in', exact: true }).click()
  await admin.waitForURL((u) => !u.pathname.endsWith('/login'))
  assert.equal(
    await admin.getByText('Automatic Discounts', { exact: true }).count(),
    0,
  )
  const coupon = await prisma.coupon.findUnique({ where: { code: 'TOKRII15' } })
  await admin.goto(
    `${web}/tokri-backoffice/resources/Coupon/records/${coupon.id}/edit`,
  )
  await admin
    .getByLabel('Show publicly in checkout Available Coupons')
    .waitFor()
  await admin.screenshot({
    path: `${shots}/admin-coupon-edit.png`,
    fullPage: true,
  })
  const saveAdmin = async () => {
    const [response] = await Promise.all([
      admin.waitForResponse(
        (response) =>
          response.request().method() === 'POST' &&
          response.url().includes('/api/resources/Coupon/records/'),
      ),
      admin.getByRole('button', { name: 'Save coupon', exact: true }).click(),
    ])
    assert.equal(response.ok(), true)
    assert.notEqual((await response.json()).notice?.type, 'error')
  }
  await admin.getByLabel('Percent value', { exact: true }).fill('12')
  await admin.getByLabel('Min cart (₹)', { exact: true }).fill('1300')
  await saveAdmin()
  assert.equal(
    Number(
      (await prisma.coupon.findUnique({ where: { id: coupon.id } })).value,
    ),
    12,
  )
  await page.goto(`${web}/checkout`)
  await page.getByText('12% OFF', { exact: true }).waitFor()
  await admin
    .getByLabel('Show publicly in checkout Available Coupons')
    .uncheck()
  await saveAdmin()
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await page.getByText('12% OFF', { exact: true }).waitFor({ state: 'hidden' })
  assert.equal(
    (await prisma.coupon.findUnique({ where: { id: coupon.id } }))
      .showAtCheckout,
    false,
  )
  await admin.getByLabel('Percent value', { exact: true }).fill('15')
  await admin.getByLabel('Min cart (₹)', { exact: true }).fill('1500')
  await admin.getByLabel('Show publicly in checkout Available Coupons').check()
  await saveAdmin()
  console.log(
    'PASS real AdminJS save changes percentage/minimum/public visibility without a rebuild',
  )
  assert.deepEqual(errors, [])
  console.log(
    'PASS AdminJS coupon visibility control, retired menu absent, no browser exceptions',
  )
} finally {
  await prisma.product.update({
    where: { slug: 'manual-fruit' },
    data: { priceValue: 1500 },
  })
  await prisma.coupon.update({
    where: { code: 'TOKRII15' },
    data: { value: 15, minCart: 1500, isActive: true, showAtCheckout: true },
  })
  await browser.close()
  await prisma.$disconnect()
}
