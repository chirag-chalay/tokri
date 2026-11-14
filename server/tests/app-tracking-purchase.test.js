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
  const order = { paymentStatus: 'paid', paymentMode: 'online', razorpayOrderId: 'order_1', razorpayPaymentId: 'payment_1', grandTotal: 210 }
  const payment = { id: 'payment_1', status: 'captured', order_id: 'order_1', amount: 21000, currency: 'INR' }
  assert.equal(isCapturedAppPayment(order, payment), true)
  for (const invalid of [{ ...payment, id: 'wrong' }, { ...payment, status: 'authorized' }, { ...payment, order_id: 'wrong' }, { ...payment, amount: 1 }, { ...payment, currency: 'USD' }]) {
    assert.equal(isCapturedAppPayment(order, invalid), false)
  }
  assert.equal(isCapturedAppPayment({ ...order, paymentStatus: 'pending' }, payment), false)
})

test('recovery isolates customer and consent and confirms captured payments', async () => {
  const { getAppTrackingPurchases } = await import('../src/services/checkout.js')
  const base = createAppTrackingContext(request, 'android', totals, lines, cart)
  const makeOrder = (id, customerId, context, mode = 'cod') => ({
    id, customerId, paymentMode: mode, paymentStatus: mode === 'online' ? 'paid' : 'pending',
    status: 'pending', grandTotal: 210, razorpayOrderId: 'rz_order', razorpayPaymentId: 'rz_payment', trackingContext: context,
  })
  const confirmed = { ...base, confirmedAt: 100, codConfirmed: true }
  const orders = [makeOrder('mine', 'customer-1', confirmed), makeOrder('theirs', 'customer-2', confirmed),
    makeOrder('wrong-consent', 'customer-1', { ...confirmed, consentId: 'other_1234567890123456' }),
    makeOrder('online', 'customer-1', base, 'online')]
  let query
  const fetched = []
  const db = { order: {
    findMany: async (args) => { query = args; return orders },
    findUnique: async ({ where }) => orders.find((entry) => entry.id === where.id),
  } }
  const result = await getAppTrackingPurchases({ id: 'customer-1' }, request.consentId, {
    db, now: () => 1_000_000_000,
    fetchPayment: async (id) => { fetched.push(id); return { id, status: 'captured', order_id: 'rz_order', amount: 21000, currency: 'INR' } },
    confirm: async (id) => { const entry = orders.find((order) => order.id === id); entry.trackingContext = { ...entry.trackingContext, confirmedAt: 200, captured: true } },
  })
  assert.equal(query.where.customerId, 'customer-1')
  assert.equal(query.take, 30)
  assert.equal(result.length, 2)
  assert.deepEqual(fetched, ['rz_payment'])
  assert.ok(result.every((payload) => !('customerId' in payload) && !('consentId' in payload)))
})
