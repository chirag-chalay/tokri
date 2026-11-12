import { test, after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import express from 'express'
import { safePage, safeEndpoint } from '../../shared/monitoring.js'

const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'tokri-website-monitoring-'))
process.env.LOG_DIRECTORY = directory
process.env.LOG_OUTBOX_ENABLED = 'false'
const { requestLogging, log, setDebug, websiteDebugState, subscribeWebsiteDebug, closeWebsiteStreams, workerCall, closeMonitoring } = await import('../src/monitoring/index.js')
const { createWebsiteMonitoringRouter } = await import('../src/monitoring/website.js')
const { logError } = await import('../src/monitoring/database.js')
const client = { product: { findMany: async () => [{ id: 'apple-id', slug: 'apple', name: 'Apple Royal Gala' }] } }
const app = express()
app.use(requestLogging)
app.use((req, _res, next) => { req.customer = { id: 'PRIVATE_CUSTOMER_ID' }; next() })
app.use('/api/v1/monitoring', createWebsiteMonitoringRouter(client))
app.get('/api/v1/products', (_req, res) => res.json([]))
app.get('/api/v1/checkout/quote', (_req, res) => { logError(Object.assign(new Error('password=PRIVATE_PASSWORD'), { code: 'P2002', status: 400 }), 'api'); res.status(400).json({ message: 'Invalid request.' }) })
app.get('/api/v1/auth/verify-otp', (_req, res) => { log('api', 'customer.login', { status: 'success' }); res.json({ ok: true }) })
app.post('/tokri-backoffice/api/resources/Product/records/unit-product/edit', (req, res) => {
  req.session = { adminUser: { id: 'unit-admin' } }
  res.json({ notice: { type: 'error' }, record: { errors: { priceValue: { message: 'PRIVATE_ADMIN_NOTICE' } } } })
})
app.get('/api/pages/logs', (_req, res) => res.json({}))
app.get('/checkout', (_req, res) => res.type('html').send('checkout'))
const server = await new Promise(resolve => { const current = app.listen(0, '127.0.0.1', () => resolve(current)) })
const origin = `http://127.0.0.1:${server.address().port}`
const send = async (events, generation = websiteDebugState().generation) => {
  const response = await fetch(`${origin}/api/v1/monitoring/events`, { method: 'POST', headers: { 'content-type': 'application/json', origin }, body: JSON.stringify({ generation, events }) })
  return { status: response.status, data: await response.json().catch(() => ({})) }
}
const event = (name, extra = {}) => ({ id: randomUUID(), event: name, path: '/checkout', ...extra })
const rows = async query => { await workerCall('flush'); return workerCall('read', query) }
beforeEach(async () => { setDebug(false); await workerCall('flush') })
after(async () => { closeWebsiteStreams(); await new Promise(resolve => server.close(resolve)); await closeMonitoring(); await fs.rm(directory, { recursive: true, force: true }) })

test('routes strip sensitive paths, query values and dynamic API identities', () => {
  assert.equal(safePage('/checkout?otp=1234&token=PRIVATE_TOKEN').pagePath, '/checkout')
  assert.equal(safePage('/order/private-order-id').pagePath, '/order/[order]')
  assert.equal(safePage('/api/v1/products'), null)
  assert.equal(safeEndpoint('/api/v1/account/orders/private-id?token=PRIVATE_TOKEN'), '/api/v1/account/orders/[record]')
})
test('website visits are anonymous, deduplicated and separate from backend API traffic', async () => {
  const row = event('website.navigation', { navigationType: 'client', path: '/checkout?phone=9876543210&token=PRIVATE_TOKEN', actorId: 'PRIVATE_ID', password: 'PRIVATE_PASSWORD' })
  assert.equal((await send([row, row])).data.accepted, 1)
  assert.equal((await send([row])).data.accepted, 0)
  await fetch(`${origin}/api/v1/products?phone=9876543210&token=PRIVATE_TOKEN`)
  const website = await rows({ category: 'website' })
  assert.equal(website.total, 1); assert.equal(website.rows[0].pagePath, '/checkout')
  assert.equal(website.rows[0].navigationType, 'client'); assert.equal(website.rows[0].httpStatus, undefined)
  for (const key of ['ip', 'actorId', 'userId', 'customerId']) assert.equal(website.rows[0][key], undefined)
  const api = await rows({ category: 'api' })
  assert.ok(api.rows.some(row => row.method === 'GET' && row.route === '/api/v1/products' && row.httpStatus === 200 && row.durationMs >= 0))
  assert.ok(!JSON.stringify(website.rows).includes('PRIVATE'))
  assert.ok(!JSON.stringify(api.rows).includes('PRIVATE_TOKEN'))
})
test('optional events reject OFF, stale generations and expired deadlines; critical audits remain independent', async () => {
  assert.equal((await send([event('cart.added', { productRef: 'apple' })])).data.accepted, 0)
  setDebug(true, 1)
  const state = websiteDebugState()
  assert.equal((await send([event('cart.added', { productRef: 'apple', product: 'INVENTED_NAME', quantity: 1, otp: 'PRIVATE_OTP' })])).data.accepted, 1)
  const current = (await rows({ category: 'debug', search: 'cart.added' })).rows[0]
  assert.equal(current.product, 'Apple Royal Gala'); assert.equal(current.actorId, undefined)
  assert.ok(!JSON.stringify(current).includes('INVENTED_NAME'))
  setDebug(false); setDebug(true, 1)
  assert.equal((await send([event('cart.added')], state.generation)).data.accepted, 0)
  const now = Date.now; Date.now = () => now() + 61000
  try { assert.equal(websiteDebugState().debugUntil, null); assert.equal((await send([event('cart.added')])).data.accepted, 0) } finally { Date.now = now }
  setDebug(false)
  log('audit', 'test.critical.audit', { status: 'success' })
  assert.equal((await rows({ category: 'audit', search: 'test.critical.audit' })).total, 1)
})
test('debug subscribers see backend changes and are released without affecting controls', () => {
  const values = []; let closed = false
  const unsubscribe = subscribeWebsiteDebug(value => values.push(value), () => { closed = true })
  setDebug(true, 1); setDebug(false)
  assert.ok(values[0].debugUntil); assert.equal(values[1].debugUntil, null)
  closeWebsiteStreams(); assert.equal(closed, true); unsubscribe()
})
test('API errors are sanitized, correlated and auth outcome emits one access entry', async () => {
  setDebug(true, 1)
  const response = await fetch(`${origin}/api/v1/checkout/quote`)
  assert.match(response.headers.get('x-tokri-request-id'), /^[a-f0-9-]{36}$/)
  const api = await rows({ category: 'api', status: 'Failed' })
  const failure = api.rows.find(row => row.route === '/api/v1/checkout/quote')
  assert.equal(failure.httpStatus, 400); assert.equal(failure.code, 'P2002')
  assert.ok(!JSON.stringify(failure).includes('PRIVATE_PASSWORD'))
  await fetch(`${origin}/api/v1/auth/verify-otp`)
  assert.equal((await rows({ category: 'api', search: 'customer.login' })).total, 1)
  const matches = (await rows({ category: 'api' })).rows.filter(row => row.route === '/api/v1/auth/verify-otp')
  assert.equal(matches.length, 1)
  await fetch(`${origin}/tokri-backoffice/api/resources/Product/records/unit-product/edit`, { method: 'POST' })
  const rejected = (await rows({ category: 'api', status: 'Failed', search: 'unit-product' })).rows[0]
  assert.equal(rejected.httpStatus, 200)
  assert.equal(rejected.model, 'Product'); assert.equal(rejected.operation, 'update')
  assert.equal(rejected.failureReason, 'admin_validation')
  assert.ok(!JSON.stringify(rejected).includes('PRIVATE_ADMIN_NOTICE'))
})
test('monitoring endpoints and HTML requests do not duplicate visits or log themselves', async () => {
  setDebug(true, 1)
  const before = await rows({ category: 'api' })
  await fetch(`${origin}/api/pages/logs`)
  await fetch(`${origin}/api/v1/monitoring/status`)
  await fetch(`${origin}/checkout`, { headers: { accept: 'text/html' } })
  await fetch(`${origin}/checkout?_rsc=prefetch`, { headers: { rsc: '1', 'next-router-prefetch': '1' } })
  await send([])
  assert.equal((await rows({ category: 'api' })).total, before.total)
  assert.equal((await rows({ search: 'monitoring.viewed' })).total, 0)
  const malformed = await fetch(`${origin}/api/v1/monitoring/events`, { method: 'POST', headers: { 'content-type': 'application/json', origin }, body: '{"password":"PRIVATE_PASSWORD"' })
  assert.equal(malformed.status, 400); assert.ok(!(await malformed.text()).includes('PRIVATE_PASSWORD'))
  const stream = await fetch(`${origin}/api/v1/monitoring/stream`)
  assert.equal(stream.headers.get('content-encoding'), 'identity')
  assert.ok(stream.headers.get('cache-control').includes('no-transform'))
  const reader = stream.body.getReader(); const frame = new TextDecoder().decode((await reader.read()).value)
  assert.ok(frame.includes('debugUntil')); await reader.cancel()
})
test('public ingestion cannot forge critical records, leak extra fields, exceed limits or accept foreign origins', async () => {
  setDebug(true, 1)
  assert.equal((await send([event('Product.delete'), event('order.payment.updated')])).data.accepted, 0)
  const foreign = await fetch(`${origin}/api/v1/monitoring/events`, { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://untrusted.example' }, body: '{"events":[]}' })
  assert.equal(foreign.status, 403)
  assert.equal((await send(Array.from({ length: 26 }, () => event('website.navigation')))).status, 400)
  const responses=[]; for(let n=0;n<12;n++)responses.push((await send(Array.from({length:25},()=>event('website.navigation')))).status)
  assert.ok(responses.includes(429))
})
test('old self-event files remain intact but are omitted from viewer results; audit history remains readable', async () => {
  const timestamp = new Date().toISOString()
  await workerCall('deliver', { category: 'access', record: { eventId: randomUUID(), timestamp, event: 'monitoring.viewed' } })
  await workerCall('deliver', { category: 'audit', record: { eventId: randomUUID(), timestamp, event: 'test.preserved.audit', route: '/api/pages/logs' } })
  assert.equal((await rows({ category: 'access', search: 'monitoring.viewed' })).total, 0)
  assert.equal((await rows({ category: 'audit', search: 'test.preserved.audit' })).total, 1)
  const old = (await fs.readdir(directory)).find(name => name.startsWith('access-'))
  assert.ok((await fs.readFile(path.join(directory, old), 'utf8')).includes('monitoring.viewed'))
})
test('status filters use the same canonical category as the visible status badge', async () => {
  await workerCall('deliver', { category: 'error', record: { eventId: randomUUID(), timestamp: new Date().toISOString(), event: 'process.fatal' } })
  assert.equal((await rows({ category: 'error', status: 'Failed', search: 'process.fatal' })).total, 1)
  assert.equal((await rows({ category: 'error', status: 'Warning', search: 'process.fatal' })).total, 0)
})
