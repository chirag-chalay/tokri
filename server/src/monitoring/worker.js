import { validVisitorSession, visitorIdleSeconds } from '../../../shared/logReasons.js'
import { parentPort, workerData } from 'node:worker_threads'
import fs from 'node:fs/promises'
import { createInterface } from 'node:readline'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { presentLog } from '../admin/monitoring-presentation.js'
import { isMonitoringRequest, readableStatus } from '../../../shared/monitoring.js'
import { ADMIN_RETENTION_DAYS, DAY_MS, activityKey, countableActivity, isCheckout, isCustomerActivity, logSource, logTab, recordedReason } from './log-policy.js'
import { addSessionEvent, belongsToSessionTab, carryTimelineDelivery, finishSession, isBackgroundCall } from './session-view.js'
import { createLogInsights } from './log-insights.js'
import { categories, sanitize, istDate } from './sanitize.js'

const { directory, maxBytes, retentionDays, readerOnly, preserveRetention, frontendErrorDirectory } = workerData
const filePattern = /^(admin-)?(website|api|access|error|audit|debug|payment|account)-(\d{4}-\d{2}-\d{2})\.log$/
// Fixed-size negative filter; possible matches are always checked against the file.
// This avoids loading every ID or scanning an entire daily file for each new event.
const dedupeIndexes = new Map()
const indexBytes = Math.max(1, Math.min(1048576, workerData.dedupeIndexBytes || 1048576))
function positions(id) {
  const hash = createHash('sha256').update(id).digest()
  return [0, 4, 8].map((i) => hash.readUInt32BE(i) % (indexBytes * 8))
}
function addId(index, id) { for (const bit of positions(id)) index.bits[bit >> 3] |= 1 << (bit & 7) }
function maybeHasId(index, id) { return positions(id).every((bit) => index.bits[bit >> 3] & (1 << (bit & 7))) }
function remember(filename, index) {
  dedupeIndexes.delete(filename); dedupeIndexes.set(filename, index)
  if (dedupeIndexes.size > 12) dedupeIndexes.delete(dedupeIndexes.keys().next().value)
}
let ready = false, lastCleanup = 0, totalBytes = 0
async function files() {
  const names = await fs.readdir(directory).catch((error) => { if (error.code === 'ENOENT') return []; throw error })
  const result = []
  for (const name of names.filter((n) => filePattern.test(n))) {
    const info = await fs.lstat(path.join(directory, name)).catch(() => null)
    const [, archive, category, date] = filePattern.exec(name)
    if (info?.isFile() && !info.isSymbolicLink()) result.push({ name, size: info.size, date, category, admin: Boolean(archive || category === 'audit') })
  }
  return result.sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name))
}
async function retainOldAdminEvents(file) {
  const name = path.join(directory, 'admin-' + file.name)
  const input = await fs.open(path.join(directory, file.name), 'r')
  const temporary = name + '.tmp'
  let output, bytes = 0
  const migratedIds = new Set()
  try {
    const lines = createInterface({ input: input.createReadStream({ autoClose: false }), crlfDelay: Infinity })
    for await (const line of lines) {
      let row
      try { row = JSON.parse(line) } catch { continue }
      if (!row || logTab(row, file.category) !== 'admin') continue
      output ||= await fs.open(temporary, 'w', 0o600)
      if (row.eventId) migratedIds.add(row.eventId)
      const data = JSON.stringify(sanitize(row)) + '\n'
      await output.writeFile(data)
      bytes += Buffer.byteLength(data)
    }
    if (output) {
      await output.sync()
      await output.close()
      output = undefined
      if (await fs.stat(name).then(() => true, error => { if (error.code === 'ENOENT') return false; throw error })) {
        // New entries and an earlier interrupted cleanup can already share this date.
        const archive = await fs.open(name, 'r')
        const existing = createInterface({ input: archive.createReadStream(), crlfDelay: Infinity })
        for await (const line of existing) {
          let row
          try { row = JSON.parse(line) } catch { continue }
          if (row && !migratedIds.has(row.eventId)) await fs.appendFile(temporary, line + '\n')
        }
        const merged = await fs.open(temporary, 'r+')
        try { await merged.sync(); bytes = (await merged.stat()).size } finally { await merged.close() }
      }
      const previousSize = await fs.stat(name).then(stat => stat.size, error => { if (error.code === 'ENOENT') return 0; throw error })
      await fs.rename(temporary, name)
      await syncDirectory()
      return bytes - previousSize
    }
    return 0
  } finally {
    await input.close()
    if (output) await output.close()
    await fs.rm(temporary, { force: true })
  }
}
async function cleanup(required = 0) {
  const list = await files()
  totalBytes = list.reduce((sum, f) => sum + f.size, 0)
  const cutoff = istDate(new Date(Date.now() - (retentionDays - 1) * DAY_MS))
  const adminCutoff = istDate(new Date(Date.now() - (ADMIN_RETENTION_DAYS - 1) * DAY_MS))
  for (const file of list) {
    const expired = file.date < (file.admin ? adminCutoff : cutoff)
    const diskPressure = !expired && !preserveRetention && totalBytes + required > maxBytes
    if (!expired && !diskPressure) continue
    if (expired && !file.admin && file.date >= adminCutoff) totalBytes += await retainOldAdminEvents(file)
    await fs.unlink(path.join(directory, file.name))
    dedupeIndexes.delete(path.join(directory, file.name))
    parentPort.postMessage({ pruned: { count: 1, bytes: file.size, diskPressure } })
    totalBytes -= file.size
  }
  lastCleanup = Date.now()
}
const publicRoots = ['../../uploads', '../../../dist', '../../../public', '../admin/assets'].map((root) => fileURLToPath(new URL(root, import.meta.url)))
function rejectPublicDirectory(directoryPath) {
  if (publicRoots.some((root) => directoryPath === root || directoryPath.startsWith(root + path.sep))) throw new Error('Logs must be outside public storage')
}
async function init() {
  if (ready) return
  rejectPublicDirectory(directory)
  if (readerOnly) {
    const info = await fs.lstat(directory).catch(() => null)
    if (info && !info.isDirectory()) throw new Error('Invalid log directory')
    if (info?.isSymbolicLink()) throw new Error('Invalid log directory')
    if (info) rejectPublicDirectory(await fs.realpath(directory))
    ready = true; return
  }
  await fs.mkdir(directory, { recursive: true, mode: 0o700 })
  if ((await fs.lstat(directory)).isSymbolicLink()) throw new Error('Invalid log directory')
  rejectPublicDirectory(await fs.realpath(directory))
  await fs.chmod(directory, 0o700)
  await cleanup()
  ready = true
}
async function indexFor(filename) {
  const info = await fs.lstat(filename).catch((error) => { if (error.code === 'ENOENT') return null; throw error })
  if (info && (!info.isFile() || info.isSymbolicLink())) throw new Error('Invalid log file')
  const cached = dedupeIndexes.get(filename)
  if (cached && cached.size === (info?.size || 0) && cached.ino === info?.ino) return cached
  const index = { bits: Buffer.alloc(indexBytes), size: info?.size || 0, ino: info?.ino }
  if (info?.size) {
    const { constants } = await import('node:fs')
    const handle = await fs.open(filename, constants.O_RDONLY | constants.O_NOFOLLOW)
    const input = handle.createReadStream(), lines = createInterface({ input, crlfDelay: Infinity })
    try { for await (const line of lines) { try { const id = JSON.parse(line).eventId; if (typeof id === 'string') addId(index, id) } catch {} } }
    finally { lines.close(); input.destroy() }
  }
  remember(filename, index)
  return index
}
async function containsEvent(filename, eventId) {
  const { constants } = await import('node:fs')
  const handle = await fs.open(filename, constants.O_RDONLY | constants.O_NOFOLLOW).catch((error) => { if (error.code === 'ENOENT') return null; throw error })
  if (!handle) return false
  const input = handle.createReadStream(), lines = createInterface({ input, crlfDelay: Infinity })
  try {
    for await (const line of lines) { try { if (JSON.parse(line).eventId === eventId) return true } catch { /* incomplete tail is repaired before append */ } }
    return false
  } finally { lines.close(); input.destroy() }
}
async function syncDirectory() {
  const { constants } = await import('node:fs')
  const handle = await fs.open(directory, constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW)
  try { await handle.sync() } finally { await handle.close() }
}
async function repairTail(handle) {
  const { size } = await handle.stat()
  if (!size) return 0
  const last = Buffer.alloc(1)
  await handle.read(last, 0, 1, size - 1)
  if (last[0] === 10) return 0
  const tail = Buffer.alloc(Math.min(size, 65536))
  await handle.read(tail, 0, tail.length, size - tail.length)
  const newline = tail.lastIndexOf(10)
  if (newline < 0 && size > tail.length) throw new Error('Unrecoverable oversized log tail')
  const end = size - tail.length + newline + 1
  await handle.truncate(end)
  parentPort.postMessage({ repairedTail: true })
  return size - end
}
async function write({ category, record, dedupe = false, fileDate }) {
  if (!categories.includes(category)) throw new Error('Invalid category')
  const date = fileDate || istDate(new Date(record.timestamp))
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || new Date(date).toISOString().slice(0, 10) !== date) throw new Error('Invalid file date')
  const admin = logTab(record, category) === 'admin'
  const prefix = admin && category !== 'audit' ? 'admin-' : ''
  const filename = path.join(directory, `${prefix}${category}-${date}.log`)
  if (fileDate && fileDate !== istDate(new Date(record.timestamp))) record = { ...record, recoveredAt: new Date().toISOString() }
  const { constants } = await import('node:fs')
  const index = dedupe && record.eventId ? await indexFor(filename) : dedupeIndexes.get(filename)
  if (dedupe && record.eventId && maybeHasId(index, record.eventId) && await containsEvent(filename, record.eventId)) {
    const handle = await fs.open(filename, constants.O_RDONLY | constants.O_NOFOLLOW)
    try { await handle.sync() } finally { await handle.close() }
    await syncDirectory()
    return { deduplicated: true }
  }
  const line = `${JSON.stringify(record)}\n`
  const size = Buffer.byteLength(line)
  if (size > maxBytes) throw new Error('Record exceeds disk budget')
  if (Date.now() - lastCleanup > 60000 || totalBytes + size > maxBytes) await cleanup(size)
  if (totalBytes + size > maxBytes) throw new Error('Log retention storage is full')
  const handle = await fs.open(filename, constants.O_RDWR | constants.O_CREAT | constants.O_APPEND | constants.O_NOFOLLOW, 0o600)
  const critical = ['payment', 'audit', 'account', 'error'].includes(category)
  try {
    await handle.chmod(0o600)
    totalBytes = Math.max(0, totalBytes - await repairTail(handle))
    await handle.writeFile(line)
    if (critical) await handle.sync()
    if (index) {
      const info = await handle.stat()
      index.size = info.size; index.ino = info.ino
      if (record.eventId) addId(index, record.eventId)
      remember(filename, index)
    }
    totalBytes += size
  } finally { await handle.close() }
  if (critical) await syncDirectory()
  return { deduplicated: false }
}
// Read a snapshot backwards in bounded chunks so recent entries are available first.
// Split bytes before decoding to preserve UTF-8 characters across chunk boundaries.
async function* reverseLines(file) {
  const { constants } = await import('node:fs')
  const handle = await fs.open(file.path || path.join(directory, file.name), constants.O_RDONLY | constants.O_NOFOLLOW).catch((error) => { if (error.code === 'ENOENT') return null; throw error })
  if (!handle) return
  let position = file.size, pending = Buffer.alloc(0)
  try {
    while (position > 0) {
      const size = Math.min(65536, position)
      position -= size
      const chunk = Buffer.allocUnsafe(size)
      const { bytesRead } = await handle.read(chunk, 0, size, position)
      const buffer = Buffer.concat([chunk.subarray(0, bytesRead), pending])
      let end = buffer.length
      for (let i = end - 1; i >= 0; i--) {
        if (buffer[i] !== 10) continue
        if (i + 1 < end) yield buffer.subarray(i + 1, end).toString('utf8')
        end = i
      }
      pending = buffer.subarray(0, end)
    }
    if (pending.length) yield pending.toString('utf8')
  } finally { await handle.close() }
}
async function legacyErrors(start, end) {
  const byDay = new Map()
  if (!frontendErrorDirectory) return byDay
  for (const suffix of ['', '.1', '.2', '.3']) {
    const filename = path.join(frontendErrorDirectory, 'website-frontend-errors.jsonl' + suffix)
    const info = await fs.lstat(filename).catch(error => { if (error.code === 'ENOENT') return null; throw error })
    if (!info?.isFile() || info.size > 8 * 1024 * 1024) continue
    for await (const line of reverseLines({ path: filename, size: info.size })) {
      let row
      try { row = JSON.parse(line) } catch { continue }
      if (!row || row.activityLogged) continue
      const time = Date.parse(row.receivedAt)
      if (!Number.isFinite(time) || time < start || time > end) continue
      const date = istDate(new Date(time))
      if (!byDay.has(date)) byDay.set(date, [])
      byDay.get(date).push({ timestamp: new Date(time).toISOString(), category: 'error', event: 'frontend.error',
        platform: 'website', logSource: 'Website', reasonCode: row.kind === 'resource' ? 'RESOURCE_LOAD_FAILED' : row.kind === 'network' ? 'NETWORK_ERROR' : 'BROWSER_ERROR', status: 'failure', file: 'legacy-frontend-errors' })
    }
  }
  return byDay
}

async function readInsights(allFiles, alertOnly, now) {
  const metrics = createLogInsights(now, { alertOnly })
  const oldest = istDate(new Date(metrics.start))
  for (const file of allFiles) {
    if (file.date < oldest || file.category === 'debug') continue
    for await (const line of reverseLines(file)) {
      let row
      try { row = JSON.parse(line) } catch { continue }
      if (row && typeof row === 'object') metrics.observe(row, file.category)
    }
  }
  return metrics.result()
}

async function recentDeliveryContexts(allFiles) {
  const now = Date.now()
  const cutoff = now - visitorIdleSeconds * 1000
  const day = istDate(new Date(cutoff))
  const known = new Map()
  for (const file of allFiles) {
    if (file.date < day || file.admin || file.category === 'debug') continue
    for await (const line of reverseLines(file)) {
      let row
      try { row = JSON.parse(line) } catch { continue }
      if (!row || !validVisitorSession(row.sessionId) || typeof row.pincodeServiceable !== 'boolean' || !/^\d{6}$/.test(row.enteredPincode || '')) continue
      const timestamp = Date.parse(row.timestamp)
      if (!Number.isFinite(timestamp) || timestamp <= cutoff || timestamp > now || known.get(row.sessionId)?.timestamp >= row.timestamp) continue
      const { sessionId, enteredPincode, pincodeServiceable, deliveryCity, deliveryState } = sanitize(row)
      known.set(sessionId, { timestamp: row.timestamp, sessionId, enteredPincode, pincodeServiceable, deliveryCity, deliveryState })
    }
  }
  return [...known.values()]
}

async function read(query) {
  const allFiles = await files()
  if (query.restoreDeliveryContexts) return recentDeliveryContexts(allFiles)
  if (query.insightsOnly) return readInsights(allFiles, Boolean(query.alertOnly), Date.now())
  totalBytes = allFiles.reduce((sum, f) => sum + f.size, 0)
  const current = Date.now()
  const retentionCutoff = current - (query.tab === 'admin' || query.journey && !query.customerJourney ? ADMIN_RETENTION_DAYS : retentionDays) * DAY_MS
  const start = query.from ? Date.parse(query.from + 'T00:00:00+05:30') : query.visitSession || query.to ? retentionCutoff : current - DAY_MS
  const end = query.to ? Date.parse(query.to + 'T23:59:59.999+05:30') : current
  const summary = { failedCheckouts: 0, website: 0, app: 0, reasons: {}, pincodes: {}, unclassified: 0 }
  const failures = new Map()
  const grouped = query.groupSessions && ['website', 'app'].includes(query.tab)
  const sessions = new Map()
  const list = allFiles.filter((f) => (!query.category || f.category === query.category) && (!query.date || f.date === query.date)
    && (!query.business || (f.date >= istDate(new Date(Math.max(start, retentionCutoff))) && (f.date <= istDate(new Date(end)) || f.date === istDate())))).reverse()
  const journey = query.journey === true && Boolean(query.visitSession)
  const legacy = query.tab === 'errors' && !query.checkoutOnly && !query.visitSession && !query.phoneHash && !query.maskedCustomerIds && !query.pin && !query.coverage &&
    (!query.status || query.status === 'Failed') &&
    (!query.source || query.source === 'Website') && (!query.device || query.device === 'website') ?
    await legacyErrors(Math.max(start, retentionCutoff), end) : new Map()
  const perPage = query.export === 'csv' ? 5000 : Number(query.perPage) === 100 ? 100 : 50
  const page = Math.max(1, Math.min(100000, Math.floor(Number(query.page)) || 1))
  const offset = (page - 1) * perPage
  let total = 0, corruptRows = 0
  const rows = []
  const maskedCustomers = query.maskedCustomerIds && new Set(query.maskedCustomerIds)
  async function* matching(file) {
    for await (const line of reverseLines(file)) {
        let row
        try {
          row = JSON.parse(line)
          if (!row || typeof row !== 'object' || Array.isArray(row) || typeof row.timestamp !== 'string' || !Number.isFinite(Date.parse(row.timestamp))) throw new Error('Invalid row')
          row = sanitize(row)
        } catch { corruptRows++; continue }
        if (file.category !== 'audit' && (row.event === 'monitoring.viewed' || (['request.completed', 'request.aborted', 'request.timing'].includes(row.event) && isMonitoringRequest(row.route)))) continue
        let session
        if (query.business) {
          const time = Date.parse(row.timestamp)
          const outcome = readableStatus({ ...row, category: file.category })
          const reason = outcome === 'Failed' ? recordedReason(row) : undefined
          const tab = logTab(row, file.category)
          if (time < Math.max(start, current - (tab === 'admin' ? ADMIN_RETENTION_DAYS : retentionDays) * DAY_MS) || time > end) continue
          const item = { ...row, category: file.category }
          const background = isBackgroundCall(item)
          if (query.tab && tab !== query.tab && !(grouped && tab === 'errors' && validVisitorSession(row.sessionId) && belongsToSessionTab(item, query.tab))) continue
          if (query.checkoutOnly && !isCheckout(row) && !grouped) continue
          if (query.customerOnly && !isCustomerActivity(row, file.category)) continue
          if (query.visitSession && row.sessionId !== query.visitSession) continue
          if (query.sessionPrefix && !row.sessionId?.startsWith(query.sessionPrefix)) continue
          if (grouped && validVisitorSession(row.sessionId) && belongsToSessionTab(item, query.tab)) session = addSessionEvent(sessions, item, background)
          if (query.checkoutOnly && !isCheckout(row)) continue
          if (background && (grouped && !query.includeBackground || journey && query.includeBackground === false)) continue
          if (query.source && logSource(row, file.category) !== query.source) continue
          if (query.phoneHash && row.phoneLookupHash !== query.phoneHash) continue
          if (maskedCustomers && !maskedCustomers.has(row.verifiedCustomerId)) continue
          if (query.reason && reason !== query.reason) continue
          if (query.pin && (row.enteredPincode || row.deliveryPin) !== query.pin) continue
          const coverage = row.pincodeServiceable ?? ({ serviceable: true, unserviceable: false })[row.deliveryCoverage]
          if (query.coverage && (typeof coverage !== 'boolean' || String(coverage) !== query.coverage)) continue
          const app = ['android', 'ios'].includes(row.platform)
          if (query.device === 'app' && !app || query.device === 'website' && row.platform !== 'website') continue
          if (!session && query.status && outcome !== query.status) continue
          if (app) summary.app++
          if (row.platform === 'website') summary.website++
          if (reason && countableActivity(row, file.category)) {
            const key = activityKey(row)
            const previous = failures.get(key)
            if (!previous || previous.reason === 'UNKNOWN' && reason !== 'UNKNOWN') {
              failures.set(key, { reason, checkout: isCheckout(row) || previous?.checkout, pin: row.enteredPincode || row.deliveryPin })
            }
          }
        }
        if (!session && query.status && (['Successful', 'Failed', 'Warning', 'Pending'].includes(query.status) ? readableStatus({ ...row, category: file.category }) !== query.status : ![row.status, row.outcome].some((value) => String(value ?? '') === query.status))) continue
        if (query.user && ![row.actorId, row.userId].some((v) => String(v || '').includes(query.user))) continue
        if (query.orderId && ![row.orderId, row.orderNo, row.razorpayOrderId, row.razorpayPaymentId, row.new?.orderNo, row.resourceId].some((v) => String(v || '').includes(query.orderId))) continue
        if (query.ip && row.ip !== query.ip) continue
        if (query.search) {
          const needle = query.search.toLowerCase()
          if (!JSON.stringify(row).toLowerCase().includes(needle) && !JSON.stringify(presentLog({ ...row, category: file.category })).toLowerCase().includes(needle)) continue
        }
        if (session) { session.matched = true; continue }
        yield { ...row, category: file.category, file: file.name }
    }
  }
  // Merge category streams for each day. Keep one head per category,
  // plus the requested page; do not load daily files or earlier pages into RAM.
  async function* matchingLegacy(rows) {
    for (const row of rows.sort((a, b) => b.timestamp.localeCompare(a.timestamp))) {
      if (query.reason && query.reason !== row.reasonCode) continue
      summary.website++
      failures.set(activityKey(row), { reason: row.reasonCode })
      yield row
    }
  }
  for (const date of [...new Set([...list.map(file => file.date), ...legacy.keys()])].sort().reverse()) {
    const streams = list.filter((file) => file.date === date).map((file) => ({ iterator: matching(file) }))
    if (legacy.has(date)) streams.push({ iterator: matchingLegacy(legacy.get(date)) })
    try {
      for (const stream of streams) stream.head = await stream.iterator.next()
      while (true) {
        const available = streams.filter((stream) => !stream.head.done)
        if (!available.length) break
        available.sort((a, b) => String(b.head.value.recoveredAt || b.head.value.timestamp).localeCompare(String(a.head.value.recoveredAt || a.head.value.timestamp)) || b.head.value.file.localeCompare(a.head.value.file))
        const stream = available[0]
        if (journey) {
          rows.push(stream.head.value)
          if (rows.length > offset + perPage) rows.shift()
        } else if (grouped ? rows.length < offset + perPage : total >= offset && rows.length < perPage) rows.push(stream.head.value)
        total++
        stream.head = await stream.iterator.next()
      }
    } finally { for (const stream of streams) await stream.iterator.return() }
  }
  for (const { reason, checkout, pin } of failures.values()) {
    if (checkout) summary.failedCheckouts++
    if (reason === 'UNKNOWN') summary.unclassified++
    else summary.reasons[reason] = (summary.reasons[reason] || 0) + 1
    if (reason === 'PINCODE_NOT_SERVICEABLE' && /^\d{6}$/.test(pin || '')) summary.pincodes[pin] = (summary.pincodes[pin] || 0) + 1
  }
  let pageRows = rows
  if (journey) {
    const chronological = carryTimelineDelivery(rows.reverse().sort((a, b) => a.timestamp.localeCompare(b.timestamp)))
    // Journey pages are collected from the oldest end of the log.
    pageRows = chronological.slice(offset, offset + perPage)
  }
  if (grouped) {
    const matchedSessions = [...sessions.values()].filter(session => session.matched).map(finishSession)
      .filter(session => !query.status || readableStatus(session) === query.status)
    total += matchedSessions.length
    pageRows = [...rows, ...matchedSessions].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(offset, offset + perPage)
  }
  return { rows: pageRows, total, page, perPage, summary, insights: query.includeInsights ? await readInsights(allFiles, false, current) : undefined, files: list, days: [...new Set(allFiles.filter(file => !query.category || file.category === query.category).map(file => file.date))].sort().reverse(), totalBytes, corruptRows }
}
let chain = Promise.resolve()
if (!readerOnly) setInterval(() => {
  if (ready) chain = chain.then(() => cleanup()).catch(() => {})
}, 3600000).unref()
parentPort.on('message', (message) => {
  chain = chain.then(async () => {
    try {
      await init()
      if (message.type === 'write') {
        await write(message)
        parentPort.postMessage({ ack: 1, eventId: message.eventId })
      } else {
        const result = message.type === 'read' ? await read(message.query) : message.type === 'deliver' ? await write(message.query) : await cleanup()
        parentPort.postMessage({ id: message.id, result })
      }
    } catch {
      parentPort.postMessage(message.type === 'write' ? { ack: 1, failed: 1, eventId: message.eventId } : { id: message.id, error: 'Log storage is unavailable.' })
    }
  })
})
const timer = setInterval(() => { chain = chain.then(async () => { if (ready && !readerOnly) await cleanup() }).catch(() => {}) }, 60000)
timer.unref()
