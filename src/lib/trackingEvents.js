// Build a minimal allowlisted payload; never copy arbitrary product/user data.
const EVENTS = new Set(['view_item', 'add_to_cart', 'remove_from_cart', 'view_cart', 'begin_checkout', 'add_payment_info', 'purchase'])

function cleanText(value, maxLength = 100) {
  const text = String(value ?? '').trim().slice(0, maxLength)
  // Product identifiers may be numeric; reject email addresses and URLs.
  return /@|https?:\/\//i.test(text) ? '' : text
}

export function buildCommerceEvent(name, { items = [], currency = 'INR', transactionId, tax, shipping, merchandiseValue } = {}) {
  if (!EVENTS.has(name) || !Array.isArray(items) || !/^[A-Z]{3}$/.test(currency)) return null
  const normalized = items.slice(0, 200).map((item) => {
    const id = cleanText(item.id || item.slug || item.productId)
    const itemName = cleanText(item.name)
    const price = Number(item.priceValue ?? item.price)
    const quantity = Number(item.quantity)
    const discount = Number(item.discount ?? 0)
    if (!id || !itemName || !Number.isFinite(price) || price < 0 || !Number.isSafeInteger(quantity) || quantity <= 0 || !Number.isFinite(discount) || discount < 0 || discount > price) return null
    return { item_id: id, item_name: itemName, price: Math.round((price - discount) * 100) / 100, quantity, ...(discount ? { discount } : {}) }
  })
  if (!normalized.length || normalized.some((item) => !item)) return null
  const ecommerce = { currency, value: Math.round(normalized.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100, items: normalized }
  if (!Number.isFinite(ecommerce.value)) return null
  if (name === 'purchase') {
    const id = cleanText(transactionId)
    if (!id) return null
    ecommerce.transaction_id = id
    if (merchandiseValue != null) {
      if (!Number.isFinite(merchandiseValue) || merchandiseValue < 0) return null
      ecommerce.value = merchandiseValue
    }
    for (const [key, value] of Object.entries({ tax, shipping })) {
      if (value != null && Number.isFinite(Number(value)) && Number(value) >= 0) ecommerce[key] = Number(value)
    }
  }
  return { event: name, ecommerce }
}
