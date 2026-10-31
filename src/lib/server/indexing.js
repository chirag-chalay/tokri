import 'server-only'

export const canonicalOrigin = 'https://tokriii.com'

// Explicit opt-in AND a production hostname are both required. Build mode alone
// does not establish that this is a public production deployment.
export function indexingEnabled(host) {
  const hostname = String(host || '').toLowerCase().split(':')[0]
  return process.env.TOKRIII_INDEXING_ENABLED === 'true' &&
    (hostname === 'tokriii.com' || hostname === 'www.tokriii.com')
}
