const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const path = require('node:path')

test('Meta stays off before marketing consent and requires iOS ATT, withdrawal stops events', async () => {
  for (const platform of ['ios', 'android']) {
    const store = new Map()
    let permission = 'denied'
    let initialized = 0
    let autoEvents = false
    const sent = []
    const scope = {
      AsyncStorage: { getItem: async (key) => store.get(key) || null, setItem: async (key, value) => store.set(key, value), removeItem: async (key) => store.delete(key) },
      Platform: { OS: platform }, AppState: { currentState: 'active' }, Constants: { expoConfig: { extra: { metaEnabled: true } } },
      fetchJson: async () => ({ metaEnabled: true }),
      getTrackingPermissionsAsync: async () => ({ status: permission }), requestTrackingPermissionsAsync: async () => ({ status: permission }),
      Settings: { setAutoLogAppEventsEnabled: (value) => { autoEvents = value }, setAdvertiserIDCollectionEnabled: () => {}, setAdvertiserTrackingEnabled: async () => true, initializeSDK: () => { initialized += 1 } },
      AppEventsLogger: { setUserID: () => {}, logEvent: (...args) => sent.push(args), logPurchase: (...args) => sent.push(args) },
      buildMetaAppEvent: () => ({ method: 'event', name: 'content', parameters: {} }), recordTrackingOutcome: () => {}, module: { exports: {} },
    }
    const source = fs.readFileSync(path.join(__dirname, '../src/lib/metaTracking.js'), 'utf8').replace(/^import .*$/gm, '').replace(/^export (async )?function /gm, '$1function ')
    vm.runInNewContext(source+'\nmodule.exports={loadMetaChoice,saveMetaChoice,getMetaConsentId,trackMetaAction}', scope)
    const api = scope.module.exports
    await api.loadMetaChoice()
    assert.equal(initialized, 0)
    assert.equal(autoEvents, false)
    await api.saveMetaChoice(true)
    if (platform === 'ios') { assert.equal(initialized, 0); assert.equal(api.getMetaConsentId(), null) }
    permission = 'granted'
    await api.loadMetaChoice()
    assert.equal(initialized, 1)
    assert.ok(api.getMetaConsentId())
    assert.equal(api.trackMetaAction('view_item', {}), true)
    await api.saveMetaChoice(false)
    assert.equal(autoEvents, false)
    assert.equal(api.trackMetaAction('view_item', {}), false)
    assert.equal(sent.length, 1)
  }
})
