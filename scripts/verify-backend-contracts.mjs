import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure DATABASE_URL is set from readonly.env if not already present
if (!process.env.DATABASE_URL) {
  const readonlyEnvPath = path.resolve(process.env.HOME || '', '.local/share/tokriii-live-local-mysql/readonly.env')
  if (fs.existsSync(readonlyEnvPath)) {
    const content = fs.readFileSync(readonlyEnvPath, 'utf8')
    const match = content.match(/DATABASE_URL=(.*)/)
    if (match && match[1]) {
      process.env.DATABASE_URL = match[1].trim()
    }
  }
}

// Import actual backend business modules
import { prisma } from '../server/src/lib/prisma.js'
import {
  calcItemTax,
  calcCartTotals,
  deliveryChargeFor,
  defaultChargeRates,
  ratesFromSettings,
  publicDeliveryConfig,
  normalizeDeliveryOption,
  DELIVERY_CHARGE,
  EXPRESS_DELIVERY_CHARGE,
  HANDLING_CHARGE,
} from '../server/src/config/charges.js'
import {
  deliveryDecision,
} from '../server/src/services/deliveryQuote.js'
import {
  getCustomerFreeDeliveryStatus,
  applyFreeDeliveryRates,
  FREE_DELIVERY_QUOTA,
} from '../server/src/services/freeDelivery.js'
import {
  deliveryAvailability,
  normalizePincode,
  findServiceablePincode,
  assertPincodeServiceable,
  assertDeliveryOptionEnabled,
} from '../server/src/services/delivery.js'

async function run() {
  console.log('=== STARTING TOKRIII BACKEND CONTRACT & BUSINESS RULE TEST SUITE ===')
  let passed = 0

  // --------------------------------------------------------------------------
  // SUITE 1: ACTUAL PINCODE CONFIGURATION & SERVICEABILITY (GROUNDED IN LOCAL DB)
  // --------------------------------------------------------------------------
  console.log('\n--- SUITE 1: Pincode Rules & Serviceability (Database Grounded) ---')

  // 1A. Pincode Normalization
  assert.equal(normalizePincode(' 122002 '), '122002', 'Should trim and clean pincode')
  assert.equal(normalizePincode('122-002-abc'), '122002', 'Should strip non-digits')
  assert.equal(normalizePincode(''), '', 'Should handle empty string')
  console.log('✓ 1A: Pincode normalization: PASS')
  passed++

  // 1B. Real Database Pincode: Both Morning & Express Enabled (e.g. 122002 / Gurugram)
  const rowBoth = await findServiceablePincode('122002')
  assert.ok(rowBoth, 'Pincode 122002 must exist in ServiceablePincode table')
  assert.equal(rowBoth.isActive, true, '122002 must be active')
  assert.equal(rowBoth.morningEnabled, true, '122002 must have morning enabled')
  assert.equal(rowBoth.expressEnabled, true, '122002 must have express enabled')

  const availBoth = deliveryAvailability(rowBoth)
  assert.equal(availBoth.serviceable, true)
  assert.equal(availBoth.morning.enabled, true)
  assert.equal(availBoth.morning.comingSoon, false)
  assert.equal(availBoth.express.enabled, true)
  assert.equal(availBoth.express.comingSoon, false)
  assert.equal(availBoth.defaultOption, 'morning')

  const assertMorningRes = await assertDeliveryOptionEnabled('122002', 'morning')
  assert.equal(assertMorningRes.option, 'morning')
  const assertExpressRes = await assertDeliveryOptionEnabled('122002', 'express')
  assert.equal(assertExpressRes.option, 'express')
  console.log('✓ 1B: Both-delivery pincode (122002 Gurugram): PASS')
  passed++

  // 1C. Real Database Pincode: Morning-Only Coverage (e.g. 122017 / Palam Vihar)
  const rowMorningOnly = await findServiceablePincode('122017')
  assert.ok(rowMorningOnly, 'Pincode 122017 must exist in database')
  assert.equal(rowMorningOnly.isActive, true)
  assert.equal(rowMorningOnly.morningEnabled, true)
  assert.equal(rowMorningOnly.expressEnabled, false)

  const availMorningOnly = deliveryAvailability(rowMorningOnly)
  assert.equal(availMorningOnly.serviceable, true)
  assert.equal(availMorningOnly.morning.enabled, true)
  assert.equal(availMorningOnly.express.enabled, false)
  assert.equal(availMorningOnly.express.comingSoon, true)
  assert.equal(availMorningOnly.defaultOption, 'morning')

  // Morning succeeds
  const morningOnlyCheck = await assertDeliveryOptionEnabled('122017', 'morning')
  assert.equal(morningOnlyCheck.option, 'morning')

  // Express MUST throw 400
  await assert.rejects(
    async () => assertDeliveryOptionEnabled('122017', 'express'),
    (err) => err.status === 400 && /not available for your pincode/i.test(err.message),
    'Requesting express for morning-only pincode must throw 400'
  )
  console.log('✓ 1C: Morning-only pincode (122017 Palam Vihar): PASS')
  passed++

  // 1D. Real Database Pincode: Express-Only Coverage (e.g. 110033 / Azadpur, Delhi)
  const rowExpressOnly = await findServiceablePincode('110033')
  assert.ok(rowExpressOnly, 'Pincode 110033 must exist in database')
  assert.equal(rowExpressOnly.isActive, true)
  assert.equal(rowExpressOnly.morningEnabled, false)
  assert.equal(rowExpressOnly.expressEnabled, true)

  const availExpressOnly = deliveryAvailability(rowExpressOnly)
  assert.equal(availExpressOnly.serviceable, true)
  assert.equal(availExpressOnly.morning.enabled, false)
  assert.equal(availExpressOnly.morning.comingSoon, true)
  assert.equal(availExpressOnly.express.enabled, true)
  assert.equal(availExpressOnly.defaultOption, 'express')

  // Express succeeds
  const expressOnlyCheck = await assertDeliveryOptionEnabled('110033', 'express')
  assert.equal(expressOnlyCheck.option, 'express')

  // Morning MUST throw 400
  await assert.rejects(
    async () => assertDeliveryOptionEnabled('110033', 'morning'),
    (err) => err.status === 400 && /not available for your pincode/i.test(err.message),
    'Requesting morning for express-only pincode must throw 400'
  )
  console.log('✓ 1D: Express-only pincode (110033 Azadpur, Delhi): PASS')
  passed++

  // 1E. Unsupported & Unconfigured Pincodes (999999 and 560001 Bengaluru)
  const rowUnsup = await findServiceablePincode('999999')
  assert.equal(rowUnsup, null, '999999 should not exist in database')

  await assert.rejects(
    async () => assertPincodeServiceable('999999'),
    (err) => err.status === 400 && /don't deliver to this pincode/i.test(err.message),
    'Unsupported pincode must reject with 400'
  )

  const rowBlr = await findServiceablePincode('560001')
  assert.equal(rowBlr, null, '560001 (Bengaluru) should not exist in NCR database')
  await assert.rejects(
    async () => assertPincodeServiceable('560001'),
    (err) => err.status === 400 && /don't deliver to this pincode/i.test(err.message),
    'Non-NCR pincode must reject with 400'
  )
  console.log('✓ 1E: Unsupported & unconfigured pincodes: PASS')
  passed++

  // --------------------------------------------------------------------------
  // SUITE 2: EXACT MINIMUM ORDER VALUE (MOV) BOUNDARIES
  // --------------------------------------------------------------------------
  console.log('\n--- SUITE 2: Exact Minimum Order Value (MOV) Boundaries ---')

  const sampleSettings = {
    morningShippingFee: '49',
    handlingFee: '15',
    expressShippingFee: '99',
    expressMinimumOrderValue: '1251',
    firstThreeMorningEnabled: true,
  }

  // 2A. ₹1,250 — Exactly ₹1 below express minimum
  const decision1250 = deliveryDecision(sampleSettings, null, 'express', 1250)
  assert.equal(decision1250.minimumOrderValue, 1251, 'MOV must be 1251')
  assert.equal(decision1250.minimumMet, false, '₹1250 must be BELOW minimum')
  assert.equal(
    decision1250.minimumMessage,
    'Same Day Delivery requires an order of at least ₹1251.',
    'Should set exact minimum warning message'
  )
  console.log('✓ 2A: MOV below threshold (₹1,250): PASS')
  passed++

  // 2B. ₹1,251 — Exactly at express minimum
  const decision1251 = deliveryDecision(sampleSettings, null, 'express', 1251)
  assert.equal(decision1251.minimumOrderValue, 1251)
  assert.equal(decision1251.minimumMet, true, '₹1251 must MEET minimum')
  assert.equal(decision1251.minimumMessage, null, 'Minimum message must be null')
  console.log('✓ 2B: MOV exactly at threshold (₹1,251): PASS')
  passed++

  // 2C. ₹1,252 — Exactly ₹1 above express minimum
  const decision1252 = deliveryDecision(sampleSettings, null, 'express', 1252)
  assert.equal(decision1252.minimumOrderValue, 1251)
  assert.equal(decision1252.minimumMet, true, '₹1252 must EXCEED minimum')
  assert.equal(decision1252.minimumMessage, null)
  console.log('✓ 2C: MOV above threshold (₹1,252): PASS')
  passed++

  // 2D. Morning Delivery MOV Isolation
  const decisionMorning1250 = deliveryDecision(sampleSettings, null, 'morning', 1250)
  assert.equal(decisionMorning1250.minimumOrderValue, 0, 'Morning delivery MOV must be 0')
  assert.equal(decisionMorning1250.minimumMet, true, 'Morning delivery must never be blocked by MOV')
  assert.equal(decisionMorning1250.minimumMessage, null)
  console.log('✓ 2D: Morning delivery MOV exemption: PASS')
  passed++

  // 2E. Coupon Independence: Coupon discount does NOT change itemsTotal or MOV eligibility
  // Cart items total is ₹1,251, coupon is ₹200 off
  const cartItems1251 = [{ priceValue: 1251, quantity: 1, isTaxable: false }]
  const totalsWithCoupon = calcCartTotals(cartItems1251, ratesFromSettings(sampleSettings, 'express'), 200)
  assert.equal(totalsWithCoupon.itemsTotal, 1251, 'itemsTotal remains ₹1251 regardless of coupon')
  assert.equal(totalsWithCoupon.discount, 200, 'Discount is ₹200')
  const decisionWithCoupon = deliveryDecision(sampleSettings, null, 'express', totalsWithCoupon.itemsTotal)
  assert.equal(decisionWithCoupon.minimumMet, true, 'MOV evaluation relies on itemsTotal before coupon')
  console.log('✓ 2E: Coupon discount independence from MOV: PASS')
  passed++

  // --------------------------------------------------------------------------
  // SUITE 3: TAX CALCULATIONS, GST ROUNDING & TOTALS
  // --------------------------------------------------------------------------
  console.log('\n--- SUITE 3: Tax Calculations, GST Rounding & Cart Totals ---')

  // 3A. Taxable item (5% GST): Even amount (₹500)
  const taxItemEven = calcItemTax({ priceValue: 500, quantity: 1, isTaxable: true, gstRate: 5 })
  assert.equal(taxItemEven.isTaxable, true)
  assert.equal(taxItemEven.gstRate, 5)
  assert.equal(taxItemEven.lineTaxableAmount, 500)
  assert.equal(taxItemEven.taxAmount, 25.00)
  assert.equal(taxItemEven.cgstAmount, 12.50)
  assert.equal(taxItemEven.sgstAmount, 12.50)
  assert.equal(taxItemEven.igstAmount, 0)
  console.log('✓ 3A: Taxable item (5% GST on ₹500): PASS')
  passed++

  // 3B. Taxable item with odd paise rounding (₹333 @ 5% GST = 16.65; CGST 8.32, SGST 8.33)
  const taxItemOdd = calcItemTax({ priceValue: 333, quantity: 1, isTaxable: true, gstRate: 5 })
  assert.equal(taxItemOdd.lineTaxableAmount, 333)
  assert.equal(taxItemOdd.taxAmount, 16.65)
  assert.equal(taxItemOdd.cgstAmount, 8.32)
  assert.equal(taxItemOdd.sgstAmount, 8.33)
  assert.equal(taxItemOdd.cgstAmount + taxItemOdd.sgstAmount, 16.65, 'CGST + SGST must exactly equal total tax')
  console.log('✓ 3B: Tax rounding on odd paise: PASS')
  passed++

  // 3C. Inter-state Tax (IGST)
  const taxItemInterState = calcItemTax({ priceValue: 500, quantity: 1, isTaxable: true, gstRate: 5 }, true)
  assert.equal(taxItemInterState.taxAmount, 25.00)
  assert.equal(taxItemInterState.igstAmount, 25.00)
  assert.equal(taxItemInterState.cgstAmount, 0)
  assert.equal(taxItemInterState.sgstAmount, 0)
  console.log('✓ 3C: Inter-state tax (IGST): PASS')
  passed++

  // 3D. Non-taxable item (Fresh Fruit @ 0% GST)
  const taxItemFresh = calcItemTax({ priceValue: 299, quantity: 2, isTaxable: false, gstRate: 0 })
  assert.equal(taxItemFresh.isTaxable, false)
  assert.equal(taxItemFresh.taxAmount, 0)
  assert.equal(taxItemFresh.cgstAmount, 0)
  assert.equal(taxItemFresh.sgstAmount, 0)
  console.log('✓ 3D: Non-taxable item (Fresh Fruit): PASS')
  passed++

  // 3E. Mixed Cart Totals: 1 Dry Fruit (₹500, 5% GST), 2 Fresh Fruits (₹299 each), ₹50 Coupon
  const mixedItems = [
    { priceValue: 500, quantity: 1, isTaxable: true, gstRate: 5 },
    { priceValue: 299, quantity: 2, isTaxable: false, gstRate: 0 },
  ]
  const ratesConfigured = ratesFromSettings(sampleSettings, 'morning')
  const mixedTotals = calcCartTotals(mixedItems, ratesConfigured, 50)
  assert.equal(mixedTotals.itemsTotal, 1098, '500 + 299*2 = 1098')
  assert.equal(mixedTotals.deliveryCharge, 49, 'Configured morning fee is 49')
  assert.equal(mixedTotals.handlingCharge, 15, 'Configured handling fee is 15')
  assert.equal(mixedTotals.taxTotal, 25, 'Tax total is 25')
  assert.equal(mixedTotals.discount, 50, 'Discount is 50')
  // Grand total: 1098 + 49 + 15 + 25 - 50 = 1137
  assert.equal(mixedTotals.grandTotal, 1137)
  console.log('✓ 3E: Mixed cart totals calculation: PASS')
  passed++

  // 3F. Empty Cart Totals
  const emptyTotals = calcCartTotals([], ratesConfigured, 0)
  assert.equal(emptyTotals.itemsTotal, 0)
  assert.equal(emptyTotals.deliveryCharge, 0)
  assert.equal(emptyTotals.handlingCharge, 0)
  assert.equal(emptyTotals.taxTotal, 0)
  assert.equal(emptyTotals.grandTotal, 0)
  console.log('✓ 3F: Empty cart charges zeroed: PASS')
  passed++

  // --------------------------------------------------------------------------
  // SUITE 4: CONFIGURABLE CHARGES VS FALLBACK DEFAULTS
  // --------------------------------------------------------------------------
  console.log('\n--- SUITE 4: Configurable Charges vs Defaults ---')

  // 4A. System Defaults
  const defMorning = defaultChargeRates('morning')
  assert.equal(defMorning.deliveryCharge, DELIVERY_CHARGE) // 25
  assert.equal(defMorning.handlingCharge, HANDLING_CHARGE) // 2
  assert.equal(defMorning.morning.fee, DELIVERY_CHARGE)

  const defExpress = defaultChargeRates('express')
  assert.equal(defExpress.deliveryCharge, EXPRESS_DELIVERY_CHARGE) // 99
  assert.equal(defExpress.handlingCharge, HANDLING_CHARGE) // 2
  assert.equal(defExpress.express.fee, EXPRESS_DELIVERY_CHARGE)
  console.log('✓ 4A: Fallback defaults (delivery: 25, express: 99, handling: 2): PASS')
  passed++

  // 4B. Configured Rates from Database / Settings Object
  const customSettings = {
    shippingFee: '35',
    handlingFee: '10',
    morningShippingFee: '40',
    expressShippingFee: '120',
  }
  const customRatesMorning = ratesFromSettings(customSettings, 'morning')
  assert.equal(customRatesMorning.deliveryCharge, 40)
  assert.equal(customRatesMorning.handlingCharge, 10)

  const customRatesExpress = ratesFromSettings(customSettings, 'express')
  assert.equal(customRatesExpress.deliveryCharge, 120)
  assert.equal(customRatesExpress.handlingCharge, 10)
  console.log('✓ 4B: Custom rates parsing from settings: PASS')
  passed++

  // 4C. Free Above Threshold
  const freeAboveSettings = {
    morningFreeAbove: '1000',
    morningShippingFee: '49',
  }
  const freeAboveRates = ratesFromSettings(freeAboveSettings, 'morning')
  assert.equal(deliveryChargeFor('morning', 999, freeAboveRates), 49, 'Below 1000: delivery charge is 49')
  assert.equal(deliveryChargeFor('morning', 1000, freeAboveRates), 0, 'At 1000: delivery charge is 0')
  assert.equal(deliveryChargeFor('morning', 1500, freeAboveRates), 0, 'Above 1000: delivery charge is 0')
  console.log('✓ 4C: freeAbove threshold logic: PASS')
  passed++

  // --------------------------------------------------------------------------
  // SUITE 5: FIRST-THREE-ORDER PROMOTION & ACCOUNT QUOTA
  // --------------------------------------------------------------------------
  console.log('\n--- SUITE 5: First-Three-Order Promotional Logic ---')

  // 5A. First 3 Orders (used = 0, 1, 2) with Morning Delivery
  for (let used = 0; used < 3; used++) {
    const fdStatus = { quota: 3, used, remaining: 3 - used, isEligible: true }
    const dec = deliveryDecision(sampleSettings, fdStatus, 'morning', 500)
    assert.equal(dec.freeDeliveryApplied, true, `Order #${used + 1} must apply free delivery`)
    assert.equal(dec.deliveryFee, 0, `Order #${used + 1} delivery fee must be waived to ₹0`)
    assert.ok(dec.offerMessage && dec.offerMessage.includes(`${3 - used} left`))
  }
  console.log('✓ 5A: First 3 orders receive free morning delivery: PASS')
  passed++

  // 5B. Fourth Order (used = 3) with Morning Delivery
  const fdStatus4th = { quota: 3, used: 3, remaining: 0, isEligible: false }
  const dec4th = deliveryDecision(sampleSettings, fdStatus4th, 'morning', 500)
  assert.equal(dec4th.freeDeliveryApplied, false, '4th order must NOT receive free delivery')
  assert.equal(dec4th.deliveryFee, 49, '4th order must pay standard morning fee (₹49)')
  assert.equal(dec4th.offerMessage, null)
  console.log('✓ 5B: 4th order pays standard delivery: PASS')
  passed++

  // 5C. Promo Never Applies to Express Delivery (even with remaining quota)
  const fdStatusEligible = { quota: 3, used: 0, remaining: 3, isEligible: true }
  const decExpress = deliveryDecision(sampleSettings, fdStatusEligible, 'express', 1500)
  assert.equal(decExpress.freeDeliveryApplied, false, 'Express delivery must NEVER receive morning promo')
  assert.equal(decExpress.deliveryFee, 99, 'Express delivery fee remains ₹99')
  console.log('✓ 5C: Express delivery exempted from morning promo: PASS')
  passed++

  // 5D. Promo Disabled in Settings
  const settingsPromoDisabled = { ...sampleSettings, firstThreeMorningEnabled: false }
  const decDisabled = deliveryDecision(settingsPromoDisabled, fdStatusEligible, 'morning', 500)
  assert.equal(decDisabled.freeDeliveryApplied, false, 'Promo must not apply when firstThreeMorningEnabled is false')
  assert.equal(decDisabled.deliveryFee, 49, 'Delivery fee remains standard when disabled in settings')
  console.log('✓ 5D: Settings toggle disables promotional delivery: PASS')
  passed++

  // 5E. Database Verification: Real Customers Free Delivery Status
  // Test customer with 6 orders
  const cust6 = await getCustomerFreeDeliveryStatus('cmucgtyuz0047sow7318gqrr4')
  assert.equal(cust6.used, 6)
  assert.equal(cust6.remaining, 0)
  assert.equal(cust6.isEligible, false)

  // Test customer with 3 orders
  const cust3 = await getCustomerFreeDeliveryStatus('cmv9k1fbb0005so4lth60wbeo')
  assert.equal(cust3.used, 3)
  assert.equal(cust3.remaining, 0)
  assert.equal(cust3.isEligible, false)

  // Test customer with 2 orders
  const cust2 = await getCustomerFreeDeliveryStatus('cmudo14r5005msow7681wbsn5')
  assert.equal(cust2.used, 2)
  assert.equal(cust2.remaining, 1)
  assert.equal(cust2.isEligible, true)

  // Test customer with 1 order
  const cust1 = await getCustomerFreeDeliveryStatus('cmsabwzul0009soqki0sqyetm')
  assert.equal(cust1.used, 1)
  assert.equal(cust1.remaining, 2)
  assert.equal(cust1.isEligible, true)

  // Test customer with 0 orders
  const cust0 = await getCustomerFreeDeliveryStatus('cmr83fmip0001pwqslzfwpkgv')
  assert.equal(cust0.used, 0)
  assert.equal(cust0.remaining, 3)
  assert.equal(cust0.isEligible, true)
  console.log('✓ 5E: Real customer database quota assertions (0, 1, 2, 3, 6 orders): PASS')
  passed++

  console.log(`\n======================================================================`)
  console.log(`ALL ${passed} BACKEND CONTRACT & BUSINESS RULE TEST SUITES PASSED!`)
  console.log(`======================================================================\n`)

  await prisma.$disconnect()
}

run().catch((err) => {
  console.error('BACKEND CONTRACT TEST FAILED:', err)
  process.exit(1)
})
