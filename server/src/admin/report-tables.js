import { logReasons } from '../../../shared/logReasons.js'
import { istOffset } from '../monitoring/report-facts.js'

const INR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })
const IST = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'medium', hour12: false })
const showTime = time => IST.format(time)
const money = value => Number.isSafeInteger(value) ? INR.format(value / 100) : 'Unavailable'
const platforms = { website: 'Website', android: 'Android', ios: 'iPhone', unknown: 'Unrecorded' }
const channels = ['website', 'android', 'ios']
const optionLabel = { morning: 'Morning', express: 'Express' }
const requestLabels = {
  '/api/v1/[other]': 'Unidentified request', '/api/v1/account/addresses': 'Delivery address', '/api/v1/account/cart': 'Saved cart',
  '/api/v1/checkout/quote': 'Cart quote', '/api/v1/checkout/create-order': 'Checkout submission', '/api/v1/auth/me': 'Account lookup',
  '/api/v1/products': 'Catalog', '/api/v1/categories': 'Categories', '/api/v1/checkout/verify-payment': 'Payment verification',
  '/api/v1/auth/send-otp': 'Sign-in code request', '/api/v1/auth/verify-otp': 'Sign-in verification',
}
const reasonLabel = code => Object.hasOwn(logReasons, code) ? logReasons[code][0] : code === 'DELIVERY_OPTION_UNAVAILABLE' ? 'Selected delivery option was unavailable' : 'Cause unavailable'
const fixed = (number, total) => total ? (number / total * 100).toFixed(1) + '%' : 'Unavailable'
const count = (rows, select) => rows.filter(select).length
const visits = rows => new Set(rows.map(row => row.session).filter(Boolean)).size
const sumMoney = (rows, get) => rows.every(row => Number.isSafeInteger(get(row))) ? money(rows.reduce((sum, row) => sum + get(row), 0)) : 'Unavailable'
const groupBy = (rows, key) => {
  const grouped = new Map()
  for (const row of rows) {
    const value = key(row)
    if (value == null || value === '') continue
    if (!grouped.has(value)) grouped.set(value, [])
    grouped.get(value).push(row)
  }
  return grouped
}
const record = (values, extra = {}) => ({ values, ...extra })
const table = (headers, rows) => ({ headers, rows })
const stat = (label, value, drill) => ({ label, value, drill })

function events(rows) {
  return table(['Time (IST)', 'Channel', 'Visit', 'Action', 'Delivery pincode', 'Details'], rows.slice().reverse().map(row =>
    record([showTime(row.time), platforms[row.platform] || 'System', row.session?.slice(0, 8) || 'No session',
      row.pinStep || (row.order ? 'Order confirmed' : row.checkout ? 'Checkout reached' : row.viewed ? 'Product viewed' : row.added ? 'Added to cart' :
        row.signIn ? 'Verified sign-in' : row.event === 'cart.restored' ? 'Saved cart loaded' : row.navigation ? 'Page opened' :
          requestLabels[row.route] || (row.background ? 'Background request' : 'Recorded activity')),
      row.pin || 'Unrecorded', row.failed ? [reasonLabel(row.reason), row.grandTotal != null && 'Recorded cart total ' + money(row.grandTotal)].filter(Boolean).join(' · ') :
        row.product || row.page || row.order || 'Recorded'], { session: row.session })))
}

function overview(main, cards, details, note) {
  return { main, cards, details, note }
}

function pinRecords(rows) {
  return table(['Time (IST)', 'Channel', 'Visit', 'Step', 'Pincode', 'Verified delivery area', 'Coverage at the time', 'Requested option', 'Reason'],
    rows.slice().reverse().map(row => record([showTime(row.time), platforms[row.platform], row.session?.slice(0, 8) || 'No session', row.pinStep,
      row.pin || 'Unrecorded', [row.city, row.state].filter(Boolean).join(', ') || 'Unrecorded',
      row.coverage === true ? 'Serviceable' : row.coverage === false ? 'Unserviceable' : 'Unrecorded', optionLabel[row.option] || 'Unrecorded',
      row.failed ? reasonLabel(row.reason) : 'Not applicable'], { session: row.session })))
}

function pinReport(facts, orders, coverage, journeyFacts) {
  const pinEvents = facts.filter(row => row.pinStep && row.pin)
  const known = groupBy(pinEvents, row => row.pin)
  const orderGroups = groupBy(orders, row => row.pin)
  const details = new Map()
  const rows = []
  const latestConfirmation = new Map(journeyFacts.filter(row => row.session && row.order).map(row => [row.session, row.time]))
  for (const pin of new Set([...known.keys(), ...orderGroups.keys()])) {
    const list = known.get(pin) || [], localOrders = orderGroups.get(pin) || []
    const denied = list.filter(row => row.coverage === false || row.reason === 'PINCODE_NOT_SERVICEABLE')
    const entry = coverage.get(pin)
    const observedArea = list.slice().reverse().find(row => row.city || row.state)
    const place = [entry?.city, entry?.state].filter(Boolean).join(', ') || [observedArea?.city, observedArea?.state].filter(Boolean).join(', ') || 'Unrecorded'
    const available = [entry?.morning && 'Morning', entry?.express && 'Express'].filter(Boolean).join(' and ') ||
      (coverage.size ? 'Unavailable' : 'Morning (fallback configuration)')
    details.set(pin, pinRecords(list))
    details.set('orders-' + pin, orderTable(localOrders))
    rows.push(record([pin, place, available, count(list, row => row.pinStep === 'Pincode check'), visits(list),
      denied.length, visits(denied), count(list, row => !row.session), count(list, row => row.deliveryOptionUnavailable),
      visits(denied.filter(row => row.session && latestConfirmation.get(row.session) > row.time)), count(localOrders, row => row.confirmed)], { drill: pin, orderDrill: 'orders-' + pin }))
  }
  rows.sort((a, b) => b.values[6] - a.values[6] || b.values[3] - a.values[3] || a.values[0].localeCompare(b.values[0]))
  const rejected = pinEvents.filter(row => row.coverage === false || row.reason === 'PINCODE_NOT_SERVICEABLE')
  details.set('all', pinRecords(pinEvents))
  details.set('denied', pinRecords(rejected))
  details.set('confirmed', orderTable(orders.filter(row => row.pin && row.confirmed)))
  const invalid = facts.filter(row => row.pinStep && !row.pin)
  details.set('unrecorded', pinRecords(invalid))
  return overview(table(['Pincode', 'Delivery area', 'Current options', 'Recorded checks', 'Tracked visits', 'Coverage rejections', 'Rejected visits',
    'Events without a visit', 'Option rejections', 'Rejected visits that later confirmed an order', 'Confirmed orders to this pincode'], rows),
  [stat('Pincodes in report', rows.length), stat('Visits with coverage rejections', visits(rejected), 'denied'), stat('Checks and address decisions', pinEvents.length, 'all'),
    stat('Checks with pincode unavailable', invalid.length, 'unrecorded'), stat('Confirmed orders with a pincode', count(orders, row => row.pin && row.confirmed), 'confirmed')],
  details, 'A visit can check several pincodes. Later confirmation looks at the same visit across pincodes. Orders to a pincode use the saved delivery address.')
}

function conversionReport(facts, end, guestOnly = false) {
  const details = new Map()
  const tracked = groupBy(facts, row => row.session && row.platform + '/' + row.session)
  const sessions = []
  const matching = (list, select, time = -Infinity) => list.find(row => row.time > time && select(row))
  for (const list of tracked.values()) {
    if (guestOnly && !list.some(row => row.checkout && row.guest)) continue
    if (!list.some(row => row.navigation || row.viewed || row.added || row.checkout || row.order)) continue
    const entry = matching(list, row => row.checkout && (!guestOnly || row.guest))
    const viewed = matching(list, row => row.viewed)
    const added = matching(list, row => row.added)
    const ordered = matching(list, row => row.order, entry?.time)
    const orderedAdd = viewed && matching(list, row => row.added, viewed.time)
    const orderedCheckout = orderedAdd && matching(list, row => row.checkout, orderedAdd.time)
    const full = orderedCheckout && matching(list, row => row.order, orderedCheckout.time)
    const signIn = entry && matching(list, row => row.signIn, entry.time)
    const signInRequired = entry && matching(list, row => row.reason === 'AUTH_REQUIRED', entry.time)
    sessions.push({ list, entry, viewed, added, ordered, full, signIn, signInRequired, open: list.at(-1).time > end - 30 * 60000 })
  }
  const stage = (label, select, id) => {
    const matches = sessions.filter(select)
    details.set(id, table(['Visit', 'Channel', 'First event (IST)', 'Last event (IST)', 'Checkout', 'Order confirmation'], matches.map(({ list, entry, ordered }) =>
      record([list[0].session.slice(0, 8), platforms[list[0].platform], showTime(list[0].time), showTime(list.at(-1).time), entry ? showTime(entry.time) : 'Unrecorded',
        ordered?.order || 'Unrecorded'], { session: list[0].session }))))
    return record([label, matches.length], { drill: id })
  }
  const ended = sessions.filter(row => row.entry && !row.open)
  const confirmed = count(ended, row => row.ordered)
  const stages = guestOnly ?
    [stage('Reached checkout as a guest', () => true, 'started'), stage('Sign-in required', row => row.signInRequired, 'blocked'),
      stage('Verified sign-in after checkout', row => row.signIn, 'signed-in'), stage('Order confirmed after checkout', row => row.ordered, 'confirmed'),
      stage('Closed visits without a recorded order', row => row.entry && !row.open && !row.ordered, 'closed'),
      stage('Still within 30 minutes of last activity', row => row.open, 'open')] :
    [stage('Observed shopping visits', () => true, 'started'), stage('Viewed a product', row => row.viewed, 'viewed'), stage('Added to cart', row => row.added, 'added'),
      stage('Reached checkout', row => row.entry, 'checkout'), stage('Order confirmed in visit', row => row.ordered, 'confirmed'),
      stage('Completed view → add → checkout → confirmation', row => row.full, 'ordered')]
  return overview(table(['Stage', 'Tracked visits'], stages),
    [stat('Tracked visits', sessions.length, 'started'), stat('Closed checkout visits', ended.length), stat('Closed checkout visits with an order', confirmed),
      stat(guestOnly ? 'Closed guest checkout without a recorded order' : 'Closed checkout conversion', fixed(guestOnly ? ended.length - confirmed : confirmed, ended.length)),
      stat('Shopping events without a visit', count(facts, row => !row.session && (row.navigation || row.viewed || row.added || row.checkout || row.order)))],
    details, 'Stages count visits independently. Conversion uses closed checkout visits and confirmations linked within the selected window. App visits require a native session ID.')
}

function failureReport(facts) {
  const failures = facts.filter(row => row.failed && !row.alert)
  const details = new Map()
  const affected = failures.filter(row => row.shoppingFailure)
  details.set('shopping', events(affected))
  const checkout = affected.filter(row => row.checkoutFailure)
  details.set('checkout', events(checkout))
  details.set('diagnostics', events(failures.filter(row => !row.shoppingFailure)))
  const groups = groupBy(failures, row => (row.shoppingFailure ? 'Shopping' : 'Diagnostics') + '/' + row.reason)
  const rows = [...groups].map(([key, list]) => {
    details.set(key, events(list))
    return record([key.split('/')[0], reasonLabel(list[0].reason), list.length, visits(list), count(list, row => !row.session)], { drill: key })
  }).sort((a, b) => a.values[0] === b.values[0] ? b.values[2] - a.values[2] : a.values[0] === 'Shopping' ? -1 : 1)
  return overview(table(['Area', 'Reason', 'Recorded failures', 'Tracked visits', 'Without a visit'], rows),
    [stat('Failed checkout events', checkout.length, 'checkout'), stat('Affected checkout visits', visits(checkout), 'checkout'),
      stat('Shopping failures', affected.length, 'shopping'), stat('Affected shopping visits', visits(affected), 'shopping'),
      stat('Diagnostic failures', failures.length - affected.length, 'diagnostics')], details,
    'Request-linked duplicates count once. Browser and unknown legacy errors remain under diagnostics unless the purchase step is recorded.')
}

function channelReport(facts) {
  const details = new Map()
  const rows = channels.map(channel => {
    const list = facts.filter(row => row.platform === channel)
    const foreground = list.filter(row => !row.background)
    details.set(channel, events(list))
    return record([platforms[channel], list.length, count(list, row => row.background), foreground.length,
      count(list, row => !row.session), visits(list) || (channel !== 'website' ? 'Unavailable' : 0)], { drill: channel })
  })
  return overview(table(['Channel', 'Recorded events', 'Background calls', 'Other recorded events', 'Events without a visit', 'Tracked visits'], rows),
    [], details, 'App API activity counts requests. Native visits are unavailable until the app supplies session IDs.')
}

function quoteTable(quotes) {
  const rows = quotes.slice().reverse().map(row => record([showTime(row.time), platforms[row.platform], row.session?.slice(0, 8) || 'No session',
    row.pin || 'Unrecorded', optionLabel[row.option] || 'Unrecorded', money(row.itemsTotal), money(row.deliveryCharge), money(row.handlingCharge),
    money(row.smallCartCharge), money(row.taxTotal), money(row.discount), money(row.grandTotal), money(row.minOrder),
    row.minimumMet === null ? 'Unrecorded' : row.minimumMet ? 'Met' : 'Below minimum', row.unavailable, row.lines || 'Unrecorded'], { session: row.session }))
  return table(['Quote time (IST)', 'Channel', 'Visit', 'Delivery pincode', 'Option', 'Subtotal', 'Delivery', 'Handling', 'Small cart', 'Tax',
    'Discount', 'Final quote', 'Minimum order', 'Minimum outcome', 'Unavailable product lines', 'Items quoted'], rows)
}

function cartReport(facts) {
  const quotes = facts.filter(row => row.quote && !row.background)
  const details = new Map([
    ['minimum', quoteTable(quotes.filter(row => row.minimumMet === false))],
    ['stock', quoteTable(quotes.filter(row => row.unavailable))],
    ['restored', events(facts.filter(row => row.event === 'cart.restored'))],
  ])
  return overview(quoteTable(quotes),
  [stat('Customer cart quotes', quotes.length), stat('Quotes below minimum', count(quotes, row => row.minimumMet === false), 'minimum'),
    stat('Quotes with unavailable products', count(quotes, row => row.unavailable), 'stock'),
    stat('Saved carts restored', count(facts, row => row.event === 'cart.restored'), 'restored')], details,
  'Quotes show amounts seen during shopping. A quote is not a sale. Routine rechecks are excluded.')
}

function orderTable(orders) {
  return table(['Created (IST)', 'Order', 'Channel', 'Delivery pincode', 'Option', 'Promised date', 'Order state', 'Payment method', 'Payment state',
    'Confirmed evidence', 'Subtotal', 'Delivery', 'Handling', 'Discount', 'Order amount'], orders.map(row =>
    record([showTime(row.time), row.orderNo, platforms[row.platform], row.pin || 'Unrecorded', optionLabel[row.option] || 'Unrecorded',
      row.expected || 'Unrecorded', row.status, row.mode === 'cod' ? 'Cash on delivery' : 'Online', row.paymentStatus,
      row.confirmed ? 'Recorded' : 'Unrecorded', money(row.itemsTotal), money(row.deliveryCharge), money(row.handlingCharge),
      money(row.discount), money(row.amount)])))
}

function ordersReport(orders, facts) {
  const paid = orders.filter(row => row.paymentStatus === 'paid')
  const cod = orders.filter(row => row.mode === 'cod' && row.confirmed)
  const refunds = orders.filter(row => row.paymentStatus === 'refunded')
  const pending = orders.filter(row => row.paymentStatus === 'pending')
  const cancelled = orders.filter(row => row.status === 'cancelled')
  const failed = orders.filter(row => row.paymentStatus === 'failed')
  const online = paid.filter(row => row.mode === 'online')
  const codPaid = paid.filter(row => row.mode === 'cod')
  const delivered = orders.filter(row => row.status === 'delivered')
  const details = new Map([['paid', paid], ['online', online], ['cod-paid', codPaid], ['cod', cod], ['refunds', refunds], ['pending', pending],
    ['cancelled', cancelled], ['failed', failed], ['delivered', delivered]].map(([key, rows]) => [key, orderTable(rows)]))
  const notifications = facts.filter(row => row.providerStatus).slice().reverse()
  const outcomes = { 'payment.captured': 'Payment captured', 'payment.failed': 'Payment failed', 'refund.processed': 'Refund processed', 'refund.failed': 'Refund failed' }
  details.set('provider', table(['Time (IST)', 'Gateway notification', 'Order reference in notification', 'Refund amount'], notifications.map(row =>
    record([showTime(row.time), outcomes[row.providerStatus], row.providerOrder || 'Unrecorded', money(row.refundAmount)]))))
  return overview(orderTable(orders), [stat('Order records', orders.length), stat('Order value marked paid', sumMoney(paid, row => row.amount), 'paid'),
    stat('Online payments marked paid', online.length, 'online'), stat('COD payments marked paid', codPaid.length, 'cod-paid'),
    stat('Recorded COD confirmations', cod.length, 'cod'), stat('Pending payment', pending.length, 'pending'),
    stat('Failed payment state', failed.length, 'failed'), stat('Refunded orders', refunds.length, 'refunds'),
    stat('Cancelled orders', cancelled.length, 'cancelled'), stat('Delivered orders', delivered.length, 'delivered'),
    stat('Gateway notifications with selected filters', notifications.length, 'provider')], details,
  'Orders are grouped by creation date and show their current state. Gateway notifications are separate and show refund amounts when recorded. Settlement totals and actual delivery times are unavailable.')
}

function productReport(facts, products, orders) {
  const details = new Map()
  const bySlug = new Map(products.map(product => [product.slug, product.id]))
  const keyOf = row => bySlug.get(row.productRef) || 'event-' + (row.productRef || row.product)
  const activity = groupBy(facts.filter(row => row.product && (row.viewed || row.added)), keyOf)
  const sold = groupBy(orders.filter(row => row.confirmed && row.status !== 'cancelled' && row.paymentStatus !== 'refunded')
    .flatMap(row => row.items.map(item => ({ ...item, order: row }))), row => row.productId || 'order-' + row.name)
  const names = new Map(products.map(product => [product.id, product.name]))
  const rows = [...new Set([...names.keys(), ...activity.keys(), ...sold.keys()])].map(key => {
    const observed = activity.get(key) || [], lines = sold.get(key) || []
    const sales = [...new Map(lines.map(line => [line.order.orderNo, line.order])).values()]
    const label = names.get(key) || (observed[0]?.product || lines[0]?.name) + ' (historical reference)'
    details.set(key, events(observed))
    details.set('orders-' + key, orderTable(sales))
    return record([label, count(observed, row => row.viewed), visits(observed.filter(row => row.viewed)),
      count(observed, row => row.added), visits(observed.filter(row => row.added)), sales.length,
      lines.reduce((sum, line) => sum + line.quantity, 0), sumMoney(lines, line => line.amount)], { drill: key, orderDrill: 'orders-' + key })
  }).sort((a, b) => b.values[2] - a.values[2] || b.values[6] - a.values[6] || a.values[0].localeCompare(b.values[0]))
  return overview(table(['Product', 'View events', 'Viewing visits', 'Add events', 'Adding visits', 'Confirmed orders', 'Units in confirmed orders', 'Item value after discounts'], rows),
    [], details, 'Product events without a reliable catalog match stay on their own row. Unit counts use confirmed orders and exclude cancelled or refunded orders.')
}

function peaksReport(facts, areas = false) {
  const details = new Map()
  const observed = facts.filter(row => row.session && (row.navigation || row.viewed || row.added || row.checkout || row.order || row.pinStep))
  const groups = groupBy(observed, row => areas ? (row.city ? 'Delivery/' + [row.city, row.state].filter(Boolean).join(', ') :
    row.approximateCity ? 'Approximate browsing/' + row.approximateCity : 'Unrecorded/Unrecorded') :
    String(new Date(row.time + istOffset).getUTCHours()).padStart(2, '0'))
  if (!areas) for (let hour = 0; hour < 24; hour++) {
    const key = String(hour).padStart(2, '0')
    if (!groups.has(key)) groups.set(key, [])
  }
  const rows = [...groups].map(([key, list]) => {
    details.set(key, events(list))
    const split = key.indexOf('/')
    return record(areas ? [key.slice(0, split), key.slice(split + 1), visits(list), list.length] : [key + ':00 IST', visits(list), list.length], { drill: key })
  }).sort((a, b) => b.values.at(-2) - a.values.at(-2) || a.values[0].localeCompare(b.values[0]))
  return overview(table(areas ? ['Source', 'Area', 'Tracked visits', 'Observed actions'] : ['Hour of day', 'Tracked visits', 'Observed actions'], rows),
    [], details, areas ? 'Delivery area and approximate browsing city are distinct. A visit may appear in more than one area.' :
      'An active visit counts once within each hour of day across the selected dates, even when it spans several hours.')
}

function landingReport(facts) {
  const details = new Map()
  const sessions = groupBy(facts.filter(row => row.platform === 'website'), row => row.session)
  const visitsByPage = new Map()
  for (const rows of sessions.values()) {
    const first = rows.find(row => row.navigation && row.page)
    if (!first) continue
    const key = first.productRef ? 'product/' + first.productRef : 'page/' + first.page
    if (!visitsByPage.has(key)) visitsByPage.set(key, [])
    visitsByPage.get(key).push({ first, rows })
  }
  const rows = [...visitsByPage].map(([key, entries]) => {
    details.set(key, events(entries.map(entry => entry.first).sort((a, b) => a.time - b.time)))
    return record([entries[0].first.page, entries.length, count(entries, entry => entry.rows.some(row => row.added && row.time > entry.first.time)),
      count(entries, entry => entry.rows.some(row => row.checkout && row.time > entry.first.time)),
      count(entries, entry => entry.rows.some(row => row.order && row.time > entry.first.time))], { drill: key })
  }).sort((a, b) => b.values[1] - a.values[1] || a.values[0].localeCompare(b.values[0]))
  return overview(table(['First recorded page', 'Tracked visits', 'Later cart adds', 'Later checkout', 'Later confirmations'], rows), [], details,
    'The first recorded page in the selected range can differ from the true landing page. Campaign and acquisition source attribution are unavailable in these logs.')
}

function alertsReport(facts, enabled) {
  const rows = facts.filter(row => row.alert).slice().reverse().map(row => record([showTime(row.time), row.failed ? 'Email send failed' : 'Email sent', row.triggerCount ?? 'Unrecorded']))
  return overview(table(['Time (IST)', 'Alert outcome', 'Failures in triggering hour'], rows), [stat('Email alerts', enabled ? 'Configured' : 'Awaiting setup')], new Map(),
    'The history shows recorded email outcomes. An empty list does not establish that historical alerts were disabled.')
}

export function buildReport({ section, facts, journeyFacts = facts, orders, coverage, products, end, alertsEnabled }) {
  switch (section) {
    case 'pincodes': return pinReport(facts, orders, coverage, journeyFacts)
    case 'funnel': return conversionReport(facts, end)
    case 'guest': return conversionReport(facts, end, true)
    case 'failures': return failureReport(facts)
    case 'channels': return channelReport(facts)
    case 'carts': return cartReport(facts)
    case 'products': return productReport(facts, products, orders)
    case 'orders': return ordersReport(orders, facts)
    case 'hours': return peaksReport(facts)
    case 'areas': return peaksReport(facts, true)
    case 'landing': return landingReport(facts)
    case 'alerts': return alertsReport(facts, alertsEnabled)
  }
}
