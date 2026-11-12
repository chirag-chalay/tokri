import { Prisma } from '@prisma/client'

// Store only explicitly approved metadata. Never serialize request bodies or provider payloads.
const fields = new Set(('id totals failureReason productCount couponCode eventId timestamp recoveredAt page pagePath navigationType product productRef clientEventId relatedRequestId deliveryOption delta resourceKind origin userId customerId orderId orderNo actorId requestId ip method route status durationMs event source model operation count reason code name slug label title priceValue oldPriceValue price mrp shippingFee handlingFee morningShippingFee morningFreeAbove expressShippingFee expressFreeAbove expressMinimumOrderValue deliveryCharge handlingCharge smallCartCharge taxTotal cgstTotal sgstTotal igstTotal minCart discount grandTotal itemsTotal paymentStatus paymentMode paymentCollectedAs razorpayOrderId razorpayPaymentId isActive role sortOrder quantity stock gstRate hsnCode type value minOrder maxDiscount usageLimit startsAt expiresAt enabled debugUntil old new where data changes resourceId provider httpStatus outcome errorKind amount paymentId refundId amountInr refundStatus changedFields providerEventId isBestSeller isImported isFeatured isTaxable isApproved isPublished usedCount rating latestBuild minimumBuild remindAfterHours maintenance morningEnabled expressEnabled firstThreeMorningEnabled codEnabled razorpayEnabled msg91Enabled msg91WhatsappEnabled manageProducts manageCatalog manageMedia manageOrders manageCoupons manageContent manageSettings manageUsers').split(' '))
const privateKey = /password|otp|token|secret|authorization|cookie|signature|email|phone|contact|address|birth|card|cvv|account|upi|description|content|html|name|title|label|authkey|apikey|credential|keyid|aadhaar|aadhar|ssn|pancard|bank/i
export function sanitize(value, depth = 0) {
  if (depth > 6) return '[OMITTED]'
  if (value == null || typeof value === 'boolean' || typeof value === 'number') return value
  if (Prisma.Decimal.isDecimal(value)) return value.toFixed()
  if (value instanceof Date) return value.toISOString()
  if (Array.isArray(value)) return value.slice(0, 30).map((v) => sanitize(v, depth + 1))
  if (typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).slice(0, 150).map(([key, val]) => [key,
      privateKey.test(key) ? '[REDACTED]' : fields.has(key) ? sanitize(val, depth + 1) : '[OMITTED]',
    ]))
  }
  // Approved fields can still contain attacker-supplied strings (e.g. order numbers).
  return String(value).slice(0, 1000)
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[REDACTED_EMAIL]')
    .replace(/\b(?:91[- ]?)?[6-9](?:[- ]?\d){9}\b/g, '[REDACTED_PHONE]')
    .replace(/\b(?:Bearer|Basic)\s+[^\s,;]+/gi, '[REDACTED_AUTH]')
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, '[REDACTED_TOKEN]')
    .replace(/\brzp_(?:live|test)_[a-zA-Z0-9]+\b/g, '[REDACTED_KEY]')
    .replace(/\b(password|passwd|otp|token|secret|signature|authkey|api[_-]?key)\s*[:=]\s*[^\s,;&]+/gi, '$1=[REDACTED]')
    .slice(0, 250)
}
export function safeSnapshot(value) {
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.entries(value).filter(([key]) => fields.has(key) && !privateKey.test(key)).map(([k, v]) => [k, sanitize(v)]))
}
export const categories = ['website', 'api', 'access', 'error', 'audit', 'debug', 'payment', 'account']
export function istDate(date = new Date()) {
  return new Date(date.getTime() + 330 * 60000).toISOString().slice(0, 10)
}
