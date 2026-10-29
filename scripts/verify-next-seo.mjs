import assert from 'node:assert/strict'
import { parseDocument } from 'htmlparser2'
import { findAll, textContent } from 'domutils'

// Read-only local smoke check. Never submits cart, authentication, or orders.
const api = process.env.TOKRIII_TEST_API || 'http://127.0.0.1:5223/api/v1'
const site = process.env.TOKRIII_TEST_SITE || 'http://127.0.0.1:3000'
const get = async (url, options) => {
  const response = await fetch(url, options)
  return { status: response.status, text: await response.text() }
}
const products = JSON.parse((await get(`${api}/products?limit=1`)).text)
const blogs = JSON.parse((await get(`${api}/blogs?limit=1`)).text).posts
assert.ok(products.length && blogs.length, 'The local API needs at least one public product and blog')

const robots = await get(`${site}/robots.txt`)
assert.equal(robots.status, 200)
assert.match(robots.text, /Disallow: \/(?:\r?\n|$)/)
const sitemap = await get(`${site}/sitemap.xml`)
assert.equal(sitemap.status, 200)
assert.match(sitemap.text, /<urlset\b/)
assert.ok(sitemap.text.includes(`https://tokriii.com/product/${encodeURIComponent(products[0].slug)}`))
assert.ok(sitemap.text.includes(`https://tokriii.com/blog/${encodeURIComponent(blogs[0].slug)}`))
assert.doesNotMatch(sitemap.text, /<loc>[^<]*\/(?:cart|checkout|account|profile|login|order)(?:[\/?<])/)

for (const [kind, item] of [['product', products[0]], ['blog', blogs[0]]]) {
  const slug = encodeURIComponent(item.slug)
  const page = await get(`${site}/${kind}/${slug}`, { headers: { 'User-Agent': 'Googlebot' } })
  assert.equal(page.status, 200)
  assert.ok(page.text.includes(`https://tokriii.com/${kind}/${slug}`), `${kind} canonical missing`)
  assert.match(page.text, /<meta name="robots" content="noindex, nofollow"\s*\/?\s*>/)
  assert.match(page.text, /<meta property="og:title"/)
  if (kind === 'product') {
    const dom = parseDocument(page.text)
    const main = findAll((node) => node.type === 'tag' && node.name === 'main', dom.children)[0]
    assert.ok(main, 'Product visible main element missing from server HTML')
    const headings = findAll((node) => node.type === 'tag' && node.name === 'h1', [main])
    assert.equal(textContent(headings[0]), item.name, 'Product H1 missing from server HTML')
    const visibleText = textContent(main)
    assert.ok(visibleText.includes(item.price), 'Product price missing from visible HTML')
    if (item.weight) assert.ok(visibleText.includes(item.weight), 'Product weight missing from visible HTML')
    const images = findAll((node) => node.type === 'tag' && node.name === 'img', [main])
    if (item.image) assert.ok(images.some((image) => image.attribs.src === item.image), 'Product image missing from visible HTML')
    const scripts = findAll((node) => node.name === 'script' && node.attribs?.type === 'application/ld+json', dom.children)
    const graph = scripts.map((node) => JSON.parse(textContent(node)))
    assert.ok(graph.some((entry) => entry['@type'] === 'Product' && entry.name === item.name), 'Product JSON-LD missing')
  }
  const missing = await get(`${site}/${kind}/missing-migration-test-987654`)
  assert.equal(missing.status, 404)
  console.log(`${kind}: metadata, preview noindex and missing-record 404 OK`)
}
console.log('robots and dynamic sitemap OK; product body checked; blog body and commerce interactions remain untested')
