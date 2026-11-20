import '../config/env.js'
import { isIP } from 'node:net'
import maxmind from 'maxmind'

let reader
const filename = process.env.LOG_GEOIP_CITY_DB
async function refresh() {
  try { reader = await maxmind.open(filename) }
  catch { reader = undefined }
}
export const ipLocationReady = filename ? refresh() : Promise.resolve()
if (filename) setInterval(refresh, 3600000).unref()

export function ipLocationProvider() {
  return reader?.metadata.databaseType === 'DBIP-City-Lite' ? 'db-ip' : undefined
}

export function approximateVisitLocation(req) {
  // Enable only after the ingress has been verified to strip and replace
  // forwarded identity headers and direct origin access has been restricted.
  if (!req || process.env.LOG_TRUST_VERIFIED_INGRESS !== 'true') return {}
  if (process.env.LOG_TRUST_CLOUDFLARE_LOCATION === 'true') {
    const { headers } = req
    if (headers['cf-ipcity'] || headers['cf-region'] || /^[A-Z]{2}$/.test(headers['cf-ipcountry'] || '')) {
      return { city: headers['cf-ipcity'], state: headers['cf-region'], country: headers['cf-ipcountry'] }
    }
  }
  const ip = String(req.ip || '').replace(/^::ffff:/, '')
  if (!reader || !isIP(ip)) return {}
  try {
    const match = reader.get(ip)
    return { city: match?.city?.names?.en, state: match?.subdivisions?.[0]?.names?.en, country: match?.country?.names?.en }
  } catch { return {} }
}
