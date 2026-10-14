import dns from 'node:dns'
import { prisma } from '../lib/prisma.js'
import { getMsg91Settings } from '../utils/msg91Settings.js'
import { formatExpectedDeliveryDate } from './delivery.js'

// MSG91 IP security matches IPv4. This machine also has IPv6, and Node
// prefers it, which MSG91 then rejects as 418 even after IPv4 is whitelisted.
dns.setDefaultResultOrder('ipv4first')

const MSG91_FLOW_URL = 'https://api.msg91.com/api/v5/flow/'
const MSG91_WHATSAPP_URL =
  'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/'

function isDltTemplateId(value) {
  return /^\d{16,20}$/.test(String(value || '').trim())
}

function isMsg91TemplateId(value) {
  return /^[a-f0-9]{24}$/i.test(String(value || '').trim())
}

function formatAmount(value) {
  const amount = Number(value || 0)
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2)
}

function toMsg91Mobile(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) return null
  if (digits.length === 10) return `91${digits}`
  return digits
}

function msg91FailureReason(result, response, label) {
  const apiError = String(result?.apiError || '')
  const errors = result?.errors
  const errorText = typeof errors === 'string'
    ? errors
    : Array.isArray(errors)
      ? errors.filter(Boolean).join(', ')
      : ''

  if (apiError === '418' || response.status === 418) {
    return 'MSG91 blocked this server IP (418). In MSG91 open Authkey and turn off IP security, or whitelist this computer’s public IP, then resend.'
  }

  if (typeof result?.message === 'string' && result.message.trim()) return result.message.trim()
  if (errorText) return errorText
  return `MSG91 rejected the ${label} request (HTTP ${response.status}).`
}

async function postToMsg91(url, authKey, payload, label) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authkey: String(authKey || '').trim(),
    },
    body: JSON.stringify(payload),
  })

  const result = await response.json().catch(() => ({}))
  const flagged = [result?.type, result?.status].some((value) =>
    ['error', 'fail'].includes(String(value).toLowerCase()),
  )

  if (!response.ok || flagged || result?.hasError) {
    throw new Error(msg91FailureReason(result, response, label))
  }

  return result
}

// Flow variable names come from the approved DLT template and are case sensitive,
// so every value is sent under its readable name plus a VAR1..VARn alias.
// MSG91 ignores keys the template does not declare.
function buildSmsRecipient(mobiles, variables) {
  const recipient = { mobiles }
  let position = 0

  for (const [key, value] of Object.entries(variables)) {
    if (value === undefined || value === null || value === '') continue
    position += 1
    recipient[key] = String(value)
    recipient[`VAR${position}`] = String(value)
  }

  return recipient
}

async function sendSms({ config, mobiles, templateId, variables, label }) {
  const id = String(templateId || '').trim()

  // 19-digit Airtel DLT ids cannot be used as MSG91 flow ids. Those must be
  // replaced in admin with the hex Template ID from MSG91 (copy icon).
  if (isDltTemplateId(id) && !isMsg91TemplateId(id)) {
    throw new Error(
      'Paste the MSG91 Template ID from the copy icon (e.g. 6aae9748…), not the 19-digit Airtel DLT ID. MSG91 already has the approved text and only needs the OTP or order number.',
    )
  }

  // MSG91 renamed flows to templates part way through v5, so the id is sent under
  // both names. Only the template variable is sent — never a custom SMS body.
  const payload = {
    template_id: id,
    flow_id: id,
    short_url: '0',
    recipients: [buildSmsRecipient(mobiles, variables)],
  }

  if (config.senderId) {
    payload.sender = config.senderId
  }

  const result = await postToMsg91(MSG91_FLOW_URL, config.authKey, payload, label)
  return { channel: 'sms', sent: true, requestId: result?.request_id || null }
}

// WhatsApp templates take positional body variables, so values map to body_1..body_n.
// A URL button receives only the dynamic suffix. The template holds the fixed URL.
function buildWhatsappComponents(values, urlButtonValue) {
  const components = {}

  values.forEach((value, index) => {
    const text = String(value ?? '').trim()
    components[`body_${index + 1}`] = { type: 'text', value: text || '-' }
  })

  const buttonValue = String(urlButtonValue ?? '').trim()
  if (buttonValue) {
    components.button_1 = { subtype: 'url', type: 'text', value: buttonValue }
  }

  return components
}

function whatsappBlockReason(config, whatsapp) {
  const templateName = String(config?.[whatsapp?.templateKey] || '').trim()
  if (whatsapp?.enabledKey && !config[whatsapp.enabledKey]) {
    return 'This WhatsApp message is turned off in Settings → Notifications.'
  }
  if (!config.whatsappEnabled) return 'Turn on MSG91 WhatsApp in Settings → Notifications.'
  if (!config.authKey) return 'MSG91 auth key is missing in Settings → Notifications.'
  if (!config.whatsappNumber) return 'WhatsApp business number is missing in Settings → Notifications.'
  if (!config.whatsappNamespace) return 'WhatsApp template namespace is missing in Settings → Notifications.'
  if (!templateName) return 'WhatsApp template name is missing in Settings → Notifications.'
  return ''
}

async function sendWhatsapp({ config, mobiles, templateName, values, urlButtonValue, label }) {
  if (!config.whatsappNamespace) {
    throw new Error('WhatsApp template namespace is missing in Settings → Notifications.')
  }

  const template = {
    name: templateName,
    language: { code: config.whatsappLanguage || 'en', policy: 'deterministic' },
    namespace: config.whatsappNamespace,
    to_and_components: [
      {
        to: [mobiles],
        components: buildWhatsappComponents(values, urlButtonValue),
      },
    ],
  }

  const payload = {
    integrated_number: toMsg91Mobile(config.whatsappNumber),
    content_type: 'template',
    payload: {
      messaging_product: 'whatsapp',
      type: 'template',
      template,
    },
  }

  const result = await postToMsg91(MSG91_WHATSAPP_URL, config.authKey, payload, label)
  const requestId = result?.request_id || result?.requestId || ''
  if (!requestId) {
    throw new Error(
      result?.data || result?.message || 'MSG91 did not accept the WhatsApp message, so it was not sent.',
    )
  }
  return {
    channel: 'whatsapp',
    sent: true,
    requestId,
    detail: typeof result?.data === 'string' ? result.data : '',
  }
}

// SMS is tried first because it needs no opt-in from the customer, and WhatsApp
// takes over whenever SMS is unconfigured or the gateway rejects the request.
async function deliver({ phone, label, sms, whatsapp }) {
  const config = await getMsg91Settings()
  const mobiles = toMsg91Mobile(phone)
  const templateEnabled = whatsapp?.enabledKey ? Boolean(config[whatsapp.enabledKey]) : true

  const smsReady = Boolean(config.smsEnabled && config.authKey && sms?.templateKey && config[sms.templateKey])
  const whatsappReason = whatsapp ? whatsappBlockReason(config, whatsapp) : ''
  const whatsappReady = Boolean(whatsapp && templateEnabled && !whatsappReason)

  if (!mobiles || (!smsReady && !whatsappReady)) {
    const reason = !mobiles
      ? 'Phone number is missing.'
      : whatsappReason || 'MSG91 WhatsApp is not configured for this template.'
    console.log(`[MSG91 not configured] ${label} -> ${mobiles || 'no number'}`, reason)
    return { channel: 'dev', sent: false, reason }
  }

  const failures = []

  if (smsReady) {
    try {
      return await sendSms({
        config,
        mobiles,
        templateId: config[sms.templateKey],
        variables: sms.variables,
        label,
      })
    } catch (error) {
      failures.push(`SMS: ${error.message}`)
      if (!whatsappReady) {
        throw new Error(whatsappReason || error.message)
      }
      console.error(`MSG91 SMS failed for ${label}, trying WhatsApp:`, error.message)
    }
  }

  if (!whatsappReady) {
    return { channel: 'dev', sent: false, reason: whatsappReason || 'MSG91 WhatsApp is not configured for this template.' }
  }

  try {
    return await sendWhatsapp({
      config,
      mobiles,
      templateName: config[whatsapp.templateKey],
      values: whatsapp.values,
      urlButtonValue: whatsapp.urlButtonValue || (config.whatsappOtpButton ? whatsapp.otpValue : null),
      label,
    })
  } catch (error) {
    failures.push(`WhatsApp: ${error.message}`)
    throw new Error(`MSG91 could not deliver ${label}. ${failures.join(' | ')}`)
  }
}

export function sendOtpMessage(phone, code) {
  return deliver({
    phone,
    label: 'login OTP',
    sms: {
      templateKey: 'otpTemplateId',
      // MSG91 template: "Please use OTP ##numeric## to login..."
      variables: { numeric: code },
    },
    whatsapp: {
      templateKey: 'whatsappOtpTemplate',
      enabledKey: 'whatsappOtpEnabled',
      values: [code],
      otpValue: code,
    },
  })
}

export function isConfirmedCheckoutOrder(order) {
  if (!order) return false
  if (String(order.status || '').toLowerCase() === 'cancelled') return false
  const mode = String(order.paymentMode || 'cod').toLowerCase()
  if (mode === 'cod') return true
  return mode === 'online' && String(order.paymentStatus || '').toLowerCase() === 'paid'
}

function textOrDash(value) {
  const text = String(value || '').trim()
  return text || '-'
}

function clip(value, max = 1000) {
  const text = String(value || '')
  if (text.length <= max) return text
  return `${text.slice(0, max - 1)}…`
}

function formatClickablePhone(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) return '-'
  const local = digits.length > 10 ? digits.slice(-10) : digits
  if (local.length !== 10) return `+${digits}`
  return `+91${local}`
}

function formatOrderAddress(address) {
  if (!address || typeof address !== 'object') return '-'
  return textOrDash(
    [address.line1, address.line2, address.landmark, address.city, address.state, address.pincode]
      .map((part) => String(part || '').trim())
      .filter(Boolean)
      .join(', '),
  )
}

// Template button URL is https://www.google.com/maps/search/?api=1&query={{1}}
// Current location sends the saved pin. A typed address sends the full address text.
function mapsButtonValue(address) {
  const latitude = Number(address?.latitude)
  const longitude = Number(address?.longitude)
  const hasPin = Number.isFinite(latitude)
    && latitude >= -90
    && latitude <= 90
    && Number.isFinite(longitude)
    && longitude >= -180
    && longitude <= 180
    && !(latitude === 0 && longitude === 0)
  if (hasPin) {
    const lat = Math.round(latitude * 1e6) / 1e6
    const lng = Math.round(longitude * 1e6) / 1e6
    return `${lat},${lng}`
  }
  const text = formatOrderAddress(address)
  if (!text || text === '-') return ''
  return encodeURIComponent(text)
}

function formatOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0) return '-'
  return clip(
    items
      .map((item) => {
        const qty = Math.max(1, Number(item.quantity) || 1)
        const weight = String(item.weight || '').trim()
        return `${item.name} x${qty}${weight ? ` (${weight})` : ''}`
      })
      .join(', '),
  )
}

function partnerPaymentLabel(order) {
  const mode = String(order.paymentMode || 'cod').toLowerCase()
  if (mode === 'online' || order.paymentCollectedAs === 'online' || order.razorpayPaymentId) {
    return String(order.paymentStatus || '').toLowerCase() === 'paid' ? 'Paid online' : 'Online - unpaid'
  }
  return 'COD - collect cash'
}

export async function sendOrderConfirmation(order, { phone, name } = {}) {
  if (!isConfirmedCheckoutOrder(order)) {
    return { channel: 'none', sent: false, reason: 'Order is not COD or paid online yet.' }
  }

  const address = order?.address && typeof order.address === 'object' ? order.address : null
  const to = phone || address?.phone || null

  if (!order?.orderNo || !to) {
    return { channel: 'none', sent: false, reason: 'Customer phone is missing.' }
  }

  const customerName = name || address?.name || 'Customer'
  const amount = formatAmount(order.grandTotal)

  return deliver({
    phone: to,
    label: `order confirmation ${order.orderNo}`,
    // The approved DLT order template carries a single variable, the order number.
    sms: {
      templateKey: 'orderTemplateId',
      // MSG91 template uses ##alphanumeric## for the order number.
      variables: { alphanumeric: order.orderNo },
    },
    whatsapp: {
      templateKey: 'whatsappOrderTemplate',
      enabledKey: 'whatsappOrderEnabled',
      values: [customerName, order.orderNo, amount],
    },
  })
}

export async function sendDeliveryPartnerAssignment(orderLike) {
  if (!orderLike?.id) {
    return { channel: 'none', sent: false, reason: 'Order is missing.' }
  }
  if (!isConfirmedCheckoutOrder(orderLike)) {
    return {
      channel: 'none',
      sent: false,
      reason: 'Send only after COD is placed or the online payment is confirmed.',
    }
  }

  const order = await prisma.order.findUnique({
    where: { id: orderLike.id },
    include: {
      items: { orderBy: { id: 'asc' } },
      customer: { select: { name: true, phone: true } },
      deliveryPartner: { select: { name: true, phone: true } },
    },
  })

  if (!order) return { channel: 'none', sent: false, reason: 'Order not found.' }
  if (!isConfirmedCheckoutOrder(order)) {
    return {
      channel: 'none',
      sent: false,
      reason: 'Send only after COD is placed or the online payment is confirmed.',
    }
  }

  const phone = order.deliveryPartner?.phone || order.deliveryPartnerPhone
  if (!phone) {
    return { channel: 'none', sent: false, reason: 'Assign a delivery partner first.' }
  }

  const address = order.address && typeof order.address === 'object' ? order.address : {}
  const customerName = order.customer?.name || address.name || 'Customer'
  const customerPhone = order.customer?.phone || address.phone

  try {
    const result = await deliver({
      phone,
      label: `delivery partner ${order.orderNo}`,
      whatsapp: {
        templateKey: 'whatsappPartnerTemplate',
        enabledKey: 'whatsappPartnerEnabled',
        values: [
          order.orderNo,
          textOrDash(customerName),
          formatClickablePhone(customerPhone),
          formatOrderAddress(address),
          formatOrderItems(order.items),
          formatAmount(order.grandTotal),
          partnerPaymentLabel(order),
          formatExpectedDeliveryDate(order.expectedDeliveryDate) || '-',
        ],
        urlButtonValue: mapsButtonValue(address),
      },
    })
    if (!result.sent) {
      return {
        ...result,
        reason: result.reason || 'WhatsApp is not configured for the delivery-partner template.',
      }
    }
    return result
  } catch (error) {
    return { channel: 'whatsapp', sent: false, reason: error.message }
  }
}

export function notifyConfirmedOrder(order, { phone, name } = {}) {
  sendOrderConfirmation(order, { phone, name }).catch((error) =>
    console.error('Failed to send order confirmation:', error),
  )
  sendDeliveryPartnerAssignment(order).catch((error) =>
    console.error('Failed to notify delivery partner:', error),
  )
}
