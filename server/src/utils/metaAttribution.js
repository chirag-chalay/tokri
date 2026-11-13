// Only forward Meta's first-party cookies when the visitor grants marketing consent.
export function cookieValue(req, name) {
  return String(req.headers.cookie || '').split(';').map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1)
}

export function metaAttribution(req) {
  if (cookieValue(req, 'tokriii_marketing_consent') !== 'granted') return {}
  const result = {}
  for (const [cookie, field] of [['_fbp', 'fbp'], ['_fbc', 'fbc']]) {
    const value = cookieValue(req, cookie)
    if (value && value.length <= 255 && /^fb\.\d+\.\d+\.[a-zA-Z0-9_-]+$/.test(value)) result[field] = value
  }
  return result
}
