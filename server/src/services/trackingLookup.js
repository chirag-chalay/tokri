import { purchaseSummary } from './trackingPurchase.js'

// The opaque transaction ID is one-way; compute it on the database side so the
// matching order can be reconciled without exposing customer or payment data.
export async function lookupTrackingPurchase(transactionId, db) {
  if (!/^[a-f0-9]{64}$/.test(transactionId || '')) return null
  let orderId
  try { orderId = (await db.trackingPurchaseLookup?.findUnique({ where: { id: transactionId } }))?.orderId } catch { /* Pre-migration/legacy fallback. */ }
  if (!orderId) {
    const rows = await db.$queryRaw`SELECT id FROM \`Order\` WHERE SHA2(CONCAT('tokri-purchase:', id), 256) = ${transactionId} LIMIT 1`
    orderId = rows?.[0]?.id
    if (!orderId) return null
    try { await db.trackingPurchaseLookup?.upsert({ where: { id: transactionId }, create: { id: transactionId, orderId }, update: {} }) } catch { /* Lookup still works before the additive migration. */ }
  }
  const order = await db.order.findUnique({ where: { id: orderId }, include: { items: { include: { product: { select: { slug: true } } } } } })
  if (!order) return null
  const context = order.trackingContext || {}
  const summary = context.source === 'app' && context.snapshot ? context.snapshot : purchaseSummary(order)
  return {
    transactionId,
    orderNo: order.orderNo,
    source: context.source || 'unknown',
    platform: context.platform || null,
    confirmedAt: context.confirmedAt || null,
    googleDispatchState: context.googleDispatch?.state || null,
    googleDispatchAt: context.googleDispatch?.at || null,
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
