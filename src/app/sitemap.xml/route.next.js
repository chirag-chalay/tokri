import { publicGet, getAllPublicBlogs } from '../../lib/server/public-api'
import { canonicalOrigin } from '../../lib/server/indexing'

export const dynamic = 'force-dynamic'

const escapeXml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char])

export async function GET() {
  try {
    const [products, categories, posts] = await Promise.all([
      publicGet('/products'), publicGet('/categories'), getAllPublicBlogs(),
    ])
    if (!Array.isArray(products) || !Array.isArray(categories)) throw new Error('Unexpected catalog response')
    const paths = [
      '/', '/shop', '/blog',
      ...products.filter((item) => item.slug).map((item) => `/product/${encodeURIComponent(item.slug)}`),
      ...categories.filter((item) => item.slug).map((item) => `/shop?category=${encodeURIComponent(item.slug)}`),
      ...posts.filter((item) => item.slug).map((item) => `/blog/${encodeURIComponent(item.slug)}`),
    ]
    const entries = [...new Set(paths)].map((path) => `<url><loc>${escapeXml(`${canonicalOrigin}${path}`)}</loc></url>`).join('')
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`, {
      headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    console.error('Sitemap public data unavailable:', error.message)
    return new Response('Sitemap temporarily unavailable', { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
