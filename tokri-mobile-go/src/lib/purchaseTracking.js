import { recordTrackingOutcome } from './trackingDiagnostics'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_BASE_URL } from '../config'
import { authGet, authPost } from './api'
import { getAnalyticsConsentId, trackConfirmedPurchase } from './analytics'

let serial = Promise.resolve()
let activeCustomerId = null
let sessionRevision = 0
const ASSOCIATIONS_KEY = 'tokri_mobile_tracking_accounts_v1'
const REVOKE_KEY = 'tokri_mobile_tracking_revocations_v1'
let privacySerial = Promise.resolve()

export function setPurchaseTrackingSession(customerId) {
  const next = customerId || null
  if (next !== activeCustomerId) { activeCustomerId = next; sessionRevision += 1 }
}

export function queueRevocation(customerId, consentId) {
  privacySerial = privacySerial.catch(() => {}).then(async () => {
    const rows = JSON.parse((await AsyncStorage.getItem(REVOKE_KEY)) || '[]')
    const associations = JSON.parse((await AsyncStorage.getItem(ASSOCIATIONS_KEY)) || '[]')
    const customers = new Set(associations.filter((row) => row.consentId === consentId).map((row) => row.customerId))
    if (customerId) customers.add(customerId)
    for (const id of customers) if (!rows.some((row) => row.customerId === id && row.consentId === consentId)) rows.push({ customerId: id, consentId })
    await AsyncStorage.setItem(REVOKE_KEY, JSON.stringify(rows))
    await AsyncStorage.setItem(ASSOCIATIONS_KEY, JSON.stringify(associations.filter((row) => row.consentId !== consentId)))
  })
  return privacySerial
}

export function flushRevocations(token, customerId) {
  privacySerial = privacySerial.catch(() => {}).then(async () => {
    const rows = JSON.parse((await AsyncStorage.getItem(REVOKE_KEY)) || '[]')
    const remaining = []
    for (const row of rows) {
      if (row.customerId !== customerId) { remaining.push(row); continue }
      try { await authPost('/checkout/app-purchases/revoke', token, { consentId: row.consentId }) } catch { remaining.push(row); recordTrackingOutcome('cleanupPending') }
    }
    await AsyncStorage.setItem(REVOKE_KEY, JSON.stringify(remaining))
  })
  return privacySerial
}

export function recoverPurchases(token, customerId) {
  if (!token || !customerId) return Promise.resolve()
  const consentId = getAnalyticsConsentId()
  const revision = sessionRevision
  const active = () => activeCustomerId === customerId && sessionRevision === revision && getAnalyticsConsentId() === consentId
  if (!consentId || !active()) return Promise.resolve()
  const task = serial.catch(() => {}).then(async () => {
    await (privacySerial = privacySerial.catch(() => {}).then(async () => {
      const associations = JSON.parse((await AsyncStorage.getItem(ASSOCIATIONS_KEY)) || '[]')
      if (!associations.some((row) => row.customerId === customerId && row.consentId === consentId)) {
        associations.push({ customerId, consentId })
        await AsyncStorage.setItem(ASSOCIATIONS_KEY, JSON.stringify(associations))
      }
    }))
    const key = `tokri_purchase_ledger_v1:${API_BASE_URL}:${customerId}`
    const ledger = JSON.parse((await AsyncStorage.getItem(key)) || '[]')
    if (!Array.isArray(ledger)) return
    const records = ledger.map((row) => typeof row === 'string' ? { id: row, state: 'sdkQueued' } : row)
    let cursor = ''
    // Bounded pages per foreground recovery. Server claims coordinate other devices.
    for (let page = 0; page < 10 && active(); page += 1) {
      const data = await authGet(`/checkout/app-purchases?consentId=${encodeURIComponent(consentId)}&cursor=${encodeURIComponent(cursor)}`, token)
      if (!active() || !Array.isArray(data?.purchases)) return
      for (const payload of data.purchases.slice(0, 30)) {
        const id = payload?.transaction_id
        if (!/^[a-f0-9]{64}$/.test(id || '') || records.some((row) => row.id === id) || !active()) continue
        if (!/^[a-zA-Z0-9_-]{1,80}$/.test(payload.orderKey || '')) continue
        const claim = { orderKey: payload.orderKey, consentId }
        const result = await authPost('/checkout/app-purchases/dispatch', token, { ...claim, state: 'claim' })
        if (!result.accepted) continue
        const record = { id, state: 'dispatching', at: Date.now() }
        records.push(record)
        // A crash after claiming is uncertain. Never automatically repeat that send.
        await AsyncStorage.setItem(key, JSON.stringify(records.slice(-1000)))
        const queued = active() && await trackConfirmedPurchase(payload, consentId)
        record.state = queued ? 'sdkQueued' : 'uncertain'
        if (!queued) recordTrackingOutcome('dispatchUncertain')
        await AsyncStorage.setItem(key, JSON.stringify(records.slice(-1000)))
        await authPost('/checkout/app-purchases/dispatch', token, { ...claim, state: record.state }).catch(() => {})
      }
      if (!data.nextCursor || data.nextCursor === cursor) break
      cursor = data.nextCursor
    }
  })
  serial = task
  return task
}
