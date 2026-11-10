import { parentPort, workerData } from 'node:worker_threads'
import fs from 'node:fs/promises'
import { createInterface } from 'node:readline'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { categories, sanitize, istDate } from './sanitize.js'

const { directory, maxBytes, retentionDays, readerOnly } = workerData
const filePattern = /^(access|error|audit|debug|payment|account)-\d{4}-\d{2}-\d{2}\.log$/
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
    if (info?.isFile() && !info.isSymbolicLink()) result.push({ name, size: info.size, date: name.slice(-14, -4), category: name.split('-')[0] })
  }
  return result.sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name))
}
async function cleanup(required = 0) {
  const list = await files()
  totalBytes = list.reduce((sum, f) => sum + f.size, 0)
  const cutoff = istDate(new Date(Date.now() - (retentionDays - 1) * 86400000))
  for (const file of list) {
    if (file.date < cutoff || totalBytes + required > maxBytes) {
      const diskPressure = file.date >= cutoff
      await fs.unlink(path.join(directory, file.name))
      dedupeIndexes.delete(path.join(directory, file.name))
      parentPort.postMessage({ pruned: { count: 1, bytes: file.size, diskPressure } })
      totalBytes -= file.size
    }
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
  const filename = path.join(directory, `${category}-${date}.log`)
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
  const handle = await fs.open(path.join(directory, file.name), constants.O_RDONLY | constants.O_NOFOLLOW).catch((error) => { if (error.code === 'ENOENT') return null; throw error })
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
async function read(query) {
  const allFiles = await files()
  totalBytes = allFiles.reduce((sum, f) => sum + f.size, 0)
  const list = allFiles.filter((f) => (!query.category || f.category === query.category) && (!query.date || f.date === query.date)).reverse()
  const perPage = Number(query.perPage) === 100 ? 100 : 50
  const page = Math.max(1, Math.min(100000, Math.floor(Number(query.page)) || 1))
  const offset = (page - 1) * perPage
  let total = 0, corruptRows = 0
  const rows = []
  async function* matching(file) {
    for await (const line of reverseLines(file)) {
        let row
        try {
          row = JSON.parse(line)
          if (!row || typeof row !== 'object' || Array.isArray(row) || typeof row.timestamp !== 'string' || !Number.isFinite(Date.parse(row.timestamp))) throw new Error('Invalid row')
          row = sanitize(row)
        } catch { corruptRows++; continue }
        if (query.status && ![row.status, row.outcome].some((value) => String(value ?? '') === query.status)) continue
        if (query.user && ![row.actorId, row.userId].some((v) => String(v || '').includes(query.user))) continue
        if (query.orderId && ![row.orderId, row.orderNo, row.razorpayOrderId, row.razorpayPaymentId, row.new?.orderNo, row.resourceId].some((v) => String(v || '').includes(query.orderId))) continue
        if (query.ip && row.ip !== query.ip) continue
        if (query.search && !JSON.stringify(row).toLowerCase().includes(query.search.toLowerCase())) continue
        yield { ...row, category: file.category, file: file.name }
    }
  }
  // Merge the six category streams for each day. Keep one head per category,
  // plus the requested page; do not load daily files or earlier pages into RAM.
  for (const date of [...new Set(list.map((file) => file.date))]) {
    const streams = list.filter((file) => file.date === date).map((file) => ({ iterator: matching(file) }))
    try {
      for (const stream of streams) stream.head = await stream.iterator.next()
      while (true) {
        const available = streams.filter((stream) => !stream.head.done)
        if (!available.length) break
        available.sort((a, b) => String(b.head.value.recoveredAt || b.head.value.timestamp).localeCompare(String(a.head.value.recoveredAt || a.head.value.timestamp)) || b.head.value.file.localeCompare(a.head.value.file))
        const stream = available[0]
        if (total >= offset && rows.length < perPage) rows.push(stream.head.value)
        total++
        stream.head = await stream.iterator.next()
      }
    } finally { for (const stream of streams) await stream.iterator.return() }
  }
  return { rows, total, page, perPage, files: list, totalBytes, corruptRows }
}
let chain = Promise.resolve()
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
