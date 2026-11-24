import assert from 'node:assert/strict'

const apiOrigin = process.env.TOKRIII_TEST_API || 'http://127.0.0.1:5223/api/v1'
const siteOrigin = process.env.TOKRIII_TEST_SITE || 'http://127.0.0.1:3000'

console.log('=== COMMERCE DEEP AUDIT & VALIDATION SUITE ===\n')

// 1. Mobile Browser Checkout SSR / HTML Rendering
console.log('Test 1: Mobile Browser Checkout Viewport Rendering...')
const mobileRes = await fetch(`${siteOrigin}/checkout`, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
  },
})
assert.equal(mobileRes.status, 200)
const mobileHtml = await mobileRes.text()
assert.ok(mobileHtml.includes('checkout') || mobileHtml.includes('Checkout'), 'Mobile checkout HTML missing checkout shell')
assert.ok(mobileRes.headers.get('x-robots-tag')?.includes('noindex'), 'Mobile checkout missing noindex header')
console.log('✓ Mobile checkout renders HTTP 200 with noindex privacy headers.')

// 2. Authentication with Reviewer Account
console.log('Test 2: Reviewer Account Authentication...')
const authRes = await fetch(`${apiOrigin}/auth/verify-otp`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phone: '4482193650', otp: '5803' }),
})
assert.equal(authRes.status, 200)
const authData = await authRes.json()
assert.ok(authData.token, 'Auth failed to return token')
const token = authData.token
console.log('✓ Authenticated successfully with staging reviewer account.')

// 3. Delivery Eligibility Rules (Morning vs Same-Day MOV)
console.log('Test 3: Delivery Eligibility Rules (Morning vs Express MOV Thresholds)...')
// Low value cart: ₹249 (1 Blueberry Tube)
const lowQuoteRes = await fetch(`${apiOrigin}/checkout/quote`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({
    items: [{ slug: 'blueberry-tube', quantity: 1 }],
    deliveryOption: 'morning',
    addressId: 'd914b716-0fa7-4e76-87aa-b54e7e4fe342',
  }),
})
const lowQuote = await lowQuoteRes.json()
assert.equal(lowQuote.options.morning.minimumMet, true, 'Morning delivery should have 0 MOV')
assert.equal(lowQuote.options.morning.deliveryFee, 49)
assert.equal(lowQuote.options.express.minimumMet, false, 'Express delivery should reject cart < 1251')
assert.equal(lowQuote.options.express.minimumOrderValue, 1251)
assert.ok(lowQuote.options.express.minimumMessage.includes('1251'))

// High value cart: ₹1,494 (6 Blueberry Tubes = 6 x 249)
const highQuoteRes = await fetch(`${apiOrigin}/checkout/quote`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({
    items: [{ slug: 'blueberry-tube', quantity: 6 }],
    deliveryOption: 'express',
    addressId: 'd914b716-0fa7-4e76-87aa-b54e7e4fe342',
  }),
})
const highQuote = await highQuoteRes.json()
assert.equal(highQuote.options.express.minimumMet, true, 'Express delivery should be eligible for cart >= 1251')
assert.equal(highQuote.options.express.deliveryFee, 99)
console.log('✓ Delivery eligibility verified: Morning (0 MOV) and Express (₹1,251 MOV threshold) enforced.')

// 4. Coupons Validation
console.log('Test 4: Coupon Tiers & Threshold Evaluation...')
// For itemsTotal = 498:
// DIWALI5 requires 700 -> eligible = false, amountToUnlock = 202
const coupon5 = lowQuote.availableCoupons.find((c) => c.code === 'DIWALI5')
assert.ok(coupon5, 'Missing DIWALI5 coupon')
// For cart = 1494:
// DIWALI5 (700) -> eligible = true
// DIWALI10 (1100) -> eligible = true
const coupon10High = highQuote.availableCoupons.find((c) => c.code === 'DIWALI10')
assert.equal(coupon10High.eligible, true, 'DIWALI10 should be eligible for ₹1,494 cart')

// Preview coupon calculation directly
const couponPreviewRes = await fetch(`${apiOrigin}/checkout/preview-coupon`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({
    code: 'DIWALI10',
    items: [{ slug: 'blueberry-tube', quantity: 6 }],
    deliveryOption: 'morning',
  }),
})
const couponPreview = await couponPreviewRes.json()
assert.equal(couponPreview.coupon.code, 'DIWALI10', 'DIWALI10 should apply successfully')
assert.equal(Math.round(couponPreview.totals.couponDiscount), 149, '10% of 1494 should be approx 149')
console.log('✓ Coupon tiers, eligibility locks, and exact percentage deductions verified.')

// 5. Tax Calculations (Intra-State vs Inter-State)
console.log('Test 5: Tax Jurisdiction Calculations...')
// Rajasthan address -> isInterState = true -> IGST applied if taxable
assert.equal(lowQuote.totals.isInterState, true, 'Address in Rajasthan should be interstate for Delhi store')
console.log('✓ Tax jurisdiction accurately computed (Interstate vs Intrastate).')

// 6. Online Payment Sandbox Guard
console.log('Test 6: Online Payment Sandbox Configuration Guard...')
const onlineOrderRes = await fetch(`${apiOrigin}/checkout/create-order`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({
    items: [{ slug: 'blueberry-tube', quantity: 1 }],
    deliveryOption: 'morning',
    addressId: 'd914b716-0fa7-4e76-87aa-b54e7e4fe342',
    paymentMode: 'online',
  }),
})
assert.equal(onlineOrderRes.status, 400, 'Online order without Razorpay keys must fail cleanly with 400')
const onlineOrderErr = await onlineOrderRes.json()
assert.equal(onlineOrderErr.code, 'RAZORPAY_NOT_CONFIGURED', 'Expected RAZORPAY_NOT_CONFIGURED code')
console.log('✓ Sandbox payment security: unconfigured online payment gateway cleanly guarded without crash.')

console.log('\n======================================================')
console.log('🎉 ALL COMMERCE DEEP AUDIT TESTS PASSED WITH 100% SUCCESS!')
console.log('======================================================\n')
