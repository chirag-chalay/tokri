import { randomUUID, createHmac } from 'node:crypto'
import { env } from '../config/env.js'
import { readMetaConversionsConfig } from '../services/metaConversions.js'
import { requireCustomer } from '../middleware/customerAuth.js'
import { prisma } from '../lib/prisma.js'
import { purchaseSummary } from '../services/trackingPurchase.js'
import { Router } from 'express'
import { getPublicTrackingConfig } from '../services/trackingConfig.js'

const router = Router()
const sessions = new Map()
const cookieValue = (req, name) => String(req.headers.cookie || '').split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1)
const sessionKey = (token) => createHmac('sha256', env.sessionSecret).update(token).digest('hex')

router.get('/config', (_req, res) => {
  res.set('Cache-Control', 'no-store')
  const config = getPublicTrackingConfig()
  let token = cookieValue(_req, 'tokri_tracking')
  if (!token || !/^[a-f0-9-]{36}$/i.test(token)) token = randomUUID()
  if (!sessions.has(token)) {
    if (sessions.size > 10000) sessions.clear()
    sessions.set(token, { expires: Date.now() + 3600000, count: 0, eventIds: [] })
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
    if (!config || !session || session.expires < Date.now() || session.count >= 120 || req.body?.eventToken !== sessionKey(token) || cookieValue(req, 'tokriii_marketing_consent') !== 'granted') return res.sendStatus(403)
    const names = new Set(['PageView', 'ViewContent', 'Search', 'AddToCart', 'InitiateCheckout', 'AddPaymentInfo'])
    const { eventName, eventId, sourceUrl, ecommerce } = req.body
    if (!names.has(eventName) || !/^[a-f0-9-]{36}$/i.test(eventId || '')) return res.sendStatus(400)
    const url = new URL(sourceUrl)
    if (url.protocol !== 'https:' || !publicConfig.allowedHosts.includes(url.hostname) || url.search || url.hash || /@|%40/i.test(url.pathname) || url.pathname.length > 512 || /^\/order(?:\/|$)/.test(url.pathname)) return res.sendStatus(400)
    const custom = {}
    if (ecommerce) {
      if (!Array.isArray(ecommerce.items) || ecommerce.items.length > 200 || !Number.isFinite(ecommerce.value) || ecommerce.value < 0 || !/^[A-Z]{3}$/.test(ecommerce.currency)) return res.sendStatus(400)
      custom.value = ecommerce.value; custom.currency = ecommerce.currency
      custom.contents = ecommerce.items.map((item) => {
        if (typeof item.item_id !== 'string' || item.item_id.length > 100 || !Number.isSafeInteger(item.quantity) || item.quantity < 1) throw Object.assign(new Error('Invalid event'), { status: 400 })
        return { id: item.item_id, quantity: item.quantity }
      })
      custom.content_type = 'product'
    }
    session.count++
    session.eventIds.push(eventId)
    await prisma.trackingDelivery.createMany({ skipDuplicates: true, data: { id: eventId, sessionId: sessionKey(token), pixelId: config.pixelId, payload: { event_name: eventName, event_id: eventId, event_time: Math.floor(Date.now() / 1000), action_source: 'website', event_source_url: url.href, user_data: { client_ip_address: req.ip, client_user_agent: String(req.get('user-agent') || '').slice(0, 512) }, custom_data: custom } } })
    return res.sendStatus(202)
  } catch (error) { next(error) }
})
router.post('/revoke-session', async (req, res, next) => {
  try {
    const token = cookieValue(req, 'tokri_tracking')
    const session = sessions.get(token)
    if (!token || req.body?.eventToken !== sessionKey(token)) return res.sendStatus(403)
    await prisma.trackingDelivery.deleteMany({ where: { sessionId: sessionKey(token), sentAt: null } })
    if (session) session.eventIds = []
    res.sendStatus(204)
  } catch (error) { next(error) }
})
router.post('/revoke', (req, res, next) => {
  if (!/^Bearer /i.test(req.headers.authorization || '')) return res.sendStatus(401)
  next()
}, requireCustomer, async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({ where: { customerId: req.customer.id }, select: { id: true, trackingContext: true } })
    for (const order of orders) if (order.trackingContext) await prisma.order.update({ where: { id: order.id }, data: { trackingContext: { ...order.trackingContext, marketing: false } } })
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
