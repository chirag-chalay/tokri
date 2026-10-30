import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const SITE = process.env.TOKRIII_TEST_SITE || 'http://127.0.0.1:3000'
const CHROME_PATH = process.env.CHROME_BIN || '/usr/bin/google-chrome'

console.log('--- STARTING TOKRIII BACKEND-DRIVEN COMMERCE, TAX & DELIVERY REGRESSION SUITE ---')

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
let simulateQuoteFailure = false
let delayCreateOrderMs = 0
let freeDeliveryEligible = false
let activeDeliveryFeeMorning = 49
let activeDeliveryFeeExpress = 99
let activeExpressMinimumOrderValue = 1251
let activeHandlingFee = 2

// Multi-pincode address fixtures covering:
// 1. Both delivery types eligible (560103)
// 2. Same-day only eligible (560001)
// 3. Unsupported pincode (999999)
const ADDRESS_FIXTURES = [
  {
    id: 'addr_both',
    label: 'Home (Both Options - Gurugram 122002)',
    recipientName: 'Gaurav Test',
    recipientPhone: '9876543210',
    line1: 'DLF Phase 1, Golf Course Road',
    line2: 'Chakkarpur',
    city: 'Gurugram',
    pincode: '122002',
    formatted: 'DLF Phase 1, Golf Course Road, Chakkarpur, Gurugram 122002',
    serviceable: true,
    delivery: {
      serviceable: true,
      morning: { enabled: true, fee: 49 },
      express: { enabled: true, fee: 99 },
    },
  },
  {
    id: 'addr_sameday_only',
    label: 'Office (Same-day Only - Delhi 110033)',
    recipientName: 'Gaurav Test',
    recipientPhone: '9876543210',
    line1: 'Azadpur Commercial Complex',
    line2: 'Adarsh Nagar',
    city: 'Delhi',
    pincode: '110033',
    formatted: 'Azadpur Commercial Complex, Adarsh Nagar, Delhi 110033',
    serviceable: true,
    delivery: {
      serviceable: true,
      morning: { enabled: false, comingSoon: true, fee: 49 },
      express: { enabled: true, fee: 99 },
    },
  },
  {
    id: 'addr_morning_only',
    label: 'Branch (Morning Only - Gurugram 122017)',
    recipientName: 'Gaurav Test',
    recipientPhone: '9876543210',
    line1: 'C-Block Market',
    line2: 'Palam Vihar',
    city: 'Gurugram',
    pincode: '122017',
    formatted: 'C-Block Market, Palam Vihar, Gurugram 122017',
    serviceable: true,
    delivery: {
      serviceable: true,
      morning: { enabled: true, fee: 49 },
      express: { enabled: false, comingSoon: true, fee: 99 },
    },
  },
  {
    id: 'addr_unsupported',
    label: 'Remote (Unsupported - 999999)',
    recipientName: 'Gaurav Test',
    recipientPhone: '9876543210',
    line1: 'Village Road',
    line2: 'Remote Sector',
    city: 'Nowhere',
    pincode: '999999',
    formatted: 'Village Road, Remote Sector, 999999',
    serviceable: false,
    delivery: {
      serviceable: false,
      morning: { enabled: false, comingSoon: true },
      express: { enabled: false, comingSoon: true },
    },
  },
]

// Server cart containing both non-taxable fresh fruit and taxable dry fruit
let mockServerCart = [
  {
    id: 'blueberry-tube',
    name: 'Blueberry Tube',
    price: '₹299',
    priceValue: 299,
    weight: '125 g',
    quantity: 1,
    isTaxable: false,
    gstRate: 0,
  },
  {
    id: 'mix-dry-fruits',
    name: 'Mix Dry Fruits 500g',
    price: '₹500',
    priceValue: 500,
    weight: '500 g',
    quantity: 1,
    isTaxable: true,
    gstRate: 5,
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
          freeDelivery: freeDeliveryEligible,
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
          freeDelivery: freeDeliveryEligible,
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
        body: JSON.stringify({ addresses: ADDRESS_FIXTURES }),
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
            name: it.slug === 'mix-dry-fruits' ? 'Mix Dry Fruits 500g' : 'Blueberry Tube',
            priceValue: it.slug === 'mix-dry-fruits' ? 500 : 299,
            price: it.slug === 'mix-dry-fruits' ? '₹500' : '₹299',
            weight: it.slug === 'mix-dry-fruits' ? '500 g' : '125 g',
            quantity: Number(it.quantity) || 1,
            isTaxable: it.slug === 'mix-dry-fruits',
            gstRate: it.slug === 'mix-dry-fruits' ? 5 : 0,
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
            fee: activeDeliveryFeeMorning,
            freeAbove: 0,
            minimumOrderValue: 0,
          },
          express: {
            id: 'express',
            title: 'Same Day Delivery',
            subtitle: 'On-Demand Luxury',
            fee: activeDeliveryFeeExpress,
            freeAbove: 0,
            minimumOrderValue: activeExpressMinimumOrderValue,
          },
        },
        freeDelivery: {
          quota: 3,
          used: 0,
          remaining: freeDeliveryEligible ? 3 : 0,
          isEligible: freeDeliveryEligible,
        },
      }),
    })
  }

  // Intercept delivery quote calculation - derives accurately from backend charges.js rules!
  if (url.pathname.includes('/api/v1/checkout/quote')) {
    if (simulateQuoteFailure) {
      return route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, message: 'Could not calculate delivery charges.' }),
      })
    }

    let postData = {}
    try {
      postData = req.postDataJSON() || {}
    } catch {
      postData = {}
    }

    const discount = Number(postData.discount) || 0
    const option = String(postData.deliveryOption || 'morning').toLowerCase()

    // 1. Items subtotal
    const itemsTotal = mockServerCart.reduce((sum, it) => sum + Number(it.priceValue) * Number(it.quantity), 0)

    // 2. Tax calculation: dry fruits (5% on ₹500) vs fresh fruit (0%)
    let taxTotal = 0
    for (const item of mockServerCart) {
      if (item.isTaxable && Number(item.gstRate) > 0) {
        taxTotal += Math.round(Number(item.priceValue) * Number(item.quantity) * (Number(item.gstRate) / 100) * 100) / 100
      }
    }

    // 3. First 3 orders promotional offer
    const freeDeliveryApplied = Boolean(freeDeliveryEligible && option === 'morning')
    const deliveryFee = option === 'express'
      ? activeDeliveryFeeExpress
      : freeDeliveryApplied
        ? 0
        : activeDeliveryFeeMorning

    // 4. Minimum order value boundary for express
    const minimumOrderValue = option === 'express' ? activeExpressMinimumOrderValue : 0
    const minimumMet = itemsTotal >= minimumOrderValue
    const handlingCharge = activeHandlingFee

    // 5. Grand total
    const grandTotal = Math.max(0, Math.round((itemsTotal + deliveryFee + handlingCharge + taxTotal - discount) * 100) / 100)

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        totals: {
          itemsTotal,
          taxTotal,
          deliveryCharge: deliveryFee,
          handlingCharge,
          discount,
          grandTotal,
        },
        options: {
          morning: {
            id: 'morning',
            title: 'Morning Delivery',
            subtitle: 'Freshness Guaranteed',
            fee: freeDeliveryApplied ? 0 : activeDeliveryFeeMorning,
            deliveryFee: freeDeliveryApplied ? 0 : activeDeliveryFeeMorning,
            freeAbove: 0,
            minimumOrderValue: 0,
            minimumMet: true,
            enabled: true,
            freeDeliveryApplied,
            offerRemaining: freeDeliveryEligible ? 3 : 0,
            offerMessage: freeDeliveryApplied ? '🎉 First 3 Orders Offer: Free delivery applied (3 left)' : null,
          },
          express: {
            id: 'express',
            title: 'Same Day Delivery',
            subtitle: 'On-Demand Luxury',
            fee: activeDeliveryFeeExpress,
            deliveryFee: activeDeliveryFeeExpress,
            freeAbove: 0,
            minimumOrderValue: activeExpressMinimumOrderValue,
            minimumMet,
            minimumMessage: minimumMet ? null : `Same Day Delivery requires an order of at least ₹${activeExpressMinimumOrderValue}.`,
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

    if (delayCreateOrderMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayCreateOrderMs))
    }

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
          paymentMode: postData.paymentMode || 'cod',
          paymentStatus: 'pending',
          expectedDeliveryDate: '2026-10-31',
          totalAmount: 826,
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
// TEST 1: Guest Cart Add & LocalStorage Persistence
// ==========================================
console.log('TEST 1: Guest Cart Add & LocalStorage Persistence')
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

await page.goto(`${SITE}/cart`, { waitUntil: 'networkidle' })
const cartBody = await page.locator('body').textContent()
assert.ok(cartBody.toLowerCase().includes('blueberry'), 'Cart page must display item name')
console.log('-> Guest cart add and display: PASS')

// ==========================================
// TEST 2: Authentication Modal, Invalid 4-Digit OTP Rejection Assertion, Valid OTP, and Session
// ==========================================
console.log('TEST 2: Authentication Modal, Invalid 4-Digit OTP Assertions, Valid OTP, and Session')
await page.goto(`${SITE}/`, { waitUntil: 'networkidle' })
const headerLoginBtn = page.locator('header button:has-text("Login")').first()
await headerLoginBtn.click()
await page.waitForTimeout(400)

const dialog = page.locator('[role="dialog"]')
await dialog.waitFor({ state: 'visible', timeout: 5000 })

const phoneInput = dialog.locator('input[type="tel"]')
await phoneInput.fill('9876543210')
const submitPhone = dialog.locator('button:has-text("Continue")')
await submitPhone.click()
await page.waitForTimeout(500)

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
// TEST 3: Authenticated Cart Synchronization Payload Verification
// ==========================================
console.log('TEST 3: Authenticated Cart Synchronization Payload Verification')
capturedCartPuts.length = 0
await page.goto(`${SITE}/cart`, { waitUntil: 'networkidle' })
await page.waitForTimeout(600)

// Assert cart sync PUT occurred AND inspect exact payload schema & item content
assert.ok(capturedCartPuts.length >= 1, 'CartContext must sync cart to server via PUT /account/cart')
const lastPut = capturedCartPuts[capturedCartPuts.length - 1]
assert.ok(Array.isArray(lastPut.items), 'Cart sync payload must contain an items array')
assert.ok(lastPut.items.length >= 1, 'Cart sync items array must not be empty')
const syncedItem = lastPut.items.find((it) => it.slug === 'blueberry-tube' || it.id === 'blueberry-tube')
assert.ok(syncedItem, 'Cart sync payload must include blueberry-tube identifier')
assert.equal(syncedItem.quantity, 1, 'Cart sync item quantity must equal 1')
console.log('-> Cart synchronization payload schema and item verification: PASS')

// ==========================================
// TEST 4: Authenticated My Orders View
// ==========================================
console.log('TEST 4: Authenticated My Orders View')
await page.goto(`${SITE}/account?section=orders`, { waitUntil: 'networkidle' })
const ordersBody = await page.locator('body').textContent()
assert.ok(ordersBody.includes('My orders'), 'My orders header must render')
assert.ok(ordersBody.includes('ORD-MOCK-771122'), 'Mock order number ORD-MOCK-771122 must render in order history')
console.log('-> My orders view: PASS')

// ==========================================
// TEST 5: Backend-Driven Shipping, Tax, Pincode & Delivery Boundaries Coverage
// ==========================================
console.log('TEST 5: Backend-Driven Shipping, Tax, Pincode & Delivery Boundaries Coverage')
await page.goto(`${SITE}/checkout`, { waitUntil: 'networkidle' })

// --- 5A: Tax Calculation & Cart Handling ---
console.log('  5A: Taxable Dry Fruits (5% GST) vs Non-taxable Fruits & Handling Charge')
const checkoutText = await page.locator('aside').textContent()
assert.ok(checkoutText.includes('₹799'), `Item total must reflect ₹799 (found in order summary)`)
assert.ok(checkoutText.includes('₹25'), `Taxes & GST must display ₹25 (5% on ₹500 dry fruits)`)
assert.ok(checkoutText.includes('₹2'), `Cart handling must display configured ₹2 charge`)
assert.ok(checkoutText.includes('₹49'), `Morning delivery must display configured ₹49 fee`)
// Expected subtotal: 799 (items) + 25 (tax) + 2 (handling) + 49 (delivery) = ₹875
assert.ok(checkoutText.includes('₹875'), `Total before coupon must equal ₹875`)
console.log('  -> Tax & handling calculations: PASS')

// --- 5B: Coupon Application & Payable Total Recalculation ---
console.log('  5B: Coupon Application & Payable Total Recalculation')
const couponInput = page.locator('input[placeholder="Enter code"]').first()
await couponInput.waitFor({ state: 'visible', timeout: 5000 })

// Test invalid coupon
await couponInput.fill('INVALIDCODE')
const applyCouponBtn = page.locator('button:has-text("Apply")').first()
await applyCouponBtn.click()
await page.waitForTimeout(500)
const couponErrorElem = page.locator('p.text-rose-400')
assert.ok(await couponErrorElem.isVisible(), 'Coupon error message must appear for invalid coupon')
console.log('  -> Invalid coupon rejection: PASS')

// Test valid coupon FRESH50 (₹50 discount)
await couponInput.fill('FRESH50')
await applyCouponBtn.click()
await page.waitForTimeout(600)

const afterCouponAside = await page.locator('aside').textContent()
assert.ok(afterCouponAside.includes('-₹50'), 'Coupon discount must display -₹50 in order summary')
// Expected total after coupon: 875 - 50 = ₹825
assert.ok(afterCouponAside.includes('₹825'), 'Grand total after ₹50 discount must recalculate to ₹825')
console.log('  -> Valid coupon discount & total recalculation: PASS')

// --- 5C: First-Order Promotional Offer Eligibility ---
console.log('  5C: Promotional First-Order Free Delivery Offer')
freeDeliveryEligible = true
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(600)

const promotionalAside = await page.locator('aside').textContent()
assert.ok(
  promotionalAside.includes('Free') || promotionalAside.includes('FREE'),
  'Delivery charge must show Free when customer is promotional free-delivery eligible'
)
// With free morning delivery (₹0) and no coupon: 799 (items) + 25 (tax) + 2 (handling) + 0 = ₹826
assert.ok(promotionalAside.includes('₹826'), 'Total must recalculate to ₹826 with free morning delivery applied')

// Re-apply coupon to verify cumulative calculation: 826 - 50 = ₹776
const promoCouponInput = page.locator('input[placeholder="Enter code"]').first()
await promoCouponInput.fill('FRESH50')
await page.locator('button:has-text("Apply")').first().click()
await page.waitForTimeout(600)
const promoAfterCoupon = await page.locator('aside').textContent()
assert.ok(promoAfterCoupon.includes('₹776'), 'Total must recalculate to ₹776 with free delivery and coupon combined')
freeDeliveryEligible = false
console.log('  -> First-order free delivery promotional calculation: PASS')

// --- 5D: Minimum-Order-Value Boundaries (Same-Day Delivery) ---
console.log('  5D: Same-Day Minimum Order Value Boundary (₹1251)')
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(600)

// Select express delivery radio button
const expressRadio = page.locator('label:has-text("Same Day Delivery") input[type="radio"]')
await expressRadio.check()
await page.waitForTimeout(500)

const expressSection = await page.locator('section:has-text("Delivery option")').textContent()
assert.ok(
  expressSection.includes('1,251') || expressSection.includes('1251'),
  'Express delivery must display minimum order requirement of ₹1,251'
)

// Assert place order CTA is disabled because cart (₹799) is below express minimum (₹1251)
const ctaBtn = page.locator('aside button.rounded-full.bg-brand')
assert.ok(await ctaBtn.isDisabled(), 'Place order button must be DISABLED when minimum order value is not met')

// Switch back to morning delivery (minimum order value 0)
const morningRadio = page.locator('label:has-text("Morning Delivery") input[type="radio"]')
await morningRadio.check()
await page.waitForTimeout(500)
assert.ok(await ctaBtn.isEnabled(), 'Place order button must be re-ENABLED when morning delivery is selected')
console.log('  -> Express minimum order value boundary & button protection: PASS')

// --- 5E: Pincode Delivery Options & Address Changes ---
console.log('  5E: Pincode Eligibility & Address Switching')
// Switch to address with Same-Day Only (Delhi 110033)
const samedayAddrRadio = page.locator('label', { hasText: '110033' }).locator('input[type="radio"]')
await samedayAddrRadio.check()
await page.waitForTimeout(600)

const morningLabel = page.locator('label:has-text("Morning Delivery")')
const morningText = await morningLabel.textContent()
assert.ok(
  morningText.includes('coming soon') || (await morningLabel.locator('input').isDisabled()),
  'Morning delivery must show "coming soon" or be disabled for same-day-only pincode'
)

// Switch to address with Morning Only (Gurugram 122017)
const morningOnlyAddrRadio = page.locator('label', { hasText: '122017' }).locator('input[type="radio"]')
await morningOnlyAddrRadio.check()
await page.waitForTimeout(600)

const expressLabel = page.locator('label:has-text("Same Day Delivery")')
const expressText = await expressLabel.textContent()
assert.ok(
  expressText.includes('coming soon') || (await expressLabel.locator('input').isDisabled()),
  'Express delivery must show "coming soon" or be disabled for morning-only pincode'
)

// Check unsupported address (999999)
const unsupportedAddrLabel = page.locator('label', { hasText: '999999' })
assert.ok(
  (await unsupportedAddrLabel.textContent()).includes("don't deliver") ||
    (await unsupportedAddrLabel.locator('input').isDisabled()),
  'Unsupported pincode address must be disabled and display not deliverable'
)

// Switch back to both-options address (Gurugram 122002)
const bothAddrRadio = page.locator('label', { hasText: '122002' }).locator('input[type="radio"]')
await bothAddrRadio.check()
await morningRadio.check()
await page.waitForTimeout(600)
console.log('  -> Pincode options & address switching: PASS')

// --- 5F: Backend Quote Failure Recovery ---
console.log('  5F: Backend Quote Failure & Graceful Degradation')
simulateQuoteFailure = true
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(600)

const quoteErrorElem = page.locator('text=Could not calculate delivery charges')
assert.ok(await quoteErrorElem.isVisible(), 'Error message must appear when backend quote fails')
assert.ok(await ctaBtn.isDisabled(), 'CTA button must be disabled when delivery quote fails')

simulateQuoteFailure = false
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(600)
console.log('  -> Backend quote failure handling: PASS')

// ==========================================
// TEST 6: Checkout Failure Recovery Without Order Creation
// ==========================================
console.log('TEST 6: Checkout Failure Recovery Without Order Creation')
simulateCreateOrderFailure = true
capturedOrderPayloads.length = 0
capturedCodConfirmPayloads.length = 0

// Select COD
const codRadio = page.locator('label:has-text("Cash on delivery") input[type="radio"]')
await codRadio.check()
await page.waitForTimeout(300)

const checkoutBtn = page.locator('aside button.rounded-full.bg-brand')
await checkoutBtn.waitFor({ state: 'visible', timeout: 5000 })
await checkoutBtn.click()
await page.waitForTimeout(500)

// Assert error dialog appeared
assert.ok(await page.locator('.swal2-container').isVisible(), 'Error dialog must appear on checkout creation failure')
const failureText = await page.locator('.swal2-html-container').textContent()
assert.ok(/simulated checkout failure|failed/i.test(failureText), 'Failure modal must explain error')

// HARD ASSERTION: Verify no order was confirmed
assert.equal(capturedCodConfirmPayloads.length, 0, 'No order must be confirmed when checkout creation fails')

// Dismiss failure alert
const failureConfirm = page.locator('.swal2-confirm')
await failureConfirm.click()
await page.waitForTimeout(300)

// HARD ASSERTION: Verify user remains on checkout and button is re-enabled
assert.ok(page.url().includes('/checkout'), 'User must remain on /checkout page after error recovery')
assert.ok(await checkoutBtn.isEnabled(), 'Place order button must be re-enabled after error recovery')
console.log('-> Checkout failure recovery without order confirmation: PASS')

// ==========================================
// TEST 7: Actual Checkout Submission with Duplicate Protection & Request Payload Verification
// ==========================================
console.log('TEST 7: Actual Checkout Submission with Duplicate Protection & Request Payload Verification')
simulateCreateOrderFailure = false
capturedOrderPayloads.length = 0
capturedCodConfirmPayloads.length = 0

// Introduce a controlled 800ms delay to rigorously test duplicate submission protection
delayCreateOrderMs = 800

await checkoutBtn.click()

// HARD ASSERTION: Verify button is immediately disabled during processing
assert.ok(await checkoutBtn.isDisabled(), 'Button MUST be disabled while checkout request is in-flight')
const buttonTextProcessing = await checkoutBtn.textContent()
assert.ok(/processing/i.test(buttonTextProcessing), 'Button text must indicate processing')

// Attempt a second submission click while disabled
await checkoutBtn.click({ force: true, timeout: 300 }).catch(() => {})

// Wait for navigation to order confirmation page
await page.waitForURL(/\/order\/ORD-SYNTHETIC-889900/, { timeout: 10000 })

// HARD ASSERTION: Exactly ONE order was created (no duplicate creation!)
assert.equal(capturedOrderPayloads.length, 1, 'Duplicate protection: exactly ONE create-order request was dispatched')
const orderPayload = capturedOrderPayloads[0]
assert.equal(orderPayload.addressId, 'addr_both', 'Order payload must specify selected addressId')
assert.equal(orderPayload.paymentMode, 'cod', 'Order payload must specify paymentMode "cod"')
assert.equal(orderPayload.deliveryOption, 'morning', 'Order payload must specify deliveryOption "morning"')
assert.ok(Array.isArray(orderPayload.items) && orderPayload.items.length >= 1, 'Order payload must contain items')

// HARD ASSERTION: Exactly ONE confirm-cod call was made
assert.equal(capturedCodConfirmPayloads.length, 1, 'Exactly one confirm-cod call was dispatched')
assert.equal(capturedCodConfirmPayloads[0].orderNo, 'ORD-SYNTHETIC-889900', 'confirm-cod must pass correct orderNo')
delayCreateOrderMs = 0
console.log('-> Duplicate submission guard & payload schema verification: PASS')

// ==========================================
// TEST 8: Order Confirmation View Details
// ==========================================
console.log('TEST 8: Order Confirmation View Details')
const h1Elem = page.locator('main h1, h1').first()
await h1Elem.waitFor({ state: 'visible', timeout: 5000 })
const orderConfirmContent = await page.locator('body').textContent()
assert.ok(orderConfirmContent.includes('Your order is confirmed'), 'Confirmation page must state order is confirmed')
assert.ok(orderConfirmContent.includes('ORD-SYNTHETIC-889900'), 'Confirmation page must display order number')
assert.ok(orderConfirmContent.includes('Pay cash on delivery'), 'Confirmation page must state payment mode')
console.log('-> Order confirmation details: PASS')

// ==========================================
// TEST 9: Session Expiry (401 Handling) & Session Cleanup
// ==========================================
console.log('TEST 9: Session Expiry (401 Handling) & Session Cleanup')
simulateMeUnauthorized = true
await page.goto(`${SITE}/account?section=profile`, { waitUntil: 'networkidle' })
await page.waitForTimeout(600)

const userAfterExpiry = await page.evaluate(() => localStorage.getItem('tokri_user'))
assert.equal(userAfterExpiry, null, 'User session must be cleared from localStorage upon 401 session expiry')
console.log('-> Session expiry 401 handling: PASS')

assert.equal(pageErrors.length, 0, `Unexpected page errors encountered: ${pageErrors.join('; ')}`)
console.log('--- ALL 9 EXPANDED REGRESSION SCENARIOS PASSED WITH ZERO ERRORS! ---')

await browser.close()
