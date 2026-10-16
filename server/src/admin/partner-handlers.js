import { ValidationError } from 'adminjs'
import { prisma } from '../lib/prisma.js'
import { sendPartnerSetPasswordEmail } from '../services/partnerPassword.js'
import { collectCashForOrder, createOrderPaymentQr } from '../services/partnerOrders.js'
import { flattenOrder } from './order-handlers.js'

function toBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback
  return value === true || value === 'true' || value === 'on' || value === 1 || value === '1'
}

function cleanText(value) {
  const text = String(value ?? '').trim()
  return text || null
}

function parseDateOnly(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return null
  // Accept YYYY-MM-DD from <input type="date">
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const date = new Date(`${raw}T00:00:00.000Z`)
    return Number.isNaN(date.getTime()) ? null : date
  }
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatDateInput(value) {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

export function normalizePartnerPhone(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (digits.length === 10) return digits
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2)
  return ''
}

function normalizePan(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
}

function normalizeAadhaar(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 12)
}

function normalizeIfsc(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 11)
}

const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/
const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/

export async function preparePartnerPayload(request) {
  if (request.method !== 'post') return request
  const payload = { ...(request.payload || {}) }
  const errors = {}

  const name = String(payload.name || '').trim()
  const email = String(payload.email || '').trim().toLowerCase()
  const phone = normalizePartnerPhone(payload.phone)
  const panNumber = normalizePan(payload.panNumber)
  const aadhaarNumber = normalizeAadhaar(payload.aadhaarNumber)
  const emergencyPhoneRaw = String(payload.emergencyPhone || '').trim()
  const emergencyPhone = emergencyPhoneRaw ? normalizePartnerPhone(payload.emergencyPhone) : ''
  const pincode = String(payload.pincode || '').replace(/\D/g, '').slice(0, 6)
  const ifscCode = normalizeIfsc(payload.ifscCode)
  const dateOfBirth = parseDateOnly(payload.dateOfBirth)

  if (!name) errors.name = { message: 'Name is required.' }
  if (!email || !email.includes('@')) {
    errors.email = { message: 'A valid email is required so the partner can set a password.' }
  }
  if (phone.length !== 10) errors.phone = { message: 'Enter a 10-digit mobile number.' }

  if (!panNumber) errors.panNumber = { message: 'PAN number is required.' }
  else if (!PAN_RE.test(panNumber)) errors.panNumber = { message: 'Enter a valid PAN (e.g. ABCDE1234F).' }

  if (!aadhaarNumber) errors.aadhaarNumber = { message: 'Aadhaar number is required.' }
  else if (aadhaarNumber.length !== 12) {
    errors.aadhaarNumber = { message: 'Enter a valid 12-digit Aadhaar number.' }
  }

  const addressLine1 = cleanText(payload.addressLine1) || cleanText(payload.address)
  if (!addressLine1) errors.addressLine1 = { message: 'Address line 1 is required.' }

  const city = cleanText(payload.city)
  if (!city) errors.city = { message: 'City is required.' }

  const state = cleanText(payload.state)
  if (!state) errors.state = { message: 'State is required.' }

  if (!pincode) errors.pincode = { message: 'Pincode is required.' }
  else if (pincode.length !== 6) errors.pincode = { message: 'Enter a 6-digit pincode.' }

  if (emergencyPhoneRaw && emergencyPhone.length !== 10) {
    errors.emergencyPhone = { message: 'Enter a valid 10-digit emergency mobile number.' }
  }

  if (ifscCode && !IFSC_RE.test(ifscCode)) {
    errors.ifscCode = { message: 'Enter a valid IFSC code (e.g. SBIN0001234).' }
  }

  if (Object.keys(errors).length) throw new ValidationError(errors)

  delete payload.password
  delete payload.hasPassword

  request.payload = {
    name,
    email,
    phone,
    dateOfBirth,
    fatherName: cleanText(payload.fatherName),
    panNumber,
    aadhaarNumber,
    addressLine1,
    addressLine2: cleanText(payload.addressLine2),
    city,
    state,
    pincode,
    permanentAddress: cleanText(payload.permanentAddress),
    emergencyName: cleanText(payload.emergencyName),
    emergencyPhone: emergencyPhone || null,
    vehicleType: cleanText(payload.vehicleType),
    vehicleNumber: cleanText(payload.vehicleNumber)?.toUpperCase() || null,
    accountHolderName: cleanText(payload.accountHolderName),
    accountNumber: cleanText(payload.accountNumber)?.replace(/\s+/g, '') || null,
    ifscCode: ifscCode || null,
    notes: cleanText(payload.notes),
    isActive: toBoolean(payload.isActive, false),
  }
  return request
}

export async function afterPartnerSave(response, request) {
  if (request.method !== 'post') return sanitizePartnerRecord(response)
  const id = response?.record?.id || response?.record?.params?.id
  if (!id) return sanitizePartnerRecord(response)
  try {
    const partner = await prisma.deliveryPartner.findUnique({ where: { id } })
    if (partner) {
      await prisma.order.updateMany({
        where: { deliveryPartnerId: partner.id },
        data: {
          deliveryPartnerName: partner.name,
          deliveryPartnerPhone: partner.phone,
        },
      })
    }
    if (partner?.email && !partner.password) {
      await sendPartnerSetPasswordEmail(partner, { isReset: false })
    }
  } catch (error) {
    console.error('Failed to sync partner details onto orders:', error)
  }
  return sanitizePartnerRecord(response)
}

export function sanitizePartnerRecord(response) {
  const hidePassword = (record) => {
    if (!record?.params) return
    record.params.hasPassword = Boolean(record.params.password || record.params.hasPassword)
    delete record.params.password
    if (record.params.dateOfBirth) {
      record.params.dateOfBirth = formatDateInput(record.params.dateOfBirth)
    }
  }
  hidePassword(response?.record)
  if (Array.isArray(response?.records)) response.records.forEach(hidePassword)
  return response
}

export async function sendPartnerPasswordAction(request, _response, context) {
  const partner = await prisma.deliveryPartner.findUnique({ where: { id: request.params.recordId } })
  if (!partner) throw new Error('Partner not found')
  await sendPartnerSetPasswordEmail(partner, { isReset: Boolean(partner.password) })
  return sanitizePartnerRecord({
    record: context.record.toJSON(context.currentAdmin),
    notice: {
      message: `Password email sent to ${partner.email}`,
      type: 'success',
    },
  })
}

export async function togglePartnerActiveAction(request, _response, context) {
  const partner = await prisma.deliveryPartner.findUnique({ where: { id: request.params.recordId } })
  if (!partner) throw new Error('Partner not found')
  const raw = request.payload?.isActive ?? request.payload?.record?.params?.isActive
  const next = raw === undefined ? !partner.isActive : toBoolean(raw)
  const updated = await prisma.deliveryPartner.update({
    where: { id: partner.id },
    data: { isActive: next },
  })
  return sanitizePartnerRecord({
    record: context.resource.build(updated).toJSON(context.currentAdmin),
    notice: {
      message: updated.isActive ? `${updated.name} can now log in.` : `${updated.name} is inactive.`,
      type: 'success',
    },
  })
}

export async function preparePincodePayload(request) {
  if (request.method !== 'post') return request
  const payload = { ...(request.payload || {}) }
  payload.pincode = String(payload.pincode || '').replace(/\D/g, '').slice(0, 6)
  payload.areaLabel = String(payload.areaLabel || '').trim() || null
  payload.city = String(payload.city || '').trim() || null
  payload.isActive = toBoolean(payload.isActive, true)
  payload.morningEnabled = toBoolean(payload.morningEnabled, true)
  payload.expressEnabled = toBoolean(payload.expressEnabled, false)
  const partnerRef = payload.partner ?? payload.partnerId
  payload.partnerId = partnerRef && partnerRef !== 'null' && partnerRef !== '' ? String(partnerRef) : null
  payload.partner = payload.partnerId

  const stateRef = payload.stateCode ?? payload.state
  payload.stateCode =
    stateRef && stateRef !== 'null' && stateRef !== ''
      ? String(stateRef).trim().toUpperCase()
      : null
  payload.state = payload.stateCode

  if (payload.pincode.length !== 6) {
    throw new ValidationError({ pincode: { message: 'Enter a 6-digit pincode.' } })
  }
  if (!payload.city) {
    throw new ValidationError({ city: { message: 'Enter the city for this pincode.' } })
  }
  if (!payload.stateCode) {
    throw new ValidationError({ state: { message: 'Select an Indian state.' } })
  }
  const state = await prisma.indiaState.findUnique({ where: { code: payload.stateCode } })
  if (!state) {
    throw new ValidationError({ state: { message: 'Select a valid Indian state.' } })
  }

  request.payload = {
    pincode: payload.pincode,
    areaLabel: payload.areaLabel,
    city: payload.city,
    stateCode: payload.stateCode,
    state: payload.stateCode,
    isActive: payload.isActive,
    morningEnabled: payload.morningEnabled,
    expressEnabled: payload.expressEnabled,
    partnerId: payload.partnerId,
    partner: payload.partnerId,
  }
  return request
}

export async function togglePincodeActiveAction(request, _response, context) {
  const row = await prisma.serviceablePincode.findUnique({ where: { id: request.params.recordId } })
  if (!row) throw new Error('Pincode not found')
  const payload = request.payload || {}
  const field =
    payload.morningEnabled !== undefined
      ? 'morningEnabled'
      : payload.expressEnabled !== undefined
        ? 'expressEnabled'
        : 'isActive'
  const raw = payload[field] ?? payload.record?.params?.[field]
  const next = raw === undefined ? !row[field] : toBoolean(raw)
  const updated = await prisma.serviceablePincode.update({
    where: { id: row.id },
    data: { [field]: next },
  })
  const message =
    field === 'morningEnabled'
      ? updated.morningEnabled
        ? `${updated.pincode}: morning delivery on.`
        : `${updated.pincode}: morning delivery off.`
      : field === 'expressEnabled'
        ? updated.expressEnabled
          ? `${updated.pincode}: Express delivery on.`
          : `${updated.pincode}: Express delivery off.`
        : updated.isActive
          ? `${updated.pincode} is now serviceable.`
          : `${updated.pincode} is not delivering.`
  return {
    record: context.resource.build(updated).toJSON(context.currentAdmin),
    notice: {
      message,
      type: 'success',
    },
  }
}

export async function collectCashAction(request, _response, context) {
  const order = await collectCashForOrder(request.params.recordId)
  return {
    record: context.resource.build(flattenOrder(order)).toJSON(context.currentAdmin),
    notice: { message: 'Cash marked as collected.', type: 'success' },
  }
}

export async function generateQrAction(request, _response, context) {
  const order = await createOrderPaymentQr(request.params.recordId)
  return {
    record: context.resource.build(flattenOrder(order)).toJSON(context.currentAdmin),
    notice: {
      message: order.razorpayQrUrl ? 'Payment QR is ready on the order.' : 'Payment link created.',
      type: 'success',
    },
  }
}
