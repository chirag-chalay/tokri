import test from 'node:test'
import assert from 'node:assert/strict'
import { createAppTrackingContext, appPurchasePayload, isCapturedAppPayment } from '../src/services/appTrackingPurchase.js'

const request = { source: 'app', platform: 'android', analytics: true, consentId: 'consent_1234567890123456' }
const totals = { itemsTotal: 200, deliveryCharge: 20, handlingCharge: 0, smallCartCharge: 0, discount: 10, taxTotal: 18, grandTotal: 210 }
const lines = [{ productId: 'product-1', name: 'Apple', priceValue: 100, quantity: 2, discount: 10, taxAmount: 18 }]
const cart = [{ product: { slug: 'apple' } }]

test('server snapshots discounted merchandise and only allows confirmed consented purchases', () => {
  const context = createAppTrackingContext(request, 'android', totals, lines, cart)
  assert.equal(context.snapshot.value, 172)
  assert.equal(context.snapshot.items[0].item_id, 'apple')
  const order = { id: 'order-1', paymentMode: 'cod', paymentStatus: 'pending', trackingContext: context }
  assert.equal(appPurchasePayload(order, request.consentId), null)
  order.trackingContext = { ...context, confirmedAt: 10, codConfirmed: true }
  assert.equal(appPurchasePayload(order, request.consentId).value, 172)
  assert.equal(appPurchasePayload(order, 'different-consent'), null)
  assert.equal(appPurchasePayload({ ...order, paymentMode: 'online', paymentStatus: 'paid' }, request.consentId), null)
  assert.equal(appPurchasePayload({ ...order, paymentMode: 'online', paymentStatus: 'paid', trackingContext: { ...order.trackingContext, captured: true } }, request.consentId).value, 172)
})

test('rejects missing consent and never uses an order line as a catalog ID', () => {
  assert.equal(createAppTrackingContext({ ...request, analytics: false }, 'android', totals, lines, cart), undefined)
  assert.equal(createAppTrackingContext(request, 'ios', totals, lines, cart), undefined)
  assert.equal(createAppTrackingContext(request, 'android', totals, [{ ...lines[0], productId: null, id: 'line-id' }], [{}]), undefined)
})

test('online purchase requires the matching captured payment and amount', () => {
  const order = { paymentStatus: 'paid', paymentMode: 'online', razorpayOrderId: 'order_1', grandTotal: 210 }
  const payment = { status: 'captured', order_id: 'order_1', amount: 21000, currency: 'INR' }
  assert.equal(isCapturedAppPayment(order, payment), true)
  for (const invalid of [{ ...payment, status: 'authorized' }, { ...payment, order_id: 'wrong' }, { ...payment, amount: 1 }, { ...payment, currency: 'USD' }]) {
    assert.equal(isCapturedAppPayment(order, invalid), false)
  }
  assert.equal(isCapturedAppPayment({ ...order, paymentStatus: 'pending' }, payment), false)
})
