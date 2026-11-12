import { orderPricesIncludeGst } from '../utils/tax.js'
import { createHash } from 'node:crypto'
import { prisma } from '../lib/prisma.js'
import { getPublicTrackingConfig } from './trackingConfig.js'
import { readMetaConversionsConfig, sendMetaConversion } from './metaConversions.js'

export function purchaseIdentity(id) {
  return createHash('sha256').update(`tokri-purchase:${id}`).digest('hex')
}
export function captureTrackingContext(value) {
  const config = getPublicTrackingConfig()
  if (!config.enabled || !value || value.source !== 'web') return undefined
  try {
    const url = new URL(value.url)
    if (url.protocol !== 'https:' || !config.allowedHosts.includes(url.hostname)) return undefined
    return { source: 'web', analytics: value.analytics === true, marketing: value.marketing === true, pixelId: config.meta.pixelId, version: config.version, url: `${url.origin}/checkout`, consentAt: Date.now() }
  } catch { return undefined }
}
export function purchaseSummary(order) {
  const id = purchaseIdentity(order.id)
  const includedTax = orderPricesIncludeGst(order) ? Number(order.taxTotal || 0) : 0
  const itemDiscount = order.items.reduce((sum, item) => sum + Number(item.discount || 0), 0)
  const shippingDiscount = Math.max(0, Number(order.discount || 0) - itemDiscount)
  return { eventId: id, transactionId: id, currency: 'INR', value: Number(order.grandTotal), merchandiseValue: Math.round((order.items.reduce((sum, item) => sum + Number(item.priceValue) * item.quantity - Number(item.discount || 0), 0) - includedTax) * 100) / 100, tax: Number(order.taxTotal), shipping: Math.max(0, Number(order.deliveryCharge) - shippingDiscount), items: order.items.map((item) => ({ id: item.product?.slug || item.productId || item.id, name: item.name, priceValue: Number(item.priceValue) - (includedTax ? Number(item.taxAmount || 0) / item.quantity : 0), quantity: item.quantity, discount: Number(item.discount || 0) / item.quantity })) }
}
export async function enqueuePurchase(orderId, { db = prisma, config = readMetaConversionsConfig() } = {}) {
  if (!config) return
  const order = await db.order.findUnique({ where: { id: orderId }, include: { items: { include: { product: { select: { slug: true } } } }, customer: true } })
  const context = order?.trackingContext
  if (!context?.marketing || context.source !== 'web' || context.pixelId !== config.pixelId || !(order.paymentStatus === 'paid' || (order.paymentMode === 'cod' && context.codConfirmed))) return
  const summary = purchaseSummary(order)
  const userData = {}
  if (order.customer?.phone) userData.ph = [createHash('sha256').update(`91${order.customer.phone.replace(/\D/g, '').slice(-10)}`).digest('hex')]
  if (!userData.ph) return
  const payload = { event_name: 'Purchase', event_id: summary.eventId, event_time: Math.floor((context.confirmedAt || order.updatedAt.getTime()) / 1000), action_source: 'website', event_source_url: context.url, user_data: userData, custom_data: { currency: summary.currency, value: summary.value, content_type: 'product', contents: summary.items.map((item) => ({ id: item.id, quantity: item.quantity })) } }
  await db.trackingDelivery.createMany({ data: [{ id: summary.eventId, pixelId: config.pixelId, payload }], skipDuplicates: true })
}
let running = false
export async function processTrackingDeliveries({ db = prisma, config = readMetaConversionsConfig(), send = sendMetaConversion } = {}) {
  if (!config || running) return
  running = true
  try {
    // Recover an enqueue interrupted after order confirmation.
    let cursor
    let orders
    do {
      orders = await db.order.findMany({ where: { updatedAt: { gte: new Date(Date.now() - 6 * 86400000) } }, take: 500, orderBy: { id: 'asc' }, ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}), select: { id: true } })
      for (const order of orders) await enqueuePurchase(order.id, { db, config })
      cursor = orders.at(-1)?.id
    } while (orders.length === 500)
    const rows = await db.trackingDelivery.findMany({ where: { sentAt: null, pixelId: config.pixelId, attempts: { lt: 8 }, nextAttemptAt: { lte: new Date() } }, take: 25 })
    for (const row of rows) {
      const lease = await db.trackingDelivery.updateMany({ where: { id: row.id, sentAt: null, attempts: { lt: 8 }, nextAttemptAt: { lte: new Date() }, OR: [{ leaseUntil: null }, { leaseUntil: { lt: new Date() } }] }, data: { leaseUntil: new Date(Date.now() + 30000), attempts: { increment: 1 } } })
      if (!lease.count) continue
      try {
        await send(row.payload, { config })
        await db.trackingDelivery.update({ where: { id: row.id }, data: { sentAt: new Date(), leaseUntil: null } })
      } catch {
        await db.trackingDelivery.update({ where: { id: row.id }, data: { leaseUntil: null, nextAttemptAt: new Date(Date.now() + Math.min(3600000, 30000 * 2 ** row.attempts)) } })
      }
    }
  } finally { running = false }
}
