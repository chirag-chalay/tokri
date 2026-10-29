import assert from 'node:assert/strict'

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
  const missing = await get(`${site}/${kind}/missing-migration-test-987654`)
  assert.equal(missing.status, 404)
  console.log(`${kind}: metadata, preview noindex and missing-record 404 OK`)
}
console.log('robots and dynamic sitemap OK; SSR body and commerce interactions are not tested by this script')
