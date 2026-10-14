import crypto from 'crypto'
import { prisma } from '../lib/prisma.js'
import {
  assertPincodeServiceable,
  deliveryOptionsByPincode,
  normalizePincode,
} from './delivery.js'

const LABELS = new Set(['Home', 'Work', 'Other'])

function normalizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (digits.length === 10) return digits
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2)
  return null
}

function parseAddresses(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  return []
}

function formatAddressLine(address) {
  const parts = [
    address.name,
    address.line1,
    address.line2,
    [address.city, address.state, address.pincode].filter(Boolean).join(', '),
    address.landmark ? `Landmark: ${address.landmark}` : null,
  ].filter(Boolean)
  return parts.join(', ')
}

function readCoordinate(value, min, max) {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  if (!Number.isFinite(number) || number < min || number > max) return null
  return Math.round(number * 1e6) / 1e6
}

function readMapPin(input = {}) {
  const latitude = readCoordinate(input.latitude, -90, 90)
  const longitude = readCoordinate(input.longitude, -180, 180)
  if (latitude === null || longitude === null) return { latitude: null, longitude: null }
  return { latitude, longitude }
}

function sanitizeAddressInput(input = {}, fallbackPhone = '') {
  const label = LABELS.has(input.label) ? input.label : 'Home'
  const name = String(input.name || '').trim()
  const line1 = String(input.line1 || '').trim()
  const line2 = String(input.line2 || '').trim()
  const city = String(input.city || '').trim()
  const state = String(input.state || '').trim()
  const pincode = String(input.pincode || '').replace(/\D/g, '').slice(0, 6)
  const landmark = String(input.landmark || '').trim()
  const phone = normalizePhone(input.phone) || fallbackPhone

  if (!name) throw Object.assign(new Error('Full name is required.'), { status: 400 })
  if (!line1) throw Object.assign(new Error('House / flat details are required.'), { status: 400 })
  if (!line2) throw Object.assign(new Error('Street / area is required.'), { status: 400 })
  if (!city) throw Object.assign(new Error('City is required.'), { status: 400 })
  if (!state) throw Object.assign(new Error('State is required.'), { status: 400 })
  if (pincode.length !== 6) throw Object.assign(new Error('Enter a valid 6-digit pincode.'), { status: 400 })
  if (!phone) throw Object.assign(new Error('A valid mobile number is required.'), { status: 400 })

  return {
    label,
    name,
    phone,
    line1,
    line2,
    city,
    state,
    pincode,
    landmark,
    ...readMapPin(input),
  }
}

export function formatAddressRecord(address) {
  return {
    ...address,
    formatted: formatAddressLine(address),
  }
}

export async function snapshotCurrentAddress(user, input = {}) {
  const pincode = String(input.pincode || '').replace(/\D/g, '').slice(0, 6)
  if (pincode.length !== 6) {
    throw Object.assign(new Error('Could not detect a valid pincode for this location. Please add a delivery address.'), {
      status: 400,
    })
  }
  await assertPincodeServiceable(pincode)
  const line1 = String(input.line1 || input.line2 || input.city || '').trim()
  const line2 = String(input.line2 || input.line1 || '').trim()
  return formatAddressRecord({
    id: 'current',
    label: 'Current location',
    name: String(input.name || user?.name || 'Customer').trim() || 'Customer',
    phone: normalizePhone(input.phone) || normalizePhone(user?.phone) || '',
    line1,
    line2,
    city: String(input.city || '').trim(),
    state: String(input.state || '').trim(),
    pincode,
    landmark: String(input.landmark || '').trim(),
    ...readMapPin(input),
  })
}

export async function listAddresses(customerId) {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } })
  if (!customer) throw Object.assign(new Error('Customer not found.'), { status: 404 })

  const list = parseAddresses(customer.addresses).map(formatAddressRecord)
  const deliveryByPin = await deliveryOptionsByPincode(list.map((item) => item.pincode))
  return list.map((item) => {
    const delivery = deliveryByPin.get(normalizePincode(item.pincode)) || {
      serviceable: false,
      morning: { enabled: false, comingSoon: true },
      express: { enabled: false, comingSoon: true },
      defaultOption: null,
    }
    return {
      ...item,
      serviceable: delivery.serviceable,
      delivery,
    }
  })
}

export async function createAddress(customerId, input) {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } })
  if (!customer) throw Object.assign(new Error('Customer not found.'), { status: 404 })

  const addresses = parseAddresses(customer.addresses)
  const payload = sanitizeAddressInput(input, customer.phone)
  await assertPincodeServiceable(payload.pincode)
  const nextAddress = {
    id: crypto.randomUUID(),
    ...payload,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await prisma.customer.update({
    where: { id: customerId },
    data: { addresses: [...addresses, nextAddress] },
  })

  return formatAddressRecord(nextAddress)
}

export async function updateAddress(customerId, addressId, input) {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } })
  if (!customer) throw Object.assign(new Error('Customer not found.'), { status: 404 })

  const addresses = parseAddresses(customer.addresses)
  const index = addresses.findIndex((item) => item.id === addressId)
  if (index === -1) throw Object.assign(new Error('Address not found.'), { status: 404 })

  const payload = sanitizeAddressInput(input, customer.phone)
  await assertPincodeServiceable(payload.pincode)
  const updated = {
    ...addresses[index],
    ...payload,
    updatedAt: new Date().toISOString(),
  }

  addresses[index] = updated
  await prisma.customer.update({
    where: { id: customerId },
    data: { addresses },
  })

  return formatAddressRecord(updated)
}

export async function deleteAddress(customerId, addressId) {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } })
  if (!customer) throw Object.assign(new Error('Customer not found.'), { status: 404 })

  const addresses = parseAddresses(customer.addresses)
  const nextAddresses = addresses.filter((item) => item.id !== addressId)
  if (nextAddresses.length === addresses.length) {
    throw Object.assign(new Error('Address not found.'), { status: 404 })
  }

  await prisma.customer.update({
    where: { id: customerId },
    data: { addresses: nextAddresses },
  })

  return { ok: true }
}

export { normalizePhone }
