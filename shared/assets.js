const UPLOAD_HOSTS = new Set(['tokriii.com', 'www.tokriii.com', 'server.tokriii.com'])
const PRODUCTION_HOSTS = new Set(['tokriii.com', 'www.tokriii.com'])
const trimSlash = (value) => String(value || '').replace(/\/+$/, '')

export function publicAssetOrigin({ publicAssetUrl, clientUrl, apiUrl }) {
  if (publicAssetUrl) return trimSlash(publicAssetUrl)
  try {
    if (PRODUCTION_HOSTS.has(new URL(clientUrl).hostname)) return 'https://tokriii.com'
  } catch { /* API-only environments may not have a public storefront origin. */ }
  return trimSlash(apiUrl)
}

export function normalizeUploadUrl(value, origin) {
  if (!value || !origin) return value
  const raw = String(value)
  const base = trimSlash(origin)
  if (raw.startsWith('/uploads/')) return `${base}${raw}`
  if (!/^(https?:\/\/|\/\/)/i.test(raw)) return raw
  try {
    const url = new URL(raw, 'https://asset-normalizer.invalid')
    if (UPLOAD_HOSTS.has(url.hostname) && url.pathname.startsWith('/uploads/')) {
      return `${base}${url.pathname}${url.search}${url.hash}`
    }
  } catch { /* Preserve malformed and unrelated URLs rather than inventing paths. */ }
  return raw
}

// URL rewriting only; existing HTML sanitization remains the renderer's job.
export function normalizeUploadHtml(value, origin) {
  if (!value || !origin) return value
  return String(value).replace(/\b(src|srcset|poster|href)(\s*=\s*)(["'])(.*?)\3/gi, (attribute, name, equals, quote, url) => {
    const normalized = name.toLowerCase() === 'srcset'
      ? url.replace(/(^\s*|,\s*)((?:https?:\/\/|\/\/)[^\s,]+|\/uploads\/[^\s,]+)/gi, (_match, prefix, candidate) => `${prefix}${normalizeUploadUrl(candidate, origin)}`)
      : normalizeUploadUrl(url, origin)
    return `${name}${equals}${quote}${normalized}${quote}`
  })
}

export function normalizeBrowserAsset(value, hostname) {
  return PRODUCTION_HOSTS.has(hostname) ? normalizeUploadUrl(value, 'https://tokriii.com') : value
}
