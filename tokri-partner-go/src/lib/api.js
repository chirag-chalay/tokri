import { API_BASE_URL } from '../config'

const ASSET_BASE = API_BASE_URL.replace(/\/api\/v1$/, '')
const UPLOADS_HOST = 'https://tokriii.com'

export function resolveAssetUrl(value) {
  if (!value) return null
  if (/^https?:\/\//i.test(value)) {
    return value
      .replace('http://localhost:5223', ASSET_BASE)
      .replace('http://127.0.0.1:5223', ASSET_BASE)
      .replace('https://server.tokriii.com/uploads/', `${UPLOADS_HOST}/uploads/`)
  }
  if (value.startsWith('/uploads/')) return `${UPLOADS_HOST}${value}`
  if (value.startsWith('/')) return `${ASSET_BASE}${value}`
  return value
}

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const detail = data.message || data.error || ''
    throw new Error(detail || `Request failed (${response.status})`)
  }
  return data
}

function authHeaders(token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

export async function postJson(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  return parseResponse(response)
}

export async function authGet(path, token) {
  const response = await fetch(`${API_BASE_URL}${path}`, { headers: authHeaders(token) })
  return parseResponse(response)
}

export async function authPost(path, token, body = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  })
  return parseResponse(response)
}

export function partnerLogin(email, password) {
  return postJson('/partner/auth/login', { email, password })
}

export function partnerForgot(email) {
  return postJson('/partner/auth/forgot', { email })
}

export function fetchPartnerMe(token) {
  return authGet('/partner/me', token)
}

export function fetchPartnerOrders(token) {
  return authGet('/partner/orders', token)
}

/** Detail uses the list endpoint so Expo Go works before GET /orders/:id is deployed. */
export async function fetchPartnerOrder(token, orderId) {
  const data = await authGet('/partner/orders', token)
  const order = (data.orders || []).find((item) => item.id === orderId)
  if (!order) {
    throw new Error('Order not found.')
  }
  return { order }
}

export function collectCash(token, orderId) {
  return authPost(`/partner/orders/${orderId}/collect-cash`, token)
}

export function createPaymentQr(token, orderId) {
  return authPost(`/partner/orders/${orderId}/payment-qr`, token)
}
