export const DEFAULT_DELIVERY = {
  morning: {
    id: 'morning',
  },
  express: {
    id: 'express',
  },
}

export function mergeDeliveryConfig(raw) {
  const source = raw?.delivery || raw || {}
  return {
    morning: {
      ...DEFAULT_DELIVERY.morning,
      ...(source.morning || {}),
    },
    express: {
      ...DEFAULT_DELIVERY.express,
      ...(source.express || {}),
    },
  }
}

export function defaultOptionForAddress(address) {
  const delivery = address?.delivery
  if (delivery?.defaultOption) return delivery.defaultOption
  if (delivery?.morning?.enabled) return 'morning'
  if (delivery?.express?.enabled) return 'express'
  return 'morning'
}

export function formatDeliveryCharge(amount) {
  const value = Number(amount)
  if (!Number.isFinite(value) || value <= 0) return 'Free'
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
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
