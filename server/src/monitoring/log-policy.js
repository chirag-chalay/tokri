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
