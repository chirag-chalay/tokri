import { decimal, money } from '../utils/money.js'

export function validateDiscountConfig(payload) {
  if (typeof payload.enabled !== 'boolean' || !Array.isArray(payload.tiers) || payload.tiers.length > 100) {
    throw Object.assign(new Error('Supply an enabled flag and up to 100 tiers.'), { status: 400 })
  }
  const seen = new Set()
  const ids = new Set()
  const tiers = payload.tiers.map((tier) => {
    const valid = (value) => /^(0|[1-9]\d{0,7})(\.\d{1,2})?$/.test(String(value))
    if (!valid(tier.minimum) || !valid(tier.percentage) || decimal(tier.minimum).lte(0) ||
        decimal(tier.percentage).lte(0) || decimal(tier.percentage).gt(100) || typeof tier.active !== 'boolean') {
      throw Object.assign(new Error('Minimum must be positive; percentage must be greater than 0 and at most 100. Use at most two decimal places.'), { status: 400 })
    }
    const minimum = money(tier.minimum)
    const id = String(tier.id || '').trim()
    if (!/^[a-zA-Z0-9_-]{1,80}$/.test(id) || ids.has(id) || seen.has(minimum)) {
      throw Object.assign(new Error('Each tier needs a unique ID and minimum order value.'), { status: 400 })
    }
    ids.add(id); seen.add(minimum)
    return { id, minimum, percentage: money(tier.percentage), active: tier.active }
  }).sort((a, b) => a.minimum - b.minimum)
  return { enabled: payload.enabled, tiers }
}

export function automaticDiscountFor(amount, config) {
  if (!config?.enabled || decimal(amount).lte(0)) return null
  const tier = [...config.tiers].filter((row) => row.active && decimal(amount).gte(row.minimum))
    .sort((a, b) => b.minimum - a.minimum)[0]
  if (!tier) return null
  return { tierId: tier.id, minimum: tier.minimum, percentage: tier.percentage,
    eligibleSubtotal: money(amount), discount: money(decimal(amount).times(tier.percentage).div(100)) }
}
