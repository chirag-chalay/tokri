import { Router, json } from 'express'
import { randomUUID } from 'node:crypto'
import { env } from '../config/env.js'
import { prisma } from '../lib/prisma.js'
import { browserEvents, safePage, safeEndpoint, productReference } from '../../../shared/monitoring.js'
import { log, logContext, websiteDebugState, subscribeWebsiteDebug } from './index.js'

export function createWebsiteMonitoringRouter(client = prisma) {
  const router = Router(), buckets = new Map(), seen = new Map(), streams = new Map()
  let pending = 0, streamCount = 0
  const origins = new Set([env.clientUrl, env.appUrl].map(value => { try { return new URL(value).origin } catch { return '' } }))
  for (const origin of [...origins]) { try { const url = new URL(origin); if (['localhost', '127.0.0.1'].includes(url.hostname)) { url.hostname = url.hostname === 'localhost' ? '127.0.0.1' : 'localhost'; origins.add(url.origin) } } catch { /* invalid configuration does not broaden origin access */ } }
  function allowed(req) {
    const origin = req.get('origin')
    if (!origin) return req.method === 'GET' || req.get('sec-fetch-site') === 'same-origin'
    try { const parsed = new URL(origin); return ['http:', 'https:'].includes(parsed.protocol) && (origins.has(parsed.origin) || parsed.host === req.get('host')) } catch { return false }
  }
  function rate(key, count, limit) {
    const now = Date.now()
    for (const [id, value] of buckets) if (value.until <= now) buckets.delete(id)
    if (buckets.size > 2000 && !buckets.has(key)) return false
    let bucket = buckets.get(key)
    if (!bucket) { bucket = { count: 0, until: now + 60000 }; buckets.set(key, bucket) }
    if (bucket.count + count > limit) return false
    bucket.count += count; return true
  }
  router.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next() })
  router.get('/stream', (req, res) => {
    if (!allowed(req)) return res.sendStatus(403)
    const key = req.ip || 'unknown'
    if (streamCount >= 500 || (streams.get(key) || 0) >= 10) return res.sendStatus(429)
    streams.set(key, (streams.get(key) || 0) + 1); streamCount++
    // Next's proxy compression buffers small frames unless transformations are
    // explicitly disabled. Control updates must reach the browser immediately.
    res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store, no-transform', 'Content-Encoding': 'identity', 'X-Accel-Buffering': 'no', Connection: 'keep-alive' })
    res.flushHeaders()
    const send = state => { if (!res.destroyed && res.writableLength < 4096) res.write(`data: ${JSON.stringify(state)}\n\n`); else res.destroy() }
    const unsubscribe = subscribeWebsiteDebug(send, () => res.end())
    send(websiteDebugState())
    const heartbeat = setInterval(() => { if (!res.destroyed && res.writableLength < 4096) res.write(': keepalive\n\n'); else res.destroy() }, 25000)
    heartbeat.unref()
    let closed = false
    res.once('close', () => { if (closed) return; closed = true; clearInterval(heartbeat); unsubscribe(); streamCount--; const count = (streams.get(key) || 1) - 1; if (count) streams.set(key, count); else streams.delete(key) })
  })
  router.get('/status', (_req, res) => res.json(websiteDebugState()))
  router.post('/events', json({ limit: '16kb' }), async (req, res) => {
    if (!allowed(req)) return res.sendStatus(403)
    const packet = req.body
    if (!packet || !Array.isArray(packet.events) || packet.events.length > 25 || Buffer.byteLength(JSON.stringify(packet)) > 16384) return res.sendStatus(400)
    const ip = req.ip || 'unknown'
    if (pending >= 4 || !rate(ip, packet.events.length, 240) || !rate('[global]', packet.events.length, 2400)) return res.sendStatus(429)
    pending++
    try {
      const state = websiteDebugState()
      const debug = Boolean(state.debugUntil && state.generation === packet.generation)
      const candidates = packet.events.filter(row => row && browserEvents.has(row.event) && (row.event === 'website.navigation' || debug) && /^[a-f0-9-]{36}$/i.test(row.id || '') && safePage(row.path))
      const refs = [...new Set(candidates.map(row => productReference(row.productRef)).filter(Boolean))]
      let products = []
      if (refs.length) { try { products = await client.product.findMany({ where: { isActive: true, OR: [{ slug: { in: refs } }, { id: { in: refs } }] }, select: { id: true, slug: true, name: true } }) } catch { /* The event remains readable without guessing a product identity. */ } }
      const catalog = new Map(products.flatMap(product => [[product.id, product], [product.slug, product]]))
      const publicPages = new Map()
      for (const [prefix, model, where] of [['/blog/', 'blogPost', { isPublished: true }], ['/p/', 'page', { isPublished: true }], ['/category/', 'category', { isActive: true }]]) {
        const slugs = [...new Set(candidates.filter(row => safePage(row.path).pagePath.startsWith(prefix)).map(row => productReference(row.pageRef)).filter(Boolean))]
        if (slugs.length) { try { const values = await client[model].findMany({ where: { ...where, slug: { in: slugs } }, select: { slug: true } }); for (const value of values) publicPages.set(prefix + value.slug, true) } catch { /* Keep a redacted URL if its public reference cannot be verified. */ } }
      }
      const now = Date.now()
      for (const [id, until] of seen) if (until <= now) seen.delete(id)
      let accepted = 0
      for (const row of candidates) {
        if (seen.has(row.id)) continue
        const current = websiteDebugState()
        if (row.event !== 'website.navigation' && (!current.debugUntil || current.generation !== packet.generation)) continue
        const page = safePage(row.path), product = catalog.get(row.productRef)
        const data = { origin: 'browser', clientEventId: row.id, page: page.pageLabel, pagePath: page.pagePath }
        if (product) { data.product = product.name; if (page.pagePath === '/product/[product]') data.pagePath = `/product/${product.slug}` }
        const prefix = ['/blog/', '/p/', '/category/'].find(value => page.pagePath.startsWith(value))
        if (prefix && publicPages.has(prefix + row.pageRef)) data.pagePath = prefix + row.pageRef
        if (['initial', 'client', 'back_forward'].includes(row.navigationType)) data.navigationType = row.navigationType
        if (Number.isInteger(row.status) && row.status >= 100 && row.status <= 599) data.httpStatus = row.status
        if (['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(row.method)) data.method = row.method
        if (safeEndpoint(row.endpoint)) data.route = safeEndpoint(row.endpoint)
        if (Number.isFinite(row.durationMs) && row.durationMs >= 0 && row.durationMs <= 300000) data.durationMs = Math.round(row.durationMs)
        if (Number.isInteger(row.quantity) && row.quantity >= 0 && row.quantity <= 10000) data.quantity = row.quantity
        if (Number.isInteger(row.count) && row.count >= 0 && row.count <= 1000) data.count = row.count
        if (['morning', 'express'].includes(row.deliveryOption)) data.deliveryOption = row.deliveryOption
        if (['product image', 'image', 'script', 'stylesheet'].includes(row.resourceKind)) data.resourceKind = row.resourceKind
        if (/^[a-f0-9-]{36}$/i.test(row.relatedRequestId || '')) data.relatedRequestId = row.relatedRequestId
        data.status = row.event.includes('failed') || row.event === 'frontend.error' || (data.httpStatus >= 400) ? 'failure' : row.event === 'website.navigation' && !data.httpStatus ? 'observed' : 'success'
        // Never persist client IP, customer identity, cookies, form values, error
        // messages, stack traces, URLs with queries, or arbitrary event metadata.
        logContext.run({ id: randomUUID(), req: {} }, () => log(row.event === 'website.navigation' ? 'website' : 'debug', row.event, data))
        seen.set(row.id, now + 300000)
        while (seen.size > 5000) seen.delete(seen.keys().next().value)
        accepted++
      }
      return res.status(202).json({ accepted })
    } finally { pending-- }
  })
  router.use((_req, res) => res.sendStatus(404))
  router.use((_error, _req, res, _next) => res.status(400).json({ message: 'Invalid monitoring request.' }))
  return router
}
export default createWebsiteMonitoringRouter()
