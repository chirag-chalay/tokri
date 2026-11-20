import { isLogReason } from '../../../shared/logReasons.js'

export const ACTIVITY_RETENTION_DAYS = 90
export const ADMIN_RETENTION_DAYS = 365
export const DAY_MS = 86400000

export function logSource(row, category = row.category) {
  if (row.logSource) return row.logSource
  if (row.staffName && row.staffName !== '[REDACTED]' || row.event?.startsWith('admin.') || row.event === 'monitoring.viewed') return 'Backoffice'
  if (row.platform === 'android') return 'Android app'
  if (row.platform === 'ios') return 'iPhone app'
  if (row.route?.startsWith('/api/v1/webhooks/') || row.event?.startsWith('razorpay.webhook')) return 'Payment provider'
  if (row.platform === 'website' || row.source === 'website' || category === 'website' || row.origin === 'browser') return 'Website'
  return category === 'audit' || category !== 'payment' && row.visitorKind === 'system' && !row.route ? 'System' : 'Server API'
}

export function logTab(row, category = row.category) {
  if (category === 'audit') return 'admin'
  if (category === 'error' || ['frontend.error', 'request.aborted', 'frontend.api.failed', 'checkout.network.failed', 'payment.browser.failed'].includes(row.event) || Number(row.httpStatus || row.status) >= 500) return 'errors'
  const source = logSource(row, category)
  if (source === 'Backoffice' || source === 'System') return 'admin'
  if (source === 'Android app' || source === 'iPhone app') return 'app'
  return 'website'
}

export function isCustomerActivity(row, category = row.category) {
  const source = logSource(row, category)
  if (['System', 'Server API', 'Backoffice', 'Payment provider'].includes(source)) return false
  return row.event !== 'request.timing'
}

export function isCheckout(row) {
  return row.event?.startsWith('checkout.') || row.route === '/api/v1/checkout/create-order'
}

// Recover reasons from older structured facts and explicit HTTP outcomes.
const historicalReasons = new Map([
  ['product_missing', 'RESOURCE_NOT_FOUND'], ['order_missing', 'RESOURCE_NOT_FOUND'],
  ['product_unavailable', 'OUT_OF_STOCK'], ['location_unserviceable', 'PINCODE_NOT_SERVICEABLE'],
  ['address_invalid', 'VALIDATION_ERROR'], ['quantity_invalid', 'VALIDATION_ERROR'],
  ['cart_empty', 'VALIDATION_ERROR'], ['cart_item_invalid', 'VALIDATION_ERROR'],
  ['phone_invalid', 'VALIDATION_ERROR'], ['otp_incorrect', 'SIGN_IN_FAILED'],
  ['otp_expired', 'SIGN_IN_FAILED'], ['otp_missing', 'SIGN_IN_FAILED'], ['otp_attempts', 'SIGN_IN_FAILED'],
  ['admin_credentials', 'SIGN_IN_FAILED'], ['account_inactive', 'SIGN_IN_FAILED'],
  ['insufficient_funds', 'PAYMENT_FAILED'], ['payment_declined', 'PAYMENT_FAILED'],
  ['payment_timed_out', 'PAYMENT_FAILED'], ['payment_mismatch', 'PAYMENT_FAILED'],
])

export function recordedReason(row) {
  if (isLogReason(row.reasonCode) && row.reasonCode !== 'UNKNOWN') return row.reasonCode
  const reason = historicalReasons.get(row.failureReason)
  if (reason) return reason
  const status = Number(row.httpStatus || row.status)
  if (row.event === 'request.aborted' || status === 499) return 'NETWORK_ERROR'
  if (row.failureReason === 'login_required' || status === 401) return isCheckout(row) ? 'AUTH_REQUIRED' : 'SIGN_IN_FAILED'
  if (status === 403) return 'ACCESS_DENIED'
  if (status === 404) return 'RESOURCE_NOT_FOUND'
  if ([502, 503, 504].includes(status)) return 'SERVICE_UNAVAILABLE'
  if (row.event === 'frontend.resource.failed') return 'RESOURCE_LOAD_FAILED'
  if (['frontend.error', 'frontend.promise.failed'].includes(row.event)) return 'BROWSER_ERROR'
  return 'UNKNOWN'
}

export function countableActivity(row, category) {
  return category !== 'debug' && !(row.event === 'checkout.request' && row.requestId && Number(row.httpStatus) >= 400)
}

export function activityKey(row) {
  return row.relatedRequestId || row.requestId || row.eventId || row.clientEventId || row.timestamp + '/' + row.event
}
