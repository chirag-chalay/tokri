// Runtime tracking settings contain only public IDs. They are never persisted
// across page loads, so a backend configuration change is seen on refresh.
export async function loadTrackingConfig({ fetchImpl = globalThis.fetch, hostname, timeoutMs = 5000 } = {}) {
  const host = String(hostname || globalThis.location?.hostname || '').toLowerCase()
  if (!host || typeof fetchImpl !== 'function') return null
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetchImpl('/api/v1/tracking/config', { cache: 'no-store', signal: controller.signal })
    if (!response.ok) return null
    const data = await response.json()
    if (data?.enabled !== true || !Array.isArray(data.allowedHosts) || !data.allowedHosts.includes(host)) return null
    const gtmId = String(data.gtm?.containerId || '')
    const gaId = String(data.gtm?.measurementId || '')
    const pixelId = String(data.meta?.pixelId || '')
    return {
      eventToken: typeof data.eventToken === 'string' ? data.eventToken : '',
      version: String(data.version || ''),
      currency: /^[A-Z]{3}$/.test(data.currency) ? data.currency : 'INR',
      gtm: { enabled: data.gtm?.enabled === true && /^GTM-[A-Z0-9]+$/.test(gtmId) && /^G-[A-Z0-9]+$/.test(gaId), containerId: gtmId, measurementId: gaId },
      meta: { enabled: data.meta?.enabled === true && /^\d{5,25}$/.test(pixelId), pixelId },
    }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}
