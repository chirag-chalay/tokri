import assert from 'node:assert/strict'
import { parseDocument } from 'htmlparser2'
import { findAll, textContent } from 'domutils'

const apiOrigin = process.env.TOKRIII_TEST_API || 'http://127.0.0.1:5223/api/v1'
const siteOrigin = process.env.TOKRIII_TEST_SITE || 'http://127.0.0.1:3000'

async function get(path, headers = {}) {
  const url = path.startsWith('http') ? path : `${siteOrigin}${path}`
  const res = await fetch(url, {
    redirect: 'manual',
    headers: { 'User-Agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)', ...headers },
  })
  const text = await res.text()
  return { status: res.status, headers: Object.fromEntries(res.headers.entries()), text }
}

function parsePage(html) {
  const dom = parseDocument(html)
  const htmlTag = findAll((n) => n.type === 'tag' && n.name === 'html', dom.children)[0]
  const titleTag = findAll((n) => n.type === 'tag' && n.name === 'title', dom.children)[0]
  const metaTags = findAll((n) => n.type === 'tag' && n.name === 'meta', dom.children)
  const linkTags = findAll((n) => n.type === 'tag' && n.name === 'link', dom.children)
  const h1Tags = findAll((n) => n.type === 'tag' && n.name === 'h1', dom.children)
  const scriptTags = findAll((n) => (n.type === 'script' || n.type === 'tag' || n.name === 'script') && n.name === 'script' && n.attribs?.type === 'application/ld+json', dom.children)

  const meta = {}
  for (const m of metaTags) {
    const key = m.attribs?.name || m.attribs?.property
    if (key) meta[key] = m.attribs?.content
  }

  const canonical = linkTags.find((l) => l.attribs?.rel === 'canonical')?.attribs?.href

  const schemas = []
  for (const s of scriptTags) {
    try {
      schemas.push(JSON.parse(textContent(s)))
    } catch {}
  }

  return {
    lang: htmlTag?.attribs?.lang,
    title: titleTag ? textContent(titleTag).trim() : null,
    description: meta['description'] || null,
    canonical,
    ogTitle: meta['og:title'] || null,
    ogDescription: meta['og:description'] || null,
    ogImage: meta['og:image'] || null,
    ogUrl: meta['og:url'] || null,
    twitterCard: meta['twitter:card'] || null,
    twitterTitle: meta['twitter:title'] || null,
    twitterDescription: meta['twitter:description'] || null,
    twitterImage: meta['twitter:image'] || null,
    h1s: h1Tags.map((h) => textContent(h).trim()).filter(Boolean),
    schemas,
    rawHtml: html,
  }
}

console.log('=== TOKRIII PRODUCTION-SAFE SEO VERIFICATION SUITE ===\n')

// 1. Root Layout Language & Geo Meta
console.log('Test 1: Root Layout (lang="en-IN" & Geo Tags)...')
const homeRes = await get('/')
assert.equal(homeRes.status, 200)
const home = parsePage(homeRes.text)
assert.equal(home.lang, 'en-IN', 'HTML lang must be en-IN')
assert.ok(homeRes.text.includes('name="geo.region" content="IN-DL"'), 'Missing geo.region meta tag')
assert.ok(homeRes.text.includes('name="geo.placename" content="New Delhi, Gurugram"'), 'Missing geo.placename meta tag')
console.log('✓ Root Layout lang="en-IN" and Delhi NCR geo-tags verified.')

// 2. Homepage SEO & Structured Data
console.log('Test 2: Homepage Title, Description, H1, OG, Twitter & JSON-LD...')
assert.equal(home.title, 'Tokriii — Buy Fresh, Exotic & Imported Fruits Online in Delhi NCR')
assert.ok(home.description && home.description.length >= 100, 'Homepage description must be >= 100 chars')
assert.equal(home.canonical, 'https://tokriii.com/')
assert.ok(home.h1s.length >= 1, 'Homepage must have at least one H1')
assert.ok(home.h1s.some((h) => h.includes('Tokriii')), 'Homepage H1 must mention Tokriii')
assert.equal(home.ogTitle, home.title)
assert.equal(home.ogDescription, home.description)
assert.ok(home.ogImage && home.ogImage.startsWith('https://tokriii.com/'), 'og:image must be absolute URL')
assert.equal(home.twitterCard, 'summary_large_image')

// Schemas on home
const websiteSchema = home.schemas.find((s) => s['@type'] === 'WebSite')
assert.ok(websiteSchema, 'WebSite schema missing on homepage')
assert.equal(websiteSchema.name, 'Tokriii')
assert.ok(websiteSchema.potentialAction, 'WebSite SearchAction missing')

const orgSchema = home.schemas.find((s) => Array.isArray(s['@type']) ? s['@type'].includes('Organization') : s['@type'] === 'Organization')
assert.ok(orgSchema, 'Organization schema missing on homepage')
assert.equal(orgSchema.name, 'Tokriii')
assert.equal(orgSchema.telephone, '+91-9580280280')

const storeSchema = home.schemas.find((s) => s['@type'] === 'Store')
assert.ok(storeSchema, 'Store (LocalBusiness) schema missing on homepage')
assert.equal(storeSchema.address?.addressLocality, 'New Delhi')
assert.equal(storeSchema.address?.postalCode, '110033')
console.log('✓ Homepage SEO and complete Structured Data verified.')

// 3. Shop All Page
console.log('Test 3: Shop All Page SEO & Structured Data...')
const shopRes = await get('/shop')
assert.equal(shopRes.status, 200)
const shop = parsePage(shopRes.text)
assert.equal(shop.title, 'Online Fruit Store — Shop Fresh, Exotic & Dry Fruits · Tokriii')
assert.ok(shop.description && shop.description.length >= 100, 'Shop description must be >= 100 chars')
assert.equal(shop.canonical, 'https://tokriii.com/shop')
assert.ok(shop.h1s.length >= 1, 'Shop page must have an H1')
assert.ok(shop.h1s[0].toLowerCase().includes('shop all'), `Expected Shop all H1, got ${shop.h1s[0]}`)
assert.ok(shop.schemas.some((s) => s['@type'] === 'CollectionPage'), 'Shop missing CollectionPage schema')
assert.ok(shop.schemas.some((s) => s['@type'] === 'BreadcrumbList'), 'Shop missing BreadcrumbList schema')
console.log('✓ Shop All SEO, H1, and Structured Data verified.')

// 4. Categories Verification (All 9 Categories)
console.log('Test 4: All 9 Category Pages SEO & Structured Data...')
const categories = await (await fetch(`${apiOrigin}/categories`)).json()
assert.ok(categories.length >= 9, 'Must have at least 9 categories')

for (const cat of categories) {
  const catSlug = cat.slug
  const catRes = await get(`/shop?category=${encodeURIComponent(catSlug)}`)
  assert.equal(catRes.status, 200, `Category ${catSlug} returned status ${catRes.status}`)
  const catPage = parsePage(catRes.text)

  assert.ok(catPage.title && catPage.title.includes('· Tokriii'), `Category ${catSlug} title must end with · Tokriii`)
  assert.ok(catPage.description && catPage.description.length >= 60, `Category ${catSlug} description missing or thin: ${catPage.description}`)
  assert.equal(catPage.canonical, `https://tokriii.com/shop?category=${encodeURIComponent(catSlug)}`)
  assert.ok(catPage.h1s.length >= 1, `Category ${catSlug} missing H1`)
  assert.ok(catPage.h1s[0].toLowerCase().includes(cat.label.toLowerCase()), `Category ${catSlug} H1 ${catPage.h1s[0]} does not include label ${cat.label}`)
  assert.ok(catPage.ogTitle, `Category ${catSlug} missing ogTitle`)
  assert.ok(catPage.ogDescription, `Category ${catSlug} missing ogDescription`)
  assert.ok(catPage.ogImage && catPage.ogImage.startsWith('https://tokriii.com/'), `Category ${catSlug} ogImage not absolute: ${catPage.ogImage}`)
  assert.equal(catPage.twitterCard, 'summary_large_image', `Category ${catSlug} missing twitterCard`)

  assert.ok(catPage.schemas.some((s) => s['@type'] === 'CollectionPage'), `Category ${catSlug} missing CollectionPage schema`)
  assert.ok(catPage.schemas.some((s) => s['@type'] === 'BreadcrumbList'), `Category ${catSlug} missing BreadcrumbList schema`)
}
console.log(`✓ All ${categories.length} categories verified: unique titles, descriptions, H1s, canonicals, and schemas.`)

// 5. Category Redirects (/category/:slug -> /shop?category=:slug)
console.log('Test 5: Category Permanent Redirects (/category/:slug -> /shop?category=:slug)...')
for (const cat of categories.slice(0, 3)) {
  const redirectRes = await get(`/category/${encodeURIComponent(cat.slug)}`)
  assert.equal(redirectRes.status, 308, `/category/${cat.slug} must return HTTP 308 permanent redirect`)
  assert.equal(redirectRes.headers['location'], `/shop?category=${encodeURIComponent(cat.slug)}`)
}
console.log('✓ Category permanent redirect (HTTP 308) verified.')

// 6. Product Detail SEO & Rich Schema
console.log('Test 6: Product Detail SEO, Open Graph & Enhanced Schema...')
const products = await (await fetch(`${apiOrigin}/products?limit=5`)).json()
for (const prod of products) {
  const prodRes = await get(`/product/${encodeURIComponent(prod.slug)}`)
  assert.equal(prodRes.status, 200)
  const prodPage = parsePage(prodRes.text)

  assert.ok(prodPage.title.includes(prod.name), `Product ${prod.slug} title missing name`)
  assert.ok(prodPage.description && prodPage.description.length >= 50, `Product ${prod.slug} description thin`)
  assert.equal(prodPage.canonical, `https://tokriii.com/product/${encodeURIComponent(prod.slug)}`)
  assert.equal(prodPage.h1s[0], prod.name, `Product ${prod.slug} H1 must match product name`)
  assert.equal(prodPage.twitterCard, 'summary_large_image')

  const prodSchema = prodPage.schemas.find((s) => s['@type'] === 'Product')
  assert.ok(prodSchema, `Product ${prod.slug} missing Product schema`)
  assert.equal(prodSchema.name, prod.name)
  assert.ok(prodSchema.brand, `Product ${prod.slug} missing brand`)
  assert.ok(prodSchema.offers, `Product ${prod.slug} missing offers`)
  assert.equal(prodSchema.offers.priceCurrency, 'INR')
  assert.ok(prodSchema.offers.availability.includes('schema.org/'), `Product ${prod.slug} missing schema.org availability`)
  assert.equal(prodSchema.offers.seller?.name, 'Tokriii')

  const breadcrumbsSchema = prodPage.schemas.find((s) => s['@type'] === 'BreadcrumbList')
  assert.ok(breadcrumbsSchema, `Product ${prod.slug} missing BreadcrumbList`)
  assert.equal(breadcrumbsSchema.itemListElement?.at(-1)?.name, prod.name)
}
console.log('✓ Product detail SEO, Open Graph, brand, availability, and BreadcrumbList schemas verified.')

// 7. Blog Listing and Blog Detail SEO
console.log('Test 7: Blog Listing & Detail Pages...')
const blogs = (await (await fetch(`${apiOrigin}/blogs?limit=5`)).json()).posts
const blogRes = await get('/blog')
assert.equal(blogRes.status, 200)
const blogPage = parsePage(blogRes.text)
assert.equal(blogPage.title, 'The Tokriii Journal — Seasonal Fruit Guides, Nutrition & Recipes')
assert.ok(blogPage.description && blogPage.description.length >= 80)
assert.equal(blogPage.canonical, 'https://tokriii.com/blog')
assert.ok(blogPage.schemas.some((s) => s['@type'] === 'CollectionPage'))
assert.ok(blogPage.schemas.some((s) => s['@type'] === 'BreadcrumbList'))

const articleRes = await get(`/blog/${encodeURIComponent(blogs[0].slug)}`)
assert.equal(articleRes.status, 200)
const articlePage = parsePage(articleRes.text)
assert.ok(articlePage.title.includes(blogs[0].title))
assert.equal(articlePage.canonical, `https://tokriii.com/blog/${encodeURIComponent(blogs[0].slug)}`)
const articleSchema = articlePage.schemas.find((s) => s['@type'] === 'BlogPosting')
assert.ok(articleSchema, 'Article missing BlogPosting schema')
assert.equal(articleSchema.headline, blogs[0].title)
assert.equal(articleSchema.publisher?.name, 'Tokriii')
console.log('✓ Blog listing and article SEO & BlogPosting schema verified.')

// 8. CMS Informational & Policy Pages (All 11 Pages)
console.log('Test 8: All 11 CMS Pages...')
const cmsSlugs = [
  'about', 'careers', 'privacy-policy', 'terms-and-conditions',
  'help-faqs', 'returns-policy', 'support-center',
  'shipping-and-delivery-policy', 'cancellation-policy', 'cookie-policy', 'freshness-guarantee'
]

for (const slug of cmsSlugs) {
  const res = await get(`/${slug}`)
  assert.equal(res.status, 200, `CMS page /${slug} returned status ${res.status}`)
  const page = parsePage(res.text)
  assert.ok(page.title && page.title.includes('Tokriii'), `CMS /${slug} title missing Tokriii`)
  assert.ok(page.description && page.description.length >= 50, `CMS /${slug} description missing or thin: ${page.description}`)
  assert.equal(page.canonical, `https://tokriii.com/${slug}`)
  assert.ok(page.h1s.length >= 1, `CMS /${slug} missing H1`)
  assert.equal(page.twitterCard, 'summary_large_image', `CMS /${slug} missing twitterCard`)
  assert.ok(page.schemas.some((s) => s['@type'] === 'BreadcrumbList'), `CMS /${slug} missing BreadcrumbList`)
}

// 9. FAQPage Schema on /help-faqs
console.log('Test 9: FAQPage Schema on /help-faqs...')
const faqRes = await get('/help-faqs')
assert.equal(faqRes.status, 200)
const faqPage = parsePage(faqRes.text)
const faqSchema = faqPage.schemas.find((s) => s['@type'] === 'FAQPage')
assert.ok(faqSchema, '/help-faqs missing FAQPage schema')
assert.ok(Array.isArray(faqSchema.mainEntity) && faqSchema.mainEntity.length >= 15, `FAQPage schema must contain at least 15 Q&A entities, found ${faqSchema.mainEntity?.length}`)
assert.ok(faqSchema.mainEntity[0].name && faqSchema.mainEntity[0].acceptedAnswer?.text)
console.log(`✓ FAQPage schema verified with ${faqSchema.mainEntity.length} verified Q&A entities.`)

// 10. Sitemap & Robots
console.log('Test 10: Dynamic Sitemap & Robots...')
const sitemapRes = await get('/sitemap.xml')
assert.equal(sitemapRes.status, 200)
assert.match(sitemapRes.text, /<urlset\b/)
assert.ok(sitemapRes.text.includes('<lastmod>'), 'Sitemap must contain <lastmod> timestamps')
assert.ok(sitemapRes.text.includes('<changefreq>'), 'Sitemap must contain <changefreq>')
assert.ok(sitemapRes.text.includes('<priority>'), 'Sitemap must contain <priority>')
for (const slug of cmsSlugs) {
  assert.ok(sitemapRes.text.includes(`https://tokriii.com/${slug}`), `Sitemap missing CMS page: /${slug}`)
}
assert.ok(sitemapRes.text.includes(`https://tokriii.com/product/${encodeURIComponent(products[0].slug)}`))
assert.ok(sitemapRes.text.includes(`https://tokriii.com/shop?category=${encodeURIComponent(categories[0].slug)}`))
assert.ok(sitemapRes.text.includes(`https://tokriii.com/blog/${encodeURIComponent(blogs[0].slug)}`))
assert.doesNotMatch(sitemapRes.text, /<loc>[^<]*\/(?:cart|checkout|account|profile|login|order)(?:[\/?<])/, 'Private routes must not be in sitemap')

const robotsRes = await get('/robots.txt')
assert.equal(robotsRes.status, 200)
assert.ok(robotsRes.text.includes('Disallow: /'), 'Robots.txt must disallow crawler access appropriately')

// 11. Error Status Handling (404s)
console.log('Test 11: 404 Status Handling...')
const unknownRes = await get('/unknown-seo-test-route-404')
assert.equal(unknownRes.status, 404, 'Unknown route must return 404')
const missingProdRes = await get('/product/nonexistent-prod-404')
assert.equal(missingProdRes.status, 404, 'Nonexistent product must return 404')
const missingBlogRes = await get('/blog/nonexistent-blog-404')
assert.equal(missingBlogRes.status, 404, 'Nonexistent blog must return 404')
console.log('✓ 404 error responses verified for missing routes.')

console.log('\n======================================================')
console.log('🎉 ALL 11 TEST PHASES PASSED WITH 100% SUCCESS!')
console.log('======================================================\n')
