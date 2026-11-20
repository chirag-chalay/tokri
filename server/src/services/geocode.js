function asText(...values) {
  return values
    .map((value) => String(value || '').trim())
    .filter(Boolean)
}

function uniqueJoin(values) {
  const seen = new Set()
  const parts = []
  for (const value of asText(...values)) {
    const key = value.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    parts.push(value)
  }
  return parts.join(', ')
}

export function mapNominatimToAddress(data = {}) {
  const a = data.address || {}
  const house = a.house_number || ''
  const road = a.road || a.pedestrian || a.residential || a.street || ''
  const building = a.building || data.name || ''
  const area = a.neighbourhood || a.suburb || a.village || a.hamlet || a.quarter || a.city_district || ''
  const city = a.city || a.town || a.village || a.county || ''
  const state = a.state || ''
  const pincode = String(a.postcode || '').replace(/\D/g, '').slice(0, 6)
  const landmark = a.amenity || a.shop || a.public_building || ''

  const line1 = uniqueJoin([house, building !== city ? building : '', road])
  const line2 = uniqueJoin([area, a.city_district, a.county !== city ? a.county : ''])

  return {
    line1,
    line2: line2 || road,
    city,
    state,
    pincode,
    landmark: landmark && !line1.includes(landmark) ? landmark : '',
  }
}

export async function reverseGeocode(lat, lng) {
  const latitude = Number(lat)
  const longitude = Number(lng)
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw Object.assign(new Error('Invalid latitude.'), { status: 400, reasonCode: 'VALIDATION_ERROR' })
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw Object.assign(new Error('Invalid longitude.'), { status: 400, reasonCode: 'VALIDATION_ERROR' })
  }

  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
    latitude,
  )}&lon=${encodeURIComponent(longitude)}&addressdetails=1&zoom=18`

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'en-IN,en',
      'User-Agent': 'Tokriii/1.0 (https://tokriii.com)',
    },
    signal: AbortSignal.timeout(8000),
  }).catch(() => null)

  if (!response?.ok) {
    throw Object.assign(new Error('Could not read an address from this location.'), { status: 502, reasonCode: 'SERVICE_UNAVAILABLE' })
  }

  const data = await response.json()
  const address = mapNominatimToAddress(data)
  if (!address.city && !address.line1 && !address.pincode) {
    throw Object.assign(new Error('Could not read an address from this location.'), { status: 404 })
  }

  return {
    ...address,
    country: String(data.address?.country || '').slice(0, 40),
    latitude,
    longitude,
  }
}
