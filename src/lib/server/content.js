import 'server-only'
import sanitizeHtml from 'sanitize-html'
import { cache } from 'react'
import { publicGet } from './public-api'
import { canonicalOrigin } from './indexing'

export const getProduct = cache((slug) => publicGet(`/products/${encodeURIComponent(slug)}`))
export const getBlog = cache((slug) => publicGet(`/blogs/${encodeURIComponent(slug)}`))

export function cleanHtml(html) {
  return sanitizeHtml(String(html || ''), {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'h1', 'h2', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
    allowedAttributes: { '*': ['class', 'id'], a: ['href', 'target', 'rel'], img: ['src', 'alt', 'width', 'height', 'loading'], ol: ['start'] },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  })
}

export function plainText(html) {
  return sanitizeHtml(String(html || ''), { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, ' ').trim()
}

export function assetUrl(value) {
  if (value) return value
  return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect fill="#f8fafc" width="100%" height="100%"/></svg>')
}

export function detailMetadata(kind, item) {
  const title = kind === 'product' ? item.name : item.title
  const description = plainText(kind === 'product' ? item.description : item.excerpt)
  const canonical = `${canonicalOrigin}/${kind}/${encodeURIComponent(item.slug)}`
  const image = kind === 'product' ? item.image : item.coverImage
  return {
    title: `${title} · Tokriii`, ...(description ? { description } : {}),
    alternates: { canonical },
    openGraph: { title: `${title} · Tokriii`, ...(description ? { description } : {}), url: canonical,
      type: kind === 'blog' ? 'article' : 'website',
      ...(typeof image === 'string' && /^https?:\/\//i.test(image) ? { images: [image] } : {}) },
  }
}

export function jsonLd(value) { return JSON.stringify(value).replace(/</g, '\\u003c') }
