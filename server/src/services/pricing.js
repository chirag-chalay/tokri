import { prisma } from '../lib/prisma.js'
import { calcCartTotals } from '../config/charges.js'
import { applyCouponToItems, findActiveCoupon } from './coupons.js'
import { automaticDiscountFor } from './automaticDiscounts.js'
import { subtotal } from '../utils/money.js'

// The only promotion selection path used by quotes, coupon previews and saved orders.
export async function calculateCheckoutPricing(items, rates, { customerId, couponCode, isInterState = false, config } = {}) {
  const promotion = config === undefined ? await prisma.automaticDiscount.findUnique({ where: { id: 1 } }) : config
  const automatic = automaticDiscountFor(subtotal(items), promotion)
  let couponResult = null
  if (String(couponCode || '').trim()) {
    const coupon = await findActiveCoupon(couponCode)
    couponResult = await applyCouponToItems(coupon, items, customerId, rates.option, { isInterState }, rates)
  }
  const shippingCoupon = couponResult?.coupon.applyOn === 'shipping'
  const useAutomatic = Boolean(automatic && (shippingCoupon || !couponResult || automatic.discount >= couponResult.benefit))
  const appliedCoupon = couponResult && (!useAutomatic || shippingCoupon) ? couponResult.coupon : null
  const merchandiseDiscount = useAutomatic ? automatic.discount : shippingCoupon ? 0 : couponResult?.benefit || 0
  const shippingDiscount = shippingCoupon ? couponResult.benefit : 0
  const totals = calcCartTotals(items, rates, merchandiseDiscount, { isInterState, shippingDiscount,
    eligibleIndexes: !useAutomatic && !shippingCoupon ? couponResult?.eligibleIndexes : undefined })
  totals.automaticDiscount = useAutomatic ? automatic : null
  totals.couponDiscount = appliedCoupon ? couponResult.benefit : 0
  totals.discountMessage = couponResult && automatic && !shippingCoupon
    ? useAutomatic ? 'Automatic discount applied because it gives equal or greater savings than your coupon. Merchandise discounts cannot be combined.'
      : 'Your coupon gives greater savings than the automatic discount. Merchandise discounts cannot be combined.'
    : useAutomatic ? `Automatic discount (${automatic.percentage}%) applied.`
      : appliedCoupon ? `Coupon ${appliedCoupon.code} applied.` : null
  return { totals, coupon: appliedCoupon }
}
