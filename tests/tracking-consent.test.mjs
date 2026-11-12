import test from 'node:test'
import assert from 'node:assert/strict'
import { getAnalyticsConsent, setAnalyticsConsent, ANALYTICS_CONSENT_UPDATED } from '../src/lib/trackingConsent.js'

test('analytics consent is opt-in, persists independent decisions, and reports write failure', () => {
  const original = globalThis.document
  let cookie = ''
  let changed = 0
  globalThis.document = {
    get cookie() { return cookie },
    set cookie(value) { cookie = value.split(';')[0] },
    dispatchEvent(event) { if (event.type === ANALYTICS_CONSENT_UPDATED) changed++ },
  }
  try {
    assert.equal(getAnalyticsConsent(), null)
    assert.equal(setAnalyticsConsent(true), true)
    assert.equal(getAnalyticsConsent(), 'granted')
    assert.equal(setAnalyticsConsent(false), true)
    assert.equal(getAnalyticsConsent(), 'denied')
    assert.equal(changed, 2)
    globalThis.document = { get cookie() { return '' }, set cookie(_) {}, dispatchEvent() { throw new Error('unexpected') } }
    assert.equal(setAnalyticsConsent(true), false)
  } finally {
    globalThis.document = original
  }
})
