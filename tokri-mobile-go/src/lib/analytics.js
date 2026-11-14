import AsyncStorage from '@react-native-async-storage/async-storage'
import { getAnalytics, logEvent, logScreenView, setAnalyticsCollectionEnabled, setConsent } from '@react-native-firebase/analytics'
import { buildCommercePayload, sanitizeSearchTerm } from './trackingCommerce'

const STORAGE_KEY = 'tokri_analytics_consent_v1'
let enabled = false
let updateQueue = Promise.resolve()
let choiceRevision = 0

// Serialize persistence and native changes in the order the user requested them.
function applyChoice(choice, persist = false) {
  enabled = false
  const revision = ++choiceRevision
  updateQueue = updateQueue.catch(() => {}).then(async () => {
    const analytics = getAnalytics()
    if (!choice) await setAnalyticsCollectionEnabled(analytics, false)
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
