import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { captureTrackingContext } from '../src/services/trackingPurchase.js'
import { purchaseIdentity, purchaseSummary, enqueuePurchase, processTrackingDeliveries } from '../src/services/trackingPurchase.js'
const config = { pixelId: '123456789', apiVersion: 'v99.0', token: 'secret' }
function order() {
  return { id: 'order-id', paymentMode: 'cod', paymentStatus: 'pending', grandTotal: 42, taxTotal: 2, deliveryCharge: 6, updatedAt: new Date(), trackingContext: { source: 'web', marketing: true, pixelId: config.pixelId, codConfirmed: true, confirmedAt: Date.now(), url: 'https://tokriii.com/checkout' }, customer: { phone: '9999999999' }, items: [{ id: 'line', productId: 'product', name: 'Apple', priceValue: 20, quantity: 2, discount: 6 }] }
}
test('confirmed COD and later paid collection share one immutable purchase', async () => {
  const o = order(); const stored = new Map()
  const db = { order: { findUnique: async () => o }, trackingDelivery: { createMany: async ({ data }) => { for (const value of data) if (!stored.has(value.id)) stored.set(value.id, value) } } }
  await enqueuePurchase(o.id, { db, config })
  const original = JSON.stringify([...stored.values()])
  o.paymentStatus = 'paid'
  await enqueuePurchase(o.id, { db, config })
  assert.equal(stored.size, 1)
  assert.equal(JSON.stringify([...stored.values()]), original)
  assert.equal(purchaseSummary(o).eventId, purchaseIdentity(o.id))
  assert.equal(purchaseSummary(o).items[0].discount, 3)
  assert.equal(JSON.stringify([...stored.values()]).includes('9999999999'), false)
})
test('consented purchase includes browser context and a hashed customer ID', async () => {
  const o = order()
  o.customer = { id: 'customer-fixture', phone: '+91 99999 99999', name: 'Asha Patil' }
  o.address = { city: 'Pune', state: 'Maharashtra', pincode: '411001', line1: 'private fixture' }
  o.trackingContext.match = { fbp: 'fb.1.123.456', fbc: 'fb.1.123.click', client_ip_address: '192.0.2.1', client_user_agent: 'fixture' }
  let payload
  const db = { order: { findUnique: async () => o }, trackingDelivery: { createMany: async ({ data }) => { payload = data[0].payload } } }
  await enqueuePurchase(o.id, { db, config })
  assert.equal(payload.user_data.fbp, o.trackingContext.match.fbp)
  assert.equal(payload.user_data.fbc, o.trackingContext.match.fbc)
  const sha = value => createHash('sha256').update(value).digest('hex')
  for (const [key, raw] of Object.entries({ ph: '919999999999', external_id: 'customer-fixture', fn: 'asha', ln: 'patil', ct: 'pune', st: 'maharashtra', zp: '411001', country: 'in' })) {
    assert.deepEqual(payload.user_data[key], [sha(raw)])
  }
  assert.equal(JSON.stringify(payload).includes('private fixture'), false)
  assert.equal(payload.event_id, purchaseSummary(o).eventId)
  assert.deepEqual(payload.custom_data, { currency: 'INR', value: 42, content_type: 'product', content_ids: ['product'], contents: [{ id: 'product', quantity: 2 }] })
  assert.equal(JSON.stringify(payload.user_data).includes('customer-fixture'), false)
})
test('unconfirmed COD, failed online, revoked and wrong-destination orders do not enqueue', async () => {
  const o = order(); let calls = 0
  const db = { order: { findUnique: async () => o }, trackingDelivery: { createMany: async () => calls++ } }
  o.trackingContext.codConfirmed = false
  await enqueuePurchase(o.id, { db, config })
  o.paymentMode = 'online'
  await enqueuePurchase(o.id, { db, config })
  o.paymentStatus = 'paid'; o.trackingContext.marketing = false
  await enqueuePurchase(o.id, { db, config })
  o.trackingContext.marketing = true; o.trackingContext.pixelId = 'other'
  await enqueuePurchase(o.id, { db, config })
  assert.equal(calls, 0)
})
test('worker leases events and preserves event identity on failed retry', async () => {
  const updates = []; const payload = { event_id: 'same-event' }
  const row = { id: 'same-event', payload, attempts: 0 }
  const db = { order: { findMany: async () => [] }, trackingDelivery: { findMany: async () => [row], updateMany: async () => ({ count: 1 }), update: async (value) => updates.push(value) } }
  await processTrackingDeliveries({ db, config, send: async (value) => { assert.equal(value, payload); throw Error('offline') } })
  assert.ok(updates[0].data.nextAttemptAt > new Date())
  assert.equal(updates[0].data.sentAt, undefined)
  await processTrackingDeliveries({ db, config, send: async (value) => assert.equal(value.event_id, 'same-event') })
  assert.ok(updates[1].data.sentAt instanceof Date)
})

test('purchase shipping reflects a shipping coupon without reducing merchandise twice', () => {
  const o = order()
  o.discount = 12
  assert.equal(purchaseSummary(o).shipping, 0)
  assert.equal(purchaseSummary(o).merchandiseValue, 34)
})

test('inclusive GST purchase reporting excludes tax while historical exclusive prices remain unchanged', () => {
  const o = order()
  Object.assign(o, { itemsTotal: 40, handlingCharge: 2, discount: 6, taxTotal: 4, grandTotal: 42 })
  o.items[0].taxAmount = 4
  assert.equal(purchaseSummary(o).merchandiseValue, 30)
  assert.equal(purchaseSummary(o).items[0].priceValue, 18)
  o.grandTotal = 46
  assert.equal(purchaseSummary(o).merchandiseValue, 34)
  assert.equal(purchaseSummary(o).items[0].priceValue, 20)
})

test('a web checkout requires consent and a native checkout cannot enter the web outbox', t => {
  const current = process.env.TRACKING_ENABLED
  process.env.TRACKING_ENABLED = 'true'
  t.after(() => { if (current == null) delete process.env.TRACKING_ENABLED; else process.env.TRACKING_ENABLED = current })
  const tracking = { source: 'web', marketing: true, url: 'https://tokriii.com/checkout' }
  assert.equal(captureTrackingContext(tracking, { marketingConsent: false }).marketing, false)
  const context = captureTrackingContext(tracking, { marketingConsent: true, ip: '192.0.2.1', userAgent: 'fixture' })
  assert.deepEqual(context.match, { client_ip_address: '192.0.2.1', client_user_agent: 'fixture' })
  assert.equal(captureTrackingContext(tracking, { marketingConsent: true, appPlatform: 'android' }), undefined)
  assert.equal(captureTrackingContext(tracking, { marketingConsent: true, appPlatform: 'ios' }), undefined)
})
