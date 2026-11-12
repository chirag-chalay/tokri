import test from 'node:test'
import assert from 'node:assert/strict'
import { buildCommerceEvent } from '../src/lib/trackingEvents.js'
import { loadTrackingConfig } from '../src/lib/trackingConfig.js'

const item = { id: 'apple', name: 'Apple', priceValue: 20, quantity: 2, phone: '9999999999' }

test('commerce payload is allowlisted and computes quantity-adjusted value', () => {
  const event = buildCommerceEvent('add_to_cart', { items: [item] })
  assert.equal(event.ecommerce.value, 40)
  assert.deepEqual(Object.keys(event.ecommerce.items[0]), ['item_id', 'item_name', 'price', 'quantity'])
  assert.equal(JSON.stringify(event).includes(item.phone), false)
})

test('invalid items, events, and purchase without transaction ID fail closed', () => {
  assert.equal(buildCommerceEvent('other', { items: [item] }), null)
  assert.equal(buildCommerceEvent('purchase', { items: [item] }), null)
  assert.equal(buildCommerceEvent('view_item', { items: [{ ...item, quantity: -1 }] }), null)
})

test('runtime configuration requires an enabled host and valid provider IDs', async () => {
  const data = { enabled: true, allowedHosts: ['shop.example'], gtm: { enabled: true, containerId: 'GTM-ABC', measurementId: 'G-ABC' }, meta: { enabled: true, pixelId: '123456789' } }
  const fetchImpl = async () => ({ ok: true, json: async () => data })
  assert.equal(await loadTrackingConfig({ fetchImpl, hostname: 'staging.example' }), null)
  const config = await loadTrackingConfig({ fetchImpl, hostname: 'shop.example' })
  assert.equal(config.gtm.enabled, true)
  assert.equal(config.meta.enabled, true)
  assert.equal(await loadTrackingConfig({ fetchImpl: async () => { throw Error('offline') }, hostname: 'shop.example' }), null)
})


test('purchase uses discounted merchandise value and preserves numeric product IDs', () => {
  const result = buildCommerceEvent('purchase', {
    transactionId: 'order-reference',
    items: [{ id: '123456789012', name: 'Apples', priceValue: 20, quantity: 2, discount: 3 }],
    tax: 2, shipping: 5,
  })
  assert.equal(result.ecommerce.value, 34)
  assert.equal(result.ecommerce.items[0].item_id, '123456789012')
  assert.equal(result.ecommerce.tax, 2)
  assert.equal(result.ecommerce.shipping, 5)
  assert.equal(buildCommerceEvent('purchase', { transactionId: 'x', items: [{ ...item, discount: 21 }] }), null)
})
