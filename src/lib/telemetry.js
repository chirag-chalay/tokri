import { loadTrackingConfig } from './trackingConfig'
import { buildCommerceEvent } from './trackingEvents'
import { getAnalyticsConsent, ANALYTICS_CONSENT_UPDATED } from './trackingConsent'
import { getMarketingConsent, MARKETING_CONSENT_UPDATED } from './metaPixel'

let loadedConfig
let configPromise
let currentPath = null
let lastPage = null
let listening = false
let scrollSent = false
const names = { page_view: 'PageView', view_item: 'ViewContent', search: 'Search', add_to_cart: 'AddToCart', begin_checkout: 'InitiateCheckout', add_payment_info: 'AddPaymentInfo', purchase: 'Purchase', scroll_depth: 'Scroll' }

function safePath(path) {
  try {
    const url = new URL(path, window.location.origin)
    if (url.origin !== window.location.origin || /^\/order(?:\/|$)/.test(url.pathname) || /@|%40/.test(url.pathname)) return null
    for (const [key, value] of url.searchParams) {
      // Tag Assistant adds this non-customer debug flag during Preview.
      // Accept it for initialization but never forward it to analytics.
      if (key === 'gtm_debug') {
        if (!/^[a-z0-9_.-]{1,64}$/i.test(value)) return null
        continue
      }
      if (!['category', 'sort', 'page', 'view', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'].includes(key.toLowerCase()) || !/^[a-z0-9_.-]{1,250}$/i.test(value)) return null
    }
    url.searchParams.delete('gtm_debug')
    // Preserve only the validated campaign/catalog query parameters.
    return `${url.pathname}${url.search}`
  } catch { return null }
}
function layer() {
  window.dataLayer = window.dataLayer || []
  return window.dataLayer
}
function consentUpdate() {
  const analytics = getAnalyticsConsent() === 'granted'
  const marketing = getMarketingConsent() === 'granted'
  const command = function () { layer().push(arguments) }
  command('consent', 'update', { analytics_storage: analytics ? 'granted' : 'denied', ad_storage: marketing ? 'granted' : 'denied', ad_user_data: marketing ? 'granted' : 'denied', ad_personalization: marketing ? 'granted' : 'denied' })
  layer().push({ event: 'tokri_consent_update', tracking_consent: { analytics_storage: analytics ? 'granted' : 'denied', ad_storage: marketing ? 'granted' : 'denied', ad_user_data: marketing ? 'granted' : 'denied', ad_personalization: marketing ? 'granted' : 'denied' } })
  if (!marketing) {
    void installAnalytics().then((config) => { if (config) fetch('/api/v1/tracking/revoke-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventToken: config.eventToken }) }).catch(() => {}) })
    try { const user = JSON.parse(localStorage.getItem('tokri_user') || 'null'); if (user?.token) fetch('/api/v1/tracking/revoke', { method: 'POST', headers: { Authorization: `Bearer ${user.token}` } }).catch(() => {}) } catch { /* Storage may be unavailable. */ }
  }
  if (!marketing && typeof window.fbq === 'function') window.fbq('consent', 'revoke')
  lastPage = null
  if (currentPath) void trackPageView(currentPath)
}
export function installAnalytics() {
  if (typeof window === 'undefined') return Promise.resolve(null)
  if (!listening) {
    listening = true
    document.addEventListener(ANALYTICS_CONSENT_UPDATED, consentUpdate)
    document.addEventListener(MARKETING_CONSENT_UPDATED, consentUpdate)
    const recordScroll = (root) => {
      if (scrollSent || !root || getMarketingConsent() !== 'granted' || !currentPath || !safePath(currentPath)) return
      const distance = root.scrollHeight - root.clientHeight
      if (distance <= 0 || root.scrollTop / distance < 0.9) return
      scrollSent = true
      const path = currentPath
      void dispatch('scroll_depth', { percent_scrolled: 90 }, undefined, path).then((sent) => {
        if (!sent && currentPath === path) scrollSent = false
      }).catch(() => { if (currentPath === path) scrollSent = false })
    }
    window.addEventListener?.('scroll', () => recordScroll(document.scrollingElement), { passive: true })
    document.addEventListener('scroll', (event) => {
      if (event.target?.hasAttribute?.('data-track-scroll')) recordScroll(event.target)
    }, { capture: true, passive: true })
  }
  configPromise ||= loadTrackingConfig({ hostname: window.location.hostname }).then((config) => { loadedConfig = config; return config })
  return configPromise
}
async function dispatch(name, data = {}, eventId = globalThis.crypto?.randomUUID?.(), expectedPath = null) {
  // Capture consent at the action, never replay denied actions after async config.
  const analytics = getAnalyticsConsent() === 'granted'
  const marketing = getMarketingConsent() === 'granted'
  if (!analytics && !marketing) return false
  const config = loadedConfig || await installAnalytics()
  if (name === 'scroll_depth' && (!config?.meta.enabled || getMarketingConsent() !== 'granted' || currentPath !== expectedPath)) return false
  const safe = safePath(window.location.href)
  if (!config || (!safe && name !== 'purchase')) return false
  const path = safe || '/checkout'
  if (analytics && getAnalyticsConsent() === 'granted' && config.gtm.enabled) {
    if (!window.__tokriGtm) {
      window.__tokriGtm = config.gtm.containerId
      const command = function () { layer().push(arguments) }
      command('consent', 'default', { analytics_storage: 'granted', ad_storage: marketing ? 'granted' : 'denied', ad_user_data: marketing ? 'granted' : 'denied', ad_personalization: marketing ? 'granted' : 'denied' })
      layer().push({ tracking_consent: { analytics_storage: 'granted', ad_storage: marketing ? 'granted' : 'denied', ad_user_data: marketing ? 'granted' : 'denied', ad_personalization: marketing ? 'granted' : 'denied' }, tracking: { ga4_measurement_id: config.gtm.measurementId }, page_location: `${window.location.origin}${path}`, page_path: path })
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtm.js?id=${config.gtm.containerId}`
      layer().push({ 'gtm.start': Date.now(), event: 'gtm.js' })
      document.head.appendChild(script)
    }
    layer().push({ ecommerce: null })
    layer().push({ ...data, event: name, event_id: eventId, page_location: `${window.location.origin}${path}`, page_path: path })
  }
  if (safe && marketing && getMarketingConsent() === 'granted' && config.meta.enabled && names[name]) {
    if (!window.fbq) {
      const fbq = function (...args) { if (fbq.callMethod) fbq.callMethod(...args); else fbq.queue.push(args) }
      fbq.queue = []; fbq.loaded = true; fbq.version = '2.0'; window.fbq = fbq; window._fbq = fbq
    }
    if (window.__tokriMetaPixelId !== config.meta.pixelId) {
      window.fbq('init', config.meta.pixelId)
      window.__tokriMetaPixelId = config.meta.pixelId
      const script = document.createElement('script'); script.async = true; script.src = 'https://connect.facebook.net/en_US/fbevents.js'; document.head.appendChild(script)
    }
    window.fbq('consent', 'grant')
    const ecommerce = data.ecommerce
    const payload = ecommerce ? { currency: ecommerce.currency, value: data.metaValue ?? ecommerce.value, content_ids: ecommerce.items.map((item) => item.item_id), content_type: 'product', contents: ecommerce.items.map((item) => ({ id: item.item_id, quantity: item.quantity })) } : (data.search_term ? { search_string: data.search_term } : name === 'scroll_depth' ? { percent_scrolled: 90 } : {})
    window.fbq(name === 'scroll_depth' ? 'trackSingleCustom' : 'trackSingle', config.meta.pixelId, names[name], payload, { eventID: eventId })
    if (name !== 'purchase') fetch('/api/v1/tracking/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventToken: config.eventToken, eventName: names[name], eventId, sourceUrl: `${window.location.origin}${path.split('?')[0]}`, ecommerce: data.ecommerce }) }).catch(() => {})
  }
  return true
}
export async function trackPageView(path) {
  if (currentPath !== path) scrollSent = false
  currentPath = path
  const safe = safePath(path)
  if (!safe) { lastPage = null; return }
  const key = `${path}|${getAnalyticsConsent()}|${getMarketingConsent()}`
  if (key === lastPage) return
  lastPage = key
  if (!await dispatch('page_view').catch(() => false)) lastPage = null
}
const pendingPurchases = new Set()
export async function trackCommerce(name, options, eventId) {
  const event = buildCommerceEvent(name, options)
  if (!event) return false
  const key = name === 'purchase' ? `tokri-tracking-purchase:${options.transactionId}` : null
  if (key) {
    if (pendingPurchases.has(key)) return false
    try { if (sessionStorage.getItem(key)) return false } catch { /* Optional persistence. */ }
    pendingPurchases.add(key)
  }
  try {
    const result = await dispatch(name, { ...event, ...(options?.paymentType ? { payment_type: options.paymentType } : {}), metaValue: options?.value }, eventId)
    if (key && result) { try { sessionStorage.setItem(key, '1') } catch { /* Optional persistence. */ } }
    return result
  } catch { return false } finally { if (key) pendingPurchases.delete(key) }
}

export function checkoutTrackingContext() {
  return { source: 'web', url: `${window.location.origin}/checkout`, analytics: getAnalyticsConsent() === 'granted', marketing: getMarketingConsent() === 'granted' }
}

export function trackSearch(term) {
  if (typeof term !== 'string') return
  const searchTerm = term.normalize('NFKC').trim().replace(/\s+/g, ' ')
  // Permit product terms while excluding email/URL syntax and phone-like input.
  if (!/^[\p{L}\p{M}\p{N} '\u2019-]{2,60}$/u.test(searchTerm) || /\p{N}{6,}/u.test(searchTerm) || /^\p{N}+$/u.test(searchTerm)) return
  void dispatch('search', { search_term: searchTerm }).catch(() => {})
}
