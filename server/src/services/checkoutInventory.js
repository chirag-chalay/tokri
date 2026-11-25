import { prisma } from '../lib/prisma.js'

const COD_RESERVATION_MS = 30 * 60 * 1000
const ONLINE_RESERVATION_MS = 73 * 60 * 60 * 1000

export async function reserveCheckoutStock(tx, items) {
  for (const item of [...items].sort((a, b) => a.productId.localeCompare(b.productId))) {
    const result = await tx.product.updateMany({
      where: { id: item.productId, isActive: true, stock: { gte: item.quantity } },
      data: { stock: { decrement: item.quantity } },
    })
    if (!result.count) {
      throw Object.assign(new Error(`There is insufficient stock for ${item.name}. Please review your cart.`), {
        status: 409,
        reasonCode: 'OUT_OF_STOCK',
      })
    }
  }
}

export async function releaseCheckoutStock(tx, order) {
  if (!order.inventoryReservedAt || order.inventoryReleasedAt) return
  const items = await tx.orderItem.findMany({
    where: { orderId: order.id, productId: { not: null } },
    orderBy: { productId: 'asc' },
  })
  for (const item of items) {
    await tx.product.updateMany({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    })
  }
  await tx.order.update({ where: { id: order.id }, data: { inventoryReleasedAt: new Date() } })
}

export async function expireCheckoutReservations() {
  const now = Date.now()
  const eligible = {
    status: 'pending',
    paymentStatus: { in: ['pending', 'failed'] },
    inventoryReleasedAt: null,
    OR: [
      { paymentMode: 'cod', codConfirmedAt: null, inventoryReservedAt: { lt: new Date(now - COD_RESERVATION_MS) } },
      { paymentMode: 'online', inventoryReservedAt: { lt: new Date(now - ONLINE_RESERVATION_MS) } },
    ],
  }
  const orders = await prisma.order.findMany({ where: eligible, select: { id: true }, take: 50 })
  for (const { id } of orders) {
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM \`Order\` WHERE id = ${id} FOR UPDATE`
      const order = await tx.order.findFirst({ where: { id, ...eligible } })
      if (!order) return
      await releaseCheckoutStock(tx, order)
      const redemptions = await tx.couponRedemption.findMany({ where: { orderId: id } })
      for (const redemption of redemptions) {
        await tx.coupon.updateMany({
          where: { id: redemption.couponId, usedCount: { gt: 0 } },
          data: { usedCount: { decrement: 1 } },
        })
        await tx.couponRedemption.delete({ where: { id: redemption.id } })
      }
      await tx.order.update({ where: { id }, data: { status: 'cancelled' } })
    })
  }
}
