import AsyncStorage from '@react-native-async-storage/async-storage'
import { getAnalytics, logEvent, logScreenView, setAnalyticsCollectionEnabled, setConsent } from '@react-native-firebase/analytics'
import { buildCommercePayload, sanitizeSearchTerm } from './trackingCommerce'

const STORAGE_KEY = 'tokri_analytics_consent_v1'
const CONSENT_ID_KEY = 'tokri_analytics_consent_id_v1'
let consentId = null
let enabled = false
let updateQueue = Promise.resolve()
let choiceRevision = 0

// Serialize persistence and native changes in the order the user requested them.
function applyChoice(choice, persist = false) {
  enabled = false
  consentId = null
  const revision = ++choiceRevision
  updateQueue = updateQueue.catch(() => {}).then(async () => {
    const analytics = getAnalytics()
    if (!choice) await setAnalyticsCollectionEnabled(analytics, false)
    let nextConsentId = choice && !persist ? await AsyncStorage.getItem(CONSENT_ID_KEY) : null
    if (choice && !nextConsentId) nextConsentId = `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`
    if (choice) await AsyncStorage.setItem(CONSENT_ID_KEY, nextConsentId)
    else await AsyncStorage.removeItem(CONSENT_ID_KEY)
    if (persist) await AsyncStorage.setItem(STORAGE_KEY, choice ? 'granted' : 'denied')
    // A newer request may have arrived while storage or native calls were pending.
    if (choice && revision !== choiceRevision) return
    await setConsent(analytics, {
      analytics_storage: choice,
      ad_storage: false,
      ad_user_data: false,
      ad_personalization: false,
    })
    if (choice && revision === choiceRevision) {
      await setAnalyticsCollectionEnabled(analytics, true)
      if (revision !== choiceRevision) {
        await setAnalyticsCollectionEnabled(analytics, false)
        return
      }
      consentId = nextConsentId
      enabled = true
    }
  })
  return updateQueue
}

export async function loadAnalyticsChoice() {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEY)
    const choice = value === 'granted' ? true : value === 'denied' ? false : null
    await applyChoice(choice === true)
    return choice
  } catch {
    enabled = false
    return null
  }
}

export function saveAnalyticsChoice(choice) {
  return applyChoice(choice === true, true)
}

export function trackScreen(name) {
  if (!enabled || typeof name !== 'string' || !/^[A-Za-z]{1,40}$/.test(name)) return
  try { logScreenView(getAnalytics(), { screen_name: name, screen_class: name }).catch(() => {}) } catch {}
}

export function trackCommerce(event, items, paymentType) {
  if (!enabled) return
  const payload = buildCommercePayload(event, items)
  if (!payload) return
  if (event === 'add_payment_info' && ['cod', 'upi', 'card', 'netbanking', 'wallet'].includes(paymentType)) payload.payment_type = paymentType
  try { logEvent(getAnalytics(), event, payload).catch(() => {}) } catch {}
}

// Only explicit, sanitized successful searches are sent; never forward arbitrary input.
export function trackSearch(term) {
  if (!enabled) return
  const searchTerm = sanitizeSearchTerm(term)
  if (!searchTerm) return
  try { logEvent(getAnalytics(), 'search', { search_term: searchTerm }).catch(() => {}) } catch {}
}

export function getAnalyticsConsentId() {
  return enabled ? consentId : null
}

// The backend supplies an allowlisted confirmed-order payload, never a live cart.
export async function trackConfirmedPurchase(payload, expectedConsentId) {
  if (!enabled || consentId !== expectedConsentId || !/^[a-f0-9]{64}$/.test(payload?.transaction_id || '') || payload?.currency !== 'INR' || !Number.isFinite(payload.value) || payload.value < 0 || !Array.isArray(payload.items) || !payload.items.length) return false
  try {
    await logEvent(getAnalytics(), 'purchase', payload)
    return true // Accepted by the SDK, not proof of provider receipt.
  } catch { return false }
}

export function trackAuthentication(isNewCustomer) {
  if (!enabled || typeof isNewCustomer !== 'boolean') return
  try { logEvent(getAnalytics(), isNewCustomer === true ? 'sign_up' : 'login', { method: 'phone' }).catch(() => {}) } catch {}
}
