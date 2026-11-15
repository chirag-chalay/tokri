const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const path = require('node:path')

test('runtime switch preserves consent identity, disables collection and never grants ad consent', async () => {
  let remote = true
  let releaseConfig
  let holdConfig = true
  let collecting = false
  let user = null
  const sent = []
  const store = new Map()
  const scope = {
    AsyncStorage: { getItem: async (key) => store.get(key) || null, setItem: async (key, value) => store.set(key, value), removeItem: async (key) => store.delete(key) },
    fetchJson: async () => { if (holdConfig) await new Promise((resolve) => { releaseConfig = resolve }); return { enabled: remote } }, getAnalytics: () => ({}),
    setAnalyticsCollectionEnabled: async (_instance, value) => { collecting = value },
    setConsent: async (_instance, value) => { assert.equal(value.ad_storage, false); assert.equal(value.ad_personalization, false) },
    setUserId: async (_instance, value) => { user = value },
    logEvent: async (_instance, name, value) => { sent.push({ name, value }) },
    trackMetaAction: () => false, setMetaCustomer: () => {},
    logScreenView: async () => {}, recordTrackingOutcome: () => {},
    buildCommercePayload: () => null, sanitizeSearchTerm: () => '', module: { exports: {} },
  }
  const source = fs.readFileSync(path.join(__dirname, '../src/lib/analytics.js'), 'utf8').replace(/^import .*$/gm, '').replace(/^export (async )?function /gm, '$1function ')
  vm.runInNewContext(source + '\nmodule.exports={loadAnalyticsChoice,saveAnalyticsChoice,getAnalyticsConsentId,refreshAnalyticsConfig,setAnalyticsCustomer,trackConfirmedPurchase}', scope)
  const api = scope.module.exports
  const loading = api.loadAnalyticsChoice()
  assert.equal(collecting, false)
  await api.saveAnalyticsChoice(true)
  assert.equal(collecting, false, 'Consent alone cannot enable before remote config')
  holdConfig = false
  releaseConfig()
  await loading
  assert.equal(collecting, true, 'Consent made during config fetch activates after config arrives')
  api.setAnalyticsCustomer('customer1')
  const marker = api.getAnalyticsConsentId()
  assert.ok(marker)
  assert.equal(user, 'customer1')
  await api.trackConfirmedPurchase({ transaction_id: 'a'.repeat(64), currency: 'INR', value: 10, tax: 0, shipping: 0, items: [{ item_id: 'apple' }], orderKey: 'internal-order' }, marker)
  assert.equal('orderKey' in sent[0].value, false)
  remote = false
  await api.refreshAnalyticsConfig()
  assert.equal(collecting, false)
  assert.equal(user, null)
  assert.equal(api.getAnalyticsConsentId(), null)
  remote = true
  assert.equal(await api.refreshAnalyticsConfig(), true, 'Recovery notifies the UI to record the visible screen')
  assert.equal(api.getAnalyticsConsentId(), marker)
  assert.equal(await api.refreshAnalyticsConfig(), false, 'An unchanged configuration must not resend the screen')
  await api.saveAnalyticsChoice(false)
  assert.equal(collecting, false)
  assert.equal(user, null)
})
