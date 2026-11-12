import test from 'node:test'
import assert from 'node:assert/strict'
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
