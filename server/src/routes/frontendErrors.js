import express from 'express'
import { log } from '../monitoring/index.js'
import { safePage } from '../../../shared/monitoring.js'
import { createFrontendErrorWriter, sanitizeEvent } from '../services/frontendErrors.js'

export function createFrontendErrorsRouter({ allowedOrigins, write = createFrontendErrorWriter({ cleanupInterval: 3600000 }), perMinute = 60 } = {}) {
  const router = express.Router()
  const origins = new Set(allowedOrigins)
  const clients = new Map()
  let windowStart = Date.now(), total = 0, lastWriteWarning = 0
  router.post('/', (req, res, next) => {
    res.set('Cache-Control', 'no-store')
    if (!origins.has(req.get('origin'))) return res.sendStatus(403)
    if (Date.now() - windowStart >= 60000) { clients.clear(); total = 0; windowStart = Date.now() }
    const key = req.ip
    const count = clients.get(key) || 0
    if (count >= perMinute || total >= 3000 || (clients.size >= 10000 && !clients.has(key))) {
      return res.set('Retry-After', '60').sendStatus(429)
    }
    clients.set(key, count + 1); total++
    next()
  }, express.json({ limit: '32kb', strict: true }), async (req, res) => {
    const input = req.body?.events
    if (!Array.isArray(input) || !input.length || input.length > 5) return res.sendStatus(400)
    const events = input.map(sanitizeEvent)
    if (events.some((event) => !event)) return res.sendStatus(400)
    try {
      await write(events.map(event => ({ ...event, activityLogged: true })))
      for (const event of events) {
        let page
        try { page = safePage(new URL(event.page).pathname) } catch {}
        const reasonCode = { resource: 'RESOURCE_LOAD_FAILED', network: 'NETWORK_ERROR', http: 'UNKNOWN' }[event.kind] || 'BROWSER_ERROR'
        log('website', 'frontend.error', { reasonCode, httpStatus: event.status, source: 'website', origin: 'browser', status: 'failure', page: page?.pageLabel, pagePath: page?.pagePath })
      }
      return res.sendStatus(204)
    } catch {
      if (Date.now() - lastWriteWarning > 60000) {
        console.error('Website frontend error log could not be written')
        lastWriteWarning = Date.now()
      }
      return res.sendStatus(503)
    }
  })
  router.use((error, _req, res, _next) => res.sendStatus(error.status === 413 ? 413 : 400))
  return router
}
