const legacyPlatforms = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  threads: 'Threads',
  x: 'X',
  linkedin: 'LinkedIn',
}

const platformHosts = {
  instagram: 'instagram.com',
  facebook: 'facebook.com',
}

function isProfileUrl(url, platform) {
  if (platform === 'instagram') {
    return /^\/[a-z\d._]+\/?$/i.test(url.pathname) && !url.search
  }
  if (platform === 'facebook') {
    if (url.pathname === '/profile.php') return /^\?id=\d+$/.test(url.search)
    return /^\/[a-z\d.]+\/?$/i.test(url.pathname) && !/\.php\/?$/i.test(url.pathname) && !url.search
  }
  return url.pathname !== '/'
}

function cleanLink(entry) {
  const platform = typeof entry?.platform === 'string' ? entry.platform.trim() : ''
  const displayText = typeof entry?.displayText === 'string' ? entry.displayText.trim() : ''
  const url = typeof entry?.url === 'string' ? entry.url.trim() : ''
  if (!platform || platform.length > 40 || !displayText || displayText.length > 80) return null
  if (typeof entry.enabled !== 'boolean' || !Number.isSafeInteger(entry.sortOrder) || entry.sortOrder < 0) return null
  if (url.length > 500 || !/^https:\/\//i.test(url) || /[\s\\\x00-\x1f\x7f]/.test(url)) return null
  try {
    const parsed = new URL(url)
    const platformKey = platform.toLowerCase()
    const host = Object.hasOwn(platformHosts, platformKey) ? platformHosts[platformKey] : null
    if (parsed.username || parsed.password || parsed.port || !parsed.hostname.includes('.')) return null
    if (host && ![host, `www.${host}`, `m.${host}`].includes(parsed.hostname)) return null
    if (!isProfileUrl(parsed, platformKey)) return null
    return { platform, displayText, url: parsed.href, enabled: entry.enabled, sortOrder: entry.sortOrder }
  } catch {
    return null
  }
}

export function readSocialLinks(value) {
  if (typeof value === 'string') {
    try { value = JSON.parse(value) } catch { return [] }
  }
  if (Array.isArray(value)) return value.map(cleanLink).filter(Boolean)
  if (!value || typeof value !== 'object') return []
  return Object.entries(legacyPlatforms).flatMap(([key, platform], index) => {
    const url = value[key]
    if (typeof url !== 'string' || !url.trim()) return []
    const withProtocol = /^https?:\/\//i.test(url) ? url.replace(/^http:/i, 'https:') : `https://${url}`
    const link = cleanLink({ platform, displayText: `Follow on ${platform}`, url: withProtocol, enabled: true, sortOrder: index + 1 })
    return link ? [link] : []
  })
}

export function validateSocialLinks(value) {
  if (!Array.isArray(value) || value.length > 50) return { error: 'Enter up to 50 social links.' }
  const links = value.map(cleanLink)
  const invalid = links.findIndex((link) => !link)
  if (invalid !== -1) return { error: `Check link ${invalid + 1}. Enter a platform, a label, a full HTTPS profile URL, and a nonnegative whole-number sort order.` }
  const platforms = links.map((link) => link.platform.toLowerCase())
  if (new Set(platforms).size !== platforms.length) return { error: 'Enter each platform only once.' }
  return { links }
}

export function activeSocialLinks(value) {
  return readSocialLinks(value)
    .filter((link) => link.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ platform, displayText, url }) => ({ platform, displayText, url }))
}

export function publicSocialLinks(value) {
  return Object.fromEntries(activeSocialLinks(value).map(({ platform, url }) => [platform.toLowerCase(), url]))
}
