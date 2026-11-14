const test = require('node:test')
const assert = require('node:assert/strict')
const { buildMetaAppEvent } = require('../src/lib/metaTrackingEvents')
const sdk = {
  AppEvents: { AddedToCart: 'cart', ViewedContent: 'content', Searched: 'search', CompletedRegistration: 'registration' },
  AppEventParams: { ContentID: 'content_id', ContentType: 'content_type', NumItems: 'count', Currency: 'currency', SearchString: 'term', RegistrationMethod: 'method', OrderId: 'order' },
}
const commerce = { currency: 'INR', value: 172, transaction_id: 'a'.repeat(64), items: [{ item_id: 'apple', quantity: 2, phone: 'private' }] }

test('native Meta payload keeps catalog IDs and excludes arbitrary customer fields', () => {
  const result = buildMetaAppEvent('add_to_cart', { commerce }, sdk)
  assert.equal(result.name, 'cart')
  assert.equal(result.parameters.content_id, 'apple')
  assert.equal(result.parameters.count, 2)
  assert.equal(JSON.stringify(result).includes('private'), false)
})

test('Meta purchase requires an explicit grand total independent of GA4 value', () => {
  assert.equal(buildMetaAppEvent('purchase', { commerce }, sdk), null)
  const result = buildMetaAppEvent('purchase', { commerce, grandTotal: 210 }, sdk)
  assert.equal(result.method, 'purchase')
  assert.equal(result.amount, 210)
  assert.equal(result.parameters.order, commerce.transaction_id)
})

test('normal login is not registration and identifying searches are excluded', () => {
  assert.equal(buildMetaAppEvent('login', { isNewCustomer: false }, sdk), null)
  assert.equal(buildMetaAppEvent('sign_up', { isNewCustomer: false }, sdk), null)
  assert.equal(buildMetaAppEvent('sign_up', { isNewCustomer: true }, sdk).name, 'registration')
  assert.equal(buildMetaAppEvent('search', { searchTerm: 'user@example.com' }, sdk), null)
})
