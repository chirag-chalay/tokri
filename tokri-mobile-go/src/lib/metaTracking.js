import AsyncStorage from '@react-native-async-storage/async-storage'
import { AppState, Platform } from 'react-native'
import Constants from 'expo-constants'
import { AppEventsLogger, Settings } from 'react-native-fbsdk-next'
import { getTrackingPermissionsAsync, requestTrackingPermissionsAsync } from 'expo-tracking-transparency'
import { fetchJson } from './api'
import { buildMetaAppEvent } from './metaTrackingEvents'
import { recordTrackingOutcome } from './trackingDiagnostics'

const CHOICE = 'tokri_marketing_consent_v1'
const ID = 'tokri_marketing_consent_id_v1'
let effectiveId = null
let customerId = null
let serial = Promise.resolve()
let revision = 0
let initialized = false

function apply(choice, persist, prompt) {
  const current = ++revision
  effectiveId = null
  serial = serial.catch(() => {}).then(async () => {
    let marker = await AsyncStorage.getItem(ID)
    if (persist) {
      marker = choice ? `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}` : null
      if (marker) await AsyncStorage.setItem(ID, marker)
      else await AsyncStorage.removeItem(ID)
      await AsyncStorage.setItem(CHOICE, choice ? 'granted' : 'denied')
    }
    let remote = false
    try { remote = (await fetchJson('/checkout/app-tracking-config'))?.metaEnabled === true } catch {}
    let allowed = Boolean(choice && marker && remote && Constants.expoConfig?.extra?.metaEnabled)
    if (allowed && Platform.OS === 'ios') {
      const permission = prompt && AppState.currentState === 'active' ? await requestTrackingPermissionsAsync() : await getTrackingPermissionsAsync()
      allowed = permission.status === 'granted'
    }
    if (current !== revision) return
    // SDK native defaults are OFF. Do not initialize before consent and ATT.
    await Settings.setAdvertiserTrackingEnabled(allowed)
    if (current !== revision) return
    Settings.setAutoLogAppEventsEnabled(allowed)
    Settings.setAdvertiserIDCollectionEnabled(allowed)
    if (allowed) {
      if (!initialized) { Settings.initializeSDK(); initialized = true }
      AppEventsLogger.setUserID(customerId)
      effectiveId = marker
    } else if (initialized) AppEventsLogger.setUserID(null)
  })
  return serial
}

export async function loadMetaChoice() {
  const current = revision
  const value = await AsyncStorage.getItem(CHOICE)
  const choice = value === 'granted' ? true : value === 'denied' ? false : null
  if (current === revision) await apply(choice === true, false, false)
  return choice
}
export function saveMetaChoice(choice) { return apply(choice === true, true, choice === true) }
export function getMetaConsentId() { return effectiveId }
export function readMetaConsentId() { return AsyncStorage.getItem(ID) }
export function setMetaCustomer(id) {
  customerId = typeof id === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(id) ? id : null
  if (initialized) { try { AppEventsLogger.setUserID(effectiveId ? customerId : null) } catch {} }
}
export function trackMetaAction(action, input) {
  if (!effectiveId) return false
  const event = buildMetaAppEvent(action, input, AppEventsLogger)
  if (!event) return false
  try {
    if (event.method === 'purchase') AppEventsLogger.logPurchase(event.amount, event.currency, event.parameters)
    else if (typeof event.value === 'number') AppEventsLogger.logEvent(event.name, event.value, event.parameters)
    else AppEventsLogger.logEvent(event.name, event.parameters)
    return true
  } catch { recordTrackingOutcome('sdkRejected'); return false }
}
export async function trackMetaPurchase(payload, expectedId) {
  if (!expectedId || effectiveId !== expectedId) return false
  return trackMetaAction('purchase', { commerce: payload, grandTotal: payload.grandTotal })
}
