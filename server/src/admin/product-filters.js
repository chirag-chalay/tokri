const STRING_FIELDS = new Set(['name', 'slug', 'badge', 'hsnCode'])
const NUMBER_FIELDS = new Set(['priceValue', 'gstRate', 'stock'])
const BOOLEAN_FIELDS = new Set(['isBestSeller', 'isImported', 'isFeatured', 'isActive', 'isTaxable'])
const DATE_FIELDS = new Set(['createdAt', 'updatedAt'])

function isBlank(value) {
  return value == null || (typeof value === 'string' && value.trim() === '')
}

export function readRequestFilters(query = {}) {
  const collected = {}

  if (query.filters && typeof query.filters === 'object' && !Array.isArray(query.filters)) {
    Object.assign(collected, query.filters)
  }

  for (const [key, value] of Object.entries(query)) {
    if (!key.startsWith('filters.')) continue
    collected[key.slice('filters.'.length)] = value
  }

  const normalized = {}
  for (const [key, value] of Object.entries(collected)) {
    if (isBlank(value)) continue
    const separator = key.indexOf('~~')
    if (separator === -1) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const nested = {}
        for (const [part, partValue] of Object.entries(value)) {
          if (!isBlank(partValue)) nested[part] = partValue
        }
        if (Object.keys(nested).length) normalized[key] = nested
      } else {
        normalized[key] = value
      }
      continue
    }

    const field = key.slice(0, separator)
    const part = key.slice(separator + 2)
    const current = normalized[field] && typeof normalized[field] === 'object' ? normalized[field] : {}
    current[part] = value
    normalized[field] = current
  }

  return normalized
}

function localDayStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
}

function localDayEnd(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
}

function parseFilterDate(value) {
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function dateRangeWhere(value) {
  if (isBlank(value)) return null
  const raw = value && typeof value === 'object' ? value : { from: value }
  const from = raw.from ? parseFilterDate(raw.from) : null
  const to = raw.to ? parseFilterDate(raw.to) : null
  if (!from && !to) return null

  const range = {}
  if (from) range.gte = localDayStart(from)
  if (to) range.lte = localDayEnd(to)
  return range
}

function booleanWhere(value) {
  if (value === true || value === 'true' || value === '1' || value === 1) return true
  if (value === false || value === 'false' || value === '0' || value === 0) return false
  return null
}

function noMatch() {
  return { id: { equals: '__no_product_match__' } }
}

export function productFilterWhere(filters = {}) {
  const clauses = []

  for (const [key, raw] of Object.entries(filters)) {
    if (key === 'category' || key === 'categoryId') {
      const id = String(raw ?? '').trim()
      if (id) clauses.push({ categoryId: id })
      continue
    }

    if (STRING_FIELDS.has(key)) {
      const text = String(raw).trim()
      if (text) clauses.push({ [key]: { contains: text } })
      continue
    }

    if (NUMBER_FIELDS.has(key)) {
      const amount = typeof raw === 'number' ? raw : Number(String(raw).trim())
      clauses.push(Number.isFinite(amount) ? { [key]: { equals: amount } } : noMatch())
      continue
    }

    if (BOOLEAN_FIELDS.has(key)) {
      const flag = booleanWhere(raw)
      if (flag != null) clauses.push({ [key]: flag })
      continue
    }

    if (DATE_FIELDS.has(key)) {
      const range = dateRangeWhere(raw)
      if (range) clauses.push({ [key]: range })
    }
  }

  if (!clauses.length) return {}
  return { AND: clauses }
}

export function productListWhere(query = {}) {
  return productFilterWhere(readRequestFilters(query))
}
