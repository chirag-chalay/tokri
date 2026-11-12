import test from 'node:test'
import assert from 'node:assert/strict'
import { getPublicTrackingConfig } from '../src/services/trackingConfig.js'

test('tracking configuration is disabled by default and never returns secrets', () => {
  const result = getPublicTrackingConfig({ META_CAPI_ACCESS_TOKEN: 'private-token', META_CAPI_TEST_EVENT_CODE: 'private-test' })
  assert.equal(result.enabled, false)
  assert.equal(result.gtm.enabled, false)
  assert.equal(result.meta.enabled, false)
  assert.doesNotMatch(JSON.stringify(result), /private-token|private-test/)
})

test('providers require master switch, provider switch, and valid IDs', () => {
  const env = { TRACKING_ENABLED: 'true', TRACKING_GTM_ENABLED: 'true', TRACKING_GTM_CONTAINER_ID: 'GTM-ABC123', TRACKING_GA4_MEASUREMENT_ID: 'G-ABC123', TRACKING_META_PIXEL_ENABLED: 'true', TRACKING_META_PIXEL_ID: '123456789', TRACKING_ALLOWED_HOSTS: 'www.example.com, bad/host, www.example.com' }
  const config = getPublicTrackingConfig(env)
  assert.equal(config.gtm.enabled, true)
  assert.equal(config.meta.enabled, true)
  assert.deepEqual(config.allowedHosts, ['www.example.com'])
  assert.equal(getPublicTrackingConfig({ ...env, TRACKING_GA4_MEASUREMENT_ID: 'invalid' }).gtm.enabled, false)
  assert.equal(getPublicTrackingConfig({ ...env, TRACKING_ENABLED: 'false' }).meta.enabled, false)
})

test('public config route returns no-store JSON without server secrets', async () => {
  const express = (await import('express')).default
  const { default: router } = await import('../src/routes/tracking.js')
  const app = express()
  app.use('/api/v1/tracking', router)
  const server = app.listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/v1/tracking/config`)
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('cache-control'), 'no-store')
    const body = await response.json()
    assert.equal(Object.hasOwn(body, 'accessToken'), false)
    assert.equal(Object.hasOwn(body, 'testEventCode'), false)
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  }
})
