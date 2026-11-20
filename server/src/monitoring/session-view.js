import { isIP } from 'node:net'
import { readableStatus } from '../../../shared/monitoring.js'
import { logSource } from './log-policy.js'

export function isBackgroundCall(row) {
  if (readableStatus(row) === 'Failed') return false
  if (['request.timing', 'website.page.ready'].includes(row.event)) return true
  if (row.method && row.method !== 'GET') return false
  return /^\/api\/v1\/(?:products|categories)(?:\/|$)/.test(row.route || '') ||
    ['/api/v1/settings/public', '/api/v1/app/bootstrap'].includes(row.route)
}

export function belongsToSessionTab(row, tab) {
  const source = logSource(row)
  if (tab === 'app') return ['Android app', 'iPhone app'].includes(source)
  return source === 'Website'
}

export function addSessionEvent(sessions, row, background) {
  const time = row.timestamp
  let session = sessions.get(row.sessionId)
  if (!session) {
    session = {
      sessionGroup: true, sessionId: row.sessionId, startedAt: time, timestamp: time,
      eventCount: 0, backgroundCount: 0, matched: false, status: 'observed',
    }
    sessions.set(row.sessionId, session)
  }
  session.eventCount++
  if (background) session.backgroundCount++
  if (time < session.startedAt) session.startedAt = time
  if (time >= session.timestamp) {
    session.timestamp = time
    for (const key of ['platform', 'browser', 'deviceType', 'logSource']) session[key] = row[key] || session[key]
  }
  if (isIP(row.ip || '') && (!session.ipAt || time >= session.ipAt)) {
    session.ipAt = time
    session.ip = row.ip
  }
  if (row.visitorKind === 'guest' && (!session.guestAt || time < session.guestAt)) session.guestAt = time
  if (row.verifiedCustomerId) {
    if (!session.verifiedAt || time < session.verifiedAt) session.verifiedAt = time
    if (!session.identityAt || time >= session.identityAt) {
      session.verifiedCustomerId = row.verifiedCustomerId
      session.identityAt = time
    }
  }
  if (Number.isInteger(row.cartItemCount) && (!session.cartAt || time >= session.cartAt)) {
    session.cartAt = time
    session.cartItemCount = row.cartItemCount
  }
  const hasPin = typeof row.pincodeServiceable === 'boolean' && /^\d{6}$/.test(row.enteredPincode || '')
  if (hasPin && (!session.pinAt || time >= session.pinAt)) {
    session.pinAt = time
    for (const key of ['enteredPincode', 'pincodeServiceable', 'deliveryCity', 'deliveryState']) session[key] = row[key]
  }
  if (row.locationSource && row.locationSource !== 'none' && (!session.locationAt || time >= session.locationAt)) {
    session.locationAt = time
    for (const key of ['locationCity', 'locationState', 'locationCountry', 'locationSource']) session[key] = row[key]
  }
  const outcome = readableStatus(row)
  const paid = ['paid', 'captured'].includes(row.paymentStatus) || (row.route === '/api/v1/checkout/confirm-cod' && outcome === 'Successful')
  if (paid || (outcome === 'Failed' && session.status !== 'success')) session.status = paid ? 'success' : 'failure'
  else if (outcome === 'Successful' && !background && session.status === 'observed') session.activitySucceeded = true
  return session
}

export function finishSession(session) {
  if (session.activitySucceeded && session.status === 'observed') session.status = 'success'
  session.visitorKind = session.verifiedCustomerId ? 'customer' : session.guestAt ? 'guest' : 'unknown'
  session.guestTransition = Boolean(session.guestAt && session.verifiedAt && session.guestAt <= session.verifiedAt)
  return session
}

export function carryTimelineDelivery(rows) {
  let known
  return rows.map(row => {
    if (typeof row.pincodeServiceable === 'boolean' && /^\d{6}$/.test(row.enteredPincode || '')) {
      const { enteredPincode, pincodeServiceable, deliveryCity, deliveryState } = row
      known = { enteredPincode, pincodeServiceable, deliveryCity, deliveryState }
    }
    return known ? { ...row, ...known } : row
  })
}
