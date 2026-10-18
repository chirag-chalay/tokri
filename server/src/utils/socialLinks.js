export const SOCIAL_LINK_FIELDS = [
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'threads', label: 'Threads' },
  { key: 'x', label: 'X' },
  { key: 'linkedin', label: 'LinkedIn' },
]

const SOCIAL_KEYS = SOCIAL_LINK_FIELDS.map((field) => field.key)

function readSocialObject(value) {
  if (!value) return {}
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
    } catch {
      return null
    }
  }
  if (typeof value === 'object' && !Array.isArray(value)) return value
  return null
}

function cleanSocialUrl(raw) {
  const trimmed = String(raw ?? '').trim()
  if (!trimmed) return ''
  if (trimmed.length > 500) return null
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  let url
  try {
    url = new URL(withProtocol)
  } catch {
    return null
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
  if (url.username || url.password) return null
  if (!url.hostname.includes('.')) return null
  return url.toString()
}

export function parseSocialLinksInput(value) {
  const source = readSocialObject(value)
  if (source == null) {
    return { error: 'Social links could not be read. Enter each link again.' }
  }

  const links = {}
  for (const field of SOCIAL_LINK_FIELDS) {
    const cleaned = cleanSocialUrl(source[field.key])
    if (cleaned == null) {
      return { error: `${field.label} needs a full link, such as https://instagram.com/tokriii` }
    }
    if (cleaned) links[field.key] = cleaned
  }

  return { links }
}

export function publicSocialLinks(value) {
  const source = readSocialObject(value)
  if (!source) return {}

  const links = {}
  for (const key of SOCIAL_KEYS) {
    const cleaned = cleanSocialUrl(source[key])
    if (cleaned) links[key] = cleaned
  }
  return links
}
