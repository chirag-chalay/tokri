import { test, after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { Prisma } from '@prisma/client'
import { Worker } from 'node:worker_threads'
import { sanitize, safeSnapshot, istDate } from '../src/monitoring/sanitize.js'

const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'tokri-monitoring-'))
process.env.LOG_DIRECTORY = directory
process.env.LOG_QUEUE_LIMIT = '10'
process.env.LOG_OUTBOX_ENABLED = 'false'
const { log, workerCall, closeMonitoring, setDebug, monitoringState, logContext, requestLogging } = await import('../src/monitoring/index.js')
const { instrumentPrisma, logError } = await import('../src/monitoring/database.js')
beforeEach(async () => { await workerCall('flush') })
after(async () => { await closeMonitoring(); await fs.rm(directory, { recursive: true, force: true }) })

test('redacts private fields at every level and snapshots only safe business values', () => {
  const value = sanitize({ old: { password: 'PASSWORD', email: 'EMAIL', phone: 'PHONE', otp: 'OTP', token: 'TOKEN', keySecret: 'SECRET', address: 'ADDRESS', card: 'CARD', unknown: 'HIDDEN' }, new: { priceValue: 100, paymentStatus: 'paid' } })
  const serialized = JSON.stringify(value)
  for (const secret of ['PASSWORD', 'EMAIL', 'PHONE', 'OTP', 'TOKEN', 'SECRET', 'ADDRESS', 'CARD', 'HIDDEN']) assert.ok(!serialized.includes(secret))
  assert.equal(safeSnapshot({ priceValue: new Prisma.Decimal('123.45') }).priceValue, '123.45')
  const embedded = JSON.stringify(sanitize({ orderNo: 'me@example.com token=MY_PRIVATE_TOKEN', code: 'Bearer MY_AUTH_TOKEN', old: { ssn: 123456789, bankNumber: 123456, unknownNumber: 9876543210 } }))
  for (const secret of ['me@example.com', 'MY_PRIVATE_TOKEN', 'MY_AUTH_TOKEN', '123456789', '123456', '9876543210']) assert.ok(!embedded.includes(secret))
  assert.deepEqual(value.new, { priceValue: 100, paymentStatus: 'paid' })
  assert.deepEqual(safeSnapshot({ id: 'p1', priceValue: 12, password: 'x', name: 'Person', address: {} }), { id: 'p1', priceValue: 12 })
})
test('daily dates follow IST across midnight', () => {
  assert.equal(istDate(new Date('2026-11-09T18:29:59Z')), '2026-11-09')
  assert.equal(istDate(new Date('2026-11-09T18:30:00Z')), '2026-11-10')
})
test('debug is off by default, requires enable, expires within capped duration and disables', async () => {
  assert.equal(monitoringState().debugUntil, null)
  log('debug', 'hidden')
  await workerCall('flush')
  assert.equal((await workerCall('read', { category: 'debug' })).total, 0)
  setDebug(true, 99999)
  assert.ok(Date.parse(monitoringState().debugUntil) <= Date.now() + 3600000)
  log('debug', 'visible')
  const now = Date.now
  Date.now = () => now() + 3600001
  try { assert.equal(monitoringState().debugUntil, null); log('debug', 'expired') } finally { Date.now = now }
  setDebug(false)
  log('debug', 'hidden-again')
  await workerCall('flush')
  assert.equal((await workerCall('read', { category: 'debug' })).total, 1)
  assert.equal(monitoringState().debugUntil, null)
})
test('server pages 50/100 rows with filters and private daily files', async () => {
  // Flush in batches to stay below the deliberately tiny test queue.
  for (let i = 0; i < 123; i++) {
    logContext.run({ id: `req-${i}`, req: { ip: '127.0.0.1', customer: { id: 'customer-test' } } }, () => log('payment', 'test.payment', { orderNo: `order-${i}`, status: i % 2 ? 'failure' : 'success' }))
    if (i % 5 === 0) await workerCall('flush')
  }
  await workerCall('flush')
  const result = await workerCall('read', { category: 'payment' })
  assert.equal(result.total, 123)
  assert.equal(result.rows.length, 50)
  const second = await workerCall('read', { category: 'payment', perPage: 100, page: 2 })
  assert.equal(second.rows.length, 23)
  assert.equal(result.rows[0].orderNo, 'order-122')
  assert.equal(second.rows[0].orderNo, 'order-22')
  const filtered = await workerCall('read', { category: 'payment', user: 'customer-test', status: 'success', orderId: 'order-122', ip: '127.0.0.1', date: istDate() })
  assert.equal(filtered.total, 1)
  assert.match(filtered.rows[0].file, /^payment-\d{4}-\d{2}-\d{2}\.log$/)
  const stat = await fs.stat(path.join(directory, filtered.rows[0].file))
  assert.equal(stat.mode & 0o777, 0o600)
  assert.equal((await fs.stat(directory)).mode & 0o777, 0o700)
  assert.equal((await workerCall('read', { category: '../../etc/passwd' })).total, 0)
})
test('queue saturation drops logs instead of blocking or growing indefinitely', async () => {
  const before = monitoringState().dropped
  for (let i = 0; i < 100; i++) log('access', 'burst')
  assert.ok(monitoringState().pending <= 10)
  assert.ok(monitoringState().dropped > before)
  await workerCall('flush')
})
test('database observer records admin old/new values, creates accounts, and deduplicates errors', async () => {
  let reads = 0, nextResult, nextError
  const raw = {
    product: { findUnique: async () => { reads++; return { id: 'p1', priceValue: 10, password: 'SECRET' } }, update: async () => nextResult, findMany: async () => { throw nextError } },
    customer: { create: async () => nextResult },
  }
  const client = instrumentPrisma(raw)
  const invoke = (model, operation, result, args = {}) => { nextResult = result; return client[model[0].toLowerCase() + model.slice(1)][operation](args) }
  await invoke('Product', 'update', { id: 'p1', priceValue: 20 }, { where: { id: 'p1' }, data: { priceValue: 20 } })
  assert.equal(reads, 0, 'no extra reads on public mutations')
  await logContext.run({ req: { session: { adminUser: { id: 'admin1' } }, ip: '127.0.0.2' } }, async () => invoke('Product', 'update', { id: 'p1', priceValue: 30 }, { where: { id: 'p1' } }))
  await invoke('Customer', 'create', { id: 'customer-new', phone: 'PRIVATE' })
  const error = new Error('PASSWORD SQL PHONE')
  nextError = error
  try { await client.product.findMany({}) } catch (e) { assert.equal(e, error); logError(e, 'api') }
  await workerCall('flush')
  const audit = await workerCall('read', { category: 'audit', search: 'Product.update' })
  assert.equal(audit.total, 1)
  assert.equal(audit.rows[0].old.priceValue, 10)
  assert.equal(audit.rows[0].new.priceValue, 30)
  assert.equal(audit.rows[0].actorId, 'admin1')
  assert.equal((await workerCall('read', { category: 'account' })).total, 1)
  const errors = await workerCall('read', { category: 'error' })
  assert.equal(errors.total, 1)
  assert.ok(!JSON.stringify(errors).includes('PASSWORD SQL PHONE'))
})
test('retention, disk cap and symlink protection in the file worker', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'tokri-rotation-'))
  await fs.writeFile(path.join(dir, 'access-2020-01-01.log'), 'expired\n')
  for (const category of ['website', 'api', 'debug']) await fs.writeFile(path.join(dir, `${category}-2020-01-01.log`), 'expired\n')
  const target = path.join(dir, 'outside.txt')
  await fs.writeFile(target, 'DO NOT CHANGE')
  await fs.symlink(target, path.join(dir, `error-${istDate()}.log`))
  const worker = new Worker(new URL('../src/monitoring/worker.js', import.meta.url), { workerData: { directory: dir, retentionDays: 2, maxBytes: 500 } })
  let id = 0
  const call = (type, extra = {}) => new Promise((resolve) => {
    const current = ++id
    const listener = (message) => { if (message.id === current || (type === 'write' && message.ack)) { worker.off('message', listener); resolve(message) } }
    worker.on('message', listener); worker.postMessage({ type, id: current, ...extra })
  })
  try {
    await call('flush')
    await assert.rejects(fs.stat(path.join(dir, 'access-2020-01-01.log')))
    for (const category of ['website', 'api', 'debug']) await assert.rejects(fs.stat(path.join(dir, `${category}-2020-01-01.log`)))
    const failed = await call('write', { category: 'error', record: { timestamp: new Date().toISOString(), event: 'symlink' } })
    assert.equal(failed.failed, 1)
    assert.equal(await fs.readFile(target, 'utf8'), 'DO NOT CHANGE')
    for (let n = 0; n < 15; n++) await call('write', { category: 'access', record: { timestamp: new Date().toISOString(), event: 'x'.repeat(70) } })
    assert.ok((await fs.stat(path.join(dir, `access-${istDate()}.log`))).size <= 500)
    for (const category of ['website', 'api', 'debug']) {
      for (let n = 0; n < 5; n++) await call('write', { category, record: { timestamp: new Date().toISOString(), event: 'x'.repeat(70) } })
      assert.ok((await fs.stat(path.join(dir, `${category}-${istDate()}.log`))).size <= 500)
    }
  } finally { await worker.terminate(); await fs.rm(dir, { recursive: true, force: true }) }
})
test('AdminJS transport enforces fresh admin privileges and same-origin debug controls', async () => {
  const { default: express } = await import('express')
  const { routeHandler } = await import('../node_modules/@adminjs/express/lib/buildRouter.js')
  const { monitoringHandler } = await import('../src/admin/monitoring.js')
  const { prisma } = await import('../src/lib/prisma.js')
  const original = prisma.user.findUnique
  const lookupModels = ['user', 'customer', 'deliveryPartner', 'product', 'order']
  const originalLookups = lookupModels.map((model) => prisma[model].findMany)
  let nameLookups = 0
  for (const model of lookupModels) prisma[model].findMany = async () => { nameLookups++; return [] }
  let user = { id: 'admin-live', role: 'admin', isActive: true }
  prisma.user.findUnique = async () => user
  const app = express()
  app.use(requestLogging)
  app.use(express.json())
  app.use((req, res, next) => { req.session = { adminUser: { id: 'admin-live', role: 'admin' } }; req.fields = req.body; next() })
  class Controller {
    constructor(_options, currentAdmin) { this.currentAdmin = currentAdmin }
    page(req, res) { return monitoringHandler(req, res, { currentAdmin: this.currentAdmin }) }
  }
  app.all('/api/pages/logs', routeHandler({ admin: {}, route: { Controller, action: 'page', contentType: 'application/json' } }))
  app.use((err, req, res, next) => res.status(err.statusCode || 403).json({ message: err.message }))
  const server = await new Promise((resolve) => { const instance = app.listen(0, '127.0.0.1', () => resolve(instance)) })
  const url = `http://127.0.0.1:${server.address().port}/api/pages/logs`
  try {
    let response = await fetch(url)
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('cache-control'), 'no-store')
    assert.equal((await response.json()).canManageDebug, false)
    const deniedDebug = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', 'x-tokri-monitoring': '1', 'sec-fetch-site': 'same-origin' }, body: JSON.stringify({ action: 'enable', minutes: 5 }) })
    assert.equal(deniedDebug.status, 403, 'ordinary admins cannot change debug, even with valid browser headers')
    assert.equal(monitoringState().debugUntil, null)
    const authorizedLookups = nameLookups
    user = { ...user, role: 'staff' }
    assert.equal((await fetch(url)).status, 403)
    assert.equal(nameLookups, authorizedLookups, 'unauthorized viewers cannot look up names')
    user = { ...user, role: 'super_admin', isActive: false }
    assert.equal((await fetch(url)).status, 403)
    user = { ...user, isActive: true }
    const post = (headers = {}) => fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify({ action: 'enable', minutes: 5 }) })
    assert.equal((await post()).status, 403)
    assert.equal((await post({ 'x-tokri-monitoring': '1', 'sec-fetch-site': 'cross-site' })).status, 403)
    response = await post({ 'x-tokri-monitoring': '1', 'sec-fetch-site': 'same-origin' })
    assert.equal(response.status, 200)
    assert.ok((await response.json()).debugUntil)
    setDebug(false)
  } finally { prisma.user.findUnique = original; lookupModels.forEach((model, i) => { prisma[model].findMany = originalLookups[i] }); await new Promise((resolve) => server.close(resolve)); await prisma.$disconnect() }
})
test('rolled-back transactions publish no mutation events; commits publish once', async () => {
  const raw = { customer: { create: async ({ data }) => data } }
  raw.$transaction = async (run) => run(raw)
  const client = instrumentPrisma(raw)
  const create = (id) => client.customer.create({ data: { id } })
  await assert.rejects(client.$transaction(async () => { await create('rolled-back'); throw new Error('rollback') }))
  await client.$transaction(async () => create('committed'))
  await workerCall('flush')
  assert.equal((await workerCall('read', { category: 'account', search: 'rolled-back' })).total, 0)
  assert.equal((await workerCall('read', { category: 'account', search: 'committed' })).total, 1)
})
test('Razorpay failures and verified refund webhooks log safe outcomes without provider payloads', async () => {
  const crypto = await import('node:crypto')
  const { prisma } = await import('../src/lib/prisma.js')
  const { fetchRazorpayPayment } = await import('../src/services/razorpay.js')
  const { handleRazorpayWebhook } = await import('../src/routes/webhooks.js')
  const originalSettings = prisma.setting.findUnique
  const originalFetch = globalThis.fetch
  prisma.setting.findUnique = async () => ({ razorpayEnabled: true, razorpayKeyId: 'test-key', razorpayKeySecret: 'TEST_PROVIDER_SECRET' })
  globalThis.fetch = async () => ({ ok: false, status: 400, json: async () => ({ error: { code: 'BAD_REQUEST_ERROR', description: 'PRIVATE_CUSTOMER_DATA' } }) })
  try {
    await assert.rejects(fetchRazorpayPayment('pay_test123'))
    await workerCall('flush')
    const api = await workerCall('read', { category: 'payment', orderId: 'pay_test123' })
    assert.equal(api.total, 2)
    assert.equal(api.rows[0].status, 'failure')
    assert.equal(api.rows[1].status, 'attempt')
    const payload = { event: 'refund.processed', payload: { refund: { entity: { id: 'rfnd_test', payment_id: 'pay_refunded', amount: 10000, notes: { email: 'PRIVATE_EMAIL' } } } } }
    const body = Buffer.from(JSON.stringify(payload))
    const signature = crypto.createHmac('sha256', 'TEST_PROVIDER_SECRET').update(body).digest('hex')
    let outcome, error
    await handleRazorpayWebhook({ body, headers: { 'x-razorpay-signature': signature } }, { json: (value) => { outcome = value } }, (value) => { error = value })
    assert.equal(error, undefined)
    assert.equal(outcome.ok, true)
    await workerCall('flush')
    const refund = await workerCall('read', { category: 'payment', status: 'refunded' })
    assert.equal(refund.total, 1)
    assert.equal(refund.rows[0].refundId, 'rfnd_test')
    assert.equal(refund.rows[0].razorpayPaymentId, 'pay_refunded')
    await handleRazorpayWebhook({ body, headers: { 'x-razorpay-signature': 'invalid' } }, {}, (value) => { error = value })
    assert.ok(error)
    await workerCall('flush')
    const all = JSON.stringify(await workerCall('read', { category: 'payment', perPage: 100 }))
    for (const secret of ['TEST_PROVIDER_SECRET', 'PRIVATE_CUSTOMER_DATA', 'PRIVATE_EMAIL', signature]) assert.ok(!all.includes(secret))
  } finally { prisma.setting.findUnique = originalSettings; globalThis.fetch = originalFetch; await prisma.$disconnect() }
})
test('critical queue slots survive access bursts and overflow emits a redacted emergency record', async () => {
  await workerCall('flush')
  const original = process.stderr.write, alerts = []
  process.stderr.write = function (chunk, ...args) { if (String(chunk).startsWith('{"event":"monitoring.delivery.failed"')) { alerts.push(JSON.parse(String(chunk))); args.find((arg) => typeof arg === 'function')?.(); return true } return original.call(this, chunk, ...args) }
  try {
    for (let i = 0; i < 100; i++) log('access', 'priority.burst')
    log('payment', 'priority.payment')
    log('audit', 'priority.delete', { resourceId: 'product-priority' })
    log('payment', 'priority.overflow', { orderNo: 'me@example.com token=HIDDEN_TOKEN' })
    assert.ok(alerts.some((entry) => entry.record.event === 'priority.overflow' && entry.reason === 'critical-queue-full'))
    assert.ok(!JSON.stringify(alerts).includes('HIDDEN_TOKEN'))
    await workerCall('flush')
    assert.equal((await workerCall('read', { category: 'payment', search: 'priority.payment' })).total, 1)
    assert.equal((await workerCall('read', { category: 'audit', search: 'priority.delete' })).total, 1)
  } finally { process.stderr.write = original }
})
test('storage failures and forced process exit expose critical records without crashing callers', async () => {
  const { spawnSync } = await import('node:child_process')
  const index = new URL('../src/monitoring/index.js', import.meta.url).href
  const broken = path.join(directory, 'not-a-directory')
  await fs.writeFile(broken, 'fixture')
  const run = (source, logDirectory) => spawnSync(process.execPath, ['--input-type=module', '-e', source], { env: { ...process.env, LOG_DIRECTORY: logDirectory }, encoding: 'utf8', timeout: 10000 })
  let result = run(`import {log,workerCall,closeMonitoring} from ${JSON.stringify(index)}; log('payment','failure.test',{orderNo:'test-order',token:'NEVER_STORE'}); await workerCall('flush').catch(()=>{}); console.log('caller survived'); await closeMonitoring().catch(()=>{});`, broken)
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /caller survived/)
  assert.match(result.stderr, /file-write-failed/)
  assert.ok(!result.stderr.includes('NEVER_STORE'))
  result = run(`import {log} from ${JSON.stringify(index)}; log('audit','Product.delete',{resourceId:'forced-exit'}); process.exit(7)`, path.join(directory, 'forced-exit'))
  assert.equal(result.status, 7)
  assert.match(result.stderr, /process-exit-before-ack/)
  assert.match(result.stderr, /forced-exit/)
  result = run(`import {installProcessErrorLogging} from ${JSON.stringify(index)}; installProcessErrorLogging(); setTimeout(()=>{throw new Error('NEVER_PRINT_FATAL_SECRET')},0);`, path.join(directory, 'fatal-error'))
  assert.equal(result.status, 1)
  assert.ok(!result.stderr.includes('NEVER_PRINT_FATAL_SECRET'))
  const fatalFiles = await fs.readdir(path.join(directory, 'fatal-error'))
  assert.ok(fatalFiles.some((name) => name.startsWith('error-')))
  assert.match(await fs.readFile(path.join(directory, 'fatal-error', fatalFiles.find((name) => name.startsWith('error-'))), 'utf8'), /process.fatal/)
  result = run(`import {log,installGracefulShutdown} from ${JSON.stringify(index)}; installGracefulShutdown({close: (done)=>done()}); log('payment','sigterm.test'); process.kill(process.pid,'SIGTERM');`, path.join(directory, 'graceful-shutdown'))
  assert.equal(result.status, 0, result.stderr)
  const shutdownFiles = await fs.readdir(path.join(directory, 'graceful-shutdown'))
  assert.match(await fs.readFile(path.join(directory, 'graceful-shutdown', shutdownFiles.find((name) => name.startsWith('payment-'))), 'utf8'), /sigterm.test/)
  result = run(`import {prepareLogRecord,deliverOutboxRecord} from ${JSON.stringify(index)}; await deliverOutboxRecord('payment',prepareLogRecord('payment','natural.exit',{status:'paid'}),{dedupe:true});console.log('delivered and exited');`, path.join(directory, 'natural-exit'))
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /delivered and exited/)
  const publicPath = new URL('../uploads/monitoring-must-not-exist', import.meta.url).pathname
  result = run(`import {log,workerCall,closeMonitoring} from ${JSON.stringify(index)}; log('audit','public.path.test'); await workerCall('flush').catch(()=>{}); await closeMonitoring().catch(()=>{});`, publicPath)
  assert.equal(result.status, 0)
  assert.match(result.stderr, /file-write-failed/)
  await assert.rejects(fs.stat(publicPath))
})
test('status filtering matches outcomes and corrupted rows are exposed', async () => {
  log('payment', 'outcome.test', { status: 'success', outcome: 'failed' })
  await workerCall('flush')
  assert.equal((await workerCall('read', { category: 'payment', status: 'failed', search: 'outcome.test' })).total, 1)
  await fs.appendFile(path.join(directory, `payment-${istDate()}.log`), '{broken json}\n')
  assert.equal((await workerCall('read', { category: 'payment' })).corruptRows, 1)
  await fs.appendFile(path.join(directory, `payment-${istDate()}.log`), JSON.stringify({ timestamp: new Date().toISOString(), event: 'legacy.test', password: 'LEGACY_PASSWORD', phone: '9876543210', orderNo: 'me@example.com' }) + '\n')
  const legacy = JSON.stringify(await workerCall('read', { category: 'payment', search: 'legacy.test' }))
  for (const value of ['LEGACY_PASSWORD', '9876543210', 'me@example.com']) assert.ok(!legacy.includes(value))
})
test('real daily file rotation crosses IST midnight without mixing categories', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'tokri-midnight-'))
  const worker = new Worker(new URL('../src/monitoring/worker.js', import.meta.url), { workerData: { directory: dir, retentionDays: 365, maxBytes: 100000 } })
  const send = (timestamp, category) => new Promise((resolve) => {
    const listener = (message) => { if (message.ack) { worker.off('message', listener); resolve(message) } }
    worker.on('message', listener); worker.postMessage({ type: 'write', category, record: { timestamp, event: 'midnight.test' } })
  })
  try {
    await send('2026-11-09T18:29:59.000Z', 'payment')
    await send('2026-11-09T18:30:00.000Z', 'payment')
    await send('2026-11-09T18:30:01.000Z', 'audit')
    for (const category of ['website', 'api', 'debug']) {
      await send('2026-11-09T18:29:59.000Z', category)
      await send('2026-11-09T18:30:00.000Z', category)
    }
    assert.deepEqual((await fs.readdir(dir)).sort(), ['api-2026-11-09.log', 'api-2026-11-10.log', 'audit-2026-11-10.log', 'debug-2026-11-09.log', 'debug-2026-11-10.log', 'payment-2026-11-09.log', 'payment-2026-11-10.log', 'website-2026-11-09.log', 'website-2026-11-10.log'])
  } finally { await worker.terminate(); await fs.rm(dir, { recursive: true, force: true }) }
})
test('a stalled emergency stream has a bounded queue and reports overflow after recovery', async () => {
  const { reportUndelivered } = await import('../src/monitoring/index.js')
  const original = process.stderr.write
  let completeFirst
  const alerts = []
  process.stderr.write = function (chunk, callback) { alerts.push(String(chunk)); completeFirst = callback; return false }
  try {
    const before = monitoringState().emergencyFailed
    for (let i = 0; i < 100; i++) reportUndelivered('payment', 'stalled.test', { orderNo: `stall-${i}` }, 'test-stall')
    assert.ok(monitoringState().emergencyPending <= 10)
    assert.ok(monitoringState().emergencyFailed > before)
    process.stderr.write = function (chunk, callback) { alerts.push(String(chunk)); callback?.(); return true }
    completeFirst?.()
    assert.equal(monitoringState().emergencyPending, 0)
    assert.ok(alerts.some((line) => line.includes('monitoring.emergency.overflow')))
  } finally { process.stderr.write = original }
})
test('durable file delivery deduplicates IDs without dropping distinct events on index collisions', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'tokri-idempotent-'))
  const worker = new Worker(new URL('../src/monitoring/worker.js', import.meta.url), { workerData: { directory: dir, retentionDays: 30, maxBytes: 100000, dedupeIndexBytes: 1 } })
  let id = 0
  const deliver = (eventId) => new Promise((resolve, reject) => {
    const current = ++id
    const listener = (message) => { if (message.id === current) { worker.off('message', listener); message.error ? reject(new Error(message.error)) : resolve(message.result) } }
    worker.on('message', listener)
    worker.postMessage({ type: 'deliver', id: current, query: { category: 'payment', dedupe: true, record: { timestamp: new Date().toISOString(), event: 'collision.test', eventId } } })
  })
  try {
    for (let i = 0; i < 20; i++) assert.equal((await deliver(`collision-${i}`)).deduplicated, false)
    for (let i = 0; i < 20; i++) assert.equal((await deliver(`collision-${i}`)).deduplicated, true)
    const file = (await fs.readdir(dir)).find((name) => name.startsWith('payment-'))
    assert.equal((await fs.readFile(path.join(dir, file), 'utf8')).trim().split('\n').length, 20)
  } finally { await worker.terminate(); await fs.rm(dir, { recursive: true, force: true }) }
})

test('recent customer logins lead mixed-category pages, with bounded reverse UTF-8 reads', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'tokri-recent-logins-'))
  const writer = new Worker(new URL('../src/monitoring/worker.js', import.meta.url), { workerData: { directory: dir, maxBytes: 10485760, retentionDays: 365, readerOnly: true } })
  let sequence = 0
  const read = (query) => new Promise((resolve, reject) => {
    const id = ++sequence
    const listener = (message) => { if (message.id === id) { writer.off('message', listener); message.error ? reject(new Error(message.error)) : resolve(message.result) } }
    writer.on('message', listener)
    writer.postMessage({ type: 'read', id, query })
  })
  try {
    const types = ['access', 'error', 'audit', 'debug', 'payment', 'account']
    const day = istDate()
    const start = Date.parse(`${day}T00:00:00Z`)
    const lines = Object.fromEntries(types.map((type) => [type, []]))
    for (let i = 0; i < 723; i++) lines[types[i % 6]].push(JSON.stringify({ timestamp: new Date(start + i * 1000).toISOString(), event: 'fixture.request', eventId: `row-${i}`, slug: 'फल'.repeat(100), status: 'success' }))
    lines.access.push(JSON.stringify({ timestamp: new Date(start + 724000).toISOString(), event: 'customer.login', actorId: 'customer-login-test', status: 'success', eventId: 'login-latest' }))
    for (const type of types) await fs.writeFile(path.join(dir, `${type}-${day}.log`), `${lines[type].join('\n')}\n`)
    const first = await read({ perPage: 100 })
    const second = await read({ perPage: 100, page: 2 })
    assert.equal(first.total, 724)
    assert.equal(first.rows.length, 100)
    assert.equal(first.rows[0].event, 'customer.login')
    assert.equal(second.rows[0].eventId, 'row-623')
    const combined = [...first.rows, ...second.rows]
    assert.equal(new Set(combined.map((row) => row.eventId)).size, 200)
    assert.deepEqual(combined.map((row) => row.timestamp), combined.map((row) => row.timestamp).sort().reverse())
    assert.equal(first.corruptRows, 0)
    assert.equal(first.rows[1].slug, 'फल'.repeat(100).slice(0, 250))
    const login = await read({ category: 'access', search: 'customer.login', user: 'customer-login-test', status: 'success', date: day })
    assert.equal(login.total, 1)
    assert.equal(login.rows[0].eventId, 'login-latest')
  } finally { await writer.terminate(); await fs.rm(dir, { recursive: true, force: true }) }
})
