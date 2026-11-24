import { activityKey, countableActivity, customerActivityChannel, isCheckout, isConfirmedCheckout, reachedCheckout, recordedReason } from './log-policy.js'
import { isBackgroundCall } from './session-view.js'
import { readableStatus } from '../../../shared/monitoring.js'
import { validVisitorSession } from '../../../shared/logReasons.js'
import { displayText } from '../admin/monitoring-presentation.js'

export const reportRecordLimit = 50000
export const istOffset = 330 * 60000

export function paise(value) {
  const text = typeof value === 'number' || typeof value === 'string' || typeof value?.toFixed === 'function' ? String(value) : ''
  const match = /^(\d{1,12})(?:\.(\d{1,2}))?$/.exec(text)
  if (!match) return null
  const amount = Number(match[1]) * 100 + Number((match[2] || '').padEnd(2, '0'))
  return Number.isSafeInteger(amount) ? amount : null
}

const validPin = value => typeof value === 'string' && /^\d{6}$/.test(value)
const field = (value, limit = 160) => displayText(value).slice(0, limit)
const quoteAmounts = ['itemsTotal', 'deliveryCharge', 'handlingCharge', 'smallCartCharge', 'taxTotal', 'discount', 'grandTotal', 'minOrder']

export function reportFact(row, category) {
  const alert = /^monitoring\.failure_alert\.(sent|failed)$/.test(row.event || '')
  const providerPayment = row.event === 'webhook.received' && row.provider === 'razorpay' && ['payment.captured', 'payment.failed', 'refund.processed', 'refund.failed'].includes(row.outcome)
  const channel = customerActivityChannel(row, category)
  if (!alert && !providerPayment && (!channel || !countableActivity(row, category))) return null
  const platform = channel === 'website' ? 'website' : row.platform || (row.logSource === 'iPhone app' ? 'ios' : 'android')
  const time = Date.parse(row.timestamp)
  if (!Number.isFinite(time)) return null
  const session = validVisitorSession(row.sessionId) ? row.sessionId : null
  const hasPin = validPin(row.deliveryPin) ? row.deliveryPin : validPin(row.enteredPincode) ? row.enteredPincode : null
  const failed = readableStatus({ ...row, category }) === 'Failed'
  const route = typeof row.route === 'string' ? row.route : ''
  const reason = failed ? recordedReason(row) : null
  const viewed = row.event === 'website.navigation' && /^\/product\/[a-z0-9-]+$/i.test(row.pagePath || '') && !failed
  const added = row.event === 'cart.added' || row.event === 'cart.quantity.changed' && row.delta > 0
  const navigation = row.event === 'website.navigation' && !failed
  const check = row.event === 'delivery.pin.checked' || route === '/api/v1/geo/pincode'
  const checkout = reachedCheckout(row)
  const address = route === '/api/v1/account/addresses' && ['POST', 'PUT', 'PATCH'].includes(row.method)
  const deliveryOptionUnavailable = reason === 'DELIVERY_OPTION_UNAVAILABLE' || row.failureReason === 'delivery_option_unavailable'
  const deliveryBlock = reason === 'PINCODE_NOT_SERVICEABLE' || deliveryOptionUnavailable
  const coverage = check || address || deliveryBlock ? row.pincodeServiceable ?? ({ serviceable: true, unserviceable: false })[row.deliveryCoverage] : undefined
  const pinStep = check ? 'Pincode check' : deliveryBlock ? (address ? 'Address rejected' : route.startsWith('/api/v1/checkout/') ? 'Checkout delivery rejected' : 'Delivery rejected') : address && hasPin && coverage !== undefined ? 'Address checked' : null
  const quote = route === '/api/v1/checkout/quote' && Number(row.httpStatus) >= 200 && Number(row.httpStatus) < 300 && paise(row.grandTotal) !== null
  const checkoutFailure = failed && (isCheckout(row) || /^payment\.browser\./.test(row.event || '') ||
    /^\/api\/v1\/checkout\/(?:confirm-cod|verify-payment|sync-payment|upi-intent|confirm-intent)$/.test(route))
  const shoppingFailure = failed && (checkoutFailure || address || check || route === '/api/v1/checkout/quote') && !alert
  const issue = deliveryOptionUnavailable ? 'DELIVERY_OPTION_UNAVAILABLE' : reason
  const product = viewed || added ? field(row.product) : ''
  return {
    time, platform: channel ? platform : null, session, key: providerPayment ? row.providerEventId || row.refundId || row.razorpayPaymentId || activityKey(row) : activityKey(row),
    event: row.event, route, failed, reason: issue, alert,
    background: isBackgroundCall({ ...row, category }), shoppingFailure, checkoutFailure, navigation, viewed, added, checkout, quote, pin: hasPin,
    pinStep, coverage, deliveryOptionUnavailable,
    hasMethod: Boolean(row.method),
    order: isConfirmedCheckout(row) ? row.orderNo : null,
    guest: row.visitorKind === 'guest', signIn: row.event === 'customer.login' && !failed && Boolean(row.verifiedCustomerId),
    product, productRef: product ? field(row.productRef || (viewed ? row.pagePath.slice(9) : ''), 120) : '', page: field(row.page) || (navigation ? field(row.pagePath) : ''),
    city: field(row.deliveryCity), state: field(row.deliveryState), approximateCity: row.locationSource === 'ip' ? field(row.locationCity) : '',
    option: ['morning', 'express'].includes(row.deliveryOption) ? row.deliveryOption : '',
    minimumMet: typeof row.minimumOrderMet === 'boolean' ? row.minimumOrderMet : null,
    unavailable: Number.isSafeInteger(row.unavailableItemCount) && row.unavailableItemCount > 0 ? row.unavailableItemCount : 0,
    ...(alert ? { triggerCount: Number.isSafeInteger(row.count) ? row.count : null } : {}),
    ...(providerPayment ? { providerStatus: row.outcome, providerOrder: /^TKR\d{8,20}$/.test(row.orderNo || '') ? row.orderNo : null,
      refundAmount: row.outcome.startsWith('refund.') && Number.isSafeInteger(row.amount) && row.amount >= 0 ? row.amount : null } : {}),
    ...(quote && Array.isArray(row.cartLines) ? { lines: row.cartLines.flatMap(line => {
      const name = field(line?.product)
      return name && Number.isSafeInteger(line.quantity) && line.quantity > 0 ? [name + ' × ' + line.quantity] : []
    }).join(' · ') } : {}),
    ...(quote || shoppingFailure ? Object.fromEntries(quoteAmounts.map(key => [key, paise(row[key])])) : {}),
  }
}

export function uniqueReportFacts(rows) {
  // A browser reply, an error row and API completion can describe one request.
  // Dedupe within a fact type so that an order confirmation cannot hide a real failure.
  const unique = new Map()
  for (const row of rows) {
    const kind = row.providerStatus || (row.alert ? 'alert' : row.pinStep ? 'pincode' : row.shoppingFailure ? 'shopping-failure' : row.order ? 'confirmation' : 'activity')
    const key = [row.platform || '', kind, row.key].join('/')
    const previous = unique.get(key)
    const score = fact => Number(Boolean(fact.hasMethod)) + 2 * Number(Boolean(fact.pin)) + 4 * Number(Boolean(fact.session)) +
      8 * Number(Boolean(fact.reason && fact.reason !== 'UNKNOWN')) + 16 * Number(Boolean(fact.failed))
    if (!previous || score(row) > score(previous)) unique.set(key, row)
  }
  return [...unique.values()].sort((a, b) => a.time - b.time)
}
