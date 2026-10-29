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
  const dom = parseDocument(page.text)
  const main = findAll((node) => node.type === 'tag' && node.name === 'main', dom.children)[0]
  assert.ok(main, `${kind} visible main element missing from server HTML`)
  const headings = findAll((node) => node.type === 'tag' && node.name === 'h1', [main])
  const name = kind === 'product' ? item.name : item.title
  assert.equal(textContent(headings[0]), name, `${kind} H1 missing from server HTML`)
  const title = findAll((node) => node.type === 'tag' && node.name === 'title', dom.children)[0]
  assert.ok(textContent(title).includes(name), `${kind} title incorrect`)
  const canonical = findAll((node) => node.type === 'tag' && node.name === 'link' && node.attribs.rel === 'canonical', dom.children)[0]
  assert.equal(canonical?.attribs.href, `https://tokriii.com/${kind}/${slug}`)
  const scripts = findAll((node) => node.name === 'script' && node.attribs?.type === 'application/ld+json', dom.children)
  const graph = scripts.map((node) => JSON.parse(textContent(node)))
  const images = findAll((node) => node.type === 'tag' && node.name === 'img', [main])
  if (kind === 'product') {
    assert.ok(textContent(main).includes(item.price), 'Product price missing from visible HTML')
    if (item.weight) assert.ok(textContent(main).includes(item.weight), 'Product weight missing from visible HTML')
    if (item.image) assert.ok(images.some((image) => image.attribs.src === item.image), 'Product image missing from visible HTML')
    const productJson = graph.find((entry) => entry['@type'] === 'Product' && entry.name === item.name)
    assert.ok(productJson, 'Product JSON-LD missing')
    assert.ok(graph.some((entry) => entry['@type'] === 'BreadcrumbList' && entry.itemListElement?.at(-1)?.name === item.name), 'Product breadcrumb JSON-LD missing')
    if (item.currency && item.priceValue !== null) {
      assert.equal(productJson.offers?.priceCurrency, item.currency)
      assert.equal(Number(productJson.offers?.price), Number(item.priceValue))
    }
  } else {
    const full = JSON.parse((await get(`${api}/blogs/${slug}`)).text)
    const body = findAll((node) => node.type === 'tag' && node.attribs?.class?.split(' ').includes('blog-article-body'), [main])[0]
    assert.ok(body, 'Blog body missing from visible HTML')
    const source = parseDocument(full.body || '')
    const paragraph = findAll((node) => node.type === 'tag' && node.name === 'p' && textContent(node).trim(), source.children)[0]
    assert.ok(paragraph && textContent(body).includes(textContent(paragraph).trim()), 'Real article paragraph missing from server HTML')
    assert.ok(findAll((node) => node.type === 'tag' && ['h2', 'h3'].includes(node.name) && node.attribs.id, [body]).length, 'Article headings missing from server HTML')
    if (full.coverImage) assert.ok(images.some((image) => image.attribs.src === full.coverImage), 'Article image missing from server HTML')
    const articleJson = graph.find((entry) => entry['@type'] === 'BlogPosting' && entry.headline === item.title)
    assert.ok(articleJson, 'BlogPosting JSON-LD missing')
    if (full.publishedAt) assert.equal(articleJson.datePublished, full.publishedAt)
    if (full.author) assert.equal(articleJson.author?.name, full.author)
  }
  const missing = await get(`${site}/${kind}/missing-migration-test-987654`)
  assert.equal(missing.status, 404)
  console.log(`${kind}: metadata, preview noindex and missing-record 404 OK`)
}

for (const slug of ['blueberry-tube', 'pear-beauty-red', 'star-fruit']) {
  const apiResponse = await get(`${api}/products/${slug}`)
  if (apiResponse.status === 404) { console.log(`${slug}: not present in local data; skipped`); continue }
  assert.equal(apiResponse.status, 200)
  const product = JSON.parse(apiResponse.text)
  const page = await get(`${site}/product/${slug}`)
  assert.equal(page.status, 200)
  const dom = parseDocument(page.text)
  const main = findAll((node) => node.type === 'tag' && node.name === 'main', dom.children)[0]
  assert.ok(main, `${slug}: main missing`)
  const title = findAll((node) => node.type === 'tag' && node.name === 'h1', [main])[0]
  assert.equal(textContent(title), product.name)
  const visible = textContent(main).replace(/\s+/g, ' ')
  assert.ok(visible.includes(product.price), `${slug}: price missing`)
  if (product.weight) assert.ok(visible.includes(product.weight), `${slug}: weight missing`)
  const images = findAll((node) => node.type === 'tag' && node.name === 'img', [main])
  if (product.image) assert.ok(images.some((image) => image.attribs.src === product.image), `${slug}: image missing`)
  if (product.description) {
    const description = parseDocument(product.description)
    const snippet = findAll((node) => node.type === 'tag' && node.name === 'p' && textContent(node).trim(), description.children)[0]
    if (snippet) assert.ok(visible.includes(textContent(snippet).trim().replace(/\s+/g, ' ')), `${slug}: description missing`)
  }
  console.log(`${slug}: product body SSR OK`)
}

console.log('robots and dynamic sitemap OK; product and article content checked; commerce interactions remain untested')
