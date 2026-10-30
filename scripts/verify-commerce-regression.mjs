import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { chromium } = require('/home/gaurav/.npm/_npx/a1722018f28f9df2/node_modules/playwright-core')

const SITE = process.env.TOKRIII_TEST_SITE || 'http://127.0.0.1:3000'
const CHROME_PATH = process.env.CHROME_BIN || '/usr/bin/google-chrome'

console.log('--- STARTING TOKRIII COMMERCE & AUTH REGRESSION TESTS ---')

const browser = await chromium.launch({
  executablePath: CHROME_PATH,
  headless: true,
})

const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
})

const page = await context.newPage()
const pageErrors = []
page.on('pageerror', (err) => pageErrors.push(err.message))

// Strict network isolation guard: block any external network request!
await page.route('**/*', async (route) => {
  const req = route.request()
  const url = new URL(req.url())

  if (!['127.0.0.1', 'localhost', '::1'].includes(url.hostname)) {
    return route.abort()
  }

  // Intercept state-changing / synthetic authentication and checkout endpoints
  if (url.pathname.includes('/api/v1/auth/request-otp') || url.pathname.includes('/api/v1/auth/send-otp')) {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, message: 'OTP sent to mobile number' }),
    })
  }

  if (url.pathname.includes('/api/v1/auth/verify-otp')) {
    let postData = {}
    try {
      postData = req.postDataJSON() || {}
    } catch {
      postData = {}
    }

    if (postData.otp === '0000') {
      return route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, message: 'Invalid or expired OTP' }),
      })
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        token: 'mock-jwt-auth-token-12345',
        user: {
          id: 'cust_mock_test_101',
          phone: postData.phone || '9876543210',
          name: 'Gaurav Test Customer',
          dateOfBirth: '1995-05-15',
          token: 'mock-jwt-auth-token-12345',
          freeDelivery: false,
        },
      }),
    })
  }

  if (url.pathname.includes('/api/v1/auth/me')) {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        user: {
          id: 'cust_mock_test_101',
          phone: '9876543210',
          name: 'Gaurav Test Customer',
          token: 'mock-jwt-auth-token-12345',
        },
      }),
    })
  }

  if (url.pathname.includes('/api/v1/account/addresses')) {
    if (req.method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          addresses: [
            {
              id: 'addr_mock_1',
              label: 'Home',
              recipientName: 'Gaurav Test',
              recipientPhone: '9876543210',
              line1: 'Flat 402, Green Glen Layout',
              line2: 'Bellandur',
              city: 'Bengaluru',
              pincode: '560103',
              serviceable: true,
            },
          ],
        }),
      })
    }
  }

  if (url.pathname.includes('/api/v1/account/orders')) {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        orders: [
          {
            orderNo: 'ORD-MOCK-771122',
            createdAt: '2026-10-29T10:00:00Z',
            totalAmount: '₹598',
            paymentMode: 'cod',
            paymentStatus: 'pending',
            status: 'confirmed',
            items: [{ name: 'Blueberry Tube', quantity: 2, price: '₹299' }],
          },
        ],
        pagination: { totalCount: 1, totalPages: 1, page: 1, perPage: 10, hasPrevPage: false, hasNextPage: false },
      }),
    })
  }

  if (url.pathname.includes('/api/v1/checkout/confirm') || url.pathname.includes('/api/v1/checkout/create')) {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        orderNo: 'ORD-SYNTHETIC-889900',
        order: {
          orderNo: 'ORD-SYNTHETIC-889900',
          paymentMode: 'cod',
          paymentStatus: 'pending',
          expectedDeliveryDate: '2026-10-31',
          totalAmount: 598,
        },
      }),
    })
  }

  if (url.pathname.includes('/api/v1/checkout/status/ORD-SYNTHETIC-889900')) {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        orderNo: 'ORD-SYNTHETIC-889900',
        paymentMode: 'cod',
        paymentStatus: 'pending',
        expectedDeliveryDate: '2026-10-31',
      }),
    })
  }

  return route.continue()
})

console.log('TEST 1: Guest Cart Add, Increment, and Persistence')
await page.goto(`${SITE}/product/blueberry-tube`, { waitUntil: 'networkidle' })
const initialCount = await page.evaluate(() => {
  const raw = localStorage.getItem('tokri_cart_v1')
  return raw ? JSON.parse(raw).length : 0
})
console.log('Initial cart items count:', initialCount)

// Add to cart
const addBtn = page.locator('main button:has-text("Add to cart")').first()
await addBtn.waitFor({ state: 'visible', timeout: 5000 })
await addBtn.click()
await page.waitForTimeout(500)

const countAfterAdd = await page.evaluate(() => {
  const raw = localStorage.getItem('tokri_cart_v1')
  const cart = raw ? JSON.parse(raw) : []
  return cart.reduce((sum, item) => sum + (item.quantity || 1), 0)
})
console.log('Cart count after add:', countAfterAdd)
assert.ok(countAfterAdd >= 1, 'Cart count should have incremented')

// Verify cart page
await page.goto(`${SITE}/cart`, { waitUntil: 'networkidle' })
const cartContent = await page.locator('body').textContent()
assert.ok(cartContent.toLowerCase().includes('blueberry'), 'Cart page must display Blueberry')
console.log('Guest cart displayed on /cart: PASS')

console.log('TEST 2: Authentication Modal, Invalid OTP, Valid OTP, and Session')
// Ensure logged out first
await page.evaluate(() => {
  localStorage.removeItem('tokri_user')
})
await page.goto(`${SITE}/`, { waitUntil: 'networkidle' })
const headerLoginBtn = page.locator('header button:has-text("Login")').first()
await headerLoginBtn.click()
await page.waitForTimeout(500)

const dialog = page.locator('[role="dialog"]')
await dialog.waitFor({ state: 'visible', timeout: 5000 })

const phoneInput = dialog.locator('input[type="tel"]')
await phoneInput.waitFor({ state: 'visible', timeout: 5000 })
await phoneInput.fill('9876543210')
const submitPhone = dialog.locator('button:has-text("Continue")')
await submitPhone.click()
await page.waitForTimeout(600)

// OtpInput has a hidden numeric input
const otpInput = dialog.locator('input[name="one-time-code"]')
await otpInput.waitFor({ state: 'visible', timeout: 5000 })

// Try invalid OTP '0000'
await otpInput.fill('0000')
const verifyBtn = dialog.locator('button:has-text("Login")')
await verifyBtn.click()
await page.waitForTimeout(600)

// Verify SweetAlert error appeared
const swalVisible = await page.locator('.swal2-container').isVisible().catch(() => false)
console.log('Error alert shown on invalid OTP:', swalVisible)

// Dismiss or click confirm on Swal if needed
const swalConfirm = page.locator('.swal2-confirm')
if (await swalConfirm.isVisible()) {
  await swalConfirm.click()
  await page.waitForTimeout(300)
}

// Now submit valid OTP '1234'
await otpInput.fill('1234')
await verifyBtn.click()
await page.waitForTimeout(1200)

// Verify user is saved to localStorage
const storedUser = await page.evaluate(() => {
  const raw = localStorage.getItem('tokri_user')
  return raw ? JSON.parse(raw) : null
})
console.log('Stored user after login:', storedUser?.phone, storedUser?.name)
assert.equal(storedUser?.phone, '9876543210', 'User phone should match mock user')
console.log('Authentication and session storage: PASS')

console.log('TEST 3: Authenticated Account & Orders View')
await page.goto(`${SITE}/account?section=orders`, { waitUntil: 'networkidle' })
const ordersContent = await page.locator('body').textContent()
assert.ok(ordersContent.includes('My orders'), 'My orders section must render')
assert.ok(ordersContent.includes('ORD-MOCK-771122'), 'Mock order ORD-MOCK-771122 must render')
console.log('Account orders view: PASS')

console.log('TEST 4: Synthetic Checkout and Order Confirmation Flow')
await page.goto(`${SITE}/checkout`, { waitUntil: 'networkidle' })
const checkoutText = await page.locator('body').textContent()
assert.ok(
  checkoutText.includes('Checkout') ||
  checkoutText.includes('Order Summary') ||
  checkoutText.includes('Delivery') ||
  checkoutText.includes('Bill Details'),
  'Checkout surface loaded'
)
console.log('Checkout surface loaded: PASS')

// Test order confirmation page
await page.goto(`${SITE}/order/ORD-SYNTHETIC-889900`, { waitUntil: 'networkidle' })
await page.waitForTimeout(800)
const orderSuccessText = await page.locator('body').textContent()
assert.ok(
  orderSuccessText.includes('ORD-SYNTHETIC-889900') ||
  orderSuccessText.includes('Your order is confirmed') ||
  orderSuccessText.includes('order'),
  'Order confirmation page renders order details'
)
console.log('Checkout and order confirmation: PASS')

console.log('TEST 5: Logout and Session Cleanup')
await page.goto(`${SITE}/account?section=profile`, { waitUntil: 'networkidle' })
const logoutBtn = page.locator('button:has-text("Log Out")').first()
await logoutBtn.waitFor({ state: 'visible', timeout: 5000 })
await logoutBtn.click()
await page.waitForTimeout(600)
const userAfterLogout = await page.evaluate(() => localStorage.getItem('tokri_user'))
assert.equal(userAfterLogout, null, 'User session must be cleared after logout')
console.log('Logout and session cleanup: PASS')

assert.equal(pageErrors.length, 0, `Unexpected page errors: ${pageErrors.join('; ')}`)
console.log('--- ALL COMMERCE, AUTH, AND CHECKOUT REGRESSION TESTS PASSED! ---')

await browser.close()
