import { createHash } from 'node:crypto'
import { productCategoryList } from '../utils/catalog.js'
import { orderPricesIncludeGst } from '../utils/tax.js'

const money = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100
const clean = (value) => typeof value === 'string' && value.trim().length <= 100 && !/@|https?:\/\/|[\r\n]/i.test(value) ? value.trim() : ''

// Snapshot only server-priced line data. The client cannot supply amounts or IDs.
export function createAppTrackingContext(input, platform, totals, lines, cartItems, appBuild) {
  if (input?.source !== 'app' || input.analytics !== true || !['ios', 'android'].includes(platform) || input.platform !== platform || !/^[a-zA-Z0-9_-]{16,80}$/.test(input.consentId || '')) return undefined
  try {
    const included = orderPricesIncludeGst(totals)
    const items = lines.map((line, index) => {
      const itemId = clean(cartItems[index]?.product?.slug) || clean(line.productId)
      const name = clean(line.name)
      const quantity = Number(line.quantity)
      const netLine = Number(line.priceValue) * quantity - Number(line.discount || 0) - (included ? Number(line.taxAmount || 0) : 0)
      const price = money(netLine / quantity)
      if (!itemId || !name || !Number.isSafeInteger(quantity) || quantity < 1 || !Number.isFinite(price) || price < 0) throw new Error('invalid item')
      const category = productCategoryList(cartItems[index]?.product || {})[0]
      const categoryName = clean(category?.label || category?.name || category?.slug)
      return { item_id: itemId, item_name: name, price, quantity, ...(categoryName ? { item_category: categoryName } : {}) }
    })
    if (!items.length || items.length > 200) return undefined
    const itemDiscount = lines.reduce((sum, line) => sum + Number(line.discount || 0), 0)
    const merchandise = money(lines.reduce((sum, line) => sum + Number(line.priceValue) * line.quantity - Number(line.discount || 0), 0) - (included ? Number(totals.taxTotal || 0) : 0))
    const shipping = money(Math.max(0, Number(totals.deliveryCharge || 0) - Math.max(0, Number(totals.discount || 0) - itemDiscount)))
    const tax = money(totals.taxTotal || 0)
    if (![merchandise, shipping, tax].every((value) => Number.isFinite(value) && value >= 0)) return undefined
    return { source: 'app', platform, ...(Number.isSafeInteger(appBuild) && appBuild > 0 ? { appBuild } : {}), analytics: true, consentId: input.consentId, consentRecordedAt: Date.now(), schemaVersion: 1, snapshot: { currency: 'INR', value: merchandise, tax, shipping, items } }
  } catch { return undefined }
}

export function appPurchasePayload(order, currentConsentId) {
  const context = order?.trackingContext
  if (order?.status === 'cancelled' || order?.paymentStatus === 'refunded' || order?.paymentStatus === 'failed') return null
  if (context?.source !== 'app' || context.analytics !== true || context.consentId !== currentConsentId || !context.confirmedAt || !context.snapshot) return null
  if (!(order.paymentMode === 'cod' && context.codConfirmed) && !(order.paymentMode === 'online' && order.paymentStatus === 'paid' && context.captured === true)) return null
  const transactionId = createHash('sha256').update(`tokri-purchase:${order.id}`).digest('hex')
  return { ...context.snapshot, transaction_id: transactionId }
}

export function isCapturedAppPayment(order, payment) {
  return Boolean(order && payment && order.paymentStatus === 'paid' && order.paymentMode === 'online' && order.razorpayOrderId && order.razorpayPaymentId && payment.id === order.razorpayPaymentId && payment.status === 'captured' && payment.order_id === order.razorpayOrderId && Number(payment.amount) === Math.round(Number(order.grandTotal) * 100) && payment.currency === 'INR')
}
