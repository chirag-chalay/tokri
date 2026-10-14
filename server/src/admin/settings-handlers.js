import { prisma } from '../lib/prisma.js'
import { parseFeaturedCategorySlugs } from '../utils/settings.js'

const SETTING_ID = 1

export const ALLOWED_SETTING_FIELDS = new Set([
  'storeName',
  'storeTagline',
  'storeEmail',
  'storePhone1',
  'storePhone2',
  'storeAddress',
  'promoBanner',
  'earlyDelivery',
  'morningDeliveryTitle',
  'morningDeliverySubtitle',
  'morningShippingFee',
  'morningFreeAbove',
  'expressDeliveryTitle',
  'expressDeliverySubtitle',
  'expressShippingFee',
  'expressFreeAbove',
  'shippingFee',
  'handlingFee',
  'homeBannerImage',
  'homeMobileBannerImage',
  'homeHighlightImage',
  'homeFeaturedCategorySlugs',
  'razorpayEnabled',
  'razorpayKeyId',
  'razorpayKeySecret',
  'codEnabled',
  'msg91Enabled',
  'msg91AuthKey',
  'msg91SenderId',
  'msg91OtpTemplateId',
  'msg91OrderTemplateId',
  'msg91WhatsappEnabled',
  'msg91WhatsappNumber',
  'msg91WhatsappNamespace',
  'msg91WhatsappOtpEnabled',
  'msg91WhatsappOtpTemplate',
  'msg91WhatsappOtpButton',
  'msg91WhatsappOrderEnabled',
  'msg91WhatsappOrderTemplate',
  'msg91WhatsappPartnerEnabled',
  'msg91WhatsappPartnerTemplate',
])

const NUMBER_FIELDS = new Set([
  'shippingFee',
  'handlingFee',
  'morningShippingFee',
  'morningFreeAbove',
  'expressShippingFee',
  'expressFreeAbove',
])

const BOOLEAN_FIELDS = new Set([
  'razorpayEnabled',
  'codEnabled',
  'msg91Enabled',
  'msg91WhatsappEnabled',
  'msg91WhatsappOtpEnabled',
  'msg91WhatsappOtpButton',
  'msg91WhatsappOrderEnabled',
  'msg91WhatsappPartnerEnabled',
])

function toBoolean(value) {
  return value === true || value === 'true' || value === 'on' || value === 1 || value === '1'
}

function normalizeIntegratedNumber(value) {
  let digits = String(value ?? '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('0')) digits = digits.replace(/^0+/, '')
  if (/^[6-9]\d{9}$/.test(digits)) return `91${digits}`
  if (/^91[6-9]\d{9}$/.test(digits)) return digits
  if (/^\d{11,15}$/.test(digits)) return digits
  return null
}

export function cleanSettingsPayload(payload = {}) {
  const cleaned = {}

  for (const [key, value] of Object.entries(payload)) {
    if (!ALLOWED_SETTING_FIELDS.has(key)) continue
    cleaned[key] = value
  }

  delete cleaned.id
  delete cleaned.updatedAt
  if (!cleaned.razorpayKeySecret) delete cleaned.razorpayKeySecret
  if (!cleaned.msg91AuthKey) delete cleaned.msg91AuthKey

  return cleaned
}

export function payloadToSettingData(payload) {
  const data = {}

  for (const [key, value] of Object.entries(cleanSettingsPayload(payload))) {
    if (key === 'homeFeaturedCategorySlugs') {
      data[key] = JSON.stringify(parseFeaturedCategorySlugs(value))
      continue
    }

    if (BOOLEAN_FIELDS.has(key)) {
      data[key] = toBoolean(value)
      continue
    }

    if (NUMBER_FIELDS.has(key)) {
      const amount = Number(value)
      if (!Number.isFinite(amount) || amount < 0) continue
      data[key] = amount
      continue
    }

    if (value === undefined || value === null || value === '') continue
    data[key] = value
  }

  return data
}

export async function saveSettingsFromPayload(payload) {
  const data = payloadToSettingData(payload)
  if (data.morningShippingFee != null) data.shippingFee = data.morningShippingFee

  return prisma.setting.update({
    where: { id: SETTING_ID },
    data: {
      ...data,
      store: null,
      theme: null,
      home: null,
      payment: null,
      messaging: null,
    },
  })
}

export function settingToRecordParams(setting) {
  if (!setting) return {}

  const params = { id: String(setting.id) }

  for (const key of ALLOWED_SETTING_FIELDS) {
    const value = setting[key]
    if (value === null || value === undefined) continue

    if (key === 'msg91AuthKey') continue

    if (typeof value === 'boolean') {
      params[key] = value
    } else if (value instanceof Date) {
      params[key] = value.toISOString()
    } else {
      params[key] = String(value)
    }
  }

  return params
}

export function cleanRecordParams(params = {}) {
  const cleaned = {}

  for (const [key, value] of Object.entries(params)) {
    if (!ALLOWED_SETTING_FIELDS.has(key) || key === 'msg91AuthKey') continue
    cleaned[key] = value
  }

  if (params.id !== undefined) cleaned.id = params.id

  return cleaned
}

export async function settingsEditHandler(request, _response, context) {
  const { record, resource, currentAdmin } = context

  if (!record) {
    throw new Error('Settings record could not be found')
  }

  if (request.method === 'get') {
    const json = record.toJSON(currentAdmin)
    json.params = cleanRecordParams(json.params)
    return { record: json }
  }

  const payload = { ...(request.payload ?? request.fields ?? {}) }
  const integratedNumber = normalizeIntegratedNumber(payload.msg91WhatsappNumber)
  if (payload.msg91WhatsappNumber && integratedNumber == null) {
    const json = record.toJSON(currentAdmin)
    json.params = cleanRecordParams(json.params)
    return {
      record: json,
      notice: {
        message: 'Enter the MSG91 WhatsApp number. A 10-digit Indian mobile gets 91 added automatically.',
        type: 'error',
      },
    }
  }
  if (integratedNumber) payload.msg91WhatsappNumber = integratedNumber

  const updated = await saveSettingsFromPayload(payload)
  const rebuilt = resource.build(settingToRecordParams(updated))
  const json = rebuilt.toJSON(currentAdmin)
  json.params = cleanRecordParams(json.params)

  return {
    record: json,
    notice: {
      message: 'Settings saved successfully',
      type: 'success',
    },
  }
}
