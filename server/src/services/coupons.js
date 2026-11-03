import { decimal, money, subtotal } from '../utils/money.js'
import { prisma } from '../lib/prisma.js'
import {
  calcCartTotals,
  deliveryChargeFor,
  getChargeRates,
} from '../config/charges.js'
import {
  applyFreeDeliveryRates,
  getCustomerFreeDeliveryStatus,
} from './freeDelivery.js'

function httpError(message, status = 400) {
  return Object.assign(new Error(message), { status })
}

function parseTargetSlugs(raw) {
  if (!raw) return []
  if (Array.isArray(raw))
    return raw.map((item) => String(item).trim()).filter(Boolean)
  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (!trimmed) return []
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) return parseTargetSlugs(parsed)
    } catch {
      // Treat as comma-separated slugs.
    }
    return trimmed
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

function itemSlug(item) {
  return String(item?.slug || item?.id || '').trim()
}

function itemCategorySlugs(item) {
  const values = []
  if (Array.isArray(item?.categories)) {
    for (const category of item.categories) {
      const slug =
        typeof category === 'string' ? category : category?.slug || category?.id
      if (slug) values.push(String(slug).trim())
    }
  }
  if (typeof item?.category === 'string') values.push(item.category.trim())
  const single = String(
    item?.category?.slug ||
      item?.categorySlug ||
      item?.categoryId ||
      item?.category?.id ||
      '',
  ).trim()
  if (single) values.push(single)
  return [...new Set(values.filter(Boolean))]
}

function isItemEligible(item, coupon) {
  const targetType = coupon.targetType || 'all'
  const slugs = parseTargetSlugs(coupon.targetSlugs)
  if (targetType === 'all' || !slugs.length) return true
  if (targetType === 'products') return slugs.includes(itemSlug(item))
  if (targetType === 'categories') {
    return itemCategorySlugs(item).some((slug) => slugs.includes(slug))
  }
  return true
}

function roundMoney(value) {
  return money(value || 0)
}

export function formatCouponPreview(coupon, totals) {
  const applyOn = coupon.applyOn === 'shipping' ? 'shipping' : 'cart'
  return {
    code: coupon.code,
    type: coupon.type,
    value: Number(coupon.value),
    applyOn,
    targetType: coupon.targetType || 'all',
    usageType: coupon.usageType || 'unlimited',
    discount: totals.discount,
    itemsTotal: totals.itemsTotal,
    deliveryCharge: totals.deliveryCharge,
    handlingCharge: totals.handlingCharge,
    smallCartCharge: totals.smallCartCharge,
    taxTotal: totals.taxTotal || 0,
    grandTotal: totals.grandTotal,
    message:
      applyOn === 'shipping'
        ? `₹${totals.discount} off shipping`
        : `₹${totals.discount} off cart`,
  }
}

export async function findActiveCoupon(code, db = prisma) {
  const normalized = String(code || '')
    .trim()
    .toUpperCase()
  if (!normalized) throw httpError('Enter a coupon code.')

  const coupon = await db.coupon.findUnique({ where: { code: normalized } })
  if (!coupon || !coupon.isActive) throw httpError('This coupon is not valid.')

  const now = new Date()
  if (coupon.startsAt && coupon.startsAt > now)
    throw httpError('This coupon is not active yet.')
  if (coupon.expiresAt && coupon.expiresAt < now)
    throw httpError('This coupon has expired.')

  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    throw httpError('This coupon has reached its usage limit.')
  }

  return coupon
}

export async function applyCouponToItems(
  coupon,
  items,
  customerId,
  deliveryOption = 'morning',
  taxOptions = {},
  configuredRates = null,
  db = prisma,
) {
  if (!items.length)
    throw httpError('Add items to your cart before applying a coupon.')

  if ((coupon.usageType || 'unlimited') === 'single' && customerId) {
    const used = await db.couponRedemption.findFirst({
      where: { couponId: coupon.id, customerId },
      select: { id: true },
    })
    if (used) throw httpError('You have already used this coupon.')
  } else if ((coupon.usageType || 'unlimited') === 'single' && !customerId) {
    throw httpError('Please log in to use this coupon.')
  }

  let rates = configuredRates || (await getChargeRates(deliveryOption))
  if (customerId && !configuredRates) {
    const freeDelivery = await getCustomerFreeDeliveryStatus(customerId)
    if (rates.firstThreeMorningEnabled && freeDelivery?.isEligible) {
      rates = applyFreeDeliveryRates(rates)
    }
  }
  const eligibleItems = items.filter((item) => isItemEligible(item, coupon))
  const eligibleTotal = subtotal(eligibleItems)
  const itemsTotal = subtotal(items)
  const minCart = Number(coupon.minCart || 0)

  if (minCart > 0 && itemsTotal < minCart) {
    const error = httpError(
      `Add items worth ₹${minCart} or more to use this coupon.`,
    )
    error.code = 'MINIMUM_SUBTOTAL'
    error.removalMessage = `Your ${coupon.type === 'percent' ? `${Number(coupon.value)}%` : coupon.code} coupon was removed because your cart is now below ₹${minCart.toLocaleString('en-IN')}.`
    throw error
  }

  const applyOn = coupon.applyOn === 'shipping' ? 'shipping' : 'cart'
  if (applyOn === 'cart' && !eligibleItems.length) {
    throw httpError(
      coupon.targetType === 'categories'
        ? 'This coupon is only valid on selected categories.'
        : 'This coupon is only valid on selected products.',
    )
  }

  const shippingCharge = deliveryChargeFor(deliveryOption, itemsTotal, rates)
  const base = applyOn === 'shipping' ? shippingCharge : eligibleTotal
  if (base <= 0) {
    throw httpError(
      applyOn === 'shipping'
        ? 'No shipping fee to discount.'
        : 'No eligible items for this coupon.',
    )
  }

  let discount =
    coupon.type === 'percent'
      ? money(decimal(base).times(coupon.value).div(100))
      : money(coupon.value)
  if (coupon.maxDiscount != null)
    discount = Math.min(discount, Number(coupon.maxDiscount))
  discount = Math.min(roundMoney(discount), base)
  if (discount <= 0)
    throw httpError('This coupon does not give a discount on your cart.')

  const eligibleIndexes = items
    .map((item, i) => (isItemEligible(item, coupon) ? i : -1))
    .filter((i) => i >= 0)
  const totals = calcCartTotals(
    items,
    rates,
    applyOn === 'shipping' ? 0 : discount,
    {
      ...(typeof taxOptions === 'boolean'
        ? { isInterState: taxOptions }
        : taxOptions),
      eligibleIndexes,
      shippingDiscount: applyOn === 'shipping' ? discount : 0,
    },
  )
  return {
    coupon,
    benefit: discount,
    eligibleIndexes,
    totals,
    preview: formatCouponPreview(coupon, totals),
  }
}

export async function previewCoupon({
  code,
  items,
  customerId,
  deliveryOption = 'morning',
  taxOptions,
}) {
  const { getDeliveryDecision } = await import('./deliveryQuote.js')
  const { calculateCheckoutPricing } = await import('./pricing.js')
  const decision = await getDeliveryDecision(
    customerId,
    deliveryOption,
    subtotal(items),
  )
  const result = await calculateCheckoutPricing(items, decision.rates, {
    customerId,
    couponCode: code,
    isInterState:
      typeof taxOptions === 'boolean'
        ? taxOptions
        : Boolean(taxOptions?.isInterState),
  })
  const requested = await findActiveCoupon(code)
  return {
    ...result,
    preview: {
      ...formatCouponPreview(requested, result.totals),
      discount: result.totals.couponDiscount,
      message: result.totals.discountMessage,
    },
  }
}

// The order and reservation commit together under a coupon row lock. Retries for
// an existing order never increment usage again. Pending online orders retain their
// reservation, since Razorpay can still capture a delayed/retried payment.
export async function redeemCoupon(
  { coupon, customerId, orderId },
  db = prisma,
) {
  if (
    await db.couponRedemption.findFirst({
      where: { couponId: coupon.id, orderId },
    })
  )
    return
  await db.coupon.update({
    where: { id: coupon.id },
    data: { usedCount: { increment: 1 } },
  })
  await db.couponRedemption.create({
    data: { couponId: coupon.id, customerId, orderId },
  })
}

export async function checkoutCouponOffers(
  items,
  rates,
  { customerId, selectedCode, isInterState = false } = {},
) {
  // Private codes never enter this result, including locked/ineligible responses.
  const coupons = await prisma.coupon.findMany({
    where: { showAtCheckout: true },
    orderBy: [{ minCart: 'asc' }, { code: 'asc' }],
  })
  const currentSubtotal = subtotal(items)
  return Promise.all(
    coupons.map(async (coupon) => {
      const minimumSubtotal = Number(coupon.minCart || 0)
      let estimatedSavings = 0,
        reason = null
      try {
        await findActiveCoupon(coupon.code)
        estimatedSavings = (
          await applyCouponToItems(
            coupon,
            items,
            customerId,
            rates.option,
            { isInterState },
            rates,
          )
        ).benefit
      } catch (error) {
        if (error.status !== 400) throw error
        reason = error.message
      }
      const eligible = !reason
      return {
        id: coupon.id,
        code: coupon.code,
        label:
          coupon.type === 'percent'
            ? `${Number(coupon.value)}% OFF`
            : `₹${Number(coupon.value)} OFF`,
        percentage: coupon.type === 'percent' ? Number(coupon.value) : null,
        minimumSubtotal,
        eligible,
        amountToUnlock: money(Math.max(0, minimumSubtotal - currentSubtotal)),
        estimatedSavings,
        applied: eligible && coupon.code === selectedCode,
        reason,
      }
    }),
  )
}
