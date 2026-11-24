import { randomUUID, createHmac } from 'node:crypto'
import { env } from '../config/env.js'
import { readMetaConversionsConfig } from '../services/metaConversions.js'
import { requireCustomer, resolveCustomer } from '../middleware/customerAuth.js'
import { prisma } from '../lib/prisma.js'
import { purchaseSummary } from '../services/trackingPurchase.js'
import { Router } from 'express'
import { getPublicTrackingConfig } from '../services/trackingConfig.js'
import { cookieValue, metaAttribution } from '../utils/metaAttribution.js'
import { metaClientData, metaCustomerData } from '../services/metaMatching.js'
import { metaSearchTerm } from '../../../shared/metaSearch.js'
import { logContext } from '../monitoring/index.js'

const router = Router()
const sessions = new Map()
const eventNames = new Set(['PageView', 'ViewContent', 'Search', 'AddToCart', 'InitiateCheckout', 'AddPaymentInfo', 'Scroll', 'CompleteRegistration'])
const sessionKey = (token) => createHmac('sha256', env.sessionSecret).update(token).digest('hex')

function skipMeasurement(res, trackingRejection) {
  const context = logContext.getStore()
  if (context) context.accessFacts = { trackingRejection }
  return res.sendStatus(403)
}

router.get('/config', (_req, res) => {
  res.set('Cache-Control', 'no-store')
  const config = getPublicTrackingConfig()
  let token = cookieValue(_req, 'tokri_tracking')
  if (!token || !/^[a-f0-9-]{36}$/i.test(token) || (sessions.get(token)?.expires ?? 0) <= Date.now()) token = randomUUID()
  if (!sessions.has(token)) {
    if (sessions.size > 10000) sessions.clear()
    sessions.set(token, { expires: Date.now() + 3600000, count: 0 })
    res.cookie('tokri_tracking', token, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 3600000, path: '/api/v1/tracking' })
  }
  res.json({ ...config, eventToken: sessionKey(token) })
})
router.post('/events', async (req, res, next) => {
  try {
    const config = readMetaConversionsConfig()
    const publicConfig = getPublicTrackingConfig()
    const token = cookieValue(req, 'tokri_tracking')
    const session = sessions.get(token)
    if (!config) return skipMeasurement(res, 'disabled')
    if (cookieValue(req, 'tokriii_marketing_consent') !== 'granted') return skipMeasurement(res, 'no_permission')
    if (!session || session.expires < Date.now()) return skipMeasurement(res, 'expired_session')
    if (session.count >= 120) return skipMeasurement(res, 'session_limit')
    if (req.body?.eventToken !== sessionKey(token)) return skipMeasurement(res, 'invalid_session')
    if (['android', 'ios'].includes(req.get('x-app-platform')?.toLowerCase())) return res.sendStatus(400)
    const { eventName, eventId, sourceUrl, ecommerce, searchTerm, addressId } = req.body
    if (!eventNames.has(eventName) || !/^[a-f0-9-]{36}$/i.test(eventId || '')) return res.sendStatus(400)
    let url
    try { url = new URL(sourceUrl) } catch { return res.sendStatus(400) }
    if (url.protocol !== 'https:' || !publicConfig.allowedHosts.includes(url.hostname) || url.search || url.hash || /@|%40/i.test(url.pathname) || url.pathname.length > 512 || /^\/order(?:\/|$)/.test(url.pathname)) return res.sendStatus(400)
    const custom = eventName === 'Scroll' ? { percent_scrolled: 90 } : {}
    if (eventName === 'Search' && searchTerm !== undefined) {
      const term = metaSearchTerm(searchTerm)
      if (!term) return res.sendStatus(400)
      custom.search_string = term
    }
    if (ecommerce) {
      if (!Array.isArray(ecommerce.items) || ecommerce.items.length > 200 || !Number.isFinite(ecommerce.value) || ecommerce.value < 0 || !/^[A-Z]{3}$/.test(ecommerce.currency)) return res.sendStatus(400)
      custom.value = ecommerce.value; custom.currency = ecommerce.currency
      custom.contents = ecommerce.items.map((item) => {
        if (typeof item?.item_id !== 'string' || !/^[a-z0-9_-]{1,100}$/i.test(item.item_id) || !Number.isSafeInteger(item.quantity) || item.quantity < 1) throw Object.assign(new Error('Invalid event'), { status: 400 })
        return { id: item.item_id, quantity: item.quantity }
      })
      custom.content_ids = custom.contents.map(({ id }) => id)
      custom.content_type = 'product'
    }
    session.count++
    // Only a verified browser bearer credential may add stored customer identity.
    const customer = /^Bearer\s+\S+$/i.test(req.get('authorization') || '')
      ? await resolveCustomer(req).catch(() => null) : null
    if (eventName === 'CompleteRegistration' && !customer) return res.sendStatus(401)
    const address = ['InitiateCheckout', 'AddPaymentInfo'].includes(eventName) && typeof addressId === 'string' && Array.isArray(customer?.addresses)
      ? customer.addresses.find(row => row?.id === addressId) : undefined
    if (sessions.get(token) !== session) return skipMeasurement(res, 'expired_session')
    await prisma.trackingDelivery.createMany({ skipDuplicates: true, data: { id: eventId, sessionId: sessionKey(token), pixelId: config.pixelId, payload: { event_name: eventName, event_id: eventId, event_time: Math.floor(Date.now() / 1000), action_source: 'website', event_source_url: url.href, user_data: { ...metaClientData(req.ip, req.get('user-agent')), ...metaAttribution(req), ...metaCustomerData(customer, address) }, custom_data: custom } } })
    return res.sendStatus(202)
  } catch (error) { next(error) }
})
router.post('/revoke-session', async (req, res, next) => {
  try {
    const token = cookieValue(req, 'tokri_tracking')
    if (!token || req.body?.eventToken !== sessionKey(token)) return res.sendStatus(403)
    sessions.delete(token)
    await prisma.trackingDelivery.deleteMany({ where: { sessionId: sessionKey(token), sentAt: null } })
    res.sendStatus(204)
  } catch (error) { next(error) }
})
router.post('/revoke', (req, res, next) => {
  if (!/^Bearer /i.test(req.headers.authorization || '')) return res.sendStatus(401)
  next()
}, requireCustomer, async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({ where: { customerId: req.customer.id }, select: { id: true, trackingContext: true } })
    for (const order of orders) if (order.trackingContext) {
      const { match: _match, ...context } = order.trackingContext
      await prisma.order.update({ where: { id: order.id }, data: { trackingContext: { ...context, marketing: false } } })
    }
    const { purchaseIdentity } = await import('../services/trackingPurchase.js')
    await prisma.trackingDelivery.deleteMany({ where: { id: { in: orders.map((order) => purchaseIdentity(order.id)) }, sentAt: null } })
    res.sendStatus(204)
  } catch (error) { next(error) }
})
router.get('/purchase/:orderNo', (req, res, next) => {
  if (!/^Bearer /i.test(req.headers.authorization || '')) return res.status(401).json({ message: 'Please log in.' })
  next()
}, requireCustomer, async (req, res, next) => {
  try {
    res.set('Cache-Control', 'no-store')
    const order = await prisma.order.findFirst({ where: { orderNo: req.params.orderNo, customerId: req.customer.id }, include: { items: { include: { product: { select: { slug: true } } } } } })
    if (!order || order.trackingContext?.source !== 'web' || !(order.trackingContext.analytics || order.trackingContext.marketing) || !(order.paymentStatus === 'paid' || (order.paymentMode === 'cod' && order.trackingContext?.codConfirmed))) return res.status(404).json({ message: 'Confirmed purchase not found.' })
    res.json(purchaseSummary(order))
  } catch (error) { next(error) }
})
export default router
