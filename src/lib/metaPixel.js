// Consent persistence shared by both storefront runtimes.
export const MARKETING_CONSENT_COOKIE = 'tokriii_marketing_consent'
export const MARKETING_CONSENT_UPDATED = 'tokriii:marketing-consent-updated'
function onProductionHost() {
  return typeof window !== 'undefined' && ['tokriii.com', 'www.tokriii.com'].includes(window.location.hostname.toLowerCase())
}
export function getMarketingConsent() {
  if (!onProductionHost() || typeof document === 'undefined') return 'unavailable'
  const entry = String(document.cookie || '').split(';').map((value) => value.trim())
    .find((value) => value.startsWith(`${MARKETING_CONSENT_COOKIE}=`))
  const value = entry?.slice(MARKETING_CONSENT_COOKIE.length + 1)
  return value === 'granted' || value === 'denied' ? value : null
}

export function setMarketingConsent(granted, { notify = true } = {}) {
  if (!onProductionHost() || typeof document === 'undefined') return false
  const approved = granted === true
  const maxAge = 60 * 60 * 24 * 180
  document.cookie = `${MARKETING_CONSENT_COOKIE}=${approved ? 'granted' : 'denied'}; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure`
  if (notify) document.dispatchEvent?.(new CustomEvent(MARKETING_CONSENT_UPDATED))

  if (!approved && typeof window.fbq === 'function') window.fbq('consent', 'revoke')
  return approved
}
