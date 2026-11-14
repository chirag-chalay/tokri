import { appPurchasePayload } from './appTrackingPurchase.js'

export async function changeAppDispatch(db, customerId, { orderKey, consentId, state }) {
  if (!/^[a-zA-Z0-9_-]{1,80}$/.test(orderKey || '') || !/^[a-zA-Z0-9_-]{16,80}$/.test(consentId || '') || !['claim', 'sdkQueued', 'uncertain'].includes(state)) return false
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM \`Order\` WHERE id = ${orderKey} AND customerId = ${customerId} FOR UPDATE`
    const order = await tx.order.findFirst({ where: { id: orderKey, customerId } })
    if (!order || !appPurchasePayload(order, consentId)) return false
    const context = order.trackingContext
    const previous = context.googleDispatch
    if (state === 'claim' ? Boolean(previous) : previous?.state !== 'dispatching') return false
    await tx.order.update({ where: { id: order.id }, data: { trackingContext: { ...context, googleDispatch: { state: state === 'claim' ? 'dispatching' : state, at: Date.now() } } } })
    return true
  })
}

export async function revokeAppTracking(db, customerId, consentId) {
  if (!/^[a-zA-Z0-9_-]{16,80}$/.test(consentId || '')) return
  let cursor
  do {
    const rows = await db.order.findMany({ where: { customerId }, select: { id: true, trackingContext: true }, orderBy: { id: 'asc' }, take: 100, ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}) })
    for (const row of rows) {
      if (row.trackingContext?.source !== 'app' || row.trackingContext.consentId !== consentId) continue
      await db.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM \`Order\` WHERE id = ${row.id} AND customerId = ${customerId} FOR UPDATE`
        const order = await tx.order.findFirst({ where: { id: row.id, customerId } })
        const context = order?.trackingContext
        if (context?.source !== 'app' || context.consentId !== consentId) return
        await tx.order.update({ where: { id: row.id }, data: { trackingContext: { source: 'app', analytics: false, revokedAt: Date.now(), ...(context.googleDispatch ? { googleDispatch: context.googleDispatch } : {}) } } })
      })
    }
    cursor = rows.length === 100 ? rows.at(-1).id : null
  } while (cursor)
}
