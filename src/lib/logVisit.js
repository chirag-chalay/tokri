import { validVisitorSession, visitorCookie, visitorIdleSeconds } from '../../shared/logReasons.js'

let pincode
let location
let permission
let observesPermission = false
let cartItemCount
let visitStarted = false
const readVisit = () => document.cookie.split(/;\s*/).find(value => value.startsWith(visitorCookie + '='))?.slice(visitorCookie.length + 1)

function generateVisitId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  if (!globalThis.crypto?.getRandomValues) return
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 15) | 64
  bytes[8] = (bytes[8] & 63) | 128
  const hex = [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('')
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join('-')
}

export function currentVisitId({ activity = false, rotate = false } = {}) {
  if (typeof document === 'undefined') return
  let id = readVisit()
  // The first page can start a session. After that, background API calls
  // never extend an expired cookie or create a new visit.
  if (!activity && visitStarted) return validVisitorSession(id) ? id : undefined
  visitStarted = true
  if (rotate || !validVisitorSession(id)) id = generateVisitId()
  if (!id) return
  document.cookie = `${visitorCookie}=${id}; Max-Age=${visitorIdleSeconds}; Path=/; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`
  return readVisit() === id ? id : undefined
}

export function visitHeaders(headers) {
  const result = new Headers(headers)
  if (typeof document === 'undefined') return result
  const id = currentVisitId()
  if (id) result.set('X-Session-Id', id)
  if (cartItemCount !== undefined) result.set('X-Cart-Item-Count', String(cartItemCount))
  let deliveryPin = pincode
  if (!deliveryPin) {
    try { deliveryPin = sessionStorage.getItem('tokri_visit_delivery_pin') } catch {}
  }
  if (/^\d{6}$/.test(deliveryPin || '')) result.set('X-Delivery-Pincode', deliveryPin)
  if (permission) result.set('X-Location-Permission', permission)
  if (location) result.set('X-Visit-Location', encodeURIComponent(JSON.stringify(location)))
  return result
}

export function setVisitCartItems(value) {
  cartItemCount = Number.isInteger(value) && value >= 0 && value <= 10000 ? value : undefined
}

export function setVisitPincode(value) {
  pincode = /^\d{6}$/.test(value || '') ? value : undefined
  try {
    if (pincode) sessionStorage.setItem('tokri_visit_delivery_pin', pincode)
    else sessionStorage.removeItem('tokri_visit_delivery_pin')
  } catch {}
}

export function setVisitLocation(address) {
  if (address) permission = 'granted'
  location = address ? { city: String(address.city || '').slice(0, 70), state: String(address.state || '').slice(0, 70), country: String(address.country || '').slice(0, 40) } : undefined
}

export async function observeLocationPermission() {
  try {
    const current = await navigator.permissions.query({ name: 'geolocation' })
    const update = () => {
      permission = ['granted', 'denied'].includes(current.state) ? current.state : undefined
      if (current.state !== 'granted') setVisitLocation(null)
    }
    if (!observesPermission) { current.addEventListener('change', update); observesPermission = true }
    update()
  } catch { /* Coordinates are never sent to monitoring. */ }
}
