import { API_BASE_URL } from '../config'
import { appBuild, appPlatform } from './appBuild'

const ASSET_BASE = API_BASE_URL.replace(/\/api\/v1$/, '')
/** Live host that actually serves /uploads (staging Node does not). */
const UPLOADS_HOST = 'https://tokriii.com'
const FETCH_TIMEOUT_MS = 12000

if (__DEV__) {
  // Confirms which API Expo actually bundled.
  console.log('[tokri-api]', API_BASE_URL)
}

export function resolveAssetUrl(value) {
  if (!value) return null
  if (/^https?:\/\//i.test(value)) {
    return value
      .replace('http://localhost:5223', ASSET_BASE)
      .replace('http://127.0.0.1:5223', ASSET_BASE)
      // Staging API often emits server.tokriii.com/uploads → 404/502; live host has the files.
      .replace('https://server.tokriii.com/uploads/', `${UPLOADS_HOST}/uploads/`)
  }
  if (value.startsWith('/uploads/')) return `${UPLOADS_HOST}${value}`
  if (value.startsWith('/')) return `${ASSET_BASE}${value}`
  return value
}

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const detail = data.message || data.error?.description || data.error || ''
    throw Object.assign(new Error(detail || `Request failed (${response.status})`), { status: response.status, code: data.code })
  }
  return data
}

async function request(path, options = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
    })
    return parseResponse(response)
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error(`Request timed out. API: ${API_BASE_URL}`)
    }
    const message = error?.message || 'Network request failed'
    if (/failed to connect|Network request failed|ConnectException/i.test(message)) {
      throw new Error(`${message}\nAPI: ${API_BASE_URL}`)
    }
    throw error
  } finally {
    clearTimeout(timer)
  }
}

export function authHeaders(token) {
  const headers = {
    'Content-Type': 'application/json',
    'X-App-Platform': appPlatform(),
    'X-App-Build': String(appBuild()),
  }
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

export async function fetchJson(path, { timeoutMs = 0 } = {}) {
  if (!timeoutMs) {
    return request(path, { headers: authHeaders() })
  }
  const controller = new AbortController()
  let timer
  try {
    return await Promise.race([
      fetch(`${API_BASE_URL}${path}`, { headers: authHeaders(), signal: controller.signal }).then(parseResponse),
      new Promise((_, reject) => {
        timer = setTimeout(() => { controller.abort(); reject(new Error('Request timed out')) }, timeoutMs)
      }),
    ])
  } finally {
    clearTimeout(timer)
  }
}

export async function authGet(path, token) {
  return request(path, { headers: authHeaders(token) })
}

function checkoutPostBody(path, body) {
  return JSON.stringify(['/checkout/quote', '/checkout/preview-coupon', '/checkout/create-order'].includes(path)
    ? { ...body, smallCartPricing: 1 }
    : body)
}

export async function authPost(path, token, body) {
  return request(path, {
    method: 'POST',
    headers: authHeaders(token),
    body: checkoutPostBody(path, body),
  })
}

export async function authPut(path, token, body) {
  return request(path, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  })
}

export async function authPatch(path, token, body) {
  return request(path, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  })
}

export async function authDelete(path, token) {
  return request(path, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
}

export async function postJson(path, body) {
  return request(path, {
    method: 'POST',
    headers: authHeaders(),
    body: checkoutPostBody(path, body),
  })
}

export function normalizeProduct(product) {
  if (!product) return product
  return {
    ...product,
    id: product.slug || product.id,
    image: resolveAssetUrl(product.image),
  }
}

export function normalizeCategory(category) {
  if (!category) return category
  return {
    ...category,
    image: resolveAssetUrl(category.image),
    bannerImage: resolveAssetUrl(category.bannerImage),
  }
}

/** Cart / order line items from API or storage */
export function normalizeLineItem(item) {
  if (!item) return item
  return {
    ...item,
    image: resolveAssetUrl(item.image),
  }
}

export function normalizeOrder(order) {
  if (!order) return order
  return {
    ...order,
    items: Array.isArray(order.items) ? order.items.map(normalizeLineItem) : order.items,
  }
}

export function formatPrice(value) {
  return `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}
