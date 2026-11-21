// REST calls stay on the server. No provider responses are persisted or used to
// seed the directory. Only customer-confirmed address fields reach address save.
const text = value => typeof value === 'string' ? value.trim().slice(0, 300) : ''
export function mapplsEnabled(config = process.env) {
  return Boolean(config.MAPPLS_API_KEY && config.MAPPLS_ADDRESS_STORAGE_ALLOWED === 'true'
    && /^\/(?!\/)[\w/.-]+$/.test(config.MAPPLS_ATTRIBUTION_LOGO_PATH || ''))
}
export function mapMapplsLocation(row) {
  const tokens = row?.addressTokens || {}
  const label = [text(row?.placeName), text(row?.placeAddress)].filter(Boolean).join(', ')
  if (!label || !/^[a-z0-9]{6}$/i.test(row?.eLoc || '')) return null
  return {
    id: row.eLoc, label, source: 'mappls', kind: text(row.type) || 'place',
    houseNumber: text(tokens.houseNumber), building: text(tokens.houseName), landmark: text(tokens.poi),
    street: text(tokens.street), locality: [text(tokens.subSubLocality), text(tokens.subLocality), text(tokens.locality || tokens.village)].filter(Boolean).join(', '),
    city: text(tokens.city), state: text(tokens.state),
    pincode: /^[1-9][0-9]{5}$/.test(tokens.pincode || '') ? String(tokens.pincode) : '',
    // An address string without structured tokens is still a genuine suggestion;
    // show it for confirmation without inferring a house number or postal code.
    unstructured: !Object.keys(tokens).length,
  }
}
let usageDay = '', calls = 0, inFlight = 0, unavailableUntil = 0
export async function searchMappls(query, { fetcher = fetch, config = process.env, now = Date.now() } = {}) {
  if (!mapplsEnabled(config)) return []
  const day = new Date(now).toISOString().slice(0, 10)
  if (day !== usageDay) { usageDay = day; calls = 0 }
  const budget = Math.max(1, Math.min(10000, Number(config.MAPPLS_DAILY_REQUEST_LIMIT) || 500))
  if (calls >= budget || inFlight >= 4 || now < unavailableUntil) throw new Error('Address provider unavailable')
  calls += 1
  inFlight += 1
  const url = new URL('https://search.mappls.com/search/places/autosuggest/json')
  url.searchParams.set('access_token', config.MAPPLS_API_KEY)
  url.searchParams.set('query', query)
  url.searchParams.set('location', '28.4595,77.0266')
  url.searchParams.set('region', 'IND')
  url.searchParams.set('tokenizeAddress', '')
  try {
    const response = await fetcher(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(3500) })
    if (response.status === 204) return []
    if (!response.ok) throw new Error('Address provider unavailable')
    const data = await response.json()
    if (!Array.isArray(data.suggestedLocations)) throw new Error('Invalid provider response')
    // suggestedSearches and userAddedLocations are not verified place matches.
    return data.suggestedLocations.map(mapMapplsLocation).filter(Boolean).slice(0, 8)
  } catch {
    unavailableUntil = now + 30000
    // Never propagate a URL, key or provider response into logs/error messages.
    throw new Error('Address provider unavailable')
  } finally { inFlight -= 1 }
}
