import { isIP } from 'node:net'
import { ipLocationProvider } from '../monitoring/ip-location.js'
import { ACTIVITY_RETENTION_DAYS, ADMIN_RETENTION_DAYS, logSource } from '../monitoring/log-policy.js'
import { isLogReason, validVisitorSession, logReasons } from '../../../shared/logReasons.js'
import { phoneLookupHash } from '../monitoring/visit.js'
import { readableStatus } from '../../../shared/monitoring.js'
import { ForbiddenError, ValidationError } from 'adminjs'
import { prisma } from '../lib/prisma.js'
import { enrichLogRows } from './monitoring-presentation.js'
import { categories } from '../monitoring/sanitize.js'
import { logContext, logDurable, outboxHealth, persistCriticalLogs, monitoringState, changeDebugSettings, workerCall } from '../monitoring/index.js'

export async function monitoringHandler(request, _response, context) {
  // Re-read privileges so revoked/deactivated sessions cannot view logs or enable debug.
  const admin = context.currentAdmin?.id ? await prisma.user.findUnique({ where: { id: context.currentAdmin.id } }) : null
  if (!admin?.isActive || !['staff', 'admin', 'super_admin'].includes(admin.role)) throw new ForbiddenError('Only active backoffice users may view logs.')
  _response?.setHeader?.('Cache-Control', 'no-store')
  const fullAccess = admin.role === 'super_admin'
  const post = String(request.method).toLowerCase() === 'post'
  const businessRead = post && request.payload?.action === 'business-read'
  const query = businessRead ? request.payload.filters || {} : request.query || {}
  const tab = ['website', 'app', 'errors', 'admin'].includes(query.tab) ? query.tab : 'website'
  if (!post && query.view === 'access') return { fullAccess, activityDays: ACTIVITY_RETENTION_DAYS, adminDays: ADMIN_RETENTION_DAYS, ipLocationProvider: ipLocationProvider() }
  if (!businessRead && !fullAccess) throw new ForbiddenError('You do not have access to these logs.')
  if (post) {
    const headers = logContext.getStore()?.req?.headers || request.headers || {}
    if (headers['x-tokri-monitoring'] !== '1' || !['same-origin', 'none'].includes(headers['sec-fetch-site'])) {
      throw new ForbiddenError('Use monitoring controls from the admin panel.')
    }
    const action = request.payload?.action
    if (!businessRead && !['enable', 'disable'].includes(action)) throw new ValidationError({}, { message: 'Invalid debug action.' })
    if (!businessRead) {
      await changeDebugSettings(action === 'enable', request.payload?.minutes)
      await persistCriticalLogs()
    }
  }
  const keys = businessRead ? ['status', 'page', 'perPage'] : ['date', 'category', 'status', 'user', 'orderId', 'ip', 'search', 'page', 'perPage']
  const filters = Object.fromEntries(keys.map(key => [key, String(query[key] || '').slice(0, 100)]))
  if (filters.category && !categories.includes(filters.category)) throw new ValidationError({}, { message: 'Invalid log type.' })
  if (filters.date && (!/^\d{4}-\d{2}-\d{2}$/.test(filters.date) || !Number.isFinite(Date.parse(filters.date)) || new Date(filters.date).toISOString().slice(0, 10) !== filters.date)) throw new ValidationError({}, { message: 'Invalid date.' })
  if (businessRead) {
    filters.business = true
    filters.tab = tab
    if (['Website', 'Android app', 'iPhone app', 'Backoffice', 'Payment provider', 'Server API', 'System'].includes(query.source)) filters.source = query.source
    for (const key of ['from', 'to']) {
      if (!query[key]) continue
      const day = String(query[key])
      if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(Date.parse(day)) || new Date(day).toISOString().slice(0, 10) !== day) throw new ValidationError({}, { message: 'Choose a valid date.' })
      filters[key] = day
    }
    if (filters.from && filters.to && filters.from > filters.to) throw new ValidationError({}, { message: 'Choose an end date after the start date.' })
    if (isLogReason(query.reason)) filters.reason = query.reason
    if (/^\d{6}$/.test(query.pin || '')) filters.pin = String(query.pin)
    if (['true', 'false'].includes(query.coverage)) filters.coverage = query.coverage
    if (['app', 'website'].includes(query.device)) filters.device = query.device
    if (validVisitorSession(query.visitSession)) {
      filters.visitSession = query.visitSession
      filters.journey = query.journey === '1'
      if (filters.journey && tab !== 'admin') delete filters.tab
    }
    if (query.phone) {
      if (!fullAccess) {
        const mask = /^(\d{2})X{6}(\d{2})$/i.exec(String(query.phone))
        if (!mask) throw new ForbiddenError('Enter a masked phone number, such as 98XXXXXX21.')
        const customers = await prisma.customer.findMany({
          where: { AND: [
            { OR: [mask[1], '+91' + mask[1], '91' + mask[1]].map(prefix => ({ phone: { startsWith: prefix } })) },
            { phone: { endsWith: mask[2] } },
          ] },
          select: { id: true },
        })
        filters.maskedCustomerIds = customers.map(customer => customer.id)
      } else {
        filters.phoneHash = phoneLookupHash(query.phone)
        if (!filters.phoneHash) throw new ValidationError({}, { message: 'Enter a valid phone number.' })
      }
    }
    if (query.export === 'csv') { filters.export = 'csv'; filters.page = '1' }
  }
  const outbox = businessRead ? undefined : await outboxHealth()
  if (post && !businessRead) return { ...monitoringState(), outbox, canManageDebug: fullAccess }
  if (businessRead && tab === 'admin') {
    const recorded = await logDurable('audit', query.export === 'csv' ? 'admin.logs.exported' : 'admin.logs.opened', {
      actorId: admin.id, staffName: admin.name, status: 'success',
    })
    if (!recorded) throw new Error('The Admin/System access audit could not be recorded.')
  }
  try {
    const result = await workerCall('read', filters)
    const rows = filters.business ? await businessRows(result.rows, fullAccess) : await enrichLogRows(result.rows, prisma)
    if (filters.export === 'csv') return { csv: toCsv(rows), total: result.total, count: rows.length }
    if (businessRead) return { rows, total: result.total, perPage: result.perPage, summary: result.summary }
    return { ...result, rows: rows.map(({ phoneLookupHash: _hash, ...row }) => row), ...monitoringState(), outbox, canManageDebug: fullAccess }
  }
  catch { return { rows: [], files: [], total: 0, totalBytes: 0, page: 1, perPage: 50, ...monitoringState(), outbox, canManageDebug, storageError: 'Log storage is unavailable. Check the supervisor stderr stream and storage permissions.' } }
}

const actions = {
  'admin.logs.opened': 'Opened Admin/System logs',
  'admin.logs.exported': 'Exported Admin/System logs',
  'frontend.error': 'Website error',
  'frontend.api.failed': 'Website request failed',
  'request.aborted': 'Connection closed before completion',
  'delivery.pin.checked': 'Delivery pincode checked',
  'checkout.guest.blocked': 'Checkout attempt blocked',
  'checkout.details.missing': 'Checkout details missing',
  'checkout.minimum.blocked': 'Checkout below minimum order',
  'checkout.network.failed': 'Checkout connection interrupted',
  'payment.browser.cancelled': 'Payment cancelled',
  'payment.browser.failed': 'Payment failed',
  'cart.added': 'Item added to cart',
  'cart.removed': 'Item removed from cart',
  'cart.quantity.changed': 'Cart quantity changed',
  'cart.cleared': 'Cart cleared',
}
async function businessRows(rows, fullAccess) {
  const ids = [...new Set(rows.map(row => row.verifiedCustomerId).filter(Boolean))]
  const people = ids.length ? await prisma.customer.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, phone: true } }).catch(() => []) : []
  const customers = new Map(people.map(person => [person.id, person]))
  const enriched = await enrichLogRows(rows, prisma)
  return enriched.map(row => {
    const person = customers.get(row.verifiedCustomerId)
    const phone = String(person?.phone || '').match(/\d{10}$/)?.[0]
    const maskedPhone = phone ? phone.slice(0, 2) + 'XXXXXX' + phone.slice(-2) : ''
    const source = logSource(row)
    const staff = source === 'Backoffice' ? row.staffName || row.presentation?.actor : undefined
    const who = staff && staff !== 'Name not recorded' ? staff : source === 'Backoffice' ? 'Unknown staff member' : row.visitorKind === 'guest' ? 'Guest' : row.visitorKind === 'system' || row.category === 'audit' && !row.verifiedCustomerId ? 'System' :
      row.visitorKind === 'customer' ? [person?.name || 'Signed-in customer', maskedPhone].filter(Boolean).join(' · ') : 'Unknown'
    const where = [row.locationCity, row.locationState, row.locationCountry].filter(Boolean).join(', ') || 'Unknown'
    const pin = row.enteredPincode || row.deliveryPin
    const coverage = (row.pincodeServiceable === true || row.deliveryCoverage === 'serviceable') ? 'Yes' : (row.pincodeServiceable === false || row.deliveryCoverage === 'unserviceable') ? 'No' : 'Unknown'
    const deliveryArea = [row.deliveryCity, row.deliveryState].filter(Boolean).join(', ')
    const status = readableStatus(row)
    const reasonCode = status === 'Failed' ? (isLogReason(row.reasonCode) ? row.reasonCode : 'UNKNOWN') : undefined
    const device = source === 'Backoffice' ? 'Backoffice' : row.platform === 'website' ? ['Website', [row.browser, row.deviceType].filter(Boolean).join(' ')].filter(Boolean).join(', ')
      : row.platform === 'android' ? 'Android app' : row.platform === 'ios' ? 'iPhone app' : row.visitorKind === 'system' ? 'Not applicable' : 'Unknown'
    return {
      eventId: row.eventId, timestamp: row.timestamp, sessionId: row.sessionId,
      who, source, where: where + ({ ip: ' (approximate)', pincode: ' (delivery area)' }[row.locationSource] || ''),
      pincode: pin ? [pin + ', Delivers: ' + coverage, deliveryArea].filter(Boolean).join(' · ') : row.visitorKind === 'system' ? 'Not applicable' : 'Unknown',
      action: row.route === '/api/v1/geo/pincode' ? 'Delivery pincode checked' : Object.hasOwn(actions, row.event) ? actions[row.event] : row.presentation?.action || 'Activity recorded',
      why: reasonCode ? logReasons[reasonCode][0] : 'Not applicable',
      hint: reasonCode ? logReasons[reasonCode][1] : undefined,
      result: status === 'Failed' ? 'Failed' : status === 'Successful' ? 'Successful' : 'Info',
      device,
      details: { 'Connection IP': isIP(row.ip || '') ? row.ip : undefined,
        'Customer phone': fullAccess ? phone : maskedPhone, 'Request ID': row.requestId, 'Session ID': row.sessionId, 'Reason code': reasonCode || 'Not applicable',
        'Location source': ({ gps: 'GPS', pincode: 'Delivery pincode', ip: 'IP address (approximate)' })[row.locationSource], 'GPS consent': row.gpsConsent === true ? 'Granted' : row.gpsConsent === false ? 'Denied' : undefined,
        Platform: row.platform, 'App build': row.appBuild || (row.platform === 'website' ? 'Not applicable' : undefined) },
    }
  })
}
function toCsv(rows) {
  const quote = value => {
    const text = String(value ?? 'Unknown')
    return '"' + (/^[\s\u0000-\u001f]*[=+@-]/.test(text) ? "'" + text : text).replaceAll('"', '""') + '"'
  }
  return [
    ['Time (IST)', 'Who', 'Where', 'Pincode', 'What happened', 'Why', 'Device', 'Source'],
    ...rows.map(row => [new Date(row.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }), row.who, row.where, row.pincode, row.action + ' · ' + row.result, row.why, row.device, row.source]),
  ].map(row => row.map(quote).join(',')).join('\r\n')
}
