import { readableStatus } from '../../../shared/monitoring.js'
import { activityKey, countableActivity, customerActivityChannel, DAY_MS, isCheckout, isConfirmedCheckout, isCustomerActivity, logTab, reachedCheckout, recordedReason } from './log-policy.js'
import { validVisitorSession } from '../../../shared/logReasons.js'
import { istDate } from './sanitize.js'

const hourMs = 3600000
const istOffset = 330 * 60000
const counter = () => new Map()
const increment = (map, key) => map.set(key, (map.get(key) || 0) + 1)
const topEntry = map => [...map].sort(([left, a], [right, b]) => b - a || left.localeCompare(right))[0]
const totals = () => ({ activity: 0, failedCheckouts: 0, pincodes: {} })

export function insightWindow(now, alertOnly) {
  const hour = Math.floor((now + istOffset) / hourMs) * hourMs - istOffset
  const today = Date.parse(istDate(new Date(now)) + 'T00:00:00+05:30')
  const daysSinceMonday = (new Date(today + istOffset).getUTCDay() + 6) % 7
  const week = today - daysSinceMonday * DAY_MS
  return { hour, today, week, start: alertOnly ? hour - 2 * hourMs : Math.min(today - DAY_MS, week, hour - 2 * hourMs) }
}

export function createLogInsights(now, { alertOnly = false } = {}) {
  const { hour, today, week, start } = insightWindow(now, alertOnly)
  const hourlyFailures = [new Set(), new Set()]
  const demand = counter(), hours = counter(), cities = counter(), approxCities = new Set()
  const channelActivity = { today: { website: new Set(), app: new Set() }, yesterday: { website: new Set(), app: new Set() } }
  const checkoutEntries = new Map(), checkoutBlocks = new Map()
  const weekActivity = new Set(), weekDemand = new Set()
  const dailyActivity = new Set(), dailyFailedCheckouts = new Set(), dailyFailedPins = new Set()
  const trends = Object.fromEntries(['website', 'app', 'errors', 'admin'].map(tab => [tab, { today: totals(), yesterday: totals() }]))

  function observe(row, category) {
    const time = Date.parse(row.timestamp)
    if (!Number.isFinite(time) || time < start || time > now) return
    if (!countableActivity(row, category)) return

    const customer = isCustomerActivity(row, category)
    const failed = readableStatus({ ...row, category }) === 'Failed'
    const reason = failed ? recordedReason(row) : undefined
    const key = activityKey(row)
    if (customer && failed && time < hour && time >= hour - 2 * hourMs) {
      hourlyFailures[time < hour - hourMs ? 0 : 1].add(key)
    }
    if (alertOnly) return

    const tab = logTab(row, category)
    const channel = customerActivityChannel(row, category)
    if (channel && time >= today - DAY_MS) {
      const period = time < today ? 'yesterday' : 'today'
      channelActivity[period][channel].add(key)
    }
    const pin = row.enteredPincode || row.deliveryPin
    const checkedPin = /^\d{6}$/.test(pin || '') && (row.event === 'delivery.pin.checked' || row.route === '/api/v1/geo/pincode')
    if ((customer || tab === 'admin') && time >= today - DAY_MS) {
      const period = time < today ? 'yesterday' : 'today'
      const day = trends[tab][period]
      const dailyKey = [tab, period, key].join('/')
      if (!dailyActivity.has(dailyKey)) { dailyActivity.add(dailyKey); day.activity++ }
      if (failed && isCheckout(row) && !dailyFailedCheckouts.has(dailyKey)) {
        dailyFailedCheckouts.add(dailyKey)
        day.failedCheckouts++
      }
      if (checkedPin && reason === 'PINCODE_NOT_SERVICEABLE' && !dailyFailedPins.has(dailyKey)) {
        dailyFailedPins.add(dailyKey)
        day.pincodes[pin] = (day.pincodes[pin] || 0) + 1
      }
    }
    if (!customer || time < week) return

    if (!weekActivity.has(key)) {
      weekActivity.add(key)
      const hourOfDay = new Date(time + istOffset).getUTCHours()
      increment(hours, String(hourOfDay).padStart(2, '0'))
      const city = row.locationCity || row.deliveryCity
      if (city) {
        increment(cities, city)
        if (row.locationSource === 'ip') approxCities.add(city)
      }
    }
    if (checkedPin && reason === 'PINCODE_NOT_SERVICEABLE' && !weekDemand.has(key)) {
      weekDemand.add(key)
      increment(demand, pin)
    }
    // A guest reaching the website checkout is observable today. Native app
    // checkout entry and guest-session events arrive with the Phase 2 release.
    if (row.platform !== 'website' || row.visitorKind !== 'guest' || !row.sessionId) return
    if (row.event === 'website.navigation' && row.pagePath === '/checkout') {
      checkoutEntries.set(row.sessionId, Math.min(checkoutEntries.get(row.sessionId) ?? time, time))
    }
    if (row.event === 'checkout.guest.blocked' && reason === 'AUTH_REQUIRED') {
      checkoutBlocks.set(row.sessionId, Math.max(checkoutBlocks.get(row.sessionId) ?? time, time))
    }
  }

  function result() {
    const hourly = { endingAt: new Date(hour).toISOString(), previous: hourlyFailures[0].size, latest: hourlyFailures[1].size }
    if (alertOnly) return { hourly }
    const [pin, count] = topEntry(demand) || []
    const [peak, peakCount] = topEntry(hours) || []
    const [city, cityCount] = topEntry(cities) || []
    const blocked = [...checkoutEntries].filter(([session, enteredAt]) => (checkoutBlocks.get(session) ?? 0) >= enteredAt).length
    return {
      trends, hourly,
      channelTrend: {
        today: channelActivity.today.website.size + channelActivity.today.app.size,
        yesterday: channelActivity.yesterday.website.size + channelActivity.yesterday.app.size,
      },
      demand: pin ? { pin, count } : null,
      checkout: { reached: checkoutEntries.size, blocked },
      peak: peak ? { hour: peak, count: peakCount } : null,
      city: city ? { name: city, count: cityCount, approximate: approxCities.has(city) } : null,
    }
  }
  return { observe, result, start }
}

export function hasFailureSpike({ latest, previous }) {
  return previous > 0 && latest > previous * 2
}

export function createWebsiteSalesFunnel() {
  const visits = new Map()
  const products = new Map()

  function observe(row) {
    if (customerActivityChannel(row) !== 'website' || !countableActivity(row, row.category) || !validVisitorSession(row.sessionId)) return
    const viewed = row.event === 'website.navigation' && /^\/product\/[a-z0-9-]+$/i.test(row.pagePath || '') && readableStatus(row) === 'Successful'
    const added = row.event === 'cart.added' || row.event === 'cart.quantity.changed' && row.delta > 0
    const checkout = reachedCheckout(row)
    const confirmed = isConfirmedCheckout(row)
    const checkoutFailure = readableStatus(row) === 'Failed' && (isCheckout(row) || row.event?.startsWith('payment.browser.') || row.route?.startsWith('/api/v1/checkout/'))
    if (row.event !== 'website.navigation' && !added && !checkout && !confirmed && !checkoutFailure) return
    const time = Date.parse(row.timestamp)
    const visit = visits.get(row.sessionId) || { checkout: Infinity, confirmed: -Infinity, viewed: false, added: false, navigated: false }
    visit.navigated ||= row.event === 'website.navigation'
    visit.viewed ||= viewed
    visit.added ||= added
    if (checkout) visit.checkout = Math.min(visit.checkout, time)
    if (confirmed) visit.confirmed = Math.max(visit.confirmed, time)
    if (checkoutFailure) {
      const reason = recordedReason(row)
      visit.failures ??= new Map()
      visit.failures.set(reason, Math.max(visit.failures.get(reason) ?? 0, time))
    }
    visits.set(row.sessionId, visit)
    if ((viewed || added) && typeof row.product === 'string' && row.product && !row.product.includes('[REDACTED')) {
      const key = row.productRef || row.product
      const product = products.get(key) || { name: row.product, views: new Set(), adds: new Set() }
      if (viewed) product.views.add(row.sessionId)
      if (added) product.adds.add(row.sessionId)
      products.set(key, product)
    }
  }

  function result() {
    const counts = { sessions: 0, viewed: 0, added: 0, checkout: 0, confirmed: 0, confirmedAfterCheckout: 0 }
    const blockers = counter()
    for (const visit of visits.values()) {
      if (visit.navigated || visit.added || Number.isFinite(visit.checkout) || Number.isFinite(visit.confirmed)) counts.sessions++
      if (visit.viewed) counts.viewed++
      if (visit.added) counts.added++
      if (Number.isFinite(visit.checkout)) counts.checkout++
      if (Number.isFinite(visit.confirmed)) counts.confirmed++
      if (Number.isFinite(visit.checkout)) {
        if (visit.confirmed >= visit.checkout) counts.confirmedAfterCheckout++
        else for (const [reason, time] of visit.failures || []) {
          if (time >= visit.checkout) increment(blockers, reason)
        }
      }
    }
    const topProducts = [...products.values()].map(({ name, views, adds }) => ({ name, viewed: views.size, added: adds.size }))
      .sort((a, b) => b.viewed - a.viewed || b.added - a.added || a.name.localeCompare(b.name)).slice(0, 5)
    const topBlockers = [...blockers].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 5)
    return { ...counts, topProducts, topBlockers }
  }
  return { observe, result }
}
