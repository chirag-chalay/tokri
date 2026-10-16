import { API_BASE_URL } from '../config'
import { appBuild, appPlatform } from './appBuild'

const ASSET_BASE = API_BASE_URL.replace(/\/api\/v1$/, '')
/** Live host that actually serves /uploads (staging Node does not). */
const UPLOADS_HOST = 'https://tokriii.com'

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
    throw new Error(detail || `Request failed (${response.status})`)
  }
  return data
}

function authHeaders(token) {
  const headers = {
    'Content-Type': 'application/json',
    'X-App-Platform': appPlatform(),
    'X-App-Build': String(appBuild()),
  }
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

export async function fetchJson(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, { headers: authHeaders() })
  return parseResponse(response)
}

export async function authGet(path, token) {
  const response = await fetch(`${API_BASE_URL}${path}`, { headers: authHeaders(token) })
  return parseResponse(response)
}

export async function authPost(path, token, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  })
  return parseResponse(response)
}

export async function authPut(path, token, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  })
  return parseResponse(response)
}

export async function authPatch(path, token, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  })
  return parseResponse(response)
}

export async function authDelete(path, token) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  return parseResponse(response)
}

export async function postJson(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  return parseResponse(response)
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
  return `₹${Number(value).toLocaleString('en-IN')}`
}
