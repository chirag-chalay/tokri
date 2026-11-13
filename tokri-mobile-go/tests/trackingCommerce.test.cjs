const test = require('node:test')
const assert = require('node:assert/strict')
const { buildCommercePayload } = require('../src/lib/trackingCommerce')

const item = { slug: 'apple', name: 'Apple', priceValue: 20.5, quantity: 2, category: { name: 'Fruit' }, phone: 'secret' }

test('builds an allowlisted commerce payload with the product slug', () => {
  assert.deepEqual(buildCommercePayload('add_to_cart', [item]), {
    currency: 'INR', value: 41,
    items: [{ item_id: 'apple', item_name: 'Apple', price: 20.5, quantity: 2, item_category: 'Fruit' }],
  })
})

test('rejects purchase and malformed or identifying item data', () => {
  assert.equal(buildCommercePayload('purchase', [item]), null)
  assert.equal(buildCommercePayload('view_item', [{ ...item, slug: '', id: 'line-42' }]), null)
  assert.equal(buildCommercePayload('add_to_cart', [{ ...item, quantity: 0 }]), null)
  assert.equal(buildCommercePayload('view_item', [{ ...item, name: 'user@example.com' }]), null)
  assert.equal(buildCommercePayload('view_item', [{ ...item, priceValue: NaN }]), null)
})
