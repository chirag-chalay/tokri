import assert from 'node:assert/strict'
import { parseDocument } from 'htmlparser2'
import { findAll, textContent } from 'domutils'

const siteOrigin = process.env.TOKRIII_TEST_SITE || 'http://127.0.0.1:3000'

async function get(path) {
  const res = await fetch(`${siteOrigin}${path}`, {
    headers: { 'User-Agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)' },
  })
  const text = await res.text()
  return { status: res.status, text }
}

function parse(html) {
  const dom = parseDocument(html)
  const title = findAll((n) => n.name === 'title', dom.children)[0]
  const metas = findAll((n) => n.name === 'meta', dom.children)
  const links = findAll((n) => n.name === 'link', dom.children)
  const scripts = findAll((n) => (n.name === 'script' || n.type === 'script') && n.attribs?.type === 'application/ld+json', dom.children)
  const h1 = findAll((n) => n.name === 'h1', dom.children)[0]

  const metaMap = {}
  for (const m of metas) {
    const k = m.attribs?.name || m.attribs?.property
    if (k) metaMap[k] = m.attribs?.content
  }

  const schemas = []
  for (const s of scripts) {
    try {
      schemas.push(JSON.parse(textContent(s)))
    } catch {}
  }

  return {
    title: title ? textContent(title).trim() : null,
    description: metaMap['description'] || null,
    canonical: links.find((l) => l.attribs?.rel === 'canonical')?.attribs?.href,
    ogTitle: metaMap['og:title'] || null,
    ogImage: metaMap['og:image'] || null,
    twitterCard: metaMap['twitter:card'] || null,
    h1: h1 ? textContent(h1).trim() : null,
    schemas,
  }
}

const targets = [
  // 10 Core Pages
  { path: '/', type: 'Core', name: 'Homepage' },
  { path: '/shop', type: 'Core', name: 'Shop All' },
  { path: '/blog', type: 'Core', name: 'Blog Listing' },
  { path: '/about', type: 'Core', name: 'About' },
  { path: '/careers', type: 'Core', name: 'Careers' },
  { path: '/privacy-policy', type: 'Core', name: 'Privacy Policy' },
  { path: '/terms-and-conditions', type: 'Core', name: 'Terms & Conditions' },
  { path: '/help-faqs', type: 'Core', name: 'Help & FAQs' },
  { path: '/returns-policy', type: 'Core', name: 'Returns Policy' },
  { path: '/support-center', type: 'Core', name: 'Support Center' },
  // 9 Categories
  { path: '/shop?category=fresh-fruits', type: 'Category', name: 'Fresh Fruits' },
  { path: '/shop?category=premium', type: 'Category', name: 'Premium' },
  { path: '/shop?category=imported', type: 'Category', name: 'Imported' },
  { path: '/shop?category=exotic', type: 'Category', name: 'Exotic' },
  { path: '/shop?category=tropical', type: 'Category', name: 'Tropical' },
  { path: '/shop?category=melons', type: 'Category', name: 'Melons' },
  { path: '/shop?category=dry-fruits', type: 'Category', name: 'Dry Fruits' },
  { path: '/shop?category=daily-fruits', type: 'Category', name: 'Daily Fruits' },
  { path: '/shop?category=fruit-hampers-combo-boxes', type: 'Category', name: 'Fruit Hampers' },
  // 9 Named Products
  { path: '/product/ultimate-luxury-fruit-hamper', type: 'Product', name: 'Ultimate Luxury Fruit Hamper' },
  { path: '/product/premium-family-fruit-feast-basket', type: 'Product', name: 'Premium Family Fruit Feast Basket' },
  { path: '/product/grand-royal-exotic-fruit-celebration-basket', type: 'Product', name: 'Grand Royal Exotic Fruit Celebration Basket' },
  { path: '/product/premium-medjool-dates-box', type: 'Product', name: 'Premium Medjool Dates Box' },
  { path: '/product/zespri-gold-kiwi-box-16-pieces', type: 'Product', name: 'Zespri Gold Kiwi Box – 16 Pieces' },
  { path: '/product/imported-blueberry-family-pack-1-5-kg', type: 'Product', name: 'Imported Blueberry Family Pack – 1.5 kg' },
  { path: '/product/ripe-ready-imported-avocado-box', type: 'Product', name: 'Ripe & Ready Imported Avocado Box' },
  { path: '/product/fresh-imported-avocado-box', type: 'Product', name: 'Fresh Imported Avocado Box' },
  { path: '/product/imported-apple-family-box', type: 'Product', name: 'Imported Apple Family Box' },
]

console.log(`Auditing ${targets.length} targets against Next.js 16.4.6...\n`)

for (const t of targets) {
  const { status, text } = await get(t.path)
  assert.equal(status, 200, `Target ${t.path} failed with status ${status}`)
  const p = parse(text)

  assert.ok(p.title && p.title.length >= 10, `Target ${t.path} title missing or too short: ${p.title}`)
  assert.ok(p.description && p.description.length >= 40, `Target ${t.path} description missing or thin: ${p.description}`)
  assert.ok(p.canonical && p.canonical.startsWith('https://tokriii.com'), `Target ${t.path} canonical invalid: ${p.canonical}`)
  assert.ok(p.ogTitle, `Target ${t.path} missing ogTitle`)
  assert.ok(p.ogImage && p.ogImage.startsWith('https://tokriii.com'), `Target ${t.path} ogImage not absolute: ${p.ogImage}`)
  assert.equal(p.twitterCard, 'summary_large_image', `Target ${t.path} missing summary_large_image`)
  assert.ok(p.h1, `Target ${t.path} missing H1`)
  assert.ok(p.schemas.length >= 1, `Target ${t.path} missing JSON-LD schemas`)

  console.log(`✓ [${t.type}] ${t.name.padEnd(42)} | 200 OK | Title: ${p.title.slice(0, 35)}... | H1: ${p.h1.slice(0, 30)} | Schemas: ${p.schemas.map(s => s['@type']).join(', ')}`)
}

console.log(`\n🎉 ALL ${targets.length} TARGETS (10 CORE + 9 CATEGORIES + 9 NAMED PRODUCTS) VERIFIED 100%!`)
