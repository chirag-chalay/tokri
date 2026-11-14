// Provider-independent preparation of browse/cart payloads. No data is sent here.
// Purchase events require an authoritative confirmed-order snapshot and are
// intentionally excluded until that backend contract exists.
const COMMERCE_EVENTS = new Set([
  'view_item_list', 'select_item', 'view_item', 'add_to_cart',
  'remove_from_cart', 'view_cart', 'begin_checkout', 'add_payment_info',
])

function safeText(value) {
  if (typeof value !== 'string') return ''
  const text = value.trim()
  if (!text || text.length > 100 || /@|https?:\/\/|[\r\n]/i.test(text)) return ''
  return text
}

function amount(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return null
  return Math.round(value * 100) / 100
}

function buildCommercePayload(event, items, currency = 'INR') {
  if (!COMMERCE_EVENTS.has(event) || !Array.isArray(items) || !items.length || items.length > 200 || !/^[A-Z]{3}$/.test(currency)) return null
  const normalized = items.map((item) => {
    if (!item || typeof item !== 'object') return null
    // A line-item ID is not necessarily a product or catalog ID.
    const id = safeText(item.slug)
    const name = safeText(item.name)
    const price = amount(item.priceValue)
    const quantity = item.quantity
    if (!id || !name || price === null || !Number.isSafeInteger(quantity) || quantity < 1) return null
    const category = safeText(typeof item.category === 'string' ? item.category : item.category?.name)
    return { item_id: id, item_name: name, price, quantity, ...(category ? { item_category: category } : {}) }
  })
  if (normalized.some((item) => !item)) return null
  const value = amount(normalized.reduce((total, item) => total + item.price * item.quantity, 0))
  if (value === null) return null
  return { currency, value, items: normalized }
}

function sanitizeSearchTerm(term) {
  if (typeof term !== 'string') return ''
  const value = term.normalize('NFKC').trim().replace(/\s+/g, ' ')
  if (!/^[\p{L}\p{M}\p{N} '\u2019-]{2,60}$/u.test(value) || /\p{N}{6,}/u.test(value) || /^\p{N}+$/u.test(value)) return ''
  return value
}

module.exports = { buildCommercePayload, sanitizeSearchTerm }
