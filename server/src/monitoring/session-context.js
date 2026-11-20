import { validVisitorSession, visitorIdleSeconds } from '../../../shared/logReasons.js'

const visits = new Map()
const maxVisits = 30000
const idleMs = visitorIdleSeconds * 1000

function knownDelivery(row) {
  if (!/^\d{6}$/.test(row?.enteredPincode || '') || typeof row.pincodeServiceable !== 'boolean') return undefined
  return {
    enteredPincode: row.enteredPincode, pincodeServiceable: row.pincodeServiceable,
    deliveryCity: row.deliveryCity, deliveryState: row.deliveryState,
  }
}

export function carryDeliveryContext(sessionId, incoming, now = Date.now()) {
  const verified = knownDelivery(incoming)
  if (!validVisitorSession(sessionId)) return verified
  const existing = visits.get(sessionId)
  const facts = verified || (existing && now - existing.updatedAt < idleMs ? existing.facts : undefined)
  if (!facts) { visits.delete(sessionId); return }
  visits.delete(sessionId)
  visits.set(sessionId, { facts, updatedAt: now })
  while (visits.size > maxVisits) visits.delete(visits.keys().next().value)
  return facts
}

export function restoreDeliveryContexts(rows, now = Date.now()) {
  for (const row of rows) {
    const time = Date.parse(row.timestamp)
    if (time > now - idleMs && time <= now) carryDeliveryContext(row.sessionId, row, time)
  }
}
