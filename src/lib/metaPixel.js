// Consent persistence shared by both storefront runtimes.
export const MARKETING_CONSENT_COOKIE = 'tokriii_marketing_consent'
export const MARKETING_CONSENT_UPDATED = 'tokriii:marketing-consent-updated'
let pendingClick

function cookie(name) {
  const prefix = name + '='
  return String(document.cookie || '').split(';').map(value => value.trim())
    .find(value => value.startsWith(prefix))?.slice(prefix.length)
}

export function hasMetaBrowserId() {
  return typeof document !== 'undefined' && /^fb\.\d+\.\d+\.[A-Za-z0-9_-]+$/.test(cookie('_fbp') || '')
}

export function captureMetaClick() {
  if (!onProductionHost() || typeof document === 'undefined') return
  const clickId = new URL(window.location.href).searchParams.get('fbclid')
  if (/^[A-Za-z0-9_-]{1,230}$/.test(clickId || '') && pendingClick?.id !== clickId) {
    pendingClick = { id: clickId, timestamp: Date.now() }
  }
  if (!pendingClick || getMarketingConsent() !== 'granted') return
  if (cookie('_fbc')?.match(/^fb\.1\.\d{13}\.([A-Za-z0-9_-]+)$/)?.[1] !== pendingClick.id) {
    document.cookie = `_fbc=fb.1.${pendingClick.timestamp}.${pendingClick.id}; Path=/; Max-Age=7776000; SameSite=Lax; Secure`
  }
  pendingClick = undefined
}
function onProductionHost() {
  return typeof window !== 'undefined' && ['tokriii.com', 'www.tokriii.com'].includes(window.location.hostname.toLowerCase())
}
export function getMarketingConsent() {
  if (!onProductionHost() || typeof document === 'undefined') return 'unavailable'
  const value = cookie(MARKETING_CONSENT_COOKIE)
  return value === 'granted' || value === 'denied' ? value : null
}

export function setMarketingConsent(granted, { notify = true } = {}) {
  if (!onProductionHost() || typeof document === 'undefined') return false
  const approved = granted === true
  const maxAge = 60 * 60 * 24 * 180
  document.cookie = `${MARKETING_CONSENT_COOKIE}=${approved ? 'granted' : 'denied'}; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure`
  if (approved) captureMetaClick()
  else {
    pendingClick = undefined
    for (const name of ['_fbc', '_fbp']) {
      document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax; Secure`
      document.cookie = `${name}=; Domain=tokriii.com; Path=/; Max-Age=0; SameSite=Lax; Secure`
    }
  }
  if (notify) document.dispatchEvent?.(new CustomEvent(MARKETING_CONSENT_UPDATED))

  if (!approved && typeof window.fbq === 'function') window.fbq('consent', 'revoke')
  return approved
}
