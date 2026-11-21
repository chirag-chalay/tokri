import { publicGet, getAllPublicBlogs } from '../../lib/server/public-api'
import { canonicalOrigin } from '../../lib/server/indexing'
import { publicCmsSlugs } from '../../lib/server/cms-slugs'

export const dynamic = 'force-dynamic'

const escapeXml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
  })[char])

function formatDate(dateValue) {
  if (!dateValue) return new Date().toISOString().split('T')[0]
  try {
    const d = new Date(dateValue)
    if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0]
    return d.toISOString().split('T')[0]
  } catch {
    return new Date().toISOString().split('T')[0]
  }
}

export async function GET() {
  try {
    const [products, categories, posts, cmsPages] = await Promise.all([
      publicGet('/products'),
      publicGet('/categories'),
      getAllPublicBlogs(),
      Promise.all(publicCmsSlugs.map((slug) => publicGet(`/pages/${encodeURIComponent(slug)}`))),
    ])
    if (!Array.isArray(products) || !Array.isArray(categories)) throw new Error('Unexpected catalog response')

    const today = new Date().toISOString().split('T')[0]

    // Map structured URL entries with <loc> and <lastmod>
    const urlEntries = [
      { loc: `${canonicalOrigin}/`, lastmod: today, changefreq: 'daily', priority: '1.0' },
      { loc: `${canonicalOrigin}/shop`, lastmod: today, changefreq: 'daily', priority: '0.9' },
      { loc: `${canonicalOrigin}/blog`, lastmod: today, changefreq: 'weekly', priority: '0.8' },
    ]

    // Published CMS pages
    cmsPages.forEach((page, index) => {
      if (page) {
        urlEntries.push({
          loc: `${canonicalOrigin}/${publicCmsSlugs[index]}`,
          lastmod: formatDate(page.updatedAt || page.createdAt),
          changefreq: 'monthly',
          priority: '0.6',
        })
      }
    })

    // Active Categories
    for (const cat of categories) {
      if (cat?.slug) {
        urlEntries.push({
          loc: `${canonicalOrigin}/shop?category=${encodeURIComponent(cat.slug)}`,
          lastmod: formatDate(cat.updatedAt || cat.createdAt),
          changefreq: 'weekly',
          priority: '0.8',
        })
      }
    }

    // Active Products
    for (const prod of products) {
      if (prod?.slug && prod.isActive !== false) {
        urlEntries.push({
          loc: `${canonicalOrigin}/product/${encodeURIComponent(prod.slug)}`,
          lastmod: formatDate(prod.updatedAt || prod.createdAt),
          changefreq: 'weekly',
          priority: '0.8',
        })
      }
    }

    // Published Blog Posts
    for (const post of posts) {
      if (post?.slug) {
        urlEntries.push({
          loc: `${canonicalOrigin}/blog/${encodeURIComponent(post.slug)}`,
          lastmod: formatDate(post.updatedAt || post.publishedAt || post.createdAt),
          changefreq: 'monthly',
          priority: '0.7',
        })
      }
    }

    // Deduplicate by loc
    const seen = new Set()
    const uniqueEntries = []
    for (const item of urlEntries) {
      if (!seen.has(item.loc)) {
        seen.add(item.loc)
        uniqueEntries.push(item)
      }
    }

    const xmlItems = uniqueEntries
      .map(
        (u) =>
          `<url><loc>${escapeXml(u.loc)}</loc><lastmod>${u.lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`
      )
      .join('')

    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${xmlItems}</urlset>`,
      {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (error) {
    console.error('Sitemap public data unavailable:', error.message)
    return new Response('Sitemap temporarily unavailable', {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    })
  }
}
