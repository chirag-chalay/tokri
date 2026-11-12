import test from 'node:test'
import { randomUUID } from 'node:crypto'
import assert from 'node:assert/strict'
const url = new URL(process.env.DATABASE_URL || 'mysql://invalid')
assert.equal(url.hostname, '127.0.0.1'); assert.equal(url.port, '13318'); assert.equal(url.pathname, '/tokri_manual_coupons_test')
const { prisma } = await import('../src/lib/prisma.js')
const { enqueuePurchase, processTrackingDeliveries, purchaseIdentity } = await import('../src/services/trackingPurchase.js')
const { confirmCodOrder } = await import('../src/services/checkout.js')
const { default: express } = await import('express')
const { default: trackingRouter } = await import('../src/routes/tracking.js')
const { signCustomerToken } = await import('../src/services/jwt.js')
const config = { pixelId: '123456789', apiVersion: 'v99.0', token: 'fixture' }
await test('isolated SQL purchase lifecycle, authorization, lease and retry', async () => {
  const customer = await prisma.customer.create({ data: { phone: '9999900991', name: 'Tracking Fixture', isActive: true } })
  let order
  let server
  try {
    order = await prisma.order.create({ data: { orderNo: `TRACK-${Date.now()}`, customerId: customer.id, itemsTotal: 40, grandTotal: 42, paymentMode: 'cod', trackingContext: { source: 'web', marketing: true, pixelId: config.pixelId, url: 'https://tokriii.com/checkout' }, items: { create: { name: 'Apple', priceValue: 20, quantity: 2 } } } })
    await enqueuePurchase(order.id, { config })
    assert.equal(await prisma.trackingDelivery.count({ where: { id: purchaseIdentity(order.id) } }), 0)
    await confirmCodOrder(customer, { orderNo: order.orderNo })
    await Promise.all([enqueuePurchase(order.id, { config }), enqueuePurchase(order.id, { config })])
    assert.equal(await prisma.trackingDelivery.count({ where: { id: purchaseIdentity(order.id) } }), 1)
    const app = express(); app.use(express.json()); app.use('/api/v1/tracking', trackingRouter)
    server = app.listen(0, '127.0.0.1'); await new Promise((resolve) => server.once('listening', resolve))
    const endpoint = `http://127.0.0.1:${server.address().port}/api/v1/tracking/purchase/${order.orderNo}`
    assert.equal((await fetch(endpoint)).status, 401)
    const response = await fetch(endpoint, { headers: { Authorization: `Bearer ${signCustomerToken(customer)}` } })
    assert.equal(response.status, 200)
    assert.equal((await response.json()).eventId, purchaseIdentity(order.id))
    Object.assign(process.env, { TRACKING_ENABLED: 'true', TRACKING_META_PIXEL_ENABLED: 'true', META_CAPI_ENABLED: 'true', TRACKING_META_PIXEL_ID: config.pixelId, META_CAPI_API_VERSION: config.apiVersion, META_CAPI_ACCESS_TOKEN: config.token })
    const base = `http://127.0.0.1:${server.address().port}/api/v1/tracking`
    const configResponse = await fetch(`${base}/config`)
    const eventToken = (await configResponse.json()).eventToken
    const cookie = configResponse.headers.get('set-cookie').split(';')[0] + '; tokriii_marketing_consent=granted'
    const eventId = randomUUID()
    const event = { eventToken, eventName: 'PageView', eventId, sourceUrl: 'https://tokriii.com/shop' }
    const post = (path, body, headers = {}) => fetch(`${base}/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookie, ...headers }, body: JSON.stringify(body) })
    assert.equal((await post('events', { ...event, eventName: 'Purchase' })).status, 400)
    assert.equal((await post('events', { ...event, eventToken: 'wrong' })).status, 403)
    assert.equal((await post('events', event)).status, 202)
    assert.equal((await post('events', event)).status, 202)
    assert.equal(await prisma.trackingDelivery.count({ where: { id: eventId } }), 1)
    assert.equal((await post('revoke-session', { eventToken })).status, 204)
    assert.equal(await prisma.trackingDelivery.count({ where: { id: eventId } }), 0)
    let sends = 0
    await processTrackingDeliveries({ config, send: async () => { sends++ } })
    assert.equal(sends, 1)
    await processTrackingDeliveries({ config, send: async () => { sends++ } })
    assert.equal(sends, 1)
    await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'paid' } })
    await enqueuePurchase(order.id, { config })
    assert.equal(await prisma.trackingDelivery.count({ where: { id: purchaseIdentity(order.id) } }), 1)
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve))
    if (order) { await prisma.trackingDelivery.deleteMany({ where: { id: purchaseIdentity(order.id) } }); await prisma.orderItem.deleteMany({ where: { orderId: order.id } }); await prisma.order.delete({ where: { id: order.id } }) }
    await prisma.customer.delete({ where: { id: customer.id } })
    await prisma.$disconnect()
  }
})
