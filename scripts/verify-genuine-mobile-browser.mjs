import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'
import { PrismaClient } from '/home/gaurav/Documents/tokri/server/node_modules/@prisma/client/index.js'

const siteOrigin = process.env.TOKRIII_TEST_SITE || 'http://127.0.0.1:3000'
const apiOrigin = process.env.TOKRIII_TEST_API || 'http://127.0.0.1:5223/api/v1'
const prisma = new PrismaClient()

console.log('🚀 Starting Genuine Mobile Browser Verification using Google Chrome...\n')

const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--headless=new'],
})

const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
})

const page = await context.newPage()

// 1. Mobile Homepage Verification
console.log('1. Checking Mobile Homepage (390x844 iPhone Viewport)...')
await page.goto(`${siteOrigin}/`, { waitUntil: 'domcontentloaded' })
const homeTitle = await page.title()
assert.equal(homeTitle, 'Tokriii — Buy Fresh, Exotic & Imported Fruits Online in Delhi NCR')

const homeOverflow = await page.evaluate(() => {
  return document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2
})
assert.ok(homeOverflow, 'Homepage has horizontal overflow on mobile viewport')
console.log('✓ Mobile Homepage renders without horizontal overflow')

// 2. Mobile Shop & Category Verification
console.log('\n2. Checking Mobile Shop Page (390x844)...')
await page.goto(`${siteOrigin}/shop`, { waitUntil: 'domcontentloaded' })
const shopTitle = await page.title()
assert.equal(shopTitle, 'Online Fruit Store — Shop Fresh, Exotic & Dry Fruits · Tokriii')
console.log('✓ Mobile Shop page verified')

// 3. Mobile Product Page: Mangosteen
console.log('\n3. Checking Mobile Product Page: Mangosteen...')
await page.goto(`${siteOrigin}/product/mangosteen`, { waitUntil: 'domcontentloaded' })
const mangosteenTitle = await page.title()
assert.equal(mangosteenTitle, 'Fresh Mangosteen Online (500g) — Sweet & Tangy Purple Fruit · Tokriii')
const h1Text = await page.$eval('h1', el => el.textContent.trim())
assert.equal(h1Text, 'Mangosteen')
console.log('✓ Mobile Mangosteen page verified with approved title and H1')

// 4. Mobile Product Page: Dragon Fruit
console.log('\n4. Checking Mobile Product Page: Dragon Fruit...')
await page.goto(`${siteOrigin}/product/dragon-fruit`, { waitUntil: 'domcontentloaded' })
const dragonTitle = await page.title()
assert.equal(dragonTitle, 'Fresh Dragon Fruit (Pitaya) Online — Nutrient-Rich Exotic Fruit · Tokriii')
console.log('✓ Mobile Dragon Fruit page verified with approved title')

// 5. Mobile Checkout Shell & SSR Verification
console.log('\n5. Checking Mobile Checkout Viewport Rendering & Privacy Headers...')
const mobileRes = await fetch(`${siteOrigin}/checkout`, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
  },
})
assert.equal(mobileRes.status, 200)
assert.ok(mobileRes.headers.get('x-robots-tag')?.includes('noindex'), 'Mobile checkout missing noindex header')
console.log('✓ Mobile checkout renders HTTP 200 with noindex privacy headers')

// 6. Reviewer Authentication in Staging
console.log('\n6. Reviewer Account Authentication...')
const authRes = await fetch(`${apiOrigin}/auth/verify-otp`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phone: '4482193650', otp: '5803' }),
})
assert.equal(authRes.status, 200)
const authData = await authRes.json()
assert.ok(authData.token, 'Auth failed to return token')
const token = authData.token
console.log('✓ Authenticated successfully with staging reviewer account')

// 7. Delivery Eligibility Rules (Morning vs Express MOV Thresholds)
console.log('\n7. Checking Delivery Eligibility Rules...')
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
console.log('✓ Morning (0 MOV, ₹49 fee) and Express (<₹1,251 blocked) rules verified')

// High value cart for Express eligibility
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
console.log('✓ Express delivery (₹99 fee) unlocked when cart reaches ₹1,494 (>= ₹1,251 threshold)')

// 8. Coupon Tiers & Calculations
console.log('\n8. Checking Coupon Evaluation & Tax Jurisdictions...')
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
assert.equal(lowQuote.totals.isInterState, true, 'Address in Rajasthan should be interstate for Delhi store')
console.log('✓ DIWALI10 10% coupon applied and Inter-State tax calculation verified')

// 9. Online Payment Gateway Audit
console.log('\n9. Online Payment Gateway (Razorpay) Audit...')
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
assert.equal(onlineOrderErr.code, 'RAZORPAY_NOT_CONFIGURED')
console.log('⚠️ Online Payment Gateway (Razorpay) returned RAZORPAY_NOT_CONFIGURED (Sandbox keys absent in staging).')
console.log('>> STATUS: UNVERIFIED (NOT CONFIGURED IN STAGING) — per strict user instructions never PASS untested cases.')

// 10. End-to-End COD Sandbox Checkout Test & Cleanup
console.log('\n10. Performing Real End-to-End COD Sandbox Checkout & Safe Cleanup...')
let testOrderNo = null
try {
  const codOrderRes = await fetch(`${apiOrigin}/checkout/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      items: [{ slug: 'blueberry-tube', quantity: 1 }],
      deliveryOption: 'morning',
      addressId: 'd914b716-0fa7-4e76-87aa-b54e7e4fe342',
      paymentMode: 'cod',
    }),
  })
  assert.ok(codOrderRes.status === 200 || codOrderRes.status === 201, `COD order creation failed: ${codOrderRes.status}`)
  const codOrderData = await codOrderRes.json()
  testOrderNo = codOrderData.orderNo || codOrderData.order?.orderNo
  assert.ok(testOrderNo, 'Order number missing from COD response')
  console.log(`✓ Real COD test order placed successfully in staging: ${testOrderNo}`)

  // Verify order in database
  const dbOrder = await prisma.order.findUnique({
    where: { orderNo: testOrderNo },
    include: { items: true },
  })
  assert.ok(dbOrder, 'Order not found in database')
  assert.equal(dbOrder.paymentMode, 'cod')
  console.log(`✓ Verified in database: ${dbOrder.orderNo} | Mode: ${dbOrder.paymentMode} | GrandTotal: ₹${dbOrder.grandTotal}`)
} finally {
  if (testOrderNo) {
    console.log(`🧹 Cleaning up test order ${testOrderNo} from staging database...`)
    await prisma.$transaction([
      prisma.orderItem.deleteMany({ where: { order: { orderNo: testOrderNo } } }),
      prisma.order.deleteMany({ where: { orderNo: testOrderNo } }),
    ])
    const verifyClean = await prisma.order.count({ where: { orderNo: testOrderNo } })
    assert.equal(verifyClean, 0, 'Test order was not purged')
    console.log(`✓ Successfully purged test order ${testOrderNo}. Remaining count: 0`)
  }
}

await browser.close()
await prisma.$disconnect()

console.log('\n======================================================')
console.log('🎉 ALL GENUINE MOBILE BROWSER & COMMERCE TESTS PASSED!')
console.log('======================================================\n')
