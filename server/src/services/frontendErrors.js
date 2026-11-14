import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const defaultDirectory = fileURLToPath(new URL('../../logs', import.meta.url))
const kinds = new Set(['javascript', 'unhandledrejection', 'resource', 'console', 'http', 'network'])

export function sanitizeText(value, limit = 800) {
  return (typeof value === 'string' ? value : '')
    .replace(/https?:\/\/[^\s<>"')]+/gi, sanitizeUrl)
    .replace(/\bbearer\s+[\w.+/=-]+/gi, 'Bearer [redacted]')
    .replace(/\b(token|password|secret|otp|authorization|cookie|email|phone)\s*[:=]\s*[^\s,;]+/gi, '$1=[redacted]')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]')
    .replace(/\b\d{6,}\b/g, '[number]').slice(0, limit)
}

export function sanitizeUrl(value) {
  try {
    const url = new URL(typeof value === 'string' ? value : '')
    if (!['http:', 'https:'].includes(url.protocol)) return '[non-http]'
    return `${url.origin}${url.pathname}`
      .replace(/\/(order|checkout|account|auth)(?:\/[^\s]*)?/gi, '/$1/[redacted]')
      .replace(/[A-Z0-9._%+-]+(?:@|%40)[A-Z0-9.-]+/gi, '[email]')
      .replace(/\b\d{6,}\b/g, '[number]').slice(0, 500)
  } catch { return '[unknown]' }
}

export function sanitizeEvent(event) {
  if (!event || !kinds.has(event.kind) || typeof event.message !== 'string') return null
  return {
    receivedAt: new Date().toISOString(), sourceType: 'website-frontend',
    kind: event.kind, message: sanitizeText(event.message),
    page: sanitizeUrl(event.page), source: sanitizeUrl(event.source),
    stack: sanitizeText(event.stack, 3000),
    status: Number.isInteger(event.status) && event.status >= 0 && event.status <= 599 ? event.status : undefined,
    line: Number.isInteger(event.line) && event.line > 0 ? event.line : undefined,
    column: Number.isInteger(event.column) && event.column > 0 ? event.column : undefined,
  }
}

// Serialize rotation/writes, bound the backlog, and keep 4 files of at most 5 MiB.
export function createFrontendErrorWriter({ directory = process.env.FRONTEND_ERROR_LOG_DIR || defaultDirectory, maxBytes = 5 * 1024 * 1024 } = {}) {
  let pending = Promise.resolve(), queued = 0
  return async function write(events) {
    if (queued >= 100) throw new Error('Frontend log backlog full')
    queued++
    const task = pending.then(async () => {
      await fs.mkdir(directory, { recursive: true, mode: 0o700 })
      const filename = path.join(directory, 'website-frontend-errors.jsonl')
      const data = events.map((event) => JSON.stringify(event)).join('\n') + '\n'
      const size = await fs.stat(filename).then((stat) => stat.size).catch((error) => { if (error.code === 'ENOENT') return 0; throw error })
      if (size + Buffer.byteLength(data) > maxBytes) {
        await fs.rm(`${filename}.3`, { force: true })
        for (let index = 2; index >= 0; index--) {
          await fs.rename(index ? `${filename}.${index}` : filename, `${filename}.${index + 1}`)
            .catch((error) => { if (error.code !== 'ENOENT') throw error })
        }
      }
      await fs.appendFile(filename, data, { mode: 0o600 })
    })
    pending = task.catch(() => {}).finally(() => { queued-- })
    return task
  }
}
