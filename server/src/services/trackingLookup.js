import { purchaseSummary } from './trackingPurchase.js'

// The opaque transaction ID is one-way; compute it on the database side so the
// matching order can be reconciled without exposing customer or payment data.
export async function lookupTrackingPurchase(transactionId, db) {
  if (!/^[a-f0-9]{64}$/.test(transactionId || '')) return null
  const rows = await db.$queryRaw`SELECT id FROM \`Order\` WHERE SHA2(CONCAT('tokri-purchase:', id), 256) = ${transactionId} LIMIT 1`
  if (!rows?.[0]?.id) return null
  const order = await db.order.findUnique({ where: { id: rows[0].id }, include: { items: { include: { product: { select: { slug: true } } } } } })
  if (!order) return null
  const context = order.trackingContext || {}
  const summary = context.source === 'app' && context.snapshot ? context.snapshot : purchaseSummary(order)
  return {
    transactionId,
    orderNo: order.orderNo,
    source: context.source || 'unknown',
    platform: context.platform || null,
    confirmedAt: context.confirmedAt || null,
    currency: summary.currency,
    ga4MerchandiseValue: context.source === 'app' ? summary.value : summary.merchandiseValue,
    grandTotal: Number(order.grandTotal),
    tax: Number(order.taxTotal || 0),
    shipping: summary.shipping,
    handling: Number(order.handlingCharge || 0),
    smallCartFee: Number(order.smallCartCharge || 0),
    discount: Number(order.discount || 0),
    paymentStatus: order.paymentStatus,
    orderStatus: order.status,
  }
}
