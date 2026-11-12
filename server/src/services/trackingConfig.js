// Only explicitly selected public identifiers may leave the server.
const isEnabled = (value) => value === 'true'
const matches = (value, pattern) => pattern.test(value || '') ? value : ''

export function getPublicTrackingConfig(source = process.env) {
  const enabled = isEnabled(source.TRACKING_ENABLED)
  const hosts = String(source.TRACKING_ALLOWED_HOSTS || 'tokriii.com,www.tokriii.com')
    .split(',').map((host) => host.trim().toLowerCase())
    .filter((host) => /^(?=.{1,253}$)[a-z0-9]+(?:[a-z0-9.-]*[a-z0-9])?$/.test(host))
  const gtmId = matches(source.TRACKING_GTM_CONTAINER_ID, /^GTM-[A-Z0-9]+$/)
  const gaId = matches(source.TRACKING_GA4_MEASUREMENT_ID, /^G-[A-Z0-9]+$/)
  const pixelId = matches(source.TRACKING_META_PIXEL_ID, /^\d{5,25}$/)
  return {
    enabled,
    allowedHosts: [...new Set(hosts)],
    version: String(source.TRACKING_CONFIG_VERSION || '1').slice(0, 64),
    currency: matches(source.TRACKING_CURRENCY || 'INR', /^[A-Z]{3}$/) || 'INR',
    gtm: { enabled: enabled && isEnabled(source.TRACKING_GTM_ENABLED) && Boolean(gtmId && gaId), containerId: gtmId, measurementId: gaId },
    meta: { enabled: enabled && isEnabled(source.TRACKING_META_PIXEL_ENABLED) && Boolean(pixelId), pixelId },
  }
}
