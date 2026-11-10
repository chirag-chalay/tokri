import '../config/env.js'
import { AsyncLocalStorage } from 'node:async_hooks'
import { Worker } from 'node:worker_threads'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { writeSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { categories, sanitize } from './sanitize.js'

export const logContext = new AsyncLocalStorage()
const positive = (value, fallback, min, max) => Math.floor(Math.max(min, Math.min(max, Number(value) || fallback)))
export const logConfig = {
  directory: path.resolve(process.env.LOG_DIRECTORY || fileURLToPath(new URL('../../logs', import.meta.url))),
  retentionDays: positive(process.env.LOG_RETENTION_DAYS, 30, 1, 365),
  maxBytes: positive(process.env.LOG_MAX_MB, 256, 1, 10240) * 1024 * 1024,
  queueLimit: positive(process.env.LOG_QUEUE_LIMIT, 2000, 10, 10000),
}
let durableStore
export function configureDurableLogging(store) { durableStore = store }
export async function persistCriticalLogs() { await durableStore?.flushPending() }
export async function startCriticalOutbox() { await durableStore?.start() }
export async function outboxHealth() { return durableStore ? durableStore.health() : { enabled: false, available: false } }
export function reportRecordUndelivered(category, entry, reason) { fallback(category, entry, reason) }
export async function deliverOutboxRecord(category, entry, options) { return workerCall('deliver', { category, record: entry, ...options }) }
export async function logDurable(category, event, details = {}) {
  const entry = prepareLogRecord(category, event, details)
  if (category === 'audit' && logContext.getStore()) logContext.getStore().auditRecorded = true
  if (durableStore?.enabled && ['audit', 'payment'].includes(category)) {
    const scope = logContext.getStore()?.transaction
    if (scope?.active) return durableStore.appendInTransaction(scope.client, category, entry)
    return durableStore.append(category, entry)
  }
  log(category, event, details)
  return true
}
const criticalTypes = new Set(['audit', 'payment', 'account', 'error'])
const inflight = new Map()
const calls = new Map()
let worker, dropped = 0, failed = 0, emergency = 0, emergencyFailed = 0, debugUntil = 0, sequence = 0
let lastDropWarning = 0, prunedFiles = 0, prunedBytes = 0, repairedTails = 0
// Workers must not inherit CLI-only flags (e.g. node --input-type=module).
const workerOptions = () => ({ workerData: logConfig, execArgv: process.execArgv.filter((arg) => !arg.startsWith('--input-type')) })
export function prepareLogRecord(category, event, details = {}) {
  const context = logContext.getStore()
  const req = context?.req
  return { ...sanitize({ ...details, event, requestId: context?.id,
    actorId: req?.session?.adminUser?.id || req?.customer?.id || req?.partner?.id || details.actorId,
    ip: req?.ip || details.ip }), eventId: randomUUID(), timestamp: new Date().toISOString() }
}
const emergencyQueue = []
let emergencyBusy = false, emergencyOverflow = 0, emergencyActive = ''
function drainEmergency() {
  if (emergencyBusy || !emergencyQueue.length) return
  emergencyBusy = true
  const line = emergencyQueue.shift()
  emergencyActive = line
  const done = (error) => {
    if (error) emergencyFailed++
    emergencyBusy = false
    emergencyActive = ''
    if (emergencyOverflow) {
      emergencyQueue.unshift(`${JSON.stringify({ event: 'monitoring.emergency.overflow', count: emergencyOverflow })}\n`)
      emergencyOverflow = 0
    }
    drainEmergency()
  }
  try { process.stderr.write(line, done) } catch { done(new Error('Emergency stream failed')) }
}
// Logging must not turn a closed supervisor pipe into an unhandled exception.
process.stderr.on('error', () => { emergencyFailed++ })
function fallback(category, entry, reason) {
  emergency++
  // A bounded independent supervisor stream; an external durable acknowledgement is still required for zero-loss guarantees.
  try {
    const line = `${JSON.stringify({ event: 'monitoring.delivery.failed', category, reason, record: entry })}\n`
    if (reason.startsWith('process-')) writeSync(2, line)
    else if (emergencyQueue.length < Math.min(logConfig.queueLimit, 100)) {
      emergencyQueue.push(line)
      drainEmergency()
    } else { emergencyFailed++; emergencyOverflow++ }
  } catch { emergencyFailed++ }
}
export function reportUndelivered(category, event, details, reason) {
  try { fallback(category, prepareLogRecord(category, event, details), reason) } catch { emergencyFailed++ }
}
function losePending(reason) {
  failed += inflight.size
  for (const { category, record: entry } of inflight.values()) {
    if (criticalTypes.has(category)) fallback(category, entry, reason)
  }
  inflight.clear()
}
function getWorker() {
  if (worker) return worker
  const current = new Worker(new URL('./worker.js', import.meta.url), workerOptions())
  worker = current
  current.on('message', (message) => {
    if (message.repairedTail) repairedTails++
    if (message.pruned) {
      prunedFiles += message.pruned.count; prunedBytes += message.pruned.bytes
      if (message.pruned.diskPressure) reportUndelivered('audit', 'storage.files.pruned', { count: message.pruned.count, reason: 'disk-budget' }, 'disk-budget-pruning')
    }
    if (message.ack) {
      const entry = inflight.get(message.eventId)
      inflight.delete(message.eventId)
      if (!inflight.size) current.unref()
      if (message.failed) {
        failed++
        if (entry && criticalTypes.has(entry.category)) fallback(entry.category, entry.record, 'file-write-failed')
      }
    }
    if (message.id) settle(message)
  })
  current.on('error', () => losePending('writer-failed'))
  current.on('exit', () => {
    if (worker !== current) return
    losePending('writer-stopped')
    worker = undefined
    for (const [id, call] of calls) {
      if (call.writer === current) { clearTimeout(call.timer); call.reject(new Error('Log worker stopped.')); calls.delete(id) }
    }
  })
  current.unref()
  return current
}
function settle(message) {
  const call = calls.get(message.id)
  if (!call) return
  clearTimeout(call.timer)
  calls.delete(message.id)
  if (call.reader) call.reader.terminate().catch(() => {})
  message.error ? call.reject(new Error(message.error)) : call.resolve(message.result)
}
export function log(category, event, details = {}) {
  let entry
  try {
    if (!categories.includes(category) || (category === 'debug' && Date.now() >= debugUntil)) return
    if (durableStore?.enabled && ['audit', 'payment'].includes(category)) {
      logDurable(category, event, details).catch(() => reportUndelivered(category, event, {}, 'outbox-producer-failed'))
      return
    }
    const critical = criticalTypes.has(category)
    if (category === 'audit' && logContext.getStore()) logContext.getStore().auditRecorded = true
    const limit = critical ? logConfig.queueLimit : logConfig.queueLimit - Math.max(1, Math.floor(logConfig.queueLimit / 4))
    if (!critical && inflight.size >= limit) {
      dropped++
      if (Date.now() - lastDropWarning > 60000) {
        lastDropWarning = Date.now()
        reportUndelivered('access', 'monitoring.queue.saturated', { count: dropped }, 'noncritical-events-dropped')
      }
      return
    }
    entry = prepareLogRecord(category, event, details)
    if (inflight.size >= limit || Buffer.byteLength(JSON.stringify(entry)) > 16384) {
      dropped++
      if (critical) fallback(category, entry, inflight.size >= limit ? 'critical-queue-full' : 'record-too-large')
      return
    }
    const writer = getWorker()
    inflight.set(entry.eventId, { category, record: entry })
    writer.ref()
    writer.postMessage({ type: 'write', category, record: entry, eventId: entry.eventId })
  } catch {
    failed++
    if (entry) inflight.delete(entry.eventId)
    if (!inflight.size) worker?.unref()
    if (criticalTypes.has(category)) {
      if (entry) fallback(category, entry, 'logger-failed')
      else reportUndelivered(category, event, {}, 'serialization-failed')
    }
  }
}
// Normal exits wait for writes via ref(); forced exits emit pending critical records synchronously.
process.once('exit', () => {
  losePending('process-exit-before-ack')
  if (emergencyActive) { try { writeSync(2, emergencyActive) } catch { emergencyFailed++ } }
  for (const line of emergencyQueue) { try { writeSync(2, line) } catch { emergencyFailed++ } }
  if (emergencyOverflow) { try { writeSync(2, `${JSON.stringify({ event: 'monitoring.emergency.overflow', count: emergencyOverflow })}\n`) } catch { emergencyFailed++ } }
})
let processLoggingInstalled = false
export function installProcessErrorLogging() {
  if (processLoggingInstalled) return
  processLoggingInstalled = true
  let exiting = false
  process.on('uncaughtException', (error) => {
    // Preserve fail-stop behavior without Node printing raw secret-bearing error messages/stacks.
    if (exiting) process.exit(1)
    exiting = true
    log('error', 'process.fatal', { source: 'server', errorKind: String(error?.name || 'Error').replace(/[^a-zA-Z]/g, '').slice(0, 60) })
    const timer = setTimeout(() => process.exit(1), 1000)
    closeMonitoring().catch(() => {}).finally(() => { clearTimeout(timer); process.exit(1) })
  })
}
export function recordDroppedLog() { dropped++ }
export function monitoringState() {
  return { debugUntil: Date.now() < debugUntil ? new Date(debugUntil).toISOString() : null, pending: inflight.size,
    dropped, failed, emergency, emergencyFailed, emergencyPending: emergencyQueue.length, prunedFiles, prunedBytes, repairedTails, degraded: Boolean(dropped || failed || emergency),
    retentionDays: logConfig.retentionDays, maxBytes: logConfig.maxBytes }
}
export function setDebug(enabled, minutes = 15) {
  debugUntil = enabled ? Date.now() + positive(minutes, 15, 1, 60) * 60000 : 0
  log('audit', enabled ? 'debug.enabled' : 'debug.disabled', { debugUntil: monitoringState().debugUntil })
  return monitoringState()
}
export async function workerCall(type, query = {}) {
  if (type === 'flush') await durableStore?.flush()
  if (calls.size >= 4) return Promise.reject(new Error('Monitoring is busy. Please retry.'))
  return new Promise((resolve, reject) => {
    const id = ++sequence
    const call = { resolve, reject }
    call.timer = setTimeout(() => {
      calls.delete(id)
      if (call.reader) call.reader.terminate().catch(() => {})
      reject(new Error('Monitoring request timed out.'))
    }, 15000)
    calls.set(id, call)
    try {
      if (type === 'read') {
        // Viewer scans cannot delay critical writes or grow the writer's work queue.
        call.reader = new Worker(new URL('./worker.js', import.meta.url), {
          ...workerOptions(), workerData: { ...logConfig, readerOnly: true },
        })
        call.reader.on('message', (message) => { if (message.id === id) settle(message) })
        call.reader.once('error', () => settle({ id, error: 'Log storage is unavailable.' }))
        call.reader.postMessage({ type, id, query })
      } else {
        call.writer = getWorker()
        call.writer.postMessage({ type, id, query })
      }
    } catch { settle({ id, error: 'Log storage is unavailable.' }) }
  })
}
export function requestLogging(req, res, next) {
  const context = { req, id: randomUUID() }
  logContext.run(context, () => {
    const start = performance.now()
    let completed = false
    const finish = (aborted = false) => logContext.run(context, () => {
      if (completed) return
      completed = true
      const route = req.route?.path ? `${req.baseUrl || ''}${req.route.path}` : '[unmatched/static]'
      const status = aborted ? 499 : res.statusCode
      if (req.session?.adminUser && !context.auditRecorded && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && req.params?.pageName !== 'logs') {
        log('audit', 'admin.action', { method: req.method, route, status: status < 400 ? 'success' : 'failure' })
      }
      log('access', aborted ? 'request.aborted' : 'request.completed', { method: req.method, route, status, durationMs: Math.round(performance.now() - start) })
      log('debug', 'request.timing', { method: req.method, route, status, durationMs: Math.round(performance.now() - start) })
    })
    res.once('finish', () => finish())
    res.once('close', () => { if (!res.writableFinished) finish(true) })
    next()
  })
}
export async function closeMonitoring() {
  await durableStore?.stop()
  for (const [id, call] of calls) if (call.reader) settle({ id, error: 'Monitoring is closing.' })
  const current = worker
  if (!current) return
  try { await workerCall('flush') } finally { await current.terminate(); if (worker === current) worker = undefined }
}

export function installGracefulShutdown(server, disconnect = async () => {}) {
  let stopping = false
  const stop = () => {
    if (stopping) return
    stopping = true
    const deadline = setTimeout(() => process.exit(1), 30000)
    deadline.unref()
    server.close(async () => {
      await closeMonitoring().catch(() => {})
      await disconnect().catch(() => {})
      clearTimeout(deadline)
      process.exit(0)
    })
  }
  process.once('SIGTERM', stop)
  process.once('SIGINT', stop)
}
