const { sanitizeSearchTerm } = require('./trackingCommerce')

// Map validated commerce data to the native SDK's constants. This module does
// not initialize an SDK or send data; marketing consent remains a runtime gate.
function buildMetaAppEvent(action, input = {}, sdk = {}) {
  const events = sdk.AppEvents || {}
  const params = sdk.AppEventParams || {}
  if (action === 'search') {
    const term = sanitizeSearchTerm(input.searchTerm)
    return term && events.Searched && params.SearchString
      ? { method: 'event', name: events.Searched, parameters: { [params.SearchString]: term } }
      : null
  }
  if (action === 'sign_up') {
    return input.isNewCustomer === true && events.CompletedRegistration && params.RegistrationMethod
      ? { method: 'event', name: events.CompletedRegistration, parameters: { [params.RegistrationMethod]: 'phone' } }
      : null
  }
  const names = { view_item: 'ViewedContent', add_to_cart: 'AddedToCart', begin_checkout: 'InitiatedCheckout', add_payment_info: 'AddedPaymentInfo' }
  if (action !== 'purchase' && !names[action]) return null
  const commerce = input.commerce
  if (!commerce || !/^[A-Z]{3}$/.test(commerce.currency || '') || !Array.isArray(commerce.items) || !commerce.items.length || commerce.items.length > 200) return null
  if (!Number.isFinite(commerce.value) || commerce.value < 0) return null
  if (commerce.items.some((item) => typeof item.item_id !== 'string' || !item.item_id || item.item_id.length > 100 || /@|https?:\/\//i.test(item.item_id) || !Number.isSafeInteger(item.quantity) || item.quantity <= 0)) return null
  if (!params.ContentID || !params.ContentType || !params.NumItems || !params.Currency) return null
  const ids = commerce.items.map((item) => item.item_id)
  const parameters = {
    [params.ContentID]: ids.length === 1 ? ids[0] : JSON.stringify(ids),
    [params.ContentType]: 'product',
    [params.NumItems]: commerce.items.reduce((sum, item) => sum + item.quantity, 0),
    [params.Currency]: commerce.currency,
  }
  if (action === 'purchase') {
    // Meta uses grand total; never fall back to GA4's merchandise-only value.
    if (!Number.isFinite(input.grandTotal) || input.grandTotal < 0 || !/^[a-f0-9]{64}$/.test(commerce.transaction_id || '')) return null
    if (params.OrderId) parameters[params.OrderId] = commerce.transaction_id
    return { method: 'purchase', amount: input.grandTotal, currency: commerce.currency, parameters }
  }
  const name = events[names[action]]
  return name ? { method: 'event', name, value: commerce.value, parameters } : null
}

module.exports = { buildMetaAppEvent }
