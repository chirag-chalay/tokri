import { calcCartTotals } from '../config/charges.js'
import { applyCouponToItems, findActiveCoupon } from './coupons.js'

// A coupon is applied only when the customer explicitly supplies one code.
// Quotes can clear invalid selections; final order creation stays strict.
export async function calculateCheckoutPricing(
  items,
  rates,
  {
    customerId,
    couponCode,
    isInterState = false,
    allowCouponRemoval = false,
    db,
  } = {},
) {
  let result = null
  let couponStatus = null
  if (String(couponCode || '').trim()) {
    try {
      const coupon = await findActiveCoupon(couponCode, db)
      result = await applyCouponToItems(
        coupon,
        items,
        customerId,
        rates.option,
        { isInterState },
        rates,
        db,
      )
      couponStatus = { status: 'applied', code: coupon.code }
    } catch (error) {
      if (!allowCouponRemoval || error.status !== 400) throw error
      couponStatus = {
        status: 'removed',
        code: String(couponCode).trim().toUpperCase(),
        reason: error.code || 'INELIGIBLE',
        message:
          error.removalMessage || `Your coupon was removed: ${error.message}`,
      }
    }
  }
  const totals =
    result?.totals || calcCartTotals(items, rates, 0, { isInterState })
  totals.automaticDiscount = null // Backwards-compatible field; never selects a promotion.
  totals.couponDiscount = result?.benefit || 0
  totals.discountMessage = result
    ? `Coupon ${result.coupon.code} applied.`
    : null
  return {
    totals,
    coupon: result?.coupon || null,
    couponStatus,
  }
}
