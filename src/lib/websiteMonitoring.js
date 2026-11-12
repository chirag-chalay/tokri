import { browserEvents, safePage, safeEndpoint, productReference } from '../../shared/monitoring.js'

let reconnectTimer, backoff = 1000
let owners = 0, base = '', nativeFetch, stream, until = 0, generation = '', expiryTimer, flushTimer
let queue = [], lastKey, currentPage, currentProduct, currentPageRef, popTarget, disconnectDebug = () => {}, disconnectBase = () => {}
const uuid = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16)); bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128
  const value = [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('')
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`
}
const enabled = () => until > Date.now()
// The key is used only in memory to deduplicate router commits, never sent or persisted.
function keyOf(value) {
  // Query/filter cleanup is not a new page visit. Keep only a transient hash.
  const path = new URL(String(value), window.location.origin).pathname
  let a = 2166136261, b = 5381
  for (const char of path) { a = Math.imul(a ^ char.charCodeAt(0), 16777619); b = Math.imul(b, 33) ^ char.charCodeAt(0) }
  return `${a}:${b}`
}
function stopDebug() {
  until = 0; generation = ''; clearTimeout(expiryTimer)
  disconnectDebug(); disconnectDebug = () => {}
  queue = queue.filter(row => row.event === 'website.navigation')
}
function flush() {
  clearTimeout(flushTimer); flushTimer = undefined
  if (!nativeFetch || !base || !queue.length) return
  const events = queue.splice(0, 25).filter(row => row.event === 'website.navigation' || enabled())
  if (events.length) {
    // Bounded, best effort and independent of checkout promises. No retries/loops.
    nativeFetch(`${base}/monitoring/events`, { method: 'POST', credentials: 'omit', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ generation, events }), keepalive: true }).then(response => { response.body?.cancel().catch(() => {}) }).catch(() => {})
  }
  if (queue.length) flushTimer = setTimeout(flush, 1000)
}
function enqueue(row) {
  if (queue.length >= 100) return
  queue.push(row)
  if (!flushTimer) flushTimer = setTimeout(flush, 1000)
}
export function recordWebsiteDebug(event, details = {}) {
  try {
    if (!enabled() || !browserEvents.has(event) || event === 'website.navigation' || !currentPage) return
    const row = { id: uuid(), event, path: currentPage.pagePath }
    if (['failure', 'pending'].includes(details.operationStatus)) row.operationStatus = details.operationStatus
    if (/^[a-z_]{1,50}$/.test(details.failureReason || '')) row.failureReason = details.failureReason
    if (Number.isInteger(details.status) && details.status >= 100 && details.status <= 599) row.status = details.status
    if (Number.isFinite(details.durationMs) && details.durationMs >= 0 && details.durationMs <= 300000) row.durationMs = Math.round(details.durationMs)
    for (const key of ['quantity', 'count']) if (Number.isInteger(details[key]) && details[key] >= 0 && details[key] <= 10000) row[key] = details[key]
    if (['morning', 'express'].includes(details.deliveryOption)) row.deliveryOption = details.deliveryOption
    if (['product image', 'image', 'script', 'stylesheet'].includes(details.resourceKind)) row.resourceKind = details.resourceKind
    if (['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(details.method)) row.method = details.method
    if (/^[a-f0-9-]{36}$/i.test(details.relatedRequestId || '')) row.relatedRequestId = details.relatedRequestId
    if (safeEndpoint(details.endpoint)) row.endpoint = safeEndpoint(details.endpoint)
    let product = productReference(details.productRef) || currentProduct
    if (details.path) { const page = safePage(details.path); if (page) { row.path = page.pagePath; product = details.path.startsWith('/product/') ? productReference(decodeURIComponent(details.path.split(/[?#]/)[0].slice(9))) : undefined } }
    if (product) row.productRef = product
    if (!details.path && currentPageRef) row.pageRef = currentPageRef
    enqueue(row)
  } catch { /* Optional diagnostics must never affect store actions. */ }
}
export function recordWebsiteNavigation(pathname, locationKey, restored = false) {
  try {
    const key = keyOf(locationKey)
    if (key === lastKey && !restored) return // React StrictMode, duplicate shell and route-state updates.
    const page = safePage(pathname)
    if (!page) return
    const initial = lastKey === undefined
    lastKey = key; currentPage = page
    currentProduct = pathname.startsWith('/product/') ? productReference(decodeURIComponent(pathname.slice(9))) : undefined
    currentPageRef = /^\/(?:blog|p|category)\//.test(pathname) ? productReference(decodeURIComponent(pathname.split('/')[2] || '')) : undefined
    const navigation = performance.getEntriesByType('navigation')[0]
    const navigationType = restored || popTarget === key || initial && navigation?.type === 'back_forward' ? 'back_forward' : initial ? 'initial' : 'client'
    popTarget = undefined
    const row = { id: uuid(), event: 'website.navigation', path: page.pagePath, navigationType }
    if (currentProduct) row.productRef = currentProduct
    if (currentPageRef) row.pageRef = currentPageRef
    if (initial && navigation?.responseStatus >= 100) row.status = navigation.responseStatus
    enqueue(row)
    recordWebsiteDebug('website.page.ready', { durationMs: initial ? Math.round(performance.now()) : undefined })
  } catch { /* Navigation and rendering are never dependent on monitoring. */ }
}
function attachDebug() {
  const original = window.fetch
  const wrapped = async function (input, init) {
    if (!enabled()) return Reflect.apply(original, this, arguments)
    let url, endpoint, pageRequest = false
    try {
      url = new URL(typeof input === 'string' || input instanceof URL ? String(input) : input.url, window.location.origin)
      const api = new URL(base)
      endpoint = url.origin === api.origin ? safeEndpoint(url.pathname) : undefined
      const headers = new Headers(init?.headers || (typeof input !== 'string' ? input?.headers : undefined))
      pageRequest = url.origin === location.origin && (headers.get('rsc') === '1' || url.pathname.startsWith('/_next/data/')) && headers.get('next-router-prefetch') !== '1'
    } catch { return Reflect.apply(original, this, arguments) }
    if (!endpoint && !pageRequest) return Reflect.apply(original, this, arguments)
    const start = performance.now(), method = String(init?.method || input?.method || 'GET').toUpperCase()
    try {
      const response = await Reflect.apply(original, this, arguments)
      if (endpoint) recordWebsiteDebug(response.ok && response.headers.get('X-Tokri-Operation-Status') !== 'failure' ? 'frontend.api.completed' : 'frontend.api.failed', { endpoint, method, status: response.status, durationMs: performance.now() - start, relatedRequestId: response.headers.get('X-Tokri-Request-Id') || undefined, failureReason: response.headers.get('X-Tokri-Failure-Reason') || undefined, operationStatus: response.headers.get('X-Tokri-Operation-Status') || undefined })
      else if (!response.ok) recordWebsiteDebug('frontend.page.failed', { path: url.pathname, status: response.status, durationMs: performance.now() - start })
      return response // Do not read, clone or delay the response body.
    } catch (error) {
      recordWebsiteDebug(endpoint ? 'frontend.api.failed' : 'frontend.page.failed', { endpoint, path: pageRequest ? url.pathname : undefined, method, durationMs: performance.now() - start })
      throw error // Preserve identity/abort semantics of the original error.
    }
  }
  window.fetch = wrapped
  const failed = event => {
    const target = event.target
    if (target instanceof Element) {
      const kind = target.tagName === 'IMG' ? String(target.getAttribute('src') || '').includes('/uploads/products/') ? 'product image' : 'image' : target.tagName === 'SCRIPT' ? 'script' : target.tagName === 'LINK' ? 'stylesheet' : null
      if (kind) recordWebsiteDebug('frontend.resource.failed', { resourceKind: kind })
    } else recordWebsiteDebug('frontend.error') // No raw message, filename, stack or form data.
  }
  const rejected = () => recordWebsiteDebug('frontend.promise.failed')
  window.addEventListener('error', failed, true)
  window.addEventListener('unhandledrejection', rejected)
  return () => { if (window.fetch === wrapped) window.fetch = original; window.removeEventListener('error', failed, true); window.removeEventListener('unhandledrejection', rejected) }
}
function connect() {
  if (stream || typeof EventSource === 'undefined' || document.hidden) return
  stopDebug()
  const connection = new EventSource(`${base}/monitoring/stream`)
  stream = connection
  connection.onmessage = event => {
    if (stream !== connection) return
    backoff = 1000
    try {
      const state = JSON.parse(event.data)
      stopDebug()
      if (typeof state.generation !== 'string' || !state.debugUntil || Date.parse(state.debugUntil) <= Date.now()) return
      until = Date.parse(state.debugUntil); generation = state.generation
      disconnectDebug = attachDebug()
      expiryTimer = setTimeout(stopDebug, Math.max(1, until - Date.now()))
      recordWebsiteDebug('website.page.ready')
    } catch { stopDebug() }
  }
  connection.onerror = () => {
    if (stream !== connection) return
    stopDebug(); connection.close(); stream = undefined
    clearTimeout(reconnectTimer)
    if (owners && !document.hidden) { backoff = Math.min(60000, backoff * 2); reconnectTimer = setTimeout(connect, backoff) }
  } // Fail closed; capped reconnect backoff avoids offline request storms.
}
export function installWebsiteMonitoring(apiBase) {
  try {
    if (typeof window === 'undefined') return () => {}
    owners++
    if (owners === 1) {
      base = new URL(apiBase, window.location.origin).href.replace(/\/$/, '')
      nativeFetch = window.fetch.bind(window)
      connect()
      const pop = () => { popTarget = keyOf(location.pathname + '?' + location.search.slice(1)) }
      // Navigation API observes history traversal before Next restores its
      // router state. Older browsers use the popstate fallback.
      const traversal = event => { if (event.navigationType === 'traverse') popTarget = keyOf(event.destination.url) }
      const navigation = window.navigation
      const leave = () => flush()
      const shown = event => { if (event.persisted) recordWebsiteNavigation(location.pathname, location.pathname + '?' + location.search.slice(1), true); connect() }
      const visibility = () => { if (document.hidden) { clearTimeout(reconnectTimer); stream?.close(); stream = undefined; stopDebug(); flush() } else connect() }
      // Run before router bubble handlers can commit the new page synchronously.
      if (navigation) navigation.addEventListener('navigate', traversal)
      else window.addEventListener('popstate', pop, true)
      window.addEventListener('pagehide', leave); window.addEventListener('pageshow', shown); document.addEventListener('visibilitychange', visibility)
      disconnectBase = () => { navigation?.removeEventListener('navigate', traversal); window.removeEventListener('popstate', pop, true); window.removeEventListener('pagehide', leave); window.removeEventListener('pageshow', shown); document.removeEventListener('visibilitychange', visibility) }
    }
    let released = false
    return () => { if (released) return; released = true; if (--owners === 0) { clearTimeout(reconnectTimer); disconnectBase(); stream?.close(); stream = undefined; stopDebug(); flush() } }
  } catch { stopDebug(); return () => {} }
}
