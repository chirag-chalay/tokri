import test from 'node:test'
import assert from 'node:assert/strict'
import { changeAppDispatch, revokeAppTracking } from '../src/services/appTrackingDelivery.js'

const consentId = 'consent_1234567890123456'
function database() {
  let order = { id: 'order1', customerId: 'customer1', paymentMode: 'cod', paymentStatus: 'pending', grandTotal: 100, trackingContext: { source: 'app', analytics: true, consentId, confirmedAt: 1, codConfirmed: true, snapshot: { currency: 'INR', value: 100, items: [] } } }
  let serial = Promise.resolve()
  const tx = {
    $queryRaw: async () => [],
    order: {
      findFirst: async ({ where }) => where.id === order.id && where.customerId === order.customerId ? structuredClone(order) : null,
      update: async ({ data }) => { order = { ...order, ...data } },
    },
  }
  return {
    $transaction: (fn) => { const result = serial.then(() => fn(tx)); serial = result.catch(() => {}); return result },
    order: { findMany: async () => [{ id: 'order1', trackingContext: order.trackingContext }] },
    current: () => order,
  }
}

test('backend serializes competing device claims and keeps dispatch state', async () => {
  const db = database()
  const input = { orderKey: 'order1', consentId, state: 'claim' }
  assert.deepEqual(await Promise.all([changeAppDispatch(db, 'customer1', input), changeAppDispatch(db, 'customer1', input)]), [true, false])
  assert.equal(await changeAppDispatch(db, 'customer1', { ...input, state: 'sdkQueued' }), true)
  assert.equal(await changeAppDispatch(db, 'customer1', input), false)
  assert.equal(await changeAppDispatch(db, 'other-customer', input), false)
})

test('withdrawal removes the snapshot and consent identity without changing the order', async () => {
  const db = database()
  await revokeAppTracking(db, 'customer1', consentId)
  assert.equal(db.current().grandTotal, 100)
  assert.equal(db.current().trackingContext.analytics, false)
  assert.equal(db.current().trackingContext.snapshot, undefined)
  assert.equal(db.current().trackingContext.consentId, undefined)
  assert.equal(await changeAppDispatch(db, 'customer1', { orderKey: 'order1', consentId, state: 'claim' }), false)
})

test('Google and Meta dispatch and revocation stay independent', async () => {
  const db = database()
  const order = db.current()
  order.trackingContext.marketing = true
  order.trackingContext.marketingConsentId = 'marketing_1234567890123456'
  order.trackingContext.snapshot.grandTotal = 120
  assert.equal(await changeAppDispatch(db, 'customer1', { orderKey: 'order1', consentId, state: 'claim' }), true)
  assert.equal(await changeAppDispatch(db, 'customer1', { orderKey: 'order1', consentId: 'marketing_1234567890123456', destination: 'meta', state: 'claim' }), true)
  await revokeAppTracking(db, 'customer1', consentId)
  assert.equal(db.current().trackingContext.marketing, true)
  assert.ok(db.current().trackingContext.snapshot)
  assert.equal(db.current().trackingContext.consentId, undefined)
  await revokeAppTracking(db, 'customer1', 'marketing_1234567890123456', 'meta')
  assert.equal(db.current().trackingContext.marketing, false)
  assert.equal(db.current().trackingContext.snapshot, undefined)
})
