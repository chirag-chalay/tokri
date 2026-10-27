export const PLACEHOLDER_IMAGE =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect fill="#f8fafc" width="100%" height="100%"/></svg>',
  )
const FETCH_TIMEOUT_MS = 15000

function stripTrailingSlash(value) {
  return String(value || '').replace(/\/+$/, '')
}

function resolveApiBaseUrl() {
  const configured = stripTrailingSlash(import.meta.env.VITE_API_BASE_URL)
  if (configured) return configured

  if (typeof window !== 'undefined') {
    const { hostname, origin } = window.location

    if (hostname === 'www.tokriii.com' || hostname === 'tokriii.com') {
      return 'https://tokriii.com/api/v1'
    }

    // Staging and any other deployed host share API on the same origin.
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `${origin}/api/v1`
    }

    return `${origin}/api/v1`
  }

  return 'http://localhost:5223/api/v1'
}

export const API_BASE_URL = resolveApiBaseUrl()
const ASSET_BASE_URL = API_BASE_URL.replace(/\/api\/v1$/, '') || API_BASE_URL

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error(`Request timed out for ${url}`)
    }
    throw error
  } finally {
    window.clearTimeout(timer)
  }
}

export async function fetchJson(path) {
  const response = await fetchWithTimeout(`${API_BASE_URL}${path}`)

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `Request failed (${response.status})`)
  }

  return response.json()
}

export async function postJson(path, body) {
  const response = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`)
  }

  return data
}

function authHeaders(user) {
  const headers = { 'Content-Type': 'application/json' }
  if (user?.token) headers.Authorization = `Bearer ${user.token}`
  if (user?.phone) headers['X-User-Phone'] = user.phone
  return headers
}

export async function authGet(path, user) {
  const response = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
    headers: authHeaders(user),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`)
  return data
}

export async function authPost(path, user, body) {
  const response = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: authHeaders(user),
    body: JSON.stringify(body),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`)
  return data
}

export async function authPut(path, user, body) {
  const response = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers: authHeaders(user),
    body: JSON.stringify(body),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`)
  return data
}

export async function authPatch(path, user, body) {
  const response = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
    method: 'PATCH',
    headers: authHeaders(user),
    body: JSON.stringify(body),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`)
  return data
}

export async function authDelete(path, user) {
  const response = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    headers: authHeaders(user),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`)
  return data
}

export async function authDownloadBlob(path, user) {
  const headers = {}
  if (user?.token) headers.Authorization = `Bearer ${user.token}`
  if (user?.phone) headers['X-User-Phone'] = user.phone

  const response = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
    headers,
  })
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.message || `Download failed (${response.status})`)
  }
  return response.blob()
}

export async function downloadOrderInvoice(orderNo, user) {
  const blob = await authDownloadBlob(`/account/orders/${orderNo}/invoice?download=1`, user)
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `invoice-${orderNo}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

export function resolveAssetUrl(value) {
  if (!value) return PLACEHOLDER_IMAGE
  let resolved = value
  if (/^(https?:|data:|blob:)/.test(value)) {
    resolved = value
  } else if (value.startsWith('/')) {
    if (typeof window !== 'undefined') {
      const { hostname, origin } = window.location
      if (hostname === 'www.tokriii.com' || hostname === 'tokriii.com') {
        resolved = `https://tokriii.com${value}`
      } else {
        // Staging / localhost / other hosts: serve uploads from the current origin
        resolved = `${origin}${value}`
      }
    } else {
      resolved = `${ASSET_BASE_URL}${value}`
    }
  }

  return resolved
}

/**
 * Staging often has new uploads locally, while older catalog images still live on
 * production. If a staging upload 404s, retry the same path on tokriii.com.
 */
export function installUploadFallback() {
  if (typeof document === 'undefined' || window.__tokriUploadFallback) return
  window.__tokriUploadFallback = true

  document.addEventListener(
    'error',
    (event) => {
      const el = event.target
      if (!(el instanceof HTMLImageElement)) return

      if (el.dataset.uploadFallbackTried === '1') {
        if (el.dataset.fallbackApplied !== '1') {
          el.dataset.fallbackApplied = '1'
          el.src = PLACEHOLDER_IMAGE
        }
        return
      }

      const src = el.currentSrc || el.getAttribute('src') || el.src || ''
      if (src.includes('://server.tokriii.com/uploads/')) {
        el.dataset.uploadFallbackTried = '1'
        el.src = src.replace('://server.tokriii.com/', '://tokriii.com/')
        return
      }

      if (el.dataset.fallbackApplied !== '1') {
        el.dataset.fallbackApplied = '1'
        el.src = PLACEHOLDER_IMAGE
      }
    },
    true,
  )
}

export function normalizeProduct(product) {
  return {
    ...product,
    id: product.slug || product.id,
    image: resolveAssetUrl(product.image),
  }
}

export function normalizeProducts(products) {
  return products.map(normalizeProduct)
}

export function getApiBaseUrl() {
  return API_BASE_URL
}
