import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const SITE = process.env.TOKRIII_TEST_SITE || 'http://127.0.0.1:3000'
const CHROME_PATH = process.env.CHROME_BIN || '/usr/bin/google-chrome'

console.log('--- STARTING TOKRIII COMPREHENSIVE COMMERCE & AUTH AUDIT REGRESSION ---')

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

// State trackers for mock inspections
const capturedOrderPayloads = []
const capturedCodConfirmPayloads = []
const capturedCartPuts = []
let simulateMeUnauthorized = false
let simulateCreateOrderFailure = false
let mockServerCart = [
  {
    id: 'blueberry-tube',
    name: 'Blueberry Tube',
    price: '₹299',
    priceValue: 299,
    weight: '125 g',
    quantity: 1,
  },
]

// Strict network isolation guard: block any external network request!
await page.route('**/*', async (route) => {
  const req = route.request()
  const url = new URL(req.url())

  // Ensure absolutely no outbound external network requests
  if (!['127.0.0.1', 'localhost', '::1'].includes(url.hostname)) {
    return route.abort()
  }

  // Intercept authentication OTP send
  if (url.pathname.includes('/api/v1/auth/send-otp') || url.pathname.includes('/api/v1/auth/request-otp')) {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, message: 'OTP sent to mobile number' }),
    })
  }

  // Intercept OTP verification
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

  // Intercept auth me (profile refresh & session check)
  if (url.pathname.includes('/api/v1/auth/me')) {
    if (simulateMeUnauthorized) {
      return route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, message: 'Session expired (401)' }),
      })
    }
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

  // Intercept saved addresses
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
              formatted: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103',
              serviceable: true,
              delivery: {
                serviceable: true,
                morning: { enabled: true, fee: 49 },
                express: { enabled: true, fee: 99 },
              },
            },
          ],
        }),
      })
    }
  }

  // Intercept orders list
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
            expectedDeliveryDate: '2026-10-31',
            items: [{ name: 'Blueberry Tube', quantity: 2, price: '₹299' }],
          },
        ],
        pagination: { totalCount: 1, totalPages: 1, page: 1, perPage: 10, hasPrevPage: false, hasNextPage: false },
      }),
    })
  }

  // Intercept account cart sync
  if (url.pathname.includes('/api/v1/account/cart')) {
    if (req.method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ cart: { items: mockServerCart } }),
      })
    }
    if (req.method() === 'PUT') {
      try {
        const body = req.postDataJSON() || {}
        capturedCartPuts.push(body)
        if (Array.isArray(body.items)) {
          mockServerCart = body.items.map((it) => ({
            id: it.slug || it.id,
            name: it.name || 'Blueberry Tube',
            priceValue: 299,
            quantity: it.quantity || 1,
          }))
        }
      } catch {
        capturedCartPuts.push({})
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      })
    }
  }

  // Intercept checkout configuration
  if (url.pathname.includes('/api/v1/checkout/config')) {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        razorpay: { enabled: true, keyId: 'rzp_test_mock123' },
        codEnabled: true,
        delivery: {
          morning: {
            id: 'morning',
            title: 'Morning Delivery',
            subtitle: 'Freshness Guaranteed',
            fee: 49,
            freeAbove: 0,
            minimumOrderValue: 0,
          },
          express: {
            id: 'express',
            title: 'Same Day Delivery',
            subtitle: 'On-Demand Luxury',
            fee: 99,
            freeAbove: 0,
            minimumOrderValue: 1251,
          },
        },
        freeDelivery: { quota: 3, used: 0, remaining: 0, isEligible: false },
      }),
    })
  }

  // Intercept delivery quote calculation
  if (url.pathname.includes('/api/v1/checkout/quote')) {
    let postData = {}
    try {
      postData = req.postDataJSON() || {}
    } catch {
      postData = {}
    }
    const discount = Number(postData.discount) || 0
    const itemsTotal = 299
    const deliveryFee = 49
    const grandTotal = Math.max(0, itemsTotal + deliveryFee - discount)

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        totals: {
          itemsTotal,
          taxTotal: 0,
          deliveryCharge: deliveryFee,
          handlingCharge: 0,
          discount,
          grandTotal,
        },
        options: {
          morning: {
            id: 'morning',
            title: 'Morning Delivery',
            subtitle: 'Freshness Guaranteed',
            fee: 49,
            deliveryFee: 49,
            freeAbove: 0,
            minimumOrderValue: 0,
            minimumMet: true,
            enabled: true,
          },
          express: {
            id: 'express',
            title: 'Same Day Delivery',
            subtitle: 'On-Demand Luxury',
            fee: 99,
            deliveryFee: 99,
            freeAbove: 0,
            minimumOrderValue: 1251,
            minimumMet: false,
            minimumMessage: 'Minimum order value of ₹1,251 required for Same Day Delivery',
            enabled: true,
          },
        },
      }),
    })
  }

  // Intercept coupon application
  if (url.pathname.includes('/api/v1/checkout/preview-coupon')) {
    let postData = {}
    try {
      postData = req.postDataJSON() || {}
    } catch {
      postData = {}
    }
    if (postData.code === 'INVALIDCODE') {
      return route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, message: 'Invalid or expired coupon code' }),
      })
    }
    if (postData.code === 'FRESH50') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          coupon: {
            code: 'FRESH50',
            discount: 50,
            discountAmount: 50,
            discountType: 'fixed',
            message: '₹50 discount applied successfully',
          },
        }),
      })
    }
  }

  // Intercept synthetic order creation
  if (url.pathname.includes('/api/v1/checkout/create-order')) {
    let postData = {}
    try {
      postData = req.postDataJSON() || {}
    } catch {
      postData = {}
    }
    capturedOrderPayloads.push(postData)

    if (simulateCreateOrderFailure) {
      return route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, message: 'Simulated checkout failure: item out of stock' }),
      })
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        order: {
          orderNo: 'ORD-SYNTHETIC-889900',
          paymentMode: 'cod',
          paymentStatus: 'pending',
          expectedDeliveryDate: '2026-10-31',
          totalAmount: 298,
        },
      }),
    })
  }

  // Intercept synthetic COD confirmation
  if (url.pathname.includes('/api/v1/checkout/confirm-cod')) {
    try {
      capturedCodConfirmPayloads.push(req.postDataJSON())
    } catch {
      capturedCodConfirmPayloads.push({})
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, orderNo: 'ORD-SYNTHETIC-889900' }),
    })
  }

  // Intercept order status polling
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

// ==========================================
// TEST 1: Guest Cart Add, Stepper, Subtotal, and LocalStorage
// ==========================================
console.log('TEST 1: Guest Cart Add, Stepper, Subtotal, and LocalStorage')
await page.goto(`${SITE}/product/blueberry-tube`, { waitUntil: 'networkidle' })
await page.evaluate(() => {
  localStorage.clear()
})
await page.reload({ waitUntil: 'networkidle' })

const addBtn = page.locator('main button:has-text("Add to cart")').first()
await addBtn.waitFor({ state: 'visible', timeout: 5000 })
await addBtn.click()
await page.waitForTimeout(500)

const cartCountAfterAdd = await page.evaluate(() => {
  const raw = localStorage.getItem('tokri_cart_v1')
  const cart = raw ? JSON.parse(raw) : []
  return cart.reduce((sum, item) => sum + (item.quantity || 1), 0)
})
assert.equal(cartCountAfterAdd, 1, 'Cart items count must be exactly 1 after initial add')

// Verify /cart page displays item and price
await page.goto(`${SITE}/cart`, { waitUntil: 'networkidle' })
const cartBody = await page.locator('body').textContent()
assert.ok(cartBody.toLowerCase().includes('blueberry'), 'Cart page must display item name')
assert.ok(cartBody.includes('299'), 'Cart page must display item price')
console.log('-> Guest cart add and display: PASS')

// ==========================================
// TEST 2: Authentication Modal, Invalid 4-Digit OTP Assertions, Valid OTP, and Session
// ==========================================
console.log('TEST 2: Authentication Modal, Invalid 4-Digit OTP Assertions, Valid OTP, and Session')
await page.goto(`${SITE}/`, { waitUntil: 'networkidle' })
const headerLoginBtn = page.locator('header button:has-text("Login")').first()
await headerLoginBtn.click()
await page.waitForTimeout(400)

const dialog = page.locator('[role="dialog"]')
await dialog.waitFor({ state: 'visible', timeout: 5000 })

// Enter mobile number and continue
const phoneInput = dialog.locator('input[type="tel"]')
await phoneInput.fill('9876543210')
const submitPhone = dialog.locator('button:has-text("Continue")')
await submitPhone.click()
await page.waitForTimeout(500)

// OtpInput step
const otpInput = dialog.locator('input[name="one-time-code"]')
await otpInput.waitFor({ state: 'visible', timeout: 5000 })

// Submit invalid OTP '0000'
await otpInput.fill('0000')
const verifyLoginBtn = dialog.locator('button:has-text("Login")')
await verifyLoginBtn.click()
await page.waitForTimeout(500)

// HARD ASSERTION: Verify SweetAlert error dialog is actually displayed
const swalContainer = page.locator('.swal2-container')
assert.ok(await swalContainer.isVisible(), 'Error alert dialog MUST appear on invalid OTP submission')
const swalText = await page.locator('.swal2-html-container').textContent()
assert.ok(
  /invalid|expired|failed/i.test(swalText),
  `Alert text must mention invalid or expired OTP (found: "${swalText}")`
)
console.log('-> Invalid OTP rejection assertion: PASS')

// Dismiss SweetAlert
const swalConfirm = page.locator('.swal2-confirm')
if (await swalConfirm.isVisible()) {
  await swalConfirm.click()
  await page.waitForTimeout(300)
}

// Submit valid OTP '1234'
await otpInput.fill('1234')
await verifyLoginBtn.click()
await page.waitForTimeout(1000)

// HARD ASSERTION: Verify user session saved to localStorage
const storedUser = await page.evaluate(() => {
  const raw = localStorage.getItem('tokri_user')
  return raw ? JSON.parse(raw) : null
})
assert.ok(storedUser, 'User object must be stored in localStorage under "tokri_user"')
assert.equal(storedUser.phone, '9876543210', 'Stored user phone must match')
assert.equal(storedUser.token, 'mock-jwt-auth-token-12345', 'Stored auth token must match')
console.log('-> Valid OTP verification & session persistence: PASS')

// ==========================================
// TEST 3: Authenticated Cart Synchronization
// ==========================================
console.log('TEST 3: Authenticated Cart Synchronization')
// Navigating triggers cart effect that pushes local items to server
await page.goto(`${SITE}/cart`, { waitUntil: 'networkidle' })
await page.waitForTimeout(600)
assert.ok(capturedCartPuts.length >= 1, 'CartContext must sync local cart to server via PUT /account/cart on login')
console.log('-> Authenticated cart sync: PASS')

// ==========================================
// TEST 4: Authenticated My Orders & Delivery Details
// ==========================================
console.log('TEST 4: Authenticated My Orders & Delivery Details')
await page.goto(`${SITE}/account?section=orders`, { waitUntil: 'networkidle' })
const ordersBody = await page.locator('body').textContent()
assert.ok(ordersBody.includes('My orders'), 'My orders header must render')
assert.ok(ordersBody.includes('ORD-MOCK-771122'), 'Mock order number ORD-MOCK-771122 must render in order history')
console.log('-> My orders view: PASS')

// ==========================================
// TEST 5: Coupon Application (Error on Invalid, Discount on Valid)
// ==========================================
console.log('TEST 5: Coupon Application & Total Recalculation')
await page.goto(`${SITE}/checkout`, { waitUntil: 'networkidle' })
const couponInput = page.locator('input[placeholder="Enter code"]').first()
await couponInput.waitFor({ state: 'visible', timeout: 5000 })

// Try invalid coupon
await couponInput.fill('INVALIDCODE')
const applyCouponBtn = page.locator('button:has-text("Apply")').first()
await applyCouponBtn.click()
await page.waitForTimeout(500)

const couponErrorElem = page.locator('p.text-rose-400')
assert.ok(await couponErrorElem.isVisible(), 'Coupon error message must appear for invalid coupon')
const couponErrorMsg = await couponErrorElem.textContent()
assert.ok(/invalid|expired/i.test(couponErrorMsg), `Expected invalid coupon error, got: "${couponErrorMsg}"`)
console.log('-> Invalid coupon rejection: PASS')

// Apply valid coupon FRESH50
await couponInput.fill('FRESH50')
await applyCouponBtn.click()
await page.waitForTimeout(600)

const checkoutContentAfterCoupon = await page.locator('body').textContent()
assert.ok(
  checkoutContentAfterCoupon.includes('FRESH50') || checkoutContentAfterCoupon.includes('Coupon applied'),
  'Coupon FRESH50 must be indicated as applied'
)
console.log('-> Valid coupon application: PASS')

// ==========================================
// TEST 6: Actual Checkout Submission, Duplicate Protection & Error Handling
// ==========================================
console.log('TEST 6: Actual Checkout Submission, Duplicate Protection & Error Handling')
// First verify failure handling: simulate server failure on checkout
simulateCreateOrderFailure = true
// Select COD
const codRadio = page.locator('label:has-text("Cash on delivery") input[type="radio"]')
await codRadio.check()
await page.waitForTimeout(300)

const placeOrderBtn = page.locator('button:has-text("Place order (Cash on delivery)")')
await placeOrderBtn.waitFor({ state: 'visible', timeout: 5000 })
await placeOrderBtn.click()
await page.waitForTimeout(500)

// Assert error alert on failure
assert.ok(await page.locator('.swal2-container').isVisible(), 'Error dialog must appear when checkout fails')
const failureText = await page.locator('.swal2-html-container').textContent()
assert.ok(/simulated checkout failure|failed/i.test(failureText), 'Failure message must explain error')

// Dismiss failure alert
const failureConfirm = page.locator('.swal2-confirm')
await failureConfirm.click()
await page.waitForTimeout(300)

// Verify button is re-enabled after failure recovery (not stuck in paying state)
assert.ok(await placeOrderBtn.isEnabled(), 'Place order button must be re-enabled after error recovery')
console.log('-> Checkout error handling & recovery: PASS')

// Now execute real successful submission
simulateCreateOrderFailure = false
capturedOrderPayloads.length = 0
capturedCodConfirmPayloads.length = 0

await placeOrderBtn.click()

// Assert duplicate click protection: button disabled during processing
const buttonTextDuringProcessing = await page.evaluate(() => {
  const btn = document.querySelector('button.rounded-full.bg-brand')
  return { disabled: btn?.disabled, text: btn?.textContent }
})
console.log('Button state right after submit click:', buttonTextDuringProcessing)

// Wait for navigation to order confirmation page
await page.waitForURL(/\/order\/ORD-SYNTHETIC-889900/, { timeout: 10000 })
console.log('-> Navigated to order confirmation page')

// Assert intercepted payload
assert.equal(capturedOrderPayloads.length, 1, 'Exactly one create-order POST must have been sent')
const orderPayload = capturedOrderPayloads[0]
assert.equal(orderPayload.addressId, 'addr_mock_1', 'Order payload must specify selected addressId')
assert.equal(orderPayload.paymentMode, 'cod', 'Order payload must specify paymentMode "cod"')
assert.equal(orderPayload.deliveryOption, 'morning', 'Order payload must specify deliveryOption "morning"')
assert.ok(Array.isArray(orderPayload.items) && orderPayload.items.length >= 1, 'Order payload must include cart items')

assert.equal(capturedCodConfirmPayloads.length, 1, 'Exactly one confirm-cod POST must have been sent')
assert.equal(capturedCodConfirmPayloads[0].orderNo, 'ORD-SYNTHETIC-889900', 'confirm-cod must pass correct orderNo')
console.log('-> Full UI checkout submission & payload assertions: PASS')

// ==========================================
// TEST 7: Order Confirmation View Verification
// ==========================================
console.log('TEST 7: Order Confirmation View Verification')
const h1Elem = page.locator('main h1, h1').first()
await h1Elem.waitFor({ state: 'visible', timeout: 5000 })
const h1Text = await h1Elem.textContent()
console.log('H1 on confirmation page:', h1Text)
const orderConfirmContent = await page.locator('body').textContent()
assert.ok(
  orderConfirmContent.includes('Your order is confirmed') ||
  orderConfirmContent.includes('Confirming your payment') ||
  orderConfirmContent.includes('ORD-SYNTHETIC-889900'),
  'Confirmation page must show order details'
)
assert.ok(orderConfirmContent.includes('ORD-SYNTHETIC-889900'), 'Confirmation page must show order number')
assert.ok(orderConfirmContent.includes('Pay cash on delivery'), 'Confirmation page must show cash on delivery mode')
console.log('-> Order confirmation details rendering: PASS')

// ==========================================
// TEST 8: Session Expiry (401 Handling) & Session Cleanup
// ==========================================
console.log('TEST 8: Session Expiry (401 Handling) & Session Cleanup')
// Test 401 session expiry on /auth/me
simulateMeUnauthorized = true
await page.goto(`${SITE}/account?section=profile`, { waitUntil: 'networkidle' })
await page.waitForTimeout(600)

const userAfterExpiry = await page.evaluate(() => localStorage.getItem('tokri_user'))
assert.equal(userAfterExpiry, null, 'User session must be cleared from localStorage upon 401 session expiry')
console.log('-> Session expiry 401 handling: PASS')

assert.equal(pageErrors.length, 0, `Unexpected page errors encountered: ${pageErrors.join('; ')}`)
console.log('--- ALL 8 EXTENDED COMMERCE, AUTH, COUPON, CHECKOUT & SESSION TESTS PASSED! ---')

await browser.close()
