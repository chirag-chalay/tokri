import { Alert, Linking } from 'react-native'
import * as Location from 'expo-location'
import { fetchJson } from './api'

function uniqueJoin(values) {
  const seen = new Set()
  const parts = []
  for (const value of values) {
    const text = String(value || '').trim()
    if (!text) continue
    const key = text.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    parts.push(text)
  }
  return parts.join(', ')
}

function digits(value, max) {
  return String(value || '').replace(/\D/g, '').slice(0, max)
}

function mapNativePlace(place) {
  if (!place) return null
  const street = uniqueJoin([place.streetNumber, place.street])
  const area = uniqueJoin([place.district, place.subregion])
  const name = place.name && place.name !== place.city ? place.name : ''
  return {
    line1: uniqueJoin([street, name !== street ? name : '']),
    line2: area,
    city: place.city || place.subregion || '',
    state: place.region || '',
    pincode: digits(place.postalCode, 6),
    landmark: place.district && place.district !== place.city ? place.district : '',
  }
}

function mergeAddress(primary, fallback) {
  const next = { ...(fallback || {}), ...(primary || {}) }
  for (const key of ['line1', 'line2', 'city', 'state', 'pincode', 'landmark']) {
    if (!String(next[key] || '').trim() && fallback?.[key]) next[key] = fallback[key]
  }
  return next
}

function isUseful(address) {
  return Boolean(address && (address.city || address.pincode || address.line1 || address.line2))
}

function mapNominatim(data) {
  const a = data?.address || {}
  const line1 = uniqueJoin([a.house_number, a.building, data?.name, a.road, a.residential])
  const line2 = uniqueJoin([a.neighbourhood, a.suburb, a.village, a.city_district])
  return {
    line1,
    line2: line2 || a.road || '',
    city: a.city || a.town || a.village || a.county || '',
    state: a.state || '',
    pincode: digits(a.postcode, 6),
    landmark: a.amenity || a.shop || '',
  }
}

async function reverseViaApi(latitude, longitude) {
  try {
    const data = await fetchJson(
      `/geo/reverse?lat=${encodeURIComponent(latitude)}&lng=${encodeURIComponent(longitude)}`,
    )
    if (data?.address) return data.address
  } catch {
    /* live API may not have this route yet */
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
        latitude,
      )}&lon=${encodeURIComponent(longitude)}&addressdetails=1&zoom=18`,
      { headers: { Accept: 'application/json', 'Accept-Language': 'en-IN,en' } },
    )
    if (!response.ok) return null
    return mapNominatim(await response.json())
  } catch {
    return null
  }
}

export async function fetchAddressFromDevice() {
  const enabled = await Location.hasServicesEnabledAsync()
  if (!enabled) {
    const error = new Error('Turn on GPS to fill your delivery address.')
    error.code = 'services'
    throw error
  }

  const current = await Location.getForegroundPermissionsAsync()
  let status = current.status
  let canAskAgain = current.canAskAgain
  if (status !== 'granted') {
    const asked = await Location.requestForegroundPermissionsAsync()
    status = asked.status
    canAskAgain = asked.canAskAgain
  }

  if (status !== 'granted') {
    const error = new Error('Allow location access to auto-fill your delivery address.')
    error.code = canAskAgain === false ? 'blocked' : 'denied'
    throw error
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  })
  const { latitude, longitude } = position.coords

  let native = null
  try {
    const places = await Location.reverseGeocodeAsync({ latitude, longitude })
    native = mapNativePlace(places?.[0])
  } catch {
    native = null
  }

  let remote = null
  if (!isUseful(native) || digits(native?.pincode, 6).length !== 6) {
    remote = await reverseViaApi(latitude, longitude)
  }

  const address = mergeAddress(native, remote)
  if (!isUseful(address)) {
    throw new Error('Could not read an address from this location. Please enter it manually.')
  }

  return {
    ...address,
    latitude,
    longitude,
  }
}

export function explainLocationError(error, { onSettings } = {}) {
  const message = error?.message || 'Could not detect your location.'
  if (error?.code === 'blocked') {
    Alert.alert('Location permission', message, [
      { text: 'Not now', style: 'cancel' },
      { text: 'Open settings', onPress: () => (onSettings ? onSettings() : Linking.openSettings()) },
    ])
    return
  }
  Alert.alert('Location', message)
}
