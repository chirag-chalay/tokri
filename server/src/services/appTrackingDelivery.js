import { appPurchasePayload } from './appTrackingPurchase.js'

export async function changeAppDispatch(db, customerId, { orderKey, consentId, state, destination = 'google' }) {
  if (!['google', 'meta'].includes(destination)) return false
  if (!/^[a-zA-Z0-9_-]{1,80}$/.test(orderKey || '') || !/^[a-zA-Z0-9_-]{16,80}$/.test(consentId || '') || !['claim', 'sdkQueued', 'uncertain'].includes(state)) return false
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM \`Order\` WHERE id = ${orderKey} AND customerId = ${customerId} FOR UPDATE`
    const order = await tx.order.findFirst({ where: { id: orderKey, customerId } })
    if (!order || !appPurchasePayload(order, consentId, destination)) return false
    const context = order.trackingContext
    const field = destination === 'meta' ? 'metaDispatch' : 'googleDispatch'
    const previous = context[field]
    if (state === 'claim' ? Boolean(previous) : previous?.state !== 'dispatching') return false
    await tx.order.update({ where: { id: order.id }, data: { trackingContext: { ...context, [field]: { state: state === 'claim' ? 'dispatching' : state, at: Date.now() } } } })
    return true
  })
}

export async function revokeAppTracking(db, customerId, consentId, destination = 'google') {
  if (!['google', 'meta'].includes(destination)) return
  const idField = destination === 'meta' ? 'marketingConsentId' : 'consentId'
  const purpose = destination === 'meta' ? 'marketing' : 'analytics'
  if (!/^[a-zA-Z0-9_-]{16,80}$/.test(consentId || '')) return
  let cursor
  do {
    const rows = await db.order.findMany({ where: { customerId }, select: { id: true, trackingContext: true }, orderBy: { id: 'asc' }, take: 100, ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}) })
    for (const row of rows) {
      if (row.trackingContext?.source !== 'app' || row.trackingContext[idField] !== consentId) continue
      await db.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM \`Order\` WHERE id = ${row.id} AND customerId = ${customerId} FOR UPDATE`
        const order = await tx.order.findFirst({ where: { id: row.id, customerId } })
        const context = order?.trackingContext
        if (context?.source !== 'app' || context[idField] !== consentId) return
        const cleaned = { ...context, [purpose]: false, revokedAt: Date.now() }
        delete cleaned[idField]
        if (!cleaned.analytics && !cleaned.marketing) delete cleaned.snapshot
        await tx.order.update({ where: { id: row.id }, data: { trackingContext: cleaned } })
      })
    }
    cursor = rows.length === 100 ? rows.at(-1).id : null
  } while (cursor)
}
