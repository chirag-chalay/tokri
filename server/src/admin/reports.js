import { randomUUID } from 'node:crypto'
import { ForbiddenError } from 'adminjs'
import { prisma } from '../lib/prisma.js'
import { workerCall, logContext } from '../monitoring/index.js'
import { ACTIVITY_RETENTION_DAYS, DAY_MS } from '../monitoring/log-policy.js'
import { istDate } from '../monitoring/sanitize.js'
import { failureAlertEnabled } from '../monitoring/failure-alerts.js'
import { paise, reportRecordLimit } from '../monitoring/report-facts.js'
import { buildReport } from './report-tables.js'
import { deliveryAvailability } from '../services/delivery.js'

const sections = new Set(['pincodes', 'funnel', 'guest', 'failures', 'channels', 'carts', 'products', 'orders', 'hours', 'areas', 'landing', 'alerts'])
const needsOrders = new Set(['pincodes', 'products', 'orders'])
const snapshots = new Map()
const snapshotLifetime = 10 * 60000
const pageSize = 40
const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value
const validPin = value => typeof value === 'string' && /^\d{6}$/.test(value)

export function periodBounds(filters, now) {
  const from = filters.from, to = filters.to, today = istDate(new Date(now))
  if (!validDate(from) || !validDate(to) || from > to || to > today) return null
  const start = Date.parse(from + 'T00:00:00+05:30')
  const nextDay = Date.parse(to + 'T00:00:00+05:30') + DAY_MS
  const duration = nextDay - start
  if (duration > ACTIVITY_RETENTION_DAYS * DAY_MS) return null
  const end = Math.min(nextDay, now)
  return { from, to, start, end, previousStart: start - duration, previousEnd: end - duration }
}

function reportPlatform(source) {
  if (source?.source === 'web') return 'website'
  return source?.source === 'app' && ['android', 'ios'].includes(source.platform) ? source.platform : 'unknown'
}

async function getOrders(bounds, pin, logConfirmations, includeItems) {
  const records = await prisma.order.findMany({
    where: { createdAt: { gte: new Date(bounds.start), lt: new Date(bounds.end) } },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: reportRecordLimit + 1,
    select: { orderNo: true, createdAt: true, status: true, paymentStatus: true, paymentMode: true, deliveryPincode: true,
      deliveryOption: true, expectedDeliveryDate: true, address: true, trackingContext: true, grandTotal: true,
      itemsTotal: true, deliveryCharge: true, handlingCharge: true, discount: true,
      ...(includeItems ? { items: { select: { productId: true, name: true, quantity: true, priceValue: true, discount: true } } } : {}) },
  })
  if (records.length > reportRecordLimit) return null
  return records.flatMap(row => {
    const pincode = validPin(row.deliveryPincode) ? row.deliveryPincode : validPin(row.address?.pincode) ? row.address.pincode : null
    if (pin && pincode !== pin) return []
    const proof = logConfirmations.get(row.orderNo)
    const confirmed = row.paymentStatus === 'paid' || Boolean(proof) ||
      row.paymentMode === 'cod' && (row.trackingContext?.codConfirmed === true ||
        row.trackingContext?.source === 'app' && Number.isFinite(row.trackingContext.confirmedAt))
    const platform = proof?.platform || reportPlatform(row.trackingContext)
    return [{
      orderNo: row.orderNo, time: row.createdAt.getTime(), status: row.status, mode: row.paymentMode, paymentStatus: row.paymentStatus,
      platform, pin: pincode, option: row.deliveryOption, expected: row.expectedDeliveryDate?.toISOString().slice(0, 10),
      amount: paise(row.grandTotal), itemsTotal: paise(row.itemsTotal), deliveryCharge: paise(row.deliveryCharge),
      handlingCharge: paise(row.handlingCharge), discount: paise(row.discount), confirmed, items: (row.items || []).map(item => {
        const price = paise(item.priceValue), discount = paise(item.discount)
        return { productId: item.productId, name: item.name, quantity: item.quantity,
          amount: price === null || discount === null || price * item.quantity < discount ? null : price * item.quantity - discount }
      }),
    }]
  })
}

function prune(now) {
  for (const [key, value] of snapshots) if (value.expires <= now) snapshots.delete(key)
}

export function reportCsv(view) {
  const quote = value => {
    const raw = String(value ?? 'Unavailable')
    const safe = /^[\s\u0000-\u001f]*[=+@-]/.test(raw) ? "'" + raw : raw
    return '"' + safe.replaceAll('"', '""') + '"'
  }
  return [view.headers, ...view.rows.map(row => row.values)].map(row => row.map(quote).join(',')).join('\r\n')
}

function renderSnapshot(snapshot, query) {
  const { report, id, metadata } = snapshot
  const drill = typeof query.drill === 'string' && query.drill.length <= 180 ? query.drill : ''
  if (drill && !report.details.has(drill)) return { error: 'This report record is unavailable. Open it again from the report.' }
  const view = drill ? report.details.get(drill) : report.main
  if (query.format === 'csv') return { csv: reportCsv(view), total: view.rows.length }
  const pages = Math.max(1, Math.ceil(view.rows.length / pageSize))
  const page = Math.min(pages, Math.max(1, Math.floor(Number(query.page) || 1)))
  return { id, metadata, cards: report.cards, note: report.note, headers: view.headers,
    rows: view.rows.slice((page - 1) * pageSize, page * pageSize), total: view.rows.length, page, pages }
}

export async function reportsHandler(request, response, context) {
  const adminId = context.currentAdmin?.id
  const admin = adminId ? await prisma.user.findUnique({ where: { id: adminId }, select: { isActive: true, role: true } }) : null
  if (!admin?.isActive || !['staff', 'admin', 'super_admin'].includes(admin.role)) throw new ForbiddenError('Only active backoffice users can view reports.')
  response?.setHeader?.('Cache-Control', 'no-store')
  if (String(request.method).toLowerCase() !== 'post') return {}
  const headers = logContext.getStore()?.req?.headers || request.headers || {}
  if (headers['x-tokri-monitoring'] !== '1' || !['same-origin', 'none'].includes(headers['sec-fetch-site'])) throw new ForbiddenError('Open reports from the backoffice.')
  const query = request.payload || {}
  const now = Date.now()
  prune(now)
  if (query.id) {
    const snapshot = snapshots.get(query.id)
    if (!snapshot || snapshot.adminId !== adminId) return { expired: true, error: 'This report snapshot has expired. Refresh the report to load current records.' }
    return renderSnapshot(snapshot, query)
  }
  const window = periodBounds(query, now)
  if (!sections.has(query.section) || !window || query.pin && !validPin(query.pin) ||
    query.channel && !['website', 'android', 'ios'].includes(query.channel)) return { error: 'Choose a valid report, date range of up to 90 days, and six-digit pincode.' }
  const retentionStart = now - ACTIVITY_RETENTION_DAYS * DAY_MS
  let previousAvailable = window.previousStart >= retentionStart
  const logStart = Math.max(retentionStart, previousAvailable ? window.previousStart : window.start)
  let result
  try {
    result = await workerCall('read', { report: { start: logStart, end: window.end } })
    if (result.tooMany && previousAvailable) {
      previousAvailable = false
      result = await workerCall('read', { report: { start: Math.max(window.start, retentionStart), end: window.end } })
    }
  } catch {
    return { error: 'The activity report could not be read. Try again with a shorter date range.' }
  }
  if (result.tooMany) return { error: 'This date range contains more than 50,000 records. Choose a shorter range to get complete results.' }
  const channelMatches = row => !query.channel || row.platform === query.channel
  const matches = row => channelMatches(row) && (!query.pin || row.pin === query.pin)
  const journeyFacts = result.facts.filter(row => row.time >= window.start && channelMatches(row))
  const inWindow = query.pin ? journeyFacts.filter(row => row.pin === query.pin) : journeyFacts
  const previous = previousAvailable && result.facts.filter(row => row.time < window.previousEnd && matches(row))
  const confirmations = new Map(result.facts.filter(row => row.order).map(row => [row.order, row]))
  const [allOrders, configured, products] = await Promise.all([
    needsOrders.has(query.section) ? getOrders(window, query.pin, confirmations, query.section === 'products') : [],
    query.section === 'pincodes' ? prisma.serviceablePincode.findMany({ select: { pincode: true, city: true, isActive: true, morningEnabled: true, expressEnabled: true,
      state: { select: { name: true } } } }) : [],
    query.section === 'products' ? prisma.product.findMany({ orderBy: { name: 'asc' }, select: { id: true, slug: true, name: true } }) : [],
  ])
  if (!allOrders) return { error: 'This date range contains more than 50,000 orders. Choose a shorter range for complete results.' }
  const coverage = new Map(configured.map(row => {
    const available = deliveryAvailability(row)
    return [row.pincode, { city: row.city, state: row.state?.name, morning: available.morning.enabled, express: available.express.enabled }]
  }))
  const orders = allOrders.filter(row => !query.channel || row.platform === query.channel)
  const report = buildReport({ section: query.section, facts: inWindow, journeyFacts, orders, coverage, products, end: window.end, alertsEnabled: failureAlertEnabled() })
  const metric = list => list.filter(row => query.section === 'failures' ? row.shoppingFailure : query.section === 'pincodes' ? row.pinStep === 'Pincode check' : row.platform).length
  const prevFirst = istDate(new Date(window.previousStart))
  const prevLast = istDate(new Date(window.previousEnd - 1))
  const previousDays = result.days.filter(day => day >= prevFirst && day <= prevLast)
  const comparison = previous && !result.corrupt && previousDays.length > 0 && previousDays.length === Math.ceil((window.previousEnd - window.previousStart) / DAY_MS) &&
    ['channels', 'failures', 'pincodes'].includes(query.section) ?
    { label: { channels: 'Recorded events', failures: 'Shopping failures', pincodes: 'Recorded pincode checks' }[query.section],
      current: metric(inWindow), previous: metric(previous), from: window.previousStart, end: window.previousEnd } : null
  const snapshot = {
    id: randomUUID(), adminId, expires: Date.now() + snapshotLifetime, report,
    metadata: { from: window.from, to: window.to, end: window.end, comparison,
      observedDays: result.days.filter(day => day >= window.from && day <= window.to).length,
      corrupt: result.corrupt, retainedFrom: istDate(new Date(retentionStart)),
      eventsWithoutSession: inWindow.filter(row => row.platform && !row.session).length,
      ordersWithoutChannel: allOrders.filter(row => row.platform === 'unknown').length },
  }
  snapshots.set(snapshot.id, snapshot)
  while (snapshots.size > 6) snapshots.delete(snapshots.keys().next().value)
  return renderSnapshot(snapshot, query)
}
