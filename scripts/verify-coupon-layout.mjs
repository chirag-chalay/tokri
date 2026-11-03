import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { chromium } from 'playwright-core'
const { calcCartTotals } = await import('../server/src/config/charges.js')
const site = process.env.TEST_SITE || 'http://localhost:5241'
assert.ok(
  ['localhost', '127.0.0.1'].includes(new URL(site).hostname),
  'Layout test must target a local server',
)
const strict = process.env.EXPECT_STABLE !== '0'
const rows = []
const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: true,
})
for (const width of [1440, 360]) {
  const context = await browser.newContext({
    viewport: { width, height: 1000 },
  })
  const page = await context.newPage()
  let navigations = 0
  const browserErrors = []
  page.on('framenavigated', (frame) => { if (frame === page.mainFrame()) navigations += 1 })
  page.on('pageerror', (error) => browserErrors.push(error.message))
  const user = {
    id: 'flicker-user',
    name: 'Flicker Test',
    phone: '9999900611',
    token: 'flicker-test-token',
  }
  const items = [
    {
      slug: 'flicker-fruit',
      id: 'flicker-fruit',
      name: 'Coupon Test Fruit',
      priceValue: 500,
      price: '₹500',
      quantity: 3,
      isTaxable: true,
      gstRate: 5,
    },
  ]
  const address = {
    id: 'flicker-address',
    name: user.name,
    phone: user.phone,
    line1: 'Test House',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    serviceable: true,
    delivery: {
      serviceable: true,
      morning: { enabled: true },
      express: { enabled: true },
      defaultOption: 'morning',
    },
  }
  let requests = 0,
    previews = 0,
    failQuote = false,
    failPreview = false,
    holdNextQuote = null
  const rates = {
    option: 'morning',
    morning: { fee: 25 },
    express: { fee: 99 },
    handlingCharge: 2,
  }
  const offerRows = [
    { percentage: 5, minimumSubtotal: 700 },
    { percentage: 10, minimumSubtotal: 1100 },
    { percentage: 15, minimumSubtotal: 1500 },
  ]
  const result = (body) => {
    const cart = (body.items || []).map((x) => ({
      ...items[0],
      quantity: x.quantity,
    }))
    const amount = cart.reduce((n, x) => n + x.quantity * x.priceValue, 0)
    const selected = offerRows.find(
      (x) => `TOKRII${x.percentage}` === (body.couponCode || body.code),
    )
    const eligible = selected && amount >= selected.minimumSubtotal
    const discount = eligible
      ? Math.round(amount * selected.percentage) / 100
      : 0
    const totals = calcCartTotals(
      cart,
      { ...rates, option: body.deliveryOption || 'morning' },
      discount,
    )
    totals.couponDiscount = discount
    totals.discountMessage = discount
      ? `Coupon TOKRII${selected.percentage} applied.`
      : null
    const code = eligible ? `TOKRII${selected.percentage}` : null
    const option = {
      title: 'Morning Delivery',
      subtitle: 'Freshness Guaranteed',
      deliveryFee: 25,
      minimumMet: true,
      minimumOrderValue: 0,
      freeDeliveryApplied: false,
    }
    return {
      totals,
      items: cart,
      couponStatus: code
        ? { status: 'applied', code }
        : selected
          ? {
              status: 'removed',
              code: `TOKRII${selected.percentage}`,
              message: `Your ${selected.percentage}% coupon was removed because your cart is now below ₹${selected.minimumSubtotal.toLocaleString('en-IN')}.`,
            }
          : null,
      availableCoupons: offerRows.map((x) => ({
        ...x,
        id: String(x.percentage),
        code: `TOKRII${x.percentage}`,
        label: `${x.percentage}% OFF`,
        eligible: amount >= x.minimumSubtotal,
        amountToUnlock: Math.max(0, x.minimumSubtotal - amount),
        estimatedSavings:
          amount >= x.minimumSubtotal
            ? Math.round(amount * x.percentage) / 100
            : 0,
        applied: code === `TOKRII${x.percentage}`,
      })),
      deliveryType: 'morning',
      options: {
        morning: option,
        express: {
          ...option,
          title: 'Same Day',
          deliveryFee: 99,
          minimumOrderValue: 1251,
          minimumMet: amount >= 1251,
        },
      },
    }
  }
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url())
    if (!['localhost', '127.0.0.1'].includes(url.hostname)) return route.abort()
    if (!url.pathname.startsWith('/api/v1/')) return route.continue()
    const path = url.pathname.slice(7)
    const body =
      route.request().method() === 'POST' || route.request().method() === 'PUT'
        ? route.request().postDataJSON() || {}
        : {}
    const send = (data) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(data),
      })
    if (path === '/auth/me') return send({ user })
    if (path === '/account/addresses') return send({ addresses: [address] })
    if (path === '/account/cart') return send({ cart: { items } })
    if (path === '/checkout/config')
      return send({ razorpay: { enabled: false }, codEnabled: true })
    if (path === '/app/bootstrap')
      return send({
        settings: {},
        categories: [],
        bestSellers: [],
        imported: [],
        featured: [],
        reviews: [],
        charges: {
          delivery: {
            morning: { fee: 25 },
            express: { fee: 99 },
            handlingCharge: 2,
          },
        },
      })
    if (path === '/checkout/quote') {
      requests++
      const data = result(body)
      const held = body.items?.[0]?.quantity === 2 ? holdNextQuote : null
      if (held) holdNextQuote = null
      if (held) {
        held.started()
        await held.wait
      }
      await new Promise((r) => setTimeout(r, 650))
      if (failQuote) {
        failQuote = false
        return route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Quote temporarily unavailable. Please retry.',
          }),
        })
      }
      return send(data)
    }
    if (path === '/checkout/preview-coupon') {
      previews++
      const data = result(body)
      await new Promise((r) => setTimeout(r, 200))
      if (failPreview) {
        failPreview = false
        return route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Coupon validation temporarily unavailable.',
          }),
        })
      }
      return send({
        coupon: {
          code: body.code,
          discount: data.totals.discount,
          message: data.totals.discountMessage,
        },
        totals: data.totals,
      })
    }
    if (path === '/checkout/create-order')
      throw new Error('Payment must not be invoked by layout test')
    return send({})
  })
  await page.addInitScript(
    ({ user, items }) => {
      localStorage.setItem('tokri_user', JSON.stringify(user))
      localStorage.setItem('tokri_cart_v1', JSON.stringify(items))
      localStorage.setItem(
        `tokri_selected_address_${user.phone}`,
        'flicker-address',
      )
    },
    { user, items },
  )
  await page.goto(`${site}/checkout`)
  const section = page.getByRole('region', { name: 'Available Coupons' })
  const pay = page.getByRole('button', {
    name: 'Place order (Cash on delivery)',
    exact: true,
  })
  await pay.waitFor()
  await page.waitForFunction(() => {
    const b = [...document.querySelectorAll('button')].find(
      (b) => b.textContent === 'Place order (Cash on delivery)',
    )
    return b && !b.disabled
  })
  const initialNavigations = navigations
  const initialTimeOrigin = await page.evaluate(() => performance.timeOrigin)
  for (const action of ['5', '10', '15', 'remove', '15', '5', 'remove']) {
    const article = section.locator('article').filter({
      has: page.getByText(`${action === 'remove' ? '5' : action}% OFF`, {
        exact: true,
      }),
    })
    const button =
      action === 'remove'
        ? page.getByRole('button', { name: 'Remove coupon', exact: true })
        : article.getByRole('button', { name: 'Apply', exact: true })
    await button.scrollIntoViewIfNeeded()
    await button.focus()
    await page.evaluate(() => {
      const section = document.querySelector(
          'section[aria-label="Available Coupons"]',
        ),
        input = document.querySelector('input[placeholder="Enter code"]'),
        aside = document.querySelector('aside')
      const state = (window.__measure = {
        initialCards: [...section.querySelectorAll('article')],
        input,
        initialScroll: scrollY,
        initialInputY: input.getBoundingClientRect().top + scrollY,
        initialAside: aside.getBoundingClientRect().height,
        minCards: 3,
        maxAsideDelta: 0,
        maxInputDelta: 0,
        maxScrollDelta: 0,
        lostCards: false,
        samples: 0,
        stop: false,
      })
      const tick = () => {
        if (state.stop) return
        state.samples++
        state.minCards = Math.min(
          state.minCards,
          section.querySelectorAll('article').length,
        )
        state.maxAsideDelta = Math.max(
          state.maxAsideDelta,
          Math.abs(aside.getBoundingClientRect().height - state.initialAside),
        )
        state.maxInputDelta = Math.max(
          state.maxInputDelta,
          Math.abs(
            input.getBoundingClientRect().top + scrollY - state.initialInputY,
          ),
        )
        state.maxScrollDelta = Math.max(
          state.maxScrollDelta,
          Math.abs(scrollY - state.initialScroll),
        )
        state.lostCards ||= state.initialCards.some((card) => !card.isConnected)
        requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })
    const before = requests
    await button.click()
    await page.waitForTimeout(350)
    const paymentBlocked = await pay.isDisabled()
    await page.waitForFunction(() => {
      const b = [...document.querySelectorAll('button')].find(
        (b) => b.textContent === 'Place order (Cash on delivery)',
      )
      return b && !b.disabled
    })
    const metrics = await page.evaluate(() => {
      const s = window.__measure
      s.stop = true
      return {
        minCards: s.minCards,
        lostCards: s.lostCards,
        maxAsideDelta: s.maxAsideDelta,
        maxInputDelta: s.maxInputDelta,
        maxScrollDelta: s.maxScrollDelta,
        samples: s.samples,
        inputPreserved:
          s.input === document.querySelector('input[placeholder="Enter code"]'),
        focusPreserved: document.activeElement?.tagName === 'BUTTON',
      }
    })
    rows.push({
      width,
      action,
      ...metrics,
      paymentBlocked,
      quoteRequests: requests - before,
    })
    if (strict) {
      assert.equal(metrics.minCards, 3)
      assert.equal(metrics.lostCards, false)
      assert.ok(metrics.maxAsideDelta <= 1, JSON.stringify(rows.at(-1)))
      assert.ok(metrics.maxInputDelta <= 1, JSON.stringify(rows.at(-1)))
      assert.ok(metrics.maxScrollDelta <= 1, JSON.stringify(rows.at(-1)))
      assert.equal(metrics.inputPreserved, true)
      assert.equal(metrics.focusPreserved, true)
      assert.equal(paymentBlocked, true)
      assert.equal(requests - before, 1)
    }
  }

  const input = page.getByPlaceholder('Enter code')
  const readTotal = () =>
    page
      .getByText('Total', { exact: true })
      .locator('..')
      .locator('span')
      .last()
      .innerText()
  const settled = () =>
    page.waitForFunction(() => {
      const button = [...document.querySelectorAll('button')].find(
        (button) => button.textContent === 'Place order (Cash on delivery)',
      )
      return (
        button &&
        !button.disabled &&
        button.getAttribute('aria-disabled') !== 'true'
      )
    })
  // Enter submits without moving input focus or replacing its DOM node. While the
  // server quote is slow, the last verified total remains displayed verbatim.
  await input.fill('TOKRII10')
  await input.focus()
  const previousTotal = await readTotal()
  await input.press('Enter')
  await page.waitForTimeout(350)
  assert.equal(await readTotal(), previousTotal)
  assert.equal(await pay.isDisabled(), true)
  assert.equal(
    await input.evaluate((element) => element === document.activeElement),
    true,
  )
  await settled()
  assert.equal(
    await input.evaluate((element) => element === document.activeElement),
    true,
  )
  assert.equal(await readTotal(), '₹1,444.5')
  const geometry = () =>
    page.locator('aside').evaluate((element) => ({
      height: element.getBoundingClientRect().height,
      inputY:
        document
          .querySelector('input[placeholder="Enter code"]')
          .getBoundingClientRect().top + scrollY,
    }))
  const stableGeometry = async (before) => {
    const after = await geometry()
    assert.ok(Math.abs(after.height - before.height) <= 1)
    assert.ok(Math.abs(after.inputY - before.inputY) <= 1)
  }
  // Failed quotes preserve the old layout/value but block payment until Retry.
  failQuote = true
  const beforeFailure = await geometry()
  await page.getByRole('button', { name: 'Remove coupon', exact: true }).click()
  await page
    .getByRole('button', { name: 'Retry update', exact: true })
    .waitFor()
  assert.equal(await pay.isDisabled(), true)
  assert.equal(await readTotal(), '₹1,444.5')
  assert.equal(await section.locator('article').count(), 3)
  await stableGeometry(beforeFailure)
  await page.getByRole('button', { name: 'Retry update', exact: true }).click()
  await settled()
  await stableGeometry(beforeFailure)
  assert.equal(await readTotal(), previousTotal)
  // Refresh failures with unchanged input keys must also revoke payment readiness.
  failQuote = true
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await page
    .getByRole('button', { name: 'Retry update', exact: true })
    .waitFor()
  assert.equal(await pay.isDisabled(), true)
  await page.getByRole('button', { name: 'Retry update', exact: true }).click()
  await settled()
  // A preview failure keeps the prior valid quote and still-visible coupon cards.
  failPreview = true
  const beforePreview = await geometry()
  await section
    .locator('article')
    .filter({ has: page.getByText('15% OFF', { exact: true }) })
    .getByRole('button', { name: 'Apply', exact: true })
    .click()
  await page
    .getByText('Coupon validation temporarily unavailable.', { exact: true })
    .waitFor()
  await settled()
  await stableGeometry(beforePreview)
  assert.equal(await readTotal(), previousTotal)
  // Equivalent simultaneous refresh/apply events share one network request.
  const quotesBefore = requests
  await page.evaluate(() => {
    for (let i = 0; i < 3; i++) window.dispatchEvent(new Event('focus'))
  })
  await page.waitForTimeout(100)
  assert.equal(await pay.isDisabled(), true)
  await settled()
  assert.equal(requests - quotesBefore, 1)
  const previewsBefore = previews,
    beforeDuplicate = requests
  await section
    .locator('article')
    .filter({ has: page.getByText('5% OFF', { exact: true }) })
    .getByRole('button', { name: 'Apply', exact: true })
    .evaluate((button) => {
      button.click()
      button.click()
    })
  await page.waitForTimeout(350)
  await settled()
  assert.equal(previews - previewsBefore, 1)
  assert.equal(requests - beforeDuplicate, 1)
  // Reapplying the already selected code still verifies a fresh quote once.
  const sameCodeQuotes = requests
  await input.fill('TOKRII5')
  await input.press('Enter')
  await page.waitForTimeout(350)
  await settled()
  assert.equal(requests - sameCodeQuotes, 1)
  assert.equal(navigations, initialNavigations, 'Coupon actions must never navigate or reload')
  assert.equal(await page.evaluate(() => performance.timeOrigin), initialTimeOrigin)
  // On cart changes, reject an old invalidation after a newer eligible quote.
  await section
    .locator('article')
    .filter({ has: page.getByText('15% OFF', { exact: true }) })
    .getByRole('button', { name: 'Apply', exact: true })
    .click()
  await page.waitForTimeout(350)
  await settled()
  await page.goto(`${site}/cart`)
  await page.waitForLoadState('networkidle')
  const cartSection = page.getByRole('region', { name: 'Available Coupons' })
  const cartCard = (percent) =>
    cartSection
      .locator('article')
      .filter({ has: page.getByText(`${percent}% OFF`, { exact: true }) })
  const decrease = page.getByRole('button', {
    name: width < 1024 ? 'Decrease quantity' : '–',
    exact: true,
  })
  const increase = page.getByRole('button', {
    name: width < 1024 ? 'Increase quantity' : '+',
    exact: true,
  })
  let started, release
  const seen = new Promise((resolve) => {
    started = resolve
  })
  holdNextQuote = {
    started,
    wait: new Promise((resolve) => {
      release = resolve
    }),
  }
  await decrease.click()
  await Promise.race([
    seen,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error('Expected held quantity quote')),
        10000,
      ),
    ),
  ])
  await increase.click()
  await page.waitForFunction(() =>
    [
      ...document.querySelectorAll(
        'section[aria-label="Available Coupons"] article button',
      ),
    ].some(
      (button) =>
        button.textContent === 'Remove' &&
        !button.disabled &&
        button.getAttribute('aria-disabled') !== 'true',
    ),
  )
  const oldResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith('/checkout/quote') &&
      response.request().postDataJSON()?.items?.[0]?.quantity === 2,
  )
  release()
  await oldResponse
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  )
  await cartCard(15).getByText('Applied', { exact: true }).waitFor()
  await decrease.click()
  await page
    .getByText(
      'Your 15% coupon was removed because your cart is now below ₹1,500.',
      { exact: true },
    )
    .filter({ visible: true })
    .first()
    .waitFor()
  assert.equal(
    await cartSection.getByText('Applied', { exact: true }).count(),
    0,
  )
  const invalidationRequests = requests
  await increase.click()
  await page.waitForFunction(() =>
    [
      ...document.querySelectorAll(
        'section[aria-label="Available Coupons"] article button',
      ),
    ].some(
      (button) =>
        button.textContent === 'Apply' &&
        !button.disabled &&
        button.getAttribute('aria-disabled') !== 'true',
    ),
  )
  assert.equal(
    await cartSection.getByText('Applied', { exact: true }).count(),
    0,
  )
  assert.equal(requests - invalidationRequests, 1)
  rows.push({
    width,
    extraChecks:
      'keyboard focus, stable server totals, failed quote/preview, same-key failure, retry, duplicate requests, stale invalidation, cart eligibility/no reapply',
    passed: true,
  })
  assert.deepEqual(browserErrors, [])
  await context.close()
}
await browser.close()
await fs.writeFile(
  process.env.MEASURE_OUT || '/tmp/tokri-coupon-layout.json',
  JSON.stringify(rows, null, 2),
)
console.log(JSON.stringify(rows, null, 2))
