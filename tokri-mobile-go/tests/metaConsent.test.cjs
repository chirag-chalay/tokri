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
    let prompts = 0
    let autoEvents = false
    const sent = []
    let hold = false, release
    let configStarted
    let holdChoice = false, choiceRead, releaseChoice
    const scope = {
      AsyncStorage: { getItem: async (key) => {
        const value = store.get(key) || null
        if (key === 'tokri_marketing_consent_v1' && holdChoice) {
          holdChoice = false
          choiceRead()
          await new Promise((resolve) => { releaseChoice = resolve })
        }
        return value
      }, setItem: async (key, value) => store.set(key, value), removeItem: async (key) => store.delete(key) },
      Platform: { OS: platform }, AppState: { currentState: 'active' }, Constants: { expoConfig: { extra: { metaEnabled: true } } },
      fetchJson: async () => {
        if (hold) { configStarted?.(); await new Promise((resolve) => { release = resolve }) }
        return { metaEnabled: true }
      },
      getTrackingPermissionsAsync: async () => ({ status: permission }), requestTrackingPermissionsAsync: async () => { prompts += 1; return { status: permission } },
      Settings: { setAutoLogAppEventsEnabled: (value) => { autoEvents = value }, setAdvertiserIDCollectionEnabled: () => {}, setAdvertiserTrackingEnabled: async () => true, initializeSDK: () => { initialized += 1 } },
      AppEventsLogger: { setUserID: () => {}, logEvent: (...args) => sent.push(args), logPurchase: (...args) => sent.push(args) },
      buildMetaAppEvent: () => ({ method: 'event', name: 'content', parameters: {} }), recordTrackingOutcome: () => {}, module: { exports: {} },
    }
    const source = fs.readFileSync(path.join(__dirname, '../src/lib/metaTracking.js'), 'utf8').replace(/^import .*$/gm, '').replace(/^export (async )?function /gm, '$1function ')
    vm.runInNewContext(source+'\nmodule.exports={loadMetaChoice,saveMetaChoice,getMetaConsentId,trackMetaAction,requestMetaTrackingPermission}', scope)
    const api = scope.module.exports
    await api.loadMetaChoice()
    assert.equal(initialized, 0)
    assert.equal(autoEvents, false)
    // A default-on install has no marker yet and no explicit agreement record.
    store.set('tokri_marketing_consent_v1', 'default_allowed')
    await api.loadMetaChoice()
    assert.ok(store.get('tokri_marketing_consent_id_v1'))
    assert.equal(store.get('tokri_marketing_consent_v1'), 'default_allowed')
    await api.requestMetaTrackingPermission()
    if (platform === 'ios') assert.equal(prompts, 1)
    if (platform === 'ios') { assert.equal(initialized, 0); assert.equal(api.getMetaConsentId(), null) }
    permission = 'granted'
    await api.loadMetaChoice()
    assert.equal(initialized, 1)
    assert.ok(api.getMetaConsentId())
    assert.equal(api.trackMetaAction('view_item', {}), true)
    hold = true
    const started = new Promise((resolve) => { configStarted = resolve })
    const promptCount = prompts
    const refresh = api.requestMetaTrackingPermission()
    await started
    const withdrawing = api.saveMetaChoice(false)
    assert.equal(autoEvents, false, 'Native auto-events stop while older config request is still pending')
    assert.equal(api.trackMetaAction('view_item', {}), false)
    hold = false
    release()
    await refresh
    await withdrawing
    assert.equal(autoEvents, false)
    assert.equal(api.trackMetaAction('view_item', {}), false)
    assert.equal(sent.length, 1)
    assert.equal(prompts, promptCount, 'A superseded request cannot show ATT after config resolves')
    await api.saveMetaChoice(true)
    holdChoice = true
    const readStarted = new Promise((resolve) => { choiceRead = resolve })
    const stalePrompt = api.requestMetaTrackingPermission()
    await readStarted
    await api.saveMetaChoice(false)
    const afterWithdrawal = prompts
    releaseChoice()
    await stalePrompt
    assert.equal(prompts, afterWithdrawal)
    assert.equal(autoEvents, false)
    assert.equal(api.getMetaConsentId(), null)
    assert.equal(store.get('tokri_marketing_consent_v1'), 'denied')
  }
})
