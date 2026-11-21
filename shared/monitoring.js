// A shared, deliberately small vocabulary. Never send query strings, arbitrary
// messages, form values, cookies, identity data or payment payloads to monitoring.
export const browserEvents = new Set(['website.navigation', 'website.page.ready', 'frontend.error', 'frontend.promise.failed', 'frontend.resource.failed', 'frontend.page.failed', 'frontend.api.completed', 'frontend.api.failed', 'customer.session.started', 'customer.session.ended', 'cart.added', 'cart.removed', 'cart.quantity.changed', 'cart.cleared', 'coupon.applied', 'coupon.removed', 'coupon.invalidated', 'delivery.selected', 'delivery.pin.checked'])
export const businessBrowserEvents = new Set(['delivery.pin.checked', 'cart.added', 'cart.removed', 'cart.quantity.changed', 'cart.cleared', 'cart.snapshot', 'cart.restored', 'checkout.guest.blocked', 'checkout.details.missing', 'checkout.minimum.blocked', 'payment.browser.cancelled', 'payment.browser.failed', 'checkout.network.failed'])
for (const event of businessBrowserEvents) browserEvents.add(event)
export const deliveryPinSources = new Set(['location', 'address_form', 'saved_address'])
export const viewportTypes = new Set(['mobile', 'tablet', 'desktop'])
export const validDeliveryPin = value => typeof value === 'string' && /^\d{6}$/.test(value)
export const validDiagnosticSession = value => typeof value === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value)
const pages = { '/': 'Home', '/shop': 'Shop', '/cart': 'Cart', '/checkout': 'Checkout', '/login': 'Customer sign-in', '/profile': 'Customer profile', '/account': 'Customer account', '/blog': 'Blog', '/about': 'About the store', '/careers': 'Careers', '/privacy-policy': 'Privacy policy', '/terms-and-conditions': 'Terms and conditions', '/help-faqs': 'Help and FAQs', '/returns-policy': 'Returns policy', '/support-center': 'Support center' }
export function safePage(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return null
  const path = value.split(/[?#]/)[0].replace(/\/+$/, '') || '/'
  if (/^\/(?:api|uploads|_next|tokri-backoffice|partner)(?:\/|$)/.test(path)) return null
  if (Object.hasOwn(pages, path)) return { pagePath: path, pageLabel: pages[path] }
  for (const [prefix, label, placeholder] of [['/product/', 'Product details', '[product]'], ['/category/', 'Product category', '[category]'], ['/order/', 'Order details', '[order]'], ['/blog/', 'Blog article', '[article]'], ['/p/', 'Store information', '[page]']]) {
    if (path.startsWith(prefix)) return { pagePath: prefix + placeholder, pageLabel: label }
  }
  return { pagePath: '/[other]', pageLabel: 'Other website page' }
}
export function productReference(value) {
  return typeof value === 'string' && /^[a-z0-9][a-z0-9-]{0,119}$/i.test(value) && !/\d{10,}/.test(value) ? value : undefined
}
export function safeEndpoint(value) {
  if (typeof value !== 'string') return undefined
  const path = value.split(/[?#]/)[0]
  if (!path.startsWith('/api/v1/') || /^\/api\/v1\/monitoring(?:\/|$)/.test(path)) return undefined
  if (path === '/api/v1/frontend-errors' || /^\/api\/v1\/tracking\/(?:config|events|revoke|revoke-session)$/.test(path)) return path
  if (path.startsWith('/api/v1/tracking/purchase/')) return '/api/v1/tracking/purchase/[record]'
  const parts = path.slice(8).split('/').filter(Boolean)
  const resources = new Set(['auth', 'account', 'checkout', 'products', 'categories', 'settings', 'app', 'geo', 'health', 'webhooks', 'partner', 'pages', 'blog'])
  if (!resources.has(parts[0])) return '/api/v1/[other]'
  const actions = new Set(['send-otp', 'verify-otp', 'me', 'logout', 'profile', 'cart', 'addresses', 'orders', 'invoice', 'create-order', 'confirm-cod', 'verify-payment', 'sync-payment', 'preview-coupon', 'quote', 'config', 'razorpay-callback', 'upi-intent', 'confirm-intent', 'sync-intent', 'public', 'bootstrap', 'reverse', 'pincode', 'razorpay'])
  return '/api/v1/' + parts.map((part, index) => index === 0 || actions.has(part) ? part : '[record]').join('/')
}
export function isMonitoringRequest(value) {
  return typeof value === 'string' && (/\/api\/v1\/monitoring(?:\/|$)/.test(value.split('?')[0]) || /\/(?:api\/)?pages\/(?:logs|reports)\/?$/.test(value.split('?')[0]))
}

export function isOptionalTelemetryRoute(route) {
  return typeof route === 'string' && (route === '/api/v1/frontend-errors' || route.startsWith('/api/v1/tracking/'))
}

export function readableStatus(row) {
  const status = String(row.status ?? '').toLowerCase()
  if (row.outcome === 'unmatched') return 'Warning'
  if (['failed', 'failure', 'error', 'cancelled', 'canceled'].includes(status) || Number(status) >= 400 || row.category === 'error' && !['skipped', 'ignored'].includes(status)) return 'Failed'
  if (status === '202') return 'Pending'
  if (['success', 'successful', 'paid', 'captured', 'refunded', 'processed', 'delivered', 'matched'].includes(status) || Number(status) >= 200 && Number(status) < 400 || row.event === 'website.navigation' && status === 'observed') return 'Successful'
  if (['pending', 'attempt', 'created', 'authorized', 'processing'].includes(status)) return 'Pending'
  if (['debug.enabled', 'debug.disabled'].includes(row.event)) return 'Successful'
  return 'Warning'
}
