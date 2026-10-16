export const DEFAULT_DELIVERY = {
  morning: {
    id: 'morning',
    title: 'Flawless Morning Delivery',
    subtitle: 'Freshness Guaranteed',
    fee: 25,
    freeAbove: 0,
  },
  express: {
    id: 'express',
    title: 'Same day',
    subtitle: 'On-Demand Luxury',
    fee: 99,
    freeAbove: 0,
  },
}

export function normalizeDeliveryOption(value) {
  return String(value || '').toLowerCase() === 'express' ? 'express' : 'morning'
}

export function mergeDeliveryConfig(raw) {
  const source = raw?.delivery || raw || {}
  return {
    morning: {
      ...DEFAULT_DELIVERY.morning,
      ...(source.morning || {}),
      fee: Number(source.morning?.fee ?? DEFAULT_DELIVERY.morning.fee) || 0,
      freeAbove: Number(source.morning?.freeAbove ?? 0) || 0,
    },
    express: {
      ...DEFAULT_DELIVERY.express,
      ...(source.express || {}),
      fee: Number(source.express?.fee ?? DEFAULT_DELIVERY.express.fee) || 0,
      freeAbove: Number(source.express?.freeAbove ?? 0) || 0,
    },
  }
}

export function deliveryChargeFor(option, itemsTotal, config = DEFAULT_DELIVERY) {
  const key = normalizeDeliveryOption(option)
  const spec = config?.[key] || DEFAULT_DELIVERY[key]
  const fee = Number(spec?.fee)
  const freeAbove = Number(spec?.freeAbove)
  const safeFee = Number.isFinite(fee) && fee >= 0 ? fee : 0
  if (Number.isFinite(freeAbove) && freeAbove > 0 && Number(itemsTotal) >= freeAbove) return 0
  return safeFee
}

export function remainingForFreeDelivery(option, itemsTotal, config = DEFAULT_DELIVERY) {
  const key = normalizeDeliveryOption(option)
  const spec = config?.[key] || DEFAULT_DELIVERY[key]
  const freeAbove = Number(spec?.freeAbove)
  if (!Number.isFinite(freeAbove) || freeAbove <= 0) return 0
  const remaining = freeAbove - Number(itemsTotal || 0)
  return remaining > 0 ? Math.round(remaining * 100) / 100 : 0
}

export function waivedDeliveryAmount(option, itemsTotal, config = DEFAULT_DELIVERY) {
  const key = normalizeDeliveryOption(option)
  const spec = config?.[key] || DEFAULT_DELIVERY[key]
  const fee = Number(spec?.fee)
  const freeAbove = Number(spec?.freeAbove)
  const safeFee = Number.isFinite(fee) && fee >= 0 ? fee : 0
  if (!Number.isFinite(freeAbove) || freeAbove <= 0 || safeFee <= 0) return 0
  return Number(itemsTotal) >= freeAbove ? safeFee : 0
}

export function defaultOptionForAddress(address) {
  const delivery = address?.delivery
  if (delivery?.defaultOption) return delivery.defaultOption
  if (delivery?.morning?.enabled) return 'morning'
  if (delivery?.express?.enabled) return 'express'
  return 'morning'
}

export function formatExpectedDeliveryDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  })
}
