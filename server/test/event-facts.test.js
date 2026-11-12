import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkoutFacts, checkoutPaymentFacts, safeFailureFacts, adminActionFacts } from '../src/monitoring/event-facts.js'
test('safe event facts select confirmed scalar values without reading customer input or messages', () => {
  assert.deepEqual(adminActionFacts('/tokri-backoffice/api/resources/Product/records/product-1/edit?token=PRIVATE_TOKEN'), { model: 'Product', operation: 'update', resourceId: 'product-1' })
  assert.deepEqual(adminActionFacts('/tokri-backoffice/api/resources/Product/actions/constructor'), {})
  assert.deepEqual(adminActionFacts('/api/v1/products/private-customer-path'), {})
  assert.deepEqual(safeFailureFacts(new Error('Incorrect OTP. Please try again.')), { failureReason: 'otp_incorrect' })
  assert.deepEqual(safeFailureFacts(new Error('password=PRIVATE_OTP code=5555')), {})
  assert.deepEqual(safeFailureFacts(new Error("We don't deliver to this pincode yet.")), { failureReason: 'location_unserviceable' })
  assert.deepEqual(safeFailureFacts(new Error('This delivery option is not available for your pincode yet.')), { failureReason: 'delivery_option_unavailable' })
  const actual = checkoutFacts({ items: [{ slug: 'apple', phone: 'PRIVATE_PHONE' }], totals: { itemsTotal: '500', grandTotal: 450, discount: 50, password: 'PRIVATE_PASSWORD' }, couponStatus: { status: 'applied', code: 'SAVE10' }, deliveryType: 'morning' })
  assert.deepEqual(actual, { itemsTotal: 500, discount: 50, grandTotal: 450, productCount: 1, couponCode: 'SAVE10', deliveryOption: 'morning' })
  assert.ok(!JSON.stringify(actual).includes('PRIVATE'))
  assert.equal(checkoutFacts({ totals: { grandTotal: 0 }, couponStatus: { status: 'invalid', code: 'NOPE' } }).couponCode, undefined)
  assert.deepEqual(checkoutPaymentFacts({ status: 'failed', message: 'PRIVATE_PAYMENT_SECRET' }), { paymentStatus: 'failed' })
  assert.deepEqual(checkoutPaymentFacts({ status: 'failed', message: 'insufficient_funds' }), { paymentStatus: 'failed', reason: 'insufficient_funds', failureReason: 'insufficient_funds' })
})
