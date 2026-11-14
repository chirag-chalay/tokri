const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const path = require('node:path')

function makeHarness(authGet) {
  const store = new Map()
  const sent = []
  let consent = 'consent_1234567890123456'
  const source = fs.readFileSync(path.join(__dirname, '../src/lib/purchaseTracking.js'), 'utf8')
    .replace(/^import .*$/gm, '')
    .replace(/^export function /gm, 'function ')
  const scope = {
    AsyncStorage: { getItem: async (key) => store.get(key) || null, setItem: async (key, value) => store.set(key, value) },
    API_BASE_URL: 'https://example.invalid/api/v1', authGet,
    getAnalyticsConsentId: () => consent,
    trackConfirmedPurchase: async (payload) => { sent.push(payload.transaction_id); return true },
    module: { exports: {} },
  }
  vm.runInNewContext(`${source}\nmodule.exports = { recoverPurchases, setPurchaseTrackingSession }`, scope)
  return { ...scope.module.exports, sent, withdraw: () => { consent = null } }
}

const purchase = { transaction_id: 'a'.repeat(64), value: 100, currency: 'INR', items: [{ item_id: 'apple' }] }

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
