export function hrefForHomeLink(link) {
  const type = String(link?.type || 'none')
  const value = String(link?.value || '').trim()
  if (type === 'shop') return '/shop'
  if (type === 'category' && value) return `/shop?category=${encodeURIComponent(value)}`
  if (type === 'product' && value) return `/product/${encodeURIComponent(value)}`
  if (type === 'url' && value) return value
  return null
}

export function isExternalHomeLink(link) {
  return String(link?.type || '') === 'url'
}
