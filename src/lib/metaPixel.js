// One production-only Meta Pixel shared by the Next.js and Vite storefronts.
// No marketing requests are permitted until the visitor explicitly opts in.
export const META_PIXEL_ID = '891089060757681'
export const MARKETING_CONSENT_COOKIE = 'tokriii_marketing_consent'
export const MARKETING_CONSENT_UPDATED = 'tokriii:marketing-consent-updated'

const PIXEL_SCRIPT = 'https://connect.facebook.net/en_US/fbevents.js'
const PRODUCTION_HOSTS = new Set(['tokriii.com', 'www.tokriii.com'])
const SAFE_QUERY_KEYS = new Set([
  'category', 'sort', 'page', 'view',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'fbclid', 'gclid',
])

let lastPageViewKey = null
let consentListenerAttached = false
let pixelConsentGranted = false

function onProductionHost() {
  return typeof window !== 'undefined' &&
    PRODUCTION_HOSTS.has(String(window.location.hostname || '').toLowerCase())
}

export function getMarketingConsent() {
  if (!onProductionHost() || typeof document === 'undefined') return 'unavailable'
  const entry = String(document.cookie || '').split(';').map((value) => value.trim())
    .find((value) => value.startsWith(`${MARKETING_CONSENT_COOKIE}=`))
  const value = entry?.slice(MARKETING_CONSENT_COOKIE.length + 1)
  return value === 'granted' || value === 'denied' ? value : null
}

function hasMarketingConsent() {
  return getMarketingConsent() === 'granted'
}

// Meta Pixel can read the current URL itself. Do not invoke it on URLs that
// might contain order IDs or unreviewed query parameters (OTP, email, phone,
// access tokens, checkout session IDs, etc.). Public catalog query changes
// (e.g. /shop?category=exotic) are still tracked separately.
function safePageKey(path) {
  try {
    const current = new URL(window.location.href)
    const requested = new URL(String(path || `${current.pathname}${current.search}`), current.origin)
    if (requested.origin !== current.origin) return null

    for (const url of [current, requested]) {
      if (/^\/order(?:\/|$)/i.test(url.pathname) || /@|%40/i.test(url.pathname)) return null
      for (const [key, value] of url.searchParams) {
        if (!SAFE_QUERY_KEYS.has(key.toLowerCase()) ||
            !/^[a-z0-9_.-]{1,250}$/i.test(value)) return null
      }
    }
    return `${requested.pathname}${requested.search}`
  } catch {
    return null
  }
}

function alreadyInitializedByAnotherTag() {
  const fbq = window.fbq
  if (typeof fbq !== 'function') return false
  try {
    const pixels = fbq.getState?.()?.pixels || []
    if (pixels.some((pixel) => String(pixel.id) === META_PIXEL_ID)) return true
  } catch {
    // Third-party integrations may not implement getState().
  }
  return Array.isArray(fbq.queue) && fbq.queue.some(
    (entry) => entry?.[0] === 'init' && String(entry[1]) === META_PIXEL_ID,
  )
}

function initializeMetaPixel() {
  if (!onProductionHost() || !hasMarketingConsent()) return false
  if (!safePageKey()) return false
  if (window.__tokriMetaPixelId === META_PIXEL_ID) {
    // Re-acceptance also has to re-grant permission in the already loaded SDK.
    if (!pixelConsentGranted) window.fbq('consent', 'grant')
    pixelConsentGranted = true
    return true
  }

  if (typeof window.fbq !== 'function') {
    // Official Meta Pixel queue/bootstrap pattern; library loads async.
    const fbq = function (...args) {
      if (fbq.callMethod) fbq.callMethod.apply(fbq, args)
      else fbq.queue.push(args)
    }
    fbq.queue = []
    fbq.push = fbq
    fbq.loaded = true
    fbq.version = '2.0'
    window.fbq = fbq
    window._fbq = fbq
  }

  if (!alreadyInitializedByAnotherTag()) window.fbq('init', META_PIXEL_ID)
  window.fbq('consent', 'grant')
  pixelConsentGranted = true

  if (!document.querySelector(`script[src="${PIXEL_SCRIPT}"]`)) {
    const script = document.createElement('script')
    script.async = true
    script.src = PIXEL_SCRIPT
    document.head.appendChild(script)
  }

  window.__tokriMetaPixelId = META_PIXEL_ID
  return true
}

/**
 * Called by the existing analytics entrypoint. Does not imply consent.
 * Consent UI/CMP must explicitly call setMarketingConsent(true/false) or
 * dispatch a 'tokriii:marketing-consent-change' event with { granted }.
 */
export function installMetaPixel() {
  if (!onProductionHost()) return false
  if (!consentListenerAttached) {
    document.addEventListener('tokriii:marketing-consent-change', (event) => {
      setMarketingConsent(event.detail?.granted === true)
    })
    consentListenerAttached = true
  }
  return initializeMetaPixel()
}

/** Only call this as a direct consequence of the visitor's consent decision. */
export function setMarketingConsent(granted) {
  if (!onProductionHost() || typeof document === 'undefined') return false
  const approved = granted === true
  const maxAge = 60 * 60 * 24 * 180
  document.cookie = `${MARKETING_CONSENT_COOKIE}=${approved ? 'granted' : 'denied'}; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure`
  document.dispatchEvent?.(new CustomEvent(MARKETING_CONSENT_UPDATED))

  if (!approved) {
    if (window.__tokriMetaPixelId === META_PIXEL_ID && typeof window.fbq === 'function') {
      window.fbq('consent', 'revoke')
    }
    lastPageViewKey = null
    pixelConsentGranted = false
    return false
  }

  if (!initializeMetaPixel()) return false
  trackMetaPageView(`${window.location.pathname}${window.location.search}`)
  return true
}

/** PageViews on first load and client-side pathname/search changes. */
export function trackMetaPageView(path) {
  if (!onProductionHost() || !hasMarketingConsent()) return false
  const key = safePageKey(path)
  if (!key) {
    lastPageViewKey = null
    return false
  }
  if (lastPageViewKey === key || !initializeMetaPixel()) return false

  // trackSingle targets ONLY the Tokriii dataset if another Pixel is present.
  window.fbq('trackSingle', META_PIXEL_ID, 'PageView')
  lastPageViewKey = key
  return true
}
