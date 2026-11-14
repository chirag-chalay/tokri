import { logDurable } from '../monitoring/index.js'
import { verifyRazorpayWebhook } from '../services/razorpay.js'
import { markOrderPaidByQr } from '../services/partnerOrders.js'
import { markOnlineOrderPaidFromWebhook, reconcileOnlineOrderFromRazorpay } from '../services/checkout.js'
import { prisma } from '../lib/prisma.js'

function extractOrderNo(payload) {
  const payment = payload?.payload?.payment?.entity || {}
  const paymentLink = payload?.payload?.payment_link?.entity || {}
  const qr = payload?.payload?.qr_code?.entity || {}
  const order = payload?.payload?.order?.entity || {}
  return (
    payment.notes?.orderNo ||
    order.notes?.orderNo ||
    paymentLink.notes?.orderNo ||
    qr.notes?.orderNo ||
    order.receipt ||
    paymentLink.reference_id ||
    null
  )
}

function extractPaymentId(payload) {
  return payload?.payload?.payment?.entity?.id || payload?.payload?.payment_link?.entity?.id || payload?.payload?.refund?.entity?.payment_id || null
}

function extractRazorpayOrderId(payload) {
  return payload?.payload?.payment?.entity?.order_id || payload?.payload?.order?.entity?.id || null
}

const PAID_EVENTS = new Set([
  'payment.captured',
  'payment.authorized',
  'order.paid',
  'payment_link.paid',
  'qr_code.credited',
])

export async function handleRazorpayWebhook(req, res, next) {
  const providerEventId = /^[a-zA-Z0-9_-]{1,100}$/.test(req.headers['x-razorpay-event-id'] || '') ? req.headers['x-razorpay-event-id'] : undefined
  try {
    const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body || {}))
    await verifyRazorpayWebhook(raw, req.headers['x-razorpay-signature'])

    const payload = JSON.parse(raw.toString('utf8'))
    const event = String(payload?.event || '')
    const webhookStatus = { 'payment.failed': 'failed', 'payment.captured': 'paid', 'refund.created': 'pending', 'refund.processed': 'refunded', 'refund.failed': 'failed' }[event] || 'verified'
    await logDurable('payment', 'webhook.received', { provider: 'razorpay', providerEventId, status: webhookStatus,
      outcome: /^[a-z_]+\.[a-z_]+$/.test(event) && event.length < 60 ? event : 'unknown',
      orderNo: extractOrderNo(payload), razorpayPaymentId: extractPaymentId(payload),
      refundId: payload?.payload?.refund?.entity?.id, amount: payload?.payload?.refund?.entity?.amount })
    if (!PAID_EVENTS.has(event)) {
      await logDurable('payment', 'webhook.completed', { status: 'ignored', providerEventId, orderNo: extractOrderNo(payload) })
      return res.json({ ok: true, ignored: event })
    }

    const orderNo = extractOrderNo(payload)
    const paymentId = extractPaymentId(payload)
    const razorpayOrderId = extractRazorpayOrderId(payload)

    let matchedOrder = null
    if (event === 'payment.captured' || event === 'payment.authorized' || event === 'order.paid') {
      let marked = null
      if (event === 'payment.captured') {
        marked = await markOnlineOrderPaidFromWebhook({ orderNo, razorpayOrderId, paymentId, capturedPayment: payload?.payload?.payment?.entity })
      }
      if (!marked && razorpayOrderId) {
        const order = await prisma.order.findFirst({ where: { razorpayOrderId } })
        if (order) {
          const result = await reconcileOnlineOrderFromRazorpay(order)
          marked = result.status === 'paid' ? result.order : null
        }
      }
      if (!marked && orderNo && event === 'payment.captured') {
        marked = await markOrderPaidByQr({ orderNo, paymentId })
      }
      matchedOrder = marked
    } else {
      matchedOrder = await markOrderPaidByQr({ orderNo, paymentId })
    }

    await logDurable('payment', 'webhook.completed', { status: 'success', outcome: matchedOrder ? 'matched' : 'unmatched', providerEventId, orderNo, razorpayPaymentId: paymentId })
    res.json({ ok: true })
  } catch (error) {
    await logDurable('payment', 'webhook.completed', { status: 'failure', providerEventId })
    next(error)
  }
}
