// Separate analytics choice from the existing marketing consent cookie.
export const ANALYTICS_CONSENT_COOKIE = 'tokriii_analytics_consent'
export const ANALYTICS_CONSENT_UPDATED = 'tokriii:analytics-consent-updated'

export function getAnalyticsConsent() {
  if (typeof document === 'undefined') return null
  const entry = String(document.cookie || '').split(';').map((value) => value.trim())
    .find((value) => value.startsWith(`${ANALYTICS_CONSENT_COOKIE}=`))
  const value = entry?.slice(ANALYTICS_CONSENT_COOKIE.length + 1)
  return value === 'granted' || value === 'denied' ? value : null
}

export function setAnalyticsConsent(granted, { notify = true } = {}) {
  if (typeof document === 'undefined') return false
  const value = granted === true ? 'granted' : 'denied'
  document.cookie = `${ANALYTICS_CONSENT_COOKIE}=${value}; Path=/; Max-Age=${60 * 60 * 24 * 180}; SameSite=Lax; Secure`
  const saved = getAnalyticsConsent() === value
  if (saved && notify) document.dispatchEvent(new Event(ANALYTICS_CONSENT_UPDATED))
  return saved
}
