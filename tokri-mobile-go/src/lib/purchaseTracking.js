import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_BASE_URL } from '../config'
import { authGet } from './api'
import { getAnalyticsConsentId, trackConfirmedPurchase } from './analytics'

// Serialize all callers in this process. Mark before handing off to the SDK:
// uncertain crashes may lose an event rather than risk sending it twice.
let serial = Promise.resolve()
let activeCustomerId = null
let sessionRevision = 0

export function setPurchaseTrackingSession(customerId) {
  const next = customerId || null
  if (next !== activeCustomerId) { activeCustomerId = next; sessionRevision += 1 }
}
export function recoverPurchases(token, customerId) {
  if (!token || !customerId) return Promise.resolve()
  const expectedConsentId = getAnalyticsConsentId()
  const revision = sessionRevision
  const active = () => activeCustomerId === customerId && sessionRevision === revision && getAnalyticsConsentId() === expectedConsentId
  if (!expectedConsentId || !active()) return Promise.resolve()
  const task = serial.catch(() => {}).then(async () => {
    if (!active()) return
    const data = await authGet(`/checkout/app-purchases?consentId=${encodeURIComponent(expectedConsentId)}`, token)
    if (!active() || !Array.isArray(data?.purchases)) return
    const key = `tokri_purchase_ledger_v1:${API_BASE_URL}:${customerId}`
    let recorded = []
    try {
      const parsed = JSON.parse((await AsyncStorage.getItem(key)) || '[]')
      if (!Array.isArray(parsed)) return
      recorded = parsed.filter((id) => typeof id === 'string')
    } catch { return }
    for (const payload of data.purchases.slice(0, 30)) {
      const id = payload?.transaction_id
      if (!/^[a-f0-9]{64}$/.test(id || '') || recorded.includes(id) || !active()) continue
      recorded = [...recorded, id].slice(-1000)
      // If persistence fails, do not send; a later recovery can safely try again.
      await AsyncStorage.setItem(key, JSON.stringify(recorded))
      if (active()) await trackConfirmedPurchase(payload, expectedConsentId)
    }
  })
  serial = task
  return task
}
