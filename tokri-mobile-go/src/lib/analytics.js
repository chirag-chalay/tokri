import AsyncStorage from '@react-native-async-storage/async-storage'
import { getAnalytics, logEvent, logScreenView, setAnalyticsCollectionEnabled, setConsent } from '@react-native-firebase/analytics'
import { buildCommercePayload } from './trackingCommerce'

const STORAGE_KEY = 'tokri_analytics_consent_v1'
let enabled = false
let updateQueue = Promise.resolve()
let choiceRevision = 0

// Serialize changes so rapid consent/withdrawal cannot enable an old choice later.
function applyChoice(choice) {
  enabled = false
  const revision = ++choiceRevision
  updateQueue = updateQueue.catch(() => {}).then(async () => {
    const analytics = getAnalytics()
    if (!choice) await setAnalyticsCollectionEnabled(analytics, false)
    await setConsent(analytics, {
      analytics_storage: choice,
      ad_storage: false,
      ad_user_data: false,
      ad_personalization: false,
    })
    if (choice) await setAnalyticsCollectionEnabled(analytics, true)
    enabled = choice && revision === choiceRevision
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

export async function saveAnalyticsChoice(choice) {
  const granted = choice === true
  enabled = false
  // Disable collection before persisting withdrawal; enable only after saving consent.
  if (!granted) await applyChoice(false)
  await AsyncStorage.setItem(STORAGE_KEY, granted ? 'granted' : 'denied')
  if (granted) await applyChoice(true)
}

export function trackScreen(name) {
  if (!enabled || typeof name !== 'string' || !/^[A-Za-z]{1,40}$/.test(name)) return
  try { logScreenView(getAnalytics(), { screen_name: name, screen_class: name }).catch(() => {}) } catch {}
}

export function trackCommerce(event, items) {
  if (!enabled) return
  const payload = buildCommercePayload(event, items)
  if (!payload) return
  try { logEvent(getAnalytics(), event, payload).catch(() => {}) } catch {}
}
