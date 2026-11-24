import { parseDocument } from 'htmlparser2'
import { findAll, textContent } from 'domutils'
import fs from 'node:fs'

const liveOrigin = 'https://tokriii.com'
const localOrigin = 'http://127.0.0.1:3000'
const apiOrigin = 'http://127.0.0.1:5223/api/v1'

async function fetchRoute(url, options = {}) {
  try {
    const res = await fetch(url, {
      redirect: 'manual',
      headers: { 'User-Agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)', ...options.headers },
    })
    const text = await res.text()
    return { status: res.status, headers: Object.fromEntries(res.headers.entries()), text, error: null }
  } catch (err) {
    return { status: 0, headers: {}, text: '', error: err.message }
  }
}

function parsePageHtml(html) {
  const dom = parseDocument(html)

  // HTML lang
  const htmlNode = findAll((n) => n.type === 'tag' && n.name === 'html', dom.children)[0]
  const lang = htmlNode?.attribs?.lang || null

  // Title
  const titleNode = findAll((n) => n.type === 'tag' && n.name === 'title', dom.children)[0]
  const title = titleNode ? textContent(titleNode).trim() : null

  // Meta tags
  const metaNodes = findAll((n) => n.type === 'tag' && n.name === 'meta', dom.children)
  const meta = {}
  for (const m of metaNodes) {
    const name = m.attribs?.name || m.attribs?.property
    const content = m.attribs?.content
    if (name) meta[name] = content
  }

  // Canonical
  const linkNodes = findAll((n) => n.type === 'tag' && n.name === 'link', dom.children)
  const canonicalNode = linkNodes.find((l) => l.attribs?.rel === 'canonical')
  const canonical = canonicalNode ? canonicalNode.attribs?.href : null

  // Headings
  const h1Nodes = findAll((n) => n.type === 'tag' && n.name === 'h1', dom.children)
  const h1s = h1Nodes.map((n) => textContent(n).trim()).filter(Boolean)

  const h2Nodes = findAll((n) => n.type === 'tag' && n.name === 'h2', dom.children)
  const h2s = h2Nodes.map((n) => textContent(n).trim()).filter(Boolean)

  // Images
  const imgNodes = findAll((n) => n.type === 'tag' && n.name === 'img', dom.children)
  const images = imgNodes.map((n) => ({
    src: n.attribs?.src || '',
    alt: n.attribs?.alt ?? null,
  }))

  // JSON-LD
  const scriptNodes = findAll((n) => n.type === 'tag' && n.name === 'script' && n.attribs?.type === 'application/ld+json', dom.children)
  const jsonLd = []
  for (const s of scriptNodes) {
    try {
      jsonLd.push(JSON.parse(textContent(s)))
    } catch (e) {
      jsonLd.push({ parseError: e.message, raw: textContent(s).slice(0, 100) })
    }
  }

  return {
    lang,
    title,
    description: meta['description'] || null,
    robots: meta['robots'] || null,
    canonical,
    ogTitle: meta['og:title'] || null,
    ogDescription: meta['og:description'] || null,
    ogImage: meta['og:image'] || null,
    ogUrl: meta['og:url'] || null,
    ogType: meta['og:type'] || null,
    twitterCard: meta['twitter:card'] || null,
    twitterTitle: meta['twitter:title'] || null,
    twitterDescription: meta['twitter:description'] || null,
    twitterImage: meta['twitter:image'] || null,
    h1s,
    h2Count: h2s.length,
    imageCount: images.length,
    imagesWithoutAlt: images.filter((img) => img.alt === null || img.alt === '').length,
    jsonLdTypes: jsonLd.map((j) => j['@type'] || (j['@graph'] ? 'Graph' : 'Unknown')),
    jsonLd,
    bodyLength: html.length,
  }
}

async function runAudit() {
  console.log('Fetching catalog lists from API...')
  const products = await (await fetch(`${apiOrigin}/products`)).json()
  const categories = await (await fetch(`${apiOrigin}/categories`)).json()
  const blogs = (await (await fetch(`${apiOrigin}/blogs?limit=50`)).json()).posts
  const cmsSlugs = [
    'about', 'careers', 'privacy-policy', 'terms-and-conditions',
    'help-faqs', 'returns-policy', 'support-center',
    'shipping-and-delivery-policy', 'cancellation-policy', 'cookie-policy', 'freshness-guarantee'
  ]

  const routes = [
    { type: 'core', path: '/' },
    { type: 'core', path: '/shop' },
    { type: 'core', path: '/blog' },
    ...categories.map((c) => ({ type: 'category-query', path: `/shop?category=${encodeURIComponent(c.slug)}`, slug: c.slug, label: c.label })),
    ...categories.map((c) => ({ type: 'category-slug', path: `/category/${encodeURIComponent(c.slug)}`, slug: c.slug, label: c.label })),
    ...products.slice(0, 15).map((p) => ({ type: 'product', path: `/product/${encodeURIComponent(p.slug)}`, name: p.name })),
    ...blogs.map((b) => ({ type: 'blog', path: `/blog/${encodeURIComponent(b.slug)}`, title: b.title })),
    ...cmsSlugs.map((slug) => ({ type: 'cms', path: `/${slug}`, slug })),
    { type: 'private', path: '/cart' },
    { type: 'private', path: '/checkout' },
    { type: 'private', path: '/account' },
    { type: 'private', path: '/login' },
    { type: 'private', path: '/profile' },
    { type: 'robots', path: '/robots.txt' },
    { type: 'sitemap', path: '/sitemap.xml' },
    { type: '404-test', path: '/non-existent-page-test-404' },
    { type: '404-product', path: '/product/non-existent-product-test-404' },
    { type: '404-blog', path: '/blog/non-existent-blog-test-404' },
  ]

  console.log(`Auditing ${routes.length} routes against live (${liveOrigin}) and local (${localOrigin})...`)

  const results = []

  for (const r of routes) {
    const liveUrl = `${liveOrigin}${r.path}`
    const localUrl = `${localOrigin}${r.path}`

    const [liveRes, localRes] = await Promise.all([
      fetchRoute(liveUrl),
      fetchRoute(localUrl),
    ])

    const liveParsed = liveRes.status === 200 && !r.path.endsWith('.txt') && !r.path.endsWith('.xml')
      ? parsePageHtml(liveRes.text)
      : null

    const localParsed = localRes.status === 200 && !r.path.endsWith('.txt') && !r.path.endsWith('.xml')
      ? parsePageHtml(localRes.text)
      : null

    results.push({
      route: r,
      live: {
        status: liveRes.status,
        headers: {
          location: liveRes.headers['location'],
          xRobotsTag: liveRes.headers['x-robots-tag'],
          cacheControl: liveRes.headers['cache-control'],
        },
        parsed: liveParsed,
      },
      local: {
        status: localRes.status,
        headers: {
          location: localRes.headers['location'],
          xRobotsTag: localRes.headers['x-robots-tag'],
          cacheControl: localRes.headers['cache-control'],
        },
        parsed: localParsed,
      },
    })
  }

  fs.writeFileSync('scripts/audit-results.json', JSON.stringify(results, null, 2))
  console.log('Audit complete! Saved to scripts/audit-results.json')
}

runAudit().catch(console.error)
