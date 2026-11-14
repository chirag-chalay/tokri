import { trackMetaAction, setMetaCustomer } from './metaTracking'
import { recordTrackingOutcome } from './trackingDiagnostics'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getAnalytics, logEvent, logScreenView, setAnalyticsCollectionEnabled, setConsent, setUserId } from '@react-native-firebase/analytics'
import { fetchJson } from './api'
import { buildCommercePayload, sanitizeSearchTerm } from './trackingCommerce'

const STORAGE_KEY = 'tokri_analytics_consent_v1'
const CONSENT_ID_KEY = 'tokri_analytics_consent_id_v1'
let remoteEnabled = false
let customerId = null
let consentId = null
let enabled = false
let updateQueue = Promise.resolve()
let choiceRevision = 0
let requestedChoice = null

// Serialize persistence and native changes in the order the user requested them.
function applyChoice(choice, persist = false) {
  enabled = false
  consentId = null
  const revision = ++choiceRevision
  updateQueue = updateQueue.catch(() => {}).then(async () => {
    const analytics = getAnalytics()
    const collect = choice && remoteEnabled
    if (!collect) await setAnalyticsCollectionEnabled(analytics, false)
    let nextConsentId = choice && !persist ? await AsyncStorage.getItem(CONSENT_ID_KEY) : null
    if (choice && !nextConsentId) nextConsentId = `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`
    if (choice) await AsyncStorage.setItem(CONSENT_ID_KEY, nextConsentId)
    else await AsyncStorage.removeItem(CONSENT_ID_KEY)
    if (persist) await AsyncStorage.setItem(STORAGE_KEY, choice ? 'granted' : 'denied')
    // A newer request may have arrived while storage or native calls were pending.
    if (choice && revision !== choiceRevision) return
    await setConsent(analytics, {
      analytics_storage: collect,
      ad_storage: false,
      ad_user_data: false,
      ad_personalization: false,
    })
    if (collect && revision === choiceRevision) {
      await setAnalyticsCollectionEnabled(analytics, true)
      if (revision !== choiceRevision) {
        await setAnalyticsCollectionEnabled(analytics, false)
        return
      }
      consentId = nextConsentId
      await setUserId(analytics, customerId)
      if (revision !== choiceRevision) { await setAnalyticsCollectionEnabled(analytics, false); return }
      enabled = true
    } else { await setUserId(analytics, null) }
  })
  return updateQueue
}

export async function loadAnalyticsChoice() {
  const revision = choiceRevision
  try {
    try { remoteEnabled = (await fetchJson('/checkout/app-tracking-config'))?.enabled === true } catch { remoteEnabled = false; recordTrackingOutcome('configUnavailable') }
    const value = await AsyncStorage.getItem(STORAGE_KEY)
    const choice = value === 'granted' ? true : value === 'denied' ? false : null
    if (revision !== choiceRevision) return requestedChoice
    requestedChoice = choice
    await applyChoice(choice === true)
    return requestedChoice
  } catch {
    enabled = false
    return null
  }
}

export function saveAnalyticsChoice(choice) {
  requestedChoice = choice === true
  return applyChoice(requestedChoice, true)
}

export function trackScreen(name) {
  if (!enabled || typeof name !== 'string' || !/^[A-Za-z]{1,40}$/.test(name)) return
  try { logScreenView(getAnalytics(), { screen_name: name, screen_class: name }).catch(() => {}) } catch {}
}

export function trackCommerce(event, items, paymentType, listId) {
  const payload = buildCommercePayload(event, items)
  if (!payload) return
  if (event === 'add_shipping_info' && ['morning', 'express'].includes(paymentType)) payload.shipping_tier = paymentType
  if (['view_item_list', 'select_item'].includes(event) && /^[a-zA-Z0-9_-]{1,100}$/.test(listId || '')) payload.item_list_id = listId
  if (event === 'add_payment_info' && ['cod', 'upi', 'card', 'netbanking', 'wallet'].includes(paymentType)) payload.payment_type = paymentType
  trackMetaAction(event, { commerce: payload })
  if (!enabled) return
  try { logEvent(getAnalytics(), event, payload).catch(() => {}) } catch {}
}

// Only explicit, sanitized successful searches are sent; never forward arbitrary input.
export function trackSearch(term) {
  const searchTerm = sanitizeSearchTerm(term)
  if (!searchTerm) return
  trackMetaAction('search', { searchTerm })
  if (!enabled) return
  try { logEvent(getAnalytics(), 'search', { search_term: searchTerm }).catch(() => {}) } catch {}
}

export function getAnalyticsConsentId() {
  return enabled ? consentId : null
}

// The backend supplies an allowlisted confirmed-order payload, never a live cart.
export async function trackConfirmedPurchase(payload, expectedConsentId) {
  if (!enabled || consentId !== expectedConsentId || !/^[a-f0-9]{64}$/.test(payload?.transaction_id || '') || payload?.currency !== 'INR' || !Number.isFinite(payload.value) || payload.value < 0 || !Array.isArray(payload.items) || !payload.items.length) return false
  try {
    const { transaction_id, currency, value, tax, shipping, items } = payload
    await logEvent(getAnalytics(), 'purchase', { transaction_id, currency, value, tax, shipping, items })
    recordTrackingOutcome('sdkQueued')
    return true // Accepted by the SDK, not proof of provider receipt.
  } catch { recordTrackingOutcome('sdkRejected'); return false }
}

export function trackAuthentication(isNewCustomer) {
  if (typeof isNewCustomer !== 'boolean') return
  trackMetaAction(isNewCustomer ? 'sign_up' : 'login', { isNewCustomer })
  if (!enabled) return
  try { logEvent(getAnalytics(), isNewCustomer === true ? 'sign_up' : 'login', { method: 'phone' }).catch(() => {}) } catch {}
}

export function setAnalyticsCustomer(id) {
  setMetaCustomer(id)
  customerId = typeof id === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(id) ? id : null
  try { setUserId(getAnalytics(), enabled ? customerId : null).catch(() => {}) } catch {}
}

export function readAnalyticsConsentId() { return AsyncStorage.getItem(CONSENT_ID_KEY) }

export async function refreshAnalyticsConfig() {
  let next = false
  try { next = (await fetchJson('/checkout/app-tracking-config'))?.enabled === true } catch { recordTrackingOutcome('configUnavailable') }
  if (next !== remoteEnabled) {
    remoteEnabled = next
    const stored = (await AsyncStorage.getItem(STORAGE_KEY)) === 'granted'
    await applyChoice(requestedChoice === null ? stored : requestedChoice)
  }
}
