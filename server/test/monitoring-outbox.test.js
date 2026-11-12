import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

test('durable critical outbox recovery, idempotence, quota and fail-open behavior', { skip: !process.env.MONITORING_TEST_DATABASE_URL, timeout: 120000 }, async (t) => {
  const { root } = await import('./helpers/isolation.js')
  const { PrismaClient } = await import('@prisma/client')
  const { createCriticalOutbox, outboxConfig } = await import('../src/monitoring/outbox.js')
  const { prepareLogRecord, deliverOutboxRecord, workerCall, closeMonitoring, logContext } = await import('../src/monitoring/index.js')
  const { instrumentPrisma } = await import('../src/monitoring/database.js')
  assert.ok(new URL(process.env.MONITORING_TEST_DATABASE_URL).pathname.includes('recovery'), 'Use a dedicated disposable recovery database')
  const raw = new PrismaClient({ log: [] })
  await raw.monitoringOutbox.deleteMany({})
  await raw.monitoringOutboxBudget.upsert({ where: { id: 1 }, create: { id: 1 }, update: { usedBytes: 0 } })
  const prefix = `outbox-${crypto.randomUUID().slice(0, 8)}`
  const alerts = [], stores = []
  const createStore = (suffix, overrides = {}) => {
    const store = createCriticalOutbox(raw, { deliver: deliverOutboxRecord, alert: (...args) => alerts.push(args), ...overrides,
      config: { ...outboxConfig, pollMs: 60000, destination: `${prefix}-${suffix}`, ...overrides.config } })
    stores.push(store)
    return store
  }
  const sourceRoot = fileURLToPath(new URL('../', import.meta.url))
  async function killedProducer(source) {
    const helper = fileURLToPath(new URL('./helpers/isolation.js', import.meta.url))
    const child = spawn(process.execPath, ['--import', helper, '--input-type=module', '-e', source], { env: process.env, stdio: ['ignore', 'pipe', 'pipe', 'ipc'] })
    let stderr = ''
    child.stderr.on('data', (chunk) => { stderr += chunk })
    const message = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => { child.kill('SIGKILL'); reject(new Error(`Producer timed out: ${stderr}`)) }, 15000)
      child.once('message', (value) => { clearTimeout(timer); resolve(value) })
      child.once('exit', (code, signal) => { clearTimeout(timer); if (signal !== 'SIGKILL') reject(new Error(`Producer exited ${code}: ${stderr}`)) })
    })
    const exited = new Promise((resolve) => child.once('exit', resolve))
    child.kill('SIGKILL')
    await exited
    return message
  }
  const contents = async () => {
    await workerCall('flush')
    const dir = process.env.LOG_DIRECTORY
    const names = await fs.readdir(dir).catch(() => [])
    const lines = []
    for (const name of names.filter((name) => /^(audit|payment)-.*\.log$/.test(name))) {
      for (const line of (await fs.readFile(path.join(dir, name), 'utf8')).split('\n').filter(Boolean)) { try { lines.push(JSON.parse(line)) } catch {} }
    }
    return lines
  }
  try {
    await t.test('committed product deletion and payment changes survive SIGKILL before any file delivery', async () => {
      const destination = `${prefix}-crash`
      const message = await killedProducer(`
        process.env.LOG_OUTBOX_POLL_MS='60000'; process.env.LOG_OUTBOX_DESTINATION=${JSON.stringify(destination)};
        const {prisma}=await import(${JSON.stringify(path.join(sourceRoot, 'src/lib/prisma.js'))});
        const {logContext,logDurable}=await import(${JSON.stringify(path.join(sourceRoot, 'src/monitoring/index.js'))});
        const product=await prisma.product.create({data:{slug:${JSON.stringify(prefix + '-crash')},name:'PRIVATE_NAME',priceValue:77}});
        await logContext.run({req:{session:{adminUser:{id:'crash-admin'}},ip:'127.0.0.1'}},async()=>{await prisma.product.delete({where:{id:product.id}})});
        const order=await prisma.order.create({data:{orderNo:${JSON.stringify(prefix + '-order')},itemsTotal:1,grandTotal:1,paymentMode:'cod'}});
        await prisma.order.updateMany({where:{id:order.id,paymentStatus:{not:'paid'}},data:{paymentStatus:'paid',paymentCollectedAs:'cash'}});
        await logDurable('payment','provider.failed',{orderId:order.id,status:'failed',token:'PRIVATE_TOKEN',orderNo:'me@example.com token=PRIVATE_VALUE'});
        process.send({productId:product.id,orderId:order.id}); setInterval(()=>{},10000);
      `)
      assert.equal(await raw.product.findUnique({ where: { id: message.productId } }), null)
      assert.equal((await raw.order.findUnique({ where: { id: message.orderId } })).paymentStatus, 'paid')
      const pending = await raw.monitoringOutbox.findMany({ where: { destination, deliveredAt: null } })
      assert.equal(pending.length, 4)
      assert.ok(pending.some((r) => r.category === 'audit' && r.payload.old.priceValue === '77' && r.payload.new === null))
      for (const secret of ['PRIVATE_NAME', 'PRIVATE_TOKEN', 'PRIVATE_VALUE', 'me@example.com']) assert.ok(!JSON.stringify(pending).includes(secret))
      const store = createStore('crash'), second = createStore('crash')
      await Promise.all([store.pump(), second.pump()])
      assert.equal(await raw.monitoringOutbox.count({ where: { destination, deliveredAt: null } }), 0)
      const lines = await contents()
      for (const row of pending) assert.equal(lines.filter((line) => line.eventId === row.id).length, 1)
      t.diagnostic('SIGKILL recovery: deletion, COD create/paid transition and failed provider event all recovered once')
    })
    await t.test('file fsync followed by SIGKILL before database acknowledgment replays without duplicate rows', async () => {
      const destination = `${prefix}-ack`
      const message = await killedProducer(`
        process.env.LOG_OUTBOX_POLL_MS='60000'; process.env.LOG_OUTBOX_DESTINATION=${JSON.stringify(destination)};
        const {PrismaClient}=await import('@prisma/client');
        const {createCriticalOutbox,outboxConfig}=await import(${JSON.stringify(path.join(sourceRoot, 'src/monitoring/outbox.js'))});
        const {prepareLogRecord,deliverOutboxRecord}=await import(${JSON.stringify(path.join(sourceRoot, 'src/monitoring/index.js'))});
        const raw=new PrismaClient({log:[]});
        const record=prepareLogRecord('payment','ack.window',{status:'paid',orderNo:'ack-window'});
        const store=createCriticalOutbox(raw,{config:outboxConfig,deliver:async(...args)=>{await deliverOutboxRecord(...args);process.send({id:record.eventId});await new Promise(()=>{})}});
        await store.append('payment',record);await store.pump();
      `)
      const before = await raw.monitoringOutbox.findUnique({ where: { id: message.id } })
      assert.equal(before.deliveredAt, null)
      assert.equal(before.attempts, 1)
      await raw.monitoringOutbox.update({ where: { id: message.id }, data: { leaseUntil: new Date(0), nextAttemptAt: new Date(0) } })
      await createStore('ack').pump()
      assert.ok((await raw.monitoringOutbox.findUnique({ where: { id: message.id } })).deliveredAt)
      assert.equal((await contents()).filter((line) => line.eventId === message.id).length, 1)
    })
    await t.test('partial append is repaired; retries retain original event IDs and safe values', async () => {
      const store = createStore('partial')
      const record = { ...prepareLogRecord('payment', 'partial.recovery', { status: 'paid', orderNo: 'partial-order' }), password: 'UNSAFE_DIRECT_SECRET', phone: '9876543210' }
      await store.append('payment', record)
      const persisted = await raw.monitoringOutbox.findUnique({ where: { id: record.eventId } })
      assert.ok(!JSON.stringify(persisted.payload).includes('UNSAFE_DIRECT_SECRET'))
      assert.ok(!JSON.stringify(persisted.payload).includes('9876543210'))
      const date = new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10)
      const file = path.join(process.env.LOG_DIRECTORY, `payment-${date}.log`)
      await fs.appendFile(file, '{"eventId":"incomplete')
      await raw.monitoringOutbox.update({ where: { id: record.eventId }, data: { attempts: 1 } })
      await store.pump()
      assert.equal((await contents()).filter((line) => line.eventId === record.eventId).length, 1)
      assert.ok(!(await fs.readFile(file, 'utf8')).includes('incomplete'))
    })
    await t.test('callback/array rollback removes business mutations and their outbox events together', async () => {
      const store = createStore('atomic')
      const client = instrumentPrisma(raw, { store })
      const actor = { req: { session: { adminUser: { id: 'atomic-admin' } } } }
      const make = (slug) => client.product.create({ data: { slug, name: 'Rollback fixture', priceValue: 10 } })
      await assert.rejects(logContext.run(actor, () => client.$transaction(async (tx) => { await tx.product.create({ data: { slug: `${prefix}-rollback-callback`, name: 'Rollback', priceValue: 1 } }); throw new Error('rollback') })))
      await assert.rejects(logContext.run(actor, () => client.$transaction([make(`${prefix}-rollback-array`), client.product.update({ where: { id: 'does-not-exist' }, data: { priceValue: 2 } })])))
      assert.equal(await raw.product.count({ where: { slug: { startsWith: `${prefix}-rollback` } } }), 0)
      assert.equal(await raw.monitoringOutbox.count({ where: { destination: `${prefix}-atomic` } }), 0)
      await logContext.run(actor, () => client.$transaction([make(`${prefix}-committed-array`)]))
      assert.equal(await raw.monitoringOutbox.count({ where: { destination: `${prefix}-atomic` } }), 1)
      const product = await raw.product.create({ data: { slug: `${prefix}-concurrent-price`, name: 'Price fixture', priceValue: 10 } })
      await Promise.all([20, 30].map((priceValue) => logContext.run(actor, async () => client.product.update({ where: { id: product.id }, data: { priceValue } }))))
      const priceEvents = (await raw.monitoringOutbox.findMany({ where: { destination: `${prefix}-atomic` } })).filter((row) => row.payload.resourceId === product.id)
      assert.equal(priceEvents.length, 2)
      assert.equal(priceEvents.filter((row) => row.payload.old.priceValue === '10').length, 1)
      assert.ok(priceEvents.some((row) => ['20', '30'].includes(row.payload.old.priceValue)))
    })
    await t.test('shutdown finishes its active delivery and leaves the remaining backlog recoverable', async () => {
      let release, entered
      const active = new Promise((resolve) => { entered = resolve })
      const finish = new Promise((resolve) => { release = resolve })
      const store = createStore('bounded-stop', { deliver: async (...args) => { entered(); await finish; await deliverOutboxRecord(...args) } })
      const records = Array.from({ length: 3 }, (_, i) => prepareLogRecord('payment', 'stop.recovery', { orderNo: `stop-${i}` }))
      for (const record of records) await store.append('payment', record)
      const pumping = store.pump()
      await active
      const stopping = store.stop()
      release()
      await Promise.all([pumping, stopping])
      assert.equal(await raw.monitoringOutbox.count({ where: { destination: `${prefix}-bounded-stop`, deliveredAt: null } }), 2)
      await createStore('bounded-stop').pump()
      assert.equal(await raw.monitoringOutbox.count({ where: { destination: `${prefix}-bounded-stop`, deliveredAt: null } }), 0)
      const lines = await contents()
      for (const record of records) assert.equal(lines.filter((row) => row.eventId === record.eventId).length, 1)
    })
    await t.test('concurrent producer quotas are exact, duplicate enqueues do not charge twice, pending rows are never pruned', async () => {
      const limit = (await raw.monitoringOutboxBudget.findUnique({ where: { id: 1 } })).usedBytes + 4096
      const store = createStore('quota', { config: { maxBytes: limit }, deliver: async () => { throw new Error('disk unavailable') } })
      const records = Array.from({ length: 25 }, (_, i) => prepareLogRecord('payment', 'quota.record', { orderNo: `quota-${i}`, status: 'pending' }))
      const accepted = await Promise.all(records.map((entry) => store.append('payment', entry)))
      assert.ok(accepted.some(Boolean) && accepted.some((ok) => !ok))
      const pending = await raw.monitoringOutbox.findMany({ where: { destination: `${prefix}-quota` } })
      assert.ok(pending.length > 0)
      const budget = await raw.monitoringOutboxBudget.findUnique({ where: { id: 1 } })
      assert.ok(budget.usedBytes <= limit)
      const duplicate = pending[0]
      assert.equal(await store.append('payment', duplicate.payload), true)
      assert.equal((await raw.monitoringOutboxBudget.findUnique({ where: { id: 1 } })).usedBytes, budget.usedBytes)
      await raw.monitoringOutbox.updateMany({ where: { destination: `${prefix}-quota` }, data: { createdAt: new Date(0) } })
      await store.pump()
      assert.equal(await raw.monitoringOutbox.count({ where: { destination: `${prefix}-quota`, deliveredAt: null } }), pending.length)
      assert.ok(alerts.some((entry) => entry[2] === 'outbox-capacity'))
      assert.ok((await store.health()).capacityFailures > 0)
      assert.equal((await store.health()).retries, pending.length)
    })
    await t.test('a missing outbox table cannot roll back checkout; byte reservations are compensated', async () => {
      const store = createStore('missing-table')
      const client = instrumentPrisma(raw, { store })
      await store.initialize()
      const before = (await raw.monitoringOutboxBudget.findUnique({ where: { id: 1 } })).usedBytes
      await raw.$executeRawUnsafe('RENAME TABLE MonitoringOutbox TO MonitoringOutboxUnavailable')
      try {
        const order = await client.order.create({ data: { orderNo: `${prefix}-missing-table`, itemsTotal: 1, grandTotal: 1 } })
        assert.ok(await raw.order.findUnique({ where: { id: order.id } }))
        assert.equal((await raw.monitoringOutboxBudget.findUnique({ where: { id: 1 } })).usedBytes, before)
        assert.equal((await store.health()).available, false)
        assert.ok(alerts.some((entry) => entry[2] === 'outbox-append-failed'))
      } finally { await raw.$executeRawUnsafe('RENAME TABLE MonitoringOutboxUnavailable TO MonitoringOutbox') }
    })
    await t.test('nontransactional tables are rejected without breaking checkout', async () => {
      const store = createStore('unsafe-engine')
      await raw.$executeRawUnsafe('ALTER TABLE MonitoringOutboxBudget ENGINE=MyISAM')
      try {
        await assert.rejects(store.initialize())
        const client = instrumentPrisma(raw, { store })
        const order = await client.order.create({ data: { orderNo: `${prefix}-unsafe-engine`, itemsTotal: 1, grandTotal: 1 } })
        assert.ok(await raw.order.findUnique({ where: { id: order.id } }))
        assert.equal((await store.health()).available, false)
        assert.ok(alerts.some((entry) => entry[2] === 'outbox-schema-unavailable'))
      } finally { await raw.$executeRawUnsafe('ALTER TABLE MonitoringOutboxBudget ENGINE=InnoDB') }
    })
    await t.test('an old pending event is recovered into a current daily file without expiring immediately', async () => {
      const store = createStore('old-event')
      const record = { ...prepareLogRecord('payment', 'old.recovery', { status: 'paid' }), timestamp: new Date(0).toISOString() }
      await store.append('payment', record)
      await store.pump()
      const matches = (await contents()).filter((line) => line.eventId === record.eventId)
      assert.equal(matches.length, 1)
      assert.equal(matches[0].timestamp, new Date(0).toISOString())
      assert.ok(matches[0].recoveredAt)
    })
    await t.test('outbox capacity failures do not roll back a valid checkout mutation; delivered retention frees budget', async () => {
      const store = createStore('full', { config: { maxBytes: 1 } })
      const client = instrumentPrisma(raw, { store })
      const order = await client.order.create({ data: { orderNo: `${prefix}-fail-open`, itemsTotal: 1, grandTotal: 1 } })
      assert.ok(await raw.order.findUnique({ where: { id: order.id } }))
      assert.equal(await raw.monitoringOutbox.count({ where: { destination: `${prefix}-full` } }), 0)
      assert.ok((await store.health()).capacityFailures > 0)
      const retained = createStore('retention')
      const record = prepareLogRecord('audit', 'retention.record', { status: 'success' })
      await retained.append('audit', record)
      await retained.pump()
      await raw.monitoringOutbox.update({ where: { id: record.eventId }, data: { deliveredAt: new Date(0) } })
      await retained.pump()
      assert.equal(await raw.monitoringOutbox.findUnique({ where: { id: record.eventId } }), null)
      const sum = await raw.monitoringOutbox.aggregate({ _sum: { bytes: true } })
      assert.equal((await raw.monitoringOutboxBudget.findUnique({ where: { id: 1 } })).usedBytes, sum._sum.bytes || 0)
    })
  } finally {
    for (const store of stores) await store.stop()
    await closeMonitoring()
    await raw.$disconnect()
  }
})
