import { createHmac } from 'node:crypto'
import { approximateVisitLocation } from './ip-location.js'
import { env } from '../config/env.js'
import { validVisitorSession, visitorCookie } from '../../../shared/logReasons.js'

const place = value => typeof value === 'string' && /^[\p{L}\p{M} .,'’-]{1,80}$/u.test(value.trim()) ? value.trim() : undefined
const allowedPin = value => typeof value === 'string' && /^\d{6}$/.test(value) ? value : undefined

export function phoneLookupHash(value) {
  const phone = String(value || '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '')
  if (!/^\d{10}$/.test(phone)) return undefined
  return createHmac('sha256', env.sessionSecret).update('logs-phone:' + phone).digest('hex')
}

export function deliveryLogFacts(pincode, row, serviceable) {
  return { enteredPincode: allowedPin(pincode), pincodeServiceable: typeof serviceable === 'boolean' ? serviceable : undefined,
    deliveryCity: place(row?.city), deliveryState: place(row?.state) }
}

export function visitFacts(req) {
  const headers = req?.headers || {}
  const platform = ['android', 'ios'].includes(headers['x-app-platform']) ? headers['x-app-platform'] : undefined
  const provided = headers['x-session-id']
  const cookie = String(headers.cookie || '').split(/;\s*/).find(value => value.startsWith(visitorCookie + '='))?.split('=')[1]
  const sessionId = validVisitorSession(cookie) && (!provided || provided === cookie) ? cookie : undefined
  const ua = String(headers['user-agent'] || '').slice(0, 500)
  const website = Boolean(sessionId || req?.logWebsite || /^Mozilla\//.test(ua))
  const customer = req?.verifiedLogCustomer
  let gps = {}
  const gpsConsent = sessionId && ['granted', 'denied'].includes(headers['x-location-permission']) ? headers['x-location-permission'] === 'granted' : undefined
  if (gpsConsent === true && typeof headers['x-visit-location'] === 'string' && headers['x-visit-location'].length <= 1200) {
    try { gps = JSON.parse(decodeURIComponent(headers['x-visit-location'])) || {} } catch {}
  }
  const hasGps = Boolean(place(gps.city) || place(gps.state) || place(gps.country))
  const location = hasGps ? gps : website || platform ? approximateVisitLocation(req) : {}
  const { city, state, country } = location
  const source = hasGps ? 'gps' : place(city) || place(state) || place(country) ? 'ip' : 'none'
  const browser = /Edg[A-Za-z]*\//.test(ua) ? 'Edge' : /(?:Chrome|CriOS)\//.test(ua) ? 'Chrome' : /(?:Firefox|FxiOS)\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : undefined
  return { sessionId, enteredPincode: allowedPin(headers['x-delivery-pincode']),
    platform: platform || (website ? 'website' : undefined),
    appBuild: platform && /^\d{1,10}$/.test(headers['x-app-build'] || '') ? headers['x-app-build'] : undefined,
    browser: website && !platform ? browser : undefined,
    deviceType: website && !platform && browser ? (/Mobile|Android/.test(ua) ? 'mobile' : 'desktop') : undefined,
    visitorKind: customer ? 'customer' : !req || req.session?.adminUser || String(req.originalUrl || '').startsWith('/api/v1/webhooks/') ? 'system' : platform || website ? 'guest' : 'unknown',
    verifiedCustomerId: customer?.id, phoneLookupHash: customer ? phoneLookupHash(customer.phone) : undefined,
    locationCity: place(city), locationState: place(state), locationCountry: place(country),
    locationSource: source,
    gpsConsent,
  }
}
