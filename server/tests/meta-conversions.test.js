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
