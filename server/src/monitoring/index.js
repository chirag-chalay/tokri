import '../config/env.js'
import { createDebugSettings } from './debug-settings.js'
import { AsyncLocalStorage } from 'node:async_hooks'
import { Worker } from 'node:worker_threads'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { writeSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { isMonitoringRequest, safeEndpoint, safePage } from '../../../shared/monitoring.js'
import { safeFailureFacts, checkoutFacts, checkoutPaymentFacts, adminActionFacts } from './event-facts.js'
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
export async function startCriticalOutbox() {
  try { await initializeDebugSettings() } catch { /* Default OFF if optional settings cannot be opened. */ }
  await durableStore?.start()
}
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
  const failure = details.status === 'failure' || details.status === 'failed' || Number(details.httpStatus) >= 400 || category === 'error'
  return { ...sanitize({ ...(failure ? { failureReason: context?.accessError?.failureReason, code: context?.accessError?.code } : {}), ...details, event, requestId: context?.id,
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
  if (category === 'access') category = 'api' // Read old files; new access records are explicitly API records.
  if (category === 'api' && ['customer.login', 'admin.login'].includes(event) && logContext.getStore() && !logContext.getStore().accessFinalized) {
    logContext.getStore().accessSummary = { event, details: sanitize(details) }
    return // One enriched request entry, rather than a second sign-in entry.
  }
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
let debugGeneration = randomUUID(), expiryTimer
const debugSubscribers = new Set(), debugClosers = new Set()
export function websiteDebugState() { return { debugUntil: monitoringState().debugUntil, generation: debugGeneration } }
export function subscribeWebsiteDebug(listener, close) { debugSubscribers.add(listener); if (close) debugClosers.add(close); return () => { debugSubscribers.delete(listener); if (close) debugClosers.delete(close) } }
export function closeWebsiteStreams() { for (const close of [...debugClosers]) { try { close() } catch { /* release every stream */ } } }
function publishDebugState() { for (const listener of debugSubscribers) { try { listener(websiteDebugState()) } catch { /* diagnostics cannot break admin controls */ } } }
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
let debugSettings, settingsReady
function applyDebugState(state) {
  clearTimeout(expiryTimer)
  const changed = debugUntil !== state.until || debugGeneration !== state.generation
  debugUntil = state.until
  debugGeneration = state.generation
  if (changed) publishDebugState()
  if (debugUntil > Date.now()) { expiryTimer = setTimeout(publishDebugState, Math.max(1, debugUntil - Date.now())); expiryTimer.unref() }
}
export async function initializeDebugSettings() {
  if (!settingsReady) settingsReady = createDebugSettings(`${logConfig.directory}.settings`, applyDebugState).then(store => { debugSettings = store }).catch(error => { settingsReady = undefined; throw error })
  await settingsReady
}
export async function changeDebugSettings(enabled, minutes = 15) {
  try {
    // Journal intent before the filesystem change. A process interruption can
    // leave an unconfirmed attempt, but cannot silently apply an unaudited
    // enable. Completion is recorded separately only after the synced save.
    const intent = prepareLogRecord('audit', 'debug.change.requested', { status: 'pending', enabled: Boolean(enabled) })
    if (logContext.getStore()) logContext.getStore().auditRecorded = true
    let recorded
    if (durableStore?.enabled) recorded = await durableStore.append('audit', intent)
    else {
      try { await deliverOutboxRecord('audit', intent); recorded = true }
      catch { reportRecordUndelivered('audit', intent, 'debug-intent-storage-unavailable'); recorded = false }
    }
    if (!recorded && enabled) throw Object.assign(new Error('Critical audit storage is unavailable.'), { code: 'DEBUG_AUDIT_UNAVAILABLE' })
    await initializeDebugSettings()
    await debugSettings.save(enabled, positive(minutes, 15, 1, 60))
  } catch (error) {
    const failureReason = error.code === 'DEBUG_AUDIT_UNAVAILABLE' ? 'debug_audit' : ['EACCES', 'EPERM'].includes(error.code) ? 'debug_permissions' : error.code === 'ENOSPC' ? 'debug_disk_full' : 'debug_storage'
    log('audit', 'debug.change.failed', { status: 'failure', failureReason })
    await persistCriticalLogs()
    throw new Error('The debug setting could not be saved. Check monitoring storage and permissions.')
  }
  log('audit', enabled ? 'debug.enabled' : 'debug.disabled', { debugUntil: monitoringState().debugUntil })
  return monitoringState()
}
// In-memory control retained for isolated instrumentation tests. Admin actions use
// changeDebugSettings, which persists the deadline before reporting success.
export function setDebug(enabled, minutes = 15) {
  applyDebugState({ until: enabled ? Date.now() + positive(minutes, 15, 1, 60) * 60000 : 0, generation: randomUUID() })
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
  const context = { req, id: randomUUID(), adminAction: ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) ? adminActionFacts(req.originalUrl || req.url) : {}, telemetryRequest: String(req.originalUrl || req.url || '').startsWith('/api/v1/monitoring/') }
  const silent = isMonitoringRequest(req.originalUrl || req.url)
  const pathname = String(req.originalUrl || req.url || '').split('?')[0]
  const apiRequest = pathname.startsWith('/api/') || pathname.includes('/api/')
  if (apiRequest && !silent) res.setHeader?.('X-Tokri-Request-Id', context.id)
  if (apiRequest && !silent && typeof res.json === 'function') {
    const json = res.json
    res.json = function (body) {
      // Inspect only approved scalar facts; never serialize a response/body.
      try {
        if (req.session?.adminUser && context.adminAction.model && !context.adminAction.resourceId) {
          const id = body?.record?.id || body?.record?.params?.id
          if (typeof id === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(id)) context.adminAction.resourceId = id
        }
        if (req.session?.adminUser && context.adminAction.model && (body?.notice?.type === 'error' || body?.record?.errors && Object.keys(body.record.errors).length)) {
          context.accessOutcome = 'failure'
          context.accessError = { ...context.accessError, ...(body?.record?.errors && Object.keys(body.record.errors).length ? { failureReason: 'admin_validation' } : safeFailureFacts(body.notice)) }
        }
        if (res.statusCode >= 400) {
          const facts = safeFailureFacts(body)
          context.accessError = { ...context.accessError, ...facts }
          if (facts.failureReason) res.setHeader('X-Tokri-Failure-Reason', facts.failureReason)
        } else if (/\/checkout\/(?:quote|preview-coupon)$/.test(pathname)) context.accessFacts = checkoutFacts(body)
        else if (req.method === 'POST' && pathname.startsWith('/api/v1/checkout/')) {
          context.accessFacts = { ...checkoutFacts(body), ...checkoutPaymentFacts(body) }
          // A successful confirmation handler has already resolved this order
          // for the authenticated customer. Some failed-provider responses omit
          // the order reference, so retain its validated application format.
          if (context.accessFacts.paymentStatus && !context.accessFacts.orderNo && /^TKR\d{8,20}$/.test(req.body?.orderNo || '')) context.accessFacts.orderNo = req.body.orderNo
          if (context.accessFacts.paymentStatus === 'failed') context.accessOutcome = 'failure'
          else if (context.accessFacts.paymentStatus === 'pending') context.accessOutcome = 'pending'
          if (context.accessOutcome) res.setHeader('X-Tokri-Operation-Status', context.accessOutcome)
          if (context.accessFacts.failureReason) res.setHeader('X-Tokri-Failure-Reason', context.accessFacts.failureReason)
        }
      } catch { /* Observation must never change the response. */ }
      return Reflect.apply(json, this, arguments)
    }
  }
  logContext.run(context, () => {
    const start = performance.now()
    let completed = false
    const finish = (aborted = false) => logContext.run(context, () => {
      if (completed) return
      completed = true
      if (silent) return // Viewing logs, SSE and telemetry never log themselves.
      const status = aborted ? 499 : res.statusCode
      const route = safeEndpoint(pathname) || req.route?.path || '[other endpoint]'
      if (req.session?.adminUser && !context.auditRecorded && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        log('audit', 'admin.action', { ...context.adminAction, ...context.accessError, method: req.method, route, status: context.accessOutcome || (status < 400 ? 'success' : 'failure') })
      }
      if (apiRequest || context.accessSummary) {
        context.accessFinalized = true
        const summary = context.accessSummary
        const fields = { ...(req.session?.adminUser ? context.adminAction : {}), ...context.accessFacts, ...(status >= 400 || context.accessOutcome === 'failure' ? context.accessError : {}), ...summary?.details, method: req.method, route, httpStatus: status, status: context.accessOutcome || summary?.details?.status || status, durationMs: Math.round(performance.now() - start) }
        log('api', summary?.event || (aborted ? 'request.aborted' : 'request.completed'), fields)
        log('debug', 'request.timing', fields)
      } else if (status >= 400 && req.method === 'GET' && String(req.headers.accept || '').includes('text/html')) {
        const page = safePage(pathname)
        if (page && page.pagePath !== '/[other]') logContext.run({ id: context.id, req: {} }, () => log('error', 'website.response.failed', { page: page.pageLabel, pagePath: page.pagePath, status, source: 'website' }))
      }
    })
    res.once('finish', () => finish())
    res.once('close', () => { if (!res.writableFinished) finish(true) })
    next()
  })
}

export async function closeMonitoring() {
  debugSettings?.close(); debugSettings = undefined; settingsReady = undefined
  clearTimeout(expiryTimer)
  closeWebsiteStreams()
  debugSubscribers.clear()
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
    closeWebsiteStreams()
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
