import { prisma } from '../lib/prisma.js'

export const FREE_DELIVERY_QUOTA = 3

// Any orders created before this date without freeDeliveryApplied count as legacy orders
const FEATURE_DEPLOY_DATE = new Date('2026-10-06T00:00:00.000Z')

/**
 * Returns account-based free delivery eligibility and usage for a customer.
 * - Eligible customer accounts get ₹0 Morning Delivery on their first 3 qualifying orders when enabled in Settings.
 * - From order 4 onward, normal delivery charges apply.
 * - Cancelled (status = 'cancelled') and failed (paymentStatus = 'failed' / 'refunded') orders do NOT consume quota.
 * - Incomplete/abandoned online orders (>15m pending) do not consume quota.
 */
export async function getCustomerFreeDeliveryStatus(customerId) {
  if (!customerId) {
    return {
      quota: FREE_DELIVERY_QUOTA,
      used: 0,
      remaining: 0,
      isEligible: false,
    }
  }

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { id: true, createdAt: true },
  })

  if (!customer) {
    return {
      quota: FREE_DELIVERY_QUOTA,
      used: 0,
      remaining: 0,
      isEligible: false,
    }
  }

  const orders = await prisma.order.findMany({
    where: {
      customerId,
      status: { not: 'cancelled' },
      paymentStatus: { notIn: ['failed', 'refunded'] },
    },
    select: {
      id: true,
      orderNo: true,
      freeDeliveryApplied: true,
      deliveryCharge: true,
      paymentMode: true,
      paymentStatus: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  // Count valid completed/placed orders:
  // - Cancelled/failed/refunded orders are excluded
  // - For online payments, unpaid orders (paymentStatus !== 'paid') do NOT consume quota
  const validOrders = orders.filter((order) => {
    if (order.status === 'cancelled') return false
    if (['failed', 'refunded'].includes(order.paymentStatus)) return false
    if (order.paymentMode === 'online' && order.paymentStatus !== 'paid') {
      return false
    }
    return true
  })

  const used = validOrders.length
  const remaining = Math.max(0, FREE_DELIVERY_QUOTA - used)
  const isEligible = used < FREE_DELIVERY_QUOTA

  return {
    quota: FREE_DELIVERY_QUOTA,
    used,
    remaining,
    isEligible,
  }
}

/**
 * Modifies morning delivery rates to reflect the account-level free delivery offer.
 */
export function applyFreeDeliveryRates(rates) {
  if (!rates || rates.option !== 'morning' || rates.firstThreeMorningEnabled === false) return rates
  const cloned = { ...rates }
  cloned.deliveryCharge = 0
  if (cloned.morning) {
    cloned.morning = { ...cloned.morning, fee: 0 }
  }
  return cloned
}
