function toBoolean(value) {
  return value === true || value === 'true' || value === 'on' || value === 1 || value === '1'
}

function parseTargetSlugs(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.map((item) => String(item).trim()).filter(Boolean)
  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (!trimmed) return []
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) return parseTargetSlugs(parsed)
    } catch {
      // comma-separated
    }
    return trimmed
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

function emptyToNull(value) {
  if (value === undefined || value === null || value === '') return null
  return value
}

export async function prepareCouponPayload(request) {
  if (request.method !== 'post') return request

  const payload = request.payload || {}
  payload.code = String(payload.code || '')
    .trim()
    .toUpperCase()
  payload.type = payload.type === 'flat' ? 'flat' : 'percent'
  payload.applyOn = payload.applyOn === 'shipping' ? 'shipping' : 'cart'
  payload.targetType = ['products', 'categories'].includes(payload.targetType) ? payload.targetType : 'all'
  payload.usageType = payload.usageType === 'single' ? 'single' : 'unlimited'
  payload.isActive = toBoolean(payload.isActive ?? true)
  payload.showAtCheckout = toBoolean(payload.showAtCheckout)
  payload.targetSlugs = payload.targetType === 'all' ? [] : parseTargetSlugs(payload.targetSlugs)
  payload.minCart = emptyToNull(payload.minCart)
  payload.maxDiscount = emptyToNull(payload.maxDiscount)
  payload.startsAt = emptyToNull(payload.startsAt)
  payload.expiresAt = emptyToNull(payload.expiresAt)
  payload.usageLimit = payload.usageType === 'single' ? null : emptyToNull(payload.usageLimit)

  if (!payload.code) {
    throw new Error('Coupon code is required.')
  }

  const value = Number(payload.value)
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('Enter a discount value greater than 0.')
  }

  if (payload.type === 'percent' && value > 100) throw new Error('Percentage must not exceed 100.')
  for (const key of ['minCart', 'maxDiscount', 'usageLimit']) {
    if (payload[key] != null && (!Number.isFinite(Number(payload[key])) || Number(payload[key]) < 0)) throw new Error(`Invalid ${key}.`)
  }
  if (payload.usageLimit != null && (!Number.isSafeInteger(Number(payload.usageLimit)) || Number(payload.usageLimit) < 1)) throw new Error('Usage limit must be a positive integer.')
  if (payload.startsAt && !Number.isFinite(Date.parse(payload.startsAt)) || payload.expiresAt && !Number.isFinite(Date.parse(payload.expiresAt))) throw new Error('Invalid validity date.')
  if (payload.startsAt && payload.expiresAt && new Date(payload.startsAt) >= new Date(payload.expiresAt)) throw new Error('Expiry must be after the start date.')

  if (payload.targetType !== 'all' && !payload.targetSlugs.length) {
    throw new Error(
      payload.targetType === 'categories'
        ? 'Select at least one category for this coupon.'
        : 'Select at least one product for this coupon.',
    )
  }

  request.payload = payload
  return request
}
