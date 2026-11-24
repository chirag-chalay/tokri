import test from 'node:test'
import assert from 'node:assert/strict'
import { readMetaConversionsConfig, sendMetaConversion } from '../src/services/metaConversions.js'

const env = { TRACKING_ENABLED: 'true', TRACKING_META_PIXEL_ENABLED: 'true', META_CAPI_ENABLED: 'true', TRACKING_META_PIXEL_ID: '123456789', META_CAPI_API_VERSION: 'v99.0', META_CAPI_ACCESS_TOKEN: 'secret' }
const event = { event_name: 'Purchase', event_id: 'event-1', event_time: 1700000000, user_data: {} }

test('CAPI requires all switches and valid configuration', () => {
  assert.equal(readMetaConversionsConfig({ ...env, META_CAPI_ENABLED: 'false' }), null)
  assert.equal(readMetaConversionsConfig({ ...env, META_CAPI_API_VERSION: '../bad' }), null)
  assert.equal(readMetaConversionsConfig({ ...env, META_CAPI_ACCESS_TOKEN: '' }), null)
})

test('CAPI sends a stable event and keeps the token out of URL and body', async () => {
  const config = readMetaConversionsConfig(env)
  let request
  const result = await sendMetaConversion(event, { config, fetchImpl: async (url, init) => {
    request = { url, init }
    return { ok: true, status: 200, json: async () => ({ events_received: 1 }) }
  } })
  assert.equal(result.status, 'sent')
  assert.equal(request.url.includes('secret'), false)
  assert.equal(request.init.body.includes('secret'), false)
  assert.equal(JSON.parse(request.init.body).data[0].event_id, 'event-1')
  assert.equal(request.init.headers.Authorization, 'Bearer secret')
})

test('CAPI rejects invalid events and failed provider responses', async () => {
  const config = readMetaConversionsConfig(env)
  await assert.rejects(sendMetaConversion({ ...event, event_name: 'other' }, { config }), /Invalid Meta conversion event/)
  await assert.rejects(sendMetaConversion(event, { config, fetchImpl: async () => ({ ok: false, status: 400, json: async () => ({ error: { message: 'secret' } }) }) }), (error) => error.message === 'Meta conversion request failed (HTTP 400)')
})

test('the website endpoint applies consent, signed matching and channel separation', async t => {
  const previous = Object.fromEntries(Object.keys(env).map(key => [key, process.env[key]]))
  Object.assign(process.env, env)
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value
    }
  })

  const { default: express } = await import('express')
  const { randomUUID, createHash } = await import('node:crypto')
  const customer = { id: 'matching-customer', phone: '9876543210', name: 'Example Shopper', addresses: [{ id: 'stored-address', city: 'Pune', state: 'Maharashtra', pincode: '411001' }] }
  const deliveries = new Map()
  const originalPrisma = globalThis.prisma
  globalThis.prisma = {
    __tokriClientGen: 7,
    cart: {}, cartItem: {}, monitoringOutbox: {}, monitoringOutboxBudget: {}, deviceToken: {},
    customer: {
      async findFirst({ where }) {
        assert.deepEqual(where, { id: customer.id, isActive: true })
        return customer
      },
    },
    trackingDelivery: {
      async createMany({ data, skipDuplicates }) {
        assert.equal(skipDuplicates, true)
        if (!deliveries.has(data.id)) deliveries.set(data.id, data.payload)
      },
    },
  }
  t.after(() => { globalThis.prisma = originalPrisma })
  const { signCustomerToken } = await import('../src/services/jwt.js')
  const { default: router } = await import('../src/routes/tracking.js')
  const app = express()
  app.use(express.json(), router)
  const server = app.listen(0, '127.0.0.1')
  await new Promise(resolve => server.once('listening', resolve))
  t.after(() => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())))
  const base = `http://127.0.0.1:${server.address().port}`
  const configResponse = await fetch(base + '/config')
  const sessionCookie = configResponse.headers.get('set-cookie').split(';')[0]
  const { eventToken } = await configResponse.json()
  const eventId = randomUUID()
  const fixture = { eventToken, eventId, eventName: 'InitiateCheckout', addressId: 'stored-address', sourceUrl: 'https://tokriii.com/checkout', ecommerce: { currency: 'INR', value: 198, items: [{ item_id: 'apple', quantity: 2 }] } }
  const bearer = { Authorization: `Bearer ${signCustomerToken(customer)}` }
  const cookies = sessionCookie + '; tokriii_marketing_consent=granted; _fbp=fb.1.1760000000000.1234; _fbc=fb.1.1760000000000.fixture-click'
  const post = (body = fixture, headers = {}) => fetch(base + '/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookies, 'User-Agent': 'Meta integration fixture', ...headers },
    body: JSON.stringify(body),
  })
  assert.equal((await post(fixture, { ...bearer, Cookie: sessionCookie })).status, 403)
  assert.equal((await post(fixture, { ...bearer, 'X-App-Platform': 'android' })).status, 400)
  assert.equal((await post(fixture, bearer)).status, 202)
  assert.equal((await post(fixture, bearer)).status, 202)
  assert.equal(deliveries.size, 1)
  const payload = deliveries.get(eventId)
  assert.equal(payload.event_id, eventId)
  assert.equal(payload.action_source, 'website')
  assert.deepEqual(payload.custom_data, { currency: 'INR', value: 198, contents: [{ id: 'apple', quantity: 2 }], content_ids: ['apple'], content_type: 'product' })
  const hash = str => createHash('sha256').update(str).digest('hex')
  assert.deepEqual(payload.user_data, {
    client_user_agent: 'Meta integration fixture', fbp: 'fb.1.1760000000000.1234', fbc: 'fb.1.1760000000000.fixture-click',
    ph: [hash('919876543210')], external_id: [hash(customer.id)], fn: [hash('example')], ln: [hash('shopper')],
    ct: [hash('pune')], st: [hash('maharashtra')], zp: [hash('411001')], country: [hash('in')],
  })
  const search = { eventToken, eventId: randomUUID(), eventName: 'Search', sourceUrl: 'https://tokriii.com/', searchTerm: 'Dragon Fruit' }
  assert.equal((await post({ ...search, searchTerm: '98765-43210' })).status, 400)
  assert.equal((await post(search, { 'X-User-Phone': customer.phone })).status, 202)
  assert.deepEqual(deliveries.get(search.eventId).custom_data, { search_string: 'Dragon Fruit' })
  assert.equal(deliveries.get(search.eventId).user_data.ph, undefined)
})
