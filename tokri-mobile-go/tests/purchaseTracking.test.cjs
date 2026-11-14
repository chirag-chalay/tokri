const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const path = require('node:path')

function makeHarness(authGet, authPost = async () => ({ accepted: true, ok: true })) {
  const store = new Map()
  const sent = []
  let consent = 'consent_1234567890123456'
  const source = fs.readFileSync(path.join(__dirname, '../src/lib/purchaseTracking.js'), 'utf8')
    .replace(/^import .*$/gm, '')
    .replace(/^export function /gm, 'function ')
  const scope = {
    AsyncStorage: { getItem: async (key) => store.get(key) || null, setItem: async (key, value) => store.set(key, value) },
    API_BASE_URL: 'https://example.invalid/api/v1', authGet,
    authPost,
    getAnalyticsConsentId: () => consent,
    trackConfirmedPurchase: async (payload) => { sent.push(payload.transaction_id); return true },
    recordTrackingOutcome: () => {},
    module: { exports: {} },
  }
  vm.runInNewContext(`${source}\nmodule.exports = { recoverPurchases, setPurchaseTrackingSession, queueRevocation, flushRevocations }`, scope)
  return { ...scope.module.exports, sent, withdraw: () => { consent = null } }
}

const purchase = { orderKey: 'order-1', transaction_id: 'a'.repeat(64), value: 100, currency: 'INR', items: [{ item_id: 'apple' }] }

test('simultaneous recovery calls dispatch an order only once', async () => {
  const h = makeHarness(async () => ({ purchases: [purchase] }))
  h.setPurchaseTrackingSession('customer-1')
  await Promise.all([h.recoverPurchases('token', 'customer-1'), h.recoverPurchases('token', 'customer-1')])
  assert.equal(h.sent.length, 1)
})

test('account switch or consent withdrawal prevents an in-flight recovery send', async () => {
  for (const cancel of ['account', 'consent']) {
    let resolve
    const h = makeHarness(() => new Promise((done) => { resolve = done }))
    h.setPurchaseTrackingSession('customer-1')
    const running = h.recoverPurchases('token', 'customer-1')
    await new Promise((done) => setImmediate(done))
    if (cancel === 'account') h.setPurchaseTrackingSession('customer-2')
    else h.withdraw()
    resolve({ purchases: [purchase] })
    await running
    assert.equal(h.sent.length, 0)
  }
})

test('offline withdrawal cleanup retries only under the matching customer', async () => {
  let online = false
  let calls = 0
  const h = makeHarness(async () => ({ purchases: [] }), async () => { calls += 1; if (!online) throw new Error('offline'); return { ok: true } })
  await h.queueRevocation('customer-1', 'consent_1234567890123456')
  await h.flushRevocations('other-token', 'customer-2')
  assert.equal(calls, 0)
  await h.flushRevocations('token', 'customer-1')
  assert.equal(calls, 1)
  online = true
  await h.flushRevocations('token', 'customer-1')
  assert.equal(calls, 2)
  await h.flushRevocations('token', 'customer-1')
  assert.equal(calls, 2)
})
