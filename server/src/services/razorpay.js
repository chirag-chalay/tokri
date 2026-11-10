import { logError } from '../monitoring/database.js'
import Razorpay from 'razorpay'
import { logDurable } from '../monitoring/index.js'
import crypto from 'crypto'
import { getRazorpaySettings } from '../utils/razorpaySettings.js'
import { prisma } from '../lib/prisma.js'

async function paymentOperation(event, details, run) {
  await logDurable('payment', event, { ...details, status: 'attempt', provider: 'razorpay' })
  try {
    const result = await run()
    await logDurable('payment', event, { ...details, status: 'success', provider: 'razorpay', outcome: ['captured', 'authorized', 'failed', 'pending', 'processed'].includes(result?.status) ? result.status : undefined })
    return result
  } catch (error) {
    await logDurable('payment', event, { ...details, status: 'failure', provider: 'razorpay', httpStatus: error?.statusCode || error?.status })
    throw error
  }
}

async function getClient() {
  const config = await getRazorpaySettings()
  if (!config.enabled || !config.keyId || !config.keySecret) {
    throw Object.assign(new Error('Razorpay is not configured. Enable it in admin settings.'), {
      status: 400,
      code: 'RAZORPAY_NOT_CONFIGURED',
    })
  }
  return {
    client: new Razorpay({ key_id: config.keyId, key_secret: config.keySecret }),
    config,
  }
}

export async function getPublicPaymentConfig() {
  const [config, settings] = await Promise.all([
    getRazorpaySettings(),
    prisma.setting.findUnique({ where: { id: 1 }, select: { codEnabled: true } }),
  ])
  return {
    razorpay: {
      enabled: config.enabled && Boolean(config.keyId && config.keySecret),
      keyId: config.enabled ? config.keyId : '',
    },
    codEnabled: settings?.codEnabled !== false,
  }
}

export async function createRazorpayOrder({ amountInr, receipt, notes = {} }) {
  const { client } = await getClient()
  const amountPaise = Math.round(Number(amountInr) * 100)

  if (amountPaise < 100) {
    throw Object.assign(new Error('Order total must be at least ₹1.'), { status: 400 })
  }

  return paymentOperation('razorpay.order.create', { orderNo: receipt }, () => client.orders.create({
    amount: amountPaise,
    currency: 'INR',
    receipt,
    notes,
  }))
}

export async function createOrderPaymentLink({ amountInr, orderNo, customer = {} }) {
  const { client } = await getClient()
  const amountPaise = Math.round(Number(amountInr) * 100)
  if (amountPaise < 100) {
    throw Object.assign(new Error('Order total must be at least ₹1.'), { status: 400 })
  }

  const link = await paymentOperation('razorpay.link.create', { orderNo }, () => client.paymentLink.create({
    amount: amountPaise,
    currency: 'INR',
    accept_partial: false,
    reference_id: String(orderNo).slice(0, 40),
    description: `Tokriii order ${orderNo}`,
    customer: {
      name: customer.name || 'Customer',
      contact: customer.phone || undefined,
    },
    notify: { sms: false, email: false },
    reminder_enable: false,
    notes: { orderNo },
  }))

  const shortUrl = link.short_url || ''
  return {
    id: link.id,
    shortUrl,
    qrUrl: shortUrl
      ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(shortUrl)}`
      : '',
  }
}

/** Best-effort cancel so cash-collected COD links cannot be paid twice. */
export async function cancelOrderPaymentLink(paymentLinkId) {
  const id = String(paymentLinkId || '').trim()
  if (!id) return null
  try {
    return await razorpayFetch(`/payment_links/${encodeURIComponent(id)}/cancel`, {
      method: 'POST',
      body: {},
    })
  } catch (error) {
    logError(error, 'payment-link-cancel')
    return null
  }
}

function formatRazorpayError(path, status, payload) {
  const rzp = payload?.error || {}
  const detail =
    rzp.description ||
    rzp.reason ||
    rzp.code ||
    (typeof payload?.message === 'string' ? payload.message : '') ||
    `HTTP ${status}`
  const code = rzp.code || rzp.reason || ''
  return {
    message: code ? `Razorpay UPI Intent failed (${status}): ${detail} [${code}]` : `Razorpay UPI Intent failed (${status}): ${detail}`,
    code: rzp.code || null,
  }
}

async function razorpayFetch(path, { method = 'GET', body } = {}) {
  return paymentOperation(method === 'GET' ? 'razorpay.lookup' : 'razorpay.payment.request', { orderId: body?.order_id || path.match(/^\/orders\/(order_[a-zA-Z0-9]+)/)?.[1], razorpayPaymentId: path.match(/^\/payments\/(pay_[a-zA-Z0-9]+)/)?.[1], orderNo: body?.notes?.orderNo }, () => razorpayFetchRaw(path, { method, body }))
}
async function razorpayFetchRaw(path, { method = 'GET', body } = {}) {
  const { config } = await getClient()
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.keyId}:${config.keySecret}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const formatted = formatRazorpayError(path, response.status, payload)
    throw Object.assign(new Error(formatted.message), {
      status: 400,
      razorpayStatus: response.status,
      razorpayCode: formatted.code,
    })
  }
  return payload
}

function extractIntentUrl(payload) {
  const urls = []
  const push = (value) => {
    if (typeof value === 'string' && value) urls.push(value)
  }
  push(payload?.link)
  push(payload?.intent_url)
  push(payload?.intent_uri)
  push(payload?.upi_intent_url)
  push(payload?.short_url)
  push(payload?.data?.intent_url)
  push(payload?.data?.link)
  push(payload?.data?.intent_uri)
  if (Array.isArray(payload?.next)) {
    for (const step of payload.next) {
      push(step?.url)
      push(step?.intent_url)
      push(step?.intent_uri)
      push(step?.link)
      if (step?.action === 'intent' || step?.action === 'upi_intent') push(step?.url)
    }
  }
  return (
    urls.find((url) => /^(upi:|intent:|tez:|phonepe:|paytmmp:|gpay:|credpay:|amazonpay:|bhim:)/i.test(url)) ||
    ''
  )
}

async function razorpayForm(path, fields) {
  return paymentOperation('razorpay.payment.request', { orderId: fields.order_id }, () => razorpayFormRaw(path, fields))
}
async function razorpayFormRaw(path, fields) {
  const { config } = await getClient()
  const body = new URLSearchParams()
  for (const [key, value] of Object.entries(fields)) {
    if (value == null || value === '') continue
    body.append(key, String(value))
  }
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.keyId}:${config.keySecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const formatted = formatRazorpayError(path, response.status, payload)
    throw Object.assign(new Error(formatted.message), {
      status: 400,
      razorpayStatus: response.status,
      razorpayCode: formatted.code,
    })
  }
  return payload
}

export async function createUpiIntentPayment({
  orderId,
  amountPaise,
  contact,
  email,
  description,
  orderNo,
  ip,
  userAgent,
}) {
  const jsonBody = {
    amount: amountPaise,
    currency: 'INR',
    order_id: orderId,
    email,
    contact,
    method: 'upi',
    description,
    ip: ip || '127.0.0.1',
    referer: 'https://tokriii.com',
    user_agent: userAgent || 'Tokriii',
    upi: { flow: 'intent' },
    ...(orderNo ? { notes: { orderNo } } : {}),
  }

  const attempts = [
    () => razorpayFetch('/payments/create/upi', { method: 'POST', body: jsonBody }),
    () =>
      razorpayForm('/payments/create/upi', {
        amount: amountPaise,
        currency: 'INR',
        order_id: orderId,
        email,
        contact,
        method: 'upi',
        description,
        'upi[flow]': 'intent',
      }),
    () => razorpayFetch('/payments/create/json', { method: 'POST', body: jsonBody }),
  ]

  let payload = null
  let lastError = null
  for (const run of attempts) {
    try {
      payload = await run()
      const intentUrl = extractIntentUrl(payload)
      const paymentId = payload.razorpay_payment_id || payload.id || ''
      if (intentUrl && paymentId) return { paymentId, intentUrl }
      lastError = Object.assign(
        new Error('Razorpay response did not include a UPI intent link.'),
        { status: 400 },
      )
    } catch (error) {
      lastError = error
    }
  }

  throw Object.assign(
    new Error(
      lastError?.message ||
        'UPI Intent is not enabled on this Razorpay account. Ask Razorpay support to enable S2S UPI Intent (POST /v1/payments/create/upi with upi.flow=intent).',
    ),
    {
      status: 400,
      razorpayStatus: lastError?.razorpayStatus,
      razorpayCode: lastError?.razorpayCode,
    },
  )
}

export async function fetchRazorpayPayment(paymentId) {
  return razorpayFetch(`/payments/${encodeURIComponent(paymentId)}`)
}

export async function listRazorpayOrderPayments(razorpayOrderId) {
  const payload = await razorpayFetch(`/orders/${encodeURIComponent(razorpayOrderId)}/payments`)
  return Array.isArray(payload?.items) ? payload.items : []
}

export async function listRazorpayOrdersByReceipt(receipt) {
  const payload = await razorpayFetch(`/orders?receipt=${encodeURIComponent(receipt)}&count=5`)
  return Array.isArray(payload?.items) ? payload.items : []
}

export async function captureRazorpayPayment(paymentId, amountPaise, currency = 'INR') {
  return razorpayFetch(`/payments/${encodeURIComponent(paymentId)}/capture`, {
    method: 'POST',
    body: { amount: amountPaise, currency },
  })
}

export async function verifyRazorpayPayment({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  const { config } = await getClient()
  const expected = crypto
    .createHmac('sha256', config.keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex')

  if (expected !== razorpaySignature) {
    throw Object.assign(new Error('Payment verification failed.'), { status: 400 })
  }

  return true
}

export async function verifyRazorpayWebhook(rawBody, signature) {
  const config = await getRazorpaySettings()
  const secrets = [...new Set([process.env.RAZORPAY_WEBHOOK_SECRET, config.keySecret].filter(Boolean))]
  if (!secrets.length) {
    throw Object.assign(new Error('Razorpay webhook secret is not configured.'), { status: 400 })
  }
  const actualBuffer = Buffer.from(String(signature || ''))
  for (const secret of secrets) {
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
    const expectedBuffer = Buffer.from(expected)
    if (
      actualBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(actualBuffer, expectedBuffer)
    ) {
      return true
    }
  }
  throw Object.assign(new Error('Invalid webhook signature.'), { status: 400 })
}
