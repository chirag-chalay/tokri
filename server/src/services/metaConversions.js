// CAPI transport. Callers are responsible for consent, event validation, and
// durable idempotency before invoking this function.
const META_PIXEL_ID = /^\d{5,25}$/
const META_API_VERSION = /^v\d{1,3}\.\d{1,3}$/
const EVENT_NAMES = new Set(['PageView', 'ViewContent', 'Search', 'AddToCart', 'InitiateCheckout', 'AddPaymentInfo', 'Purchase', 'Scroll'])

export function readMetaConversionsConfig(source = process.env) {
  const pixelId = String(source.TRACKING_META_PIXEL_ID || '').trim()
  const apiVersion = String(source.META_CAPI_API_VERSION || '').trim()
  const token = String(source.META_CAPI_ACCESS_TOKEN || '').trim()
  const enabled = source.TRACKING_ENABLED === 'true' && source.TRACKING_META_PIXEL_ENABLED === 'true' && source.META_CAPI_ENABLED === 'true'
  if (!enabled || !META_PIXEL_ID.test(pixelId) || !META_API_VERSION.test(apiVersion) || !token) return null
  return { pixelId, apiVersion, token, testEventCode: String(source.META_CAPI_TEST_EVENT_CODE || '').trim() }
}

export async function sendMetaConversion(event, options = {}) {
  const config = options.config || readMetaConversionsConfig()
  if (!config) return { status: 'disabled' }
  if (!META_PIXEL_ID.test(config.pixelId) || !META_API_VERSION.test(config.apiVersion) || !config.token) {
    throw new Error('Invalid Meta Conversions API configuration')
  }
  if (!event || !EVENT_NAMES.has(event.event_name) || typeof event.event_id !== 'string' || !event.event_id || !Number.isSafeInteger(event.event_time) || !event.user_data || typeof event.user_data !== 'object') {
    throw new Error('Invalid Meta conversion event')
  }
  const payload = { data: [event] }
  if (config.testEventCode) payload.test_event_code = config.testEventCode
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), options.timeoutMs || 10000)
  try {
    const response = await (options.fetchImpl || fetch)(`https://graph.facebook.com/${config.apiVersion}/${config.pixelId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.token}` },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok || result.error || result.events_received !== 1) {
      // Do not include provider bodies, URLs, customer data, or credentials in logs.
      throw new Error(`Meta conversion request failed (HTTP ${response.status})`)
    }
    return { status: 'sent' }
  } finally {
    clearTimeout(timer)
  }
}
