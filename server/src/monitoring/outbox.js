import { Prisma } from '@prisma/client'
import { randomUUID } from 'node:crypto'
import { istDate, sanitize } from './sanitize.js'

const integer = (value, fallback, min, max) => Math.max(min, Math.min(max, Math.floor(Number(value) || fallback)))
export const outboxConfig = {
  enabled: process.env.LOG_OUTBOX_ENABLED !== 'false',
  destination: String(process.env.LOG_OUTBOX_DESTINATION || 'tokri-server').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64),
  maxBytes: integer(process.env.LOG_OUTBOX_MAX_MB, 64, 1, 1024) * 1048576,
  retentionDays: integer(process.env.LOG_OUTBOX_RETENTION_DAYS, 7, 1, 90),
  pollMs: integer(process.env.LOG_OUTBOX_POLL_MS, 2000, 100, 60000),
  batchSize: 25,
}

export function createCriticalOutbox(client, { deliver, alert, config = outboxConfig, logRetentionDays = 30 } = {}) {
  const owner = randomUUID(), writes = new Set()
  let safeSchema = false
  let timer, initialized, pumping, stopped = false, stopping = false, failures = 0, capacityFailures = 0, available = false, relayed = 0
  async function initialize() {
    if (!config.enabled) return
    if (!initialized) initialized = (async () => {
      const tables = await client.$queryRaw`SELECT TABLE_NAME AS tableName, ENGINE AS storageEngine FROM information_schema.tables WHERE TABLE_SCHEMA = DATABASE()`
      const managed = new Set(Prisma.dmmf.datamodel.models.map((model) => model.dbName || model.name))
      if (!['MonitoringOutbox', 'MonitoringOutboxBudget'].every((name) => tables.some((row) => row.tableName === name)) || tables.some((row) => managed.has(row.tableName) && row.storageEngine?.toLowerCase() !== 'innodb')) throw new Error('Transactional monitoring schema is unavailable')
      await client.monitoringOutboxBudget.upsert({ where: { id: 1 }, create: { id: 1 }, update: {} })
      safeSchema = true; available = true
    })().catch((error) => { initialized = undefined; available = false; throw error })
    return initialized
  }
  function failure(category, record, reason) {
    failures++
    if (reason === 'outbox-capacity') capacityFailures++
    try { alert?.(['audit', 'payment'].includes(category) ? category : 'audit', sanitize(record), reason) } catch { /* a broken emergency sink must not affect checkout */ }
  }
  async function deleteDelivered(tx, where, take = 100) {
    // Budget first everywhere: avoids a budget/outbox lock-order inversion.
    await tx.monitoringOutboxBudget.update({ where: { id: 1 }, data: { usedBytes: { increment: 0 } } })
    const rows = await tx.monitoringOutbox.findMany({ where: { deliveredAt: { not: null }, ...where }, orderBy: { deliveredAt: 'asc' }, take, select: { id: true, bytes: true } })
    if (!rows.length) return 0
    await tx.monitoringOutbox.deleteMany({ where: { id: { in: rows.map((r) => r.id) } } })
    const bytes = rows.reduce((sum, row) => sum + row.bytes, 0)
    await tx.monitoringOutboxBudget.update({ where: { id: 1 }, data: { usedBytes: { decrement: bytes } } })
    return bytes
  }
  async function appendInTransaction(tx, category, record) {
    // MySQL statement errors leave the transaction usable. Compensate a reserved
    // budget on insert failure; never roll back a valid mutation for a logger quota/table error.
    if (!safeSchema) { failure(category, record, 'outbox-schema-unavailable'); return false }
    let reservedBytes = 0
    try {
      if (!['audit', 'payment'].includes(category) || !/^[a-f0-9-]{36}$/i.test(record.eventId || '') || typeof record.timestamp !== 'string' || !Number.isFinite(Date.parse(record.timestamp))) throw Object.assign(new Error('Invalid outbox record'), { code: 'OUTBOX_RECORD' })
      const payload = JSON.parse(JSON.stringify(sanitize(record)))
      const bytes = Buffer.byteLength(JSON.stringify(payload)) + 256
      if (bytes > 16640) throw Object.assign(new Error('Record too large'), { code: 'OUTBOX_RECORD_SIZE' })
      let reserved = await tx.monitoringOutboxBudget.updateMany({ where: { id: 1, usedBytes: { lte: config.maxBytes - bytes } }, data: { usedBytes: { increment: bytes } } })
      if (!reserved.count) {
        const existing = await tx.$queryRaw`SELECT id FROM MonitoringOutbox WHERE id = ${record.eventId} FOR UPDATE`
        if (existing.length) return true
        await deleteDelivered(tx, {})
        reserved = await tx.monitoringOutboxBudget.updateMany({ where: { id: 1, usedBytes: { lte: config.maxBytes - bytes } }, data: { usedBytes: { increment: bytes } } })
      }
      if (!reserved.count) throw Object.assign(new Error('Outbox capacity reached'), { code: 'OUTBOX_CAPACITY' })
      reservedBytes = bytes
      await tx.monitoringOutbox.create({ data: { id: record.eventId, destination: config.destination, category, payload, bytes, createdAt: new Date(), nextAttemptAt: new Date() } })
      return true
    } catch (error) {
      if (reservedBytes) await tx.monitoringOutboxBudget.update({ where: { id: 1 }, data: { usedBytes: { decrement: reservedBytes } } })
      if (error.code === 'P2002') return true
      failure(category, record, error.code === 'OUTBOX_CAPACITY' ? 'outbox-capacity' : 'outbox-append-failed')
      available = error.code === 'OUTBOX_CAPACITY' ? available : false
      return false
    }
  }
  async function append(category, record) {
    if (!config.enabled) return false
    if (writes.size >= 64) { failure(category, record, 'outbox-producer-overload'); return false }
    const work = (async () => {
      try {
        await initialize()
        const ok = await client.$transaction((tx) => appendInTransaction(tx, category, record))
        wake()
        return ok
      } catch { failure(category, record, 'outbox-database-unavailable'); available = false; return false }
    })()
    writes.add(work)
    try { return await work } finally { writes.delete(work) }
  }
  async function pump() {
    if (!config.enabled || stopped) return
    if (pumping) return pumping
    pumping = (async () => {
      try {
        await initialize()
        const now = new Date()
        const candidates = await client.monitoringOutbox.findMany({
          where: { destination: config.destination, deliveredAt: null, nextAttemptAt: { lte: now }, OR: [{ leaseUntil: null }, { leaseUntil: { lte: now } }] },
          orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], take: config.batchSize,
        })
        for (const row of candidates) {
          if (stopping) break
          const claimed = await client.monitoringOutbox.updateMany({
            where: { id: row.id, deliveredAt: null, OR: [{ leaseUntil: null }, { leaseUntil: { lte: new Date() } }] },
            data: { leaseOwner: owner, leaseUntil: new Date(Date.now() + 60000), attempts: { increment: 1 } },
          })
          if (!claimed.count) continue
          const fresh = await client.monitoringOutbox.findUnique({ where: { id: row.id } })
          if (!fresh || fresh.leaseOwner !== owner || fresh.deliveredAt) continue
          const cutoff = istDate(new Date(Date.now() - (logRetentionDays - 1) * 86400000))
          const fileDate = fresh.fileDate && fresh.fileDate >= cutoff ? fresh.fileDate : istDate()
          const planned = await client.monitoringOutbox.updateMany({ where: { id: row.id, deliveredAt: null, leaseOwner: owner }, data: { fileDate } })
          if (!planned.count) continue
          try {
            await deliver(fresh.category, fresh.payload, { dedupe: true, fileDate })
            const acknowledged = await client.monitoringOutbox.updateMany({ where: { id: row.id, deliveredAt: null, leaseOwner: owner }, data: { deliveredAt: new Date(), leaseOwner: null, leaseUntil: null, lastError: null } })
            if (acknowledged.count) relayed++
          } catch {
            await client.monitoringOutbox.updateMany({ where: { id: row.id, deliveredAt: null, leaseOwner: owner }, data: {
              leaseOwner: null, leaseUntil: null, lastError: 'DELIVERY_FAILED', nextAttemptAt: new Date(Date.now() + Math.min(300000, config.pollMs * 2 ** Math.min(row.attempts, 7))),
            } })
          }
        }
        await client.$transaction((tx) => deleteDelivered(tx, { deliveredAt: { lt: new Date(Date.now() - config.retentionDays * 86400000) } }))
        available = true
        return candidates.length
      } catch { available = false; return 0 }
    })()
    try { return await pumping } finally { pumping = undefined }
  }
  function wake() {
    if (stopped || stopping || timer || !config.enabled) return
    timer = setInterval(() => { pump().catch(() => {}) }, config.pollMs)
    timer.unref()
  }
  async function flush() {
    await Promise.allSettled([...writes])
    if (stopped) return
    if (pumping) await pumping
    // Bound shutdown/test drain work; undelivered rows remain durable for the next process.
    for (let i = 0; i < 100; i++) if ((await pump()) !== config.batchSize) break
  }
  async function health() {
    const state = { enabled: config.enabled, available, failures, capacityFailures, relayed, maxBytes: config.maxBytes, destination: config.destination }
    if (!config.enabled) return state
    try {
      const [budget, pending, oldest, retries] = await Promise.all([
        client.monitoringOutboxBudget.findUnique({ where: { id: 1 } }),
        client.monitoringOutbox.count({ where: { destination: config.destination, deliveredAt: null } }),
        client.monitoringOutbox.findFirst({ where: { destination: config.destination, deliveredAt: null }, orderBy: { createdAt: 'asc' }, select: { createdAt: true } }),
        client.monitoringOutbox.count({ where: { destination: config.destination, deliveredAt: null, OR: [{ lastError: { not: null } }, { attempts: { gt: 1 } }] } }),
      ])
      return { ...state, available: available && Boolean(budget), usedBytes: budget?.usedBytes || 0, pending, retries, oldest: oldest?.createdAt?.toISOString() || null }
    } catch { return { ...state, available: false } }
  }
  return {
    enabled: config.enabled, initialize, appendInTransaction, append, pump, flush, health,
    async flushPending() { await Promise.allSettled([...writes]) },
    async start() { stopped = false; stopping = false; await initialize().catch(() => {}); wake(); pump().catch(() => {}) },
    wake,
    async stop() {
      if (stopped) return
      stopping = true; clearInterval(timer); timer = undefined
      await Promise.allSettled([...writes])
      if (pumping) await pumping
      stopped = true
    },
  }
}
