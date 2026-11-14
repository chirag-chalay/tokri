import test from 'node:test'
import assert from 'node:assert/strict'
import { lookupTrackingPurchase } from '../src/services/trackingLookup.js'

const id = 'a'.repeat(64)

test('authorized lookup helper maps an opaque ID to non-customer reconciliation fields', async () => {
  let dbId
  const db = {
    $queryRaw: async (_sql, input) => { dbId = input; return [{ id: 'internal-1' }] },
    order: { findUnique: async () => ({
      orderNo: 'ORDER-1', status: 'pending', paymentStatus: 'pending', grandTotal: 220,
      taxTotal: 10, discount: 0, handlingCharge: 2, smallCartCharge: 0,
      customerId: 'private', address: { phone: 'private' }, items: [],
      trackingContext: { source: 'app', platform: 'android', confirmedAt: 1, snapshot: { currency: 'INR', value: 190, shipping: 18 } },
    }) },
  }
  const result = await lookupTrackingPurchase(id, db)
  assert.equal(dbId, id)
  assert.equal(result.orderNo, 'ORDER-1')
  assert.equal(result.ga4MerchandiseValue, 190)
  assert.equal(result.grandTotal, 220)
  assert.equal('customerId' in result, false)
  assert.equal('address' in result, false)
})

test('invalid transaction ID is rejected before any database query', async () => {
  const db = { $queryRaw: async () => { throw new Error('unexpected database query') } }
  assert.equal(await lookupTrackingPurchase('not-a-hash', db), null)
})

test('lookup route requires a current active order admin and audits access', async (t) => {
  const express = (await import('express')).default
  const { buildOrderRoutes } = await import('../src/admin/orderRoutes.js')
  let active = false
  let audits = 0
  const db = {
    user: { findUnique: async () => ({ id: 'admin-1', role: 'staff', isActive: active, permissions: { manageOrders: true } }) },
    $queryRaw: async () => [{ id: 'internal-1' }],
    order: { findUnique: async () => ({ orderNo: 'ORDER-1', status: 'pending', paymentStatus: 'pending', grandTotal: 100, taxTotal: 0, discount: 0, handlingCharge: 0, smallCartCharge: 0, items: [], trackingContext: { source: 'app', snapshot: { value: 100, currency: 'INR', shipping: 0 } } }) },
  }
  const app = express()
  app.use((req, _res, next) => { req.session = { adminUser: { id: 'admin-1' } }; next() })
  app.use(buildOrderRoutes({ db, audit: async () => { audits += 1 } }))
  const server = await new Promise((resolve) => { const instance = app.listen(0, '127.0.0.1', () => resolve(instance)) })
  t.after(() => server.close())
  const address = `http://127.0.0.1:${server.address().port}/tracking/${id}`
  assert.equal((await fetch(address)).status, 403)
  assert.equal(audits, 0)
  active = true
  const response = await fetch(address)
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('cache-control'), 'no-store')
  assert.equal((await response.json()).orderNo, 'ORDER-1')
  assert.equal(audits, 1)
})

test('indexed transaction lookups avoid the legacy hash scan', async () => {
  const db = {
    trackingPurchaseLookup: { findUnique: async ({ where }) => { assert.equal(where.id, id); return { orderId: 'internal-1' } } },
    $queryRaw: async () => { throw new Error('unexpected scan') },
    order: { findUnique: async () => ({ orderNo: 'ORDER-1', grandTotal: 100, items: [], trackingContext: { source: 'app', snapshot: { currency: 'INR', value: 100, shipping: 0 } } }) },
  }
  assert.equal((await lookupTrackingPurchase(id, db)).orderNo, 'ORDER-1')
})
