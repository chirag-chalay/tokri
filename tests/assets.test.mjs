import test from 'node:test'
import assert from 'node:assert/strict'
import { publicAssetOrigin, normalizeUploadUrl, normalizeUploadHtml, normalizeBrowserAsset } from '../shared/assets.js'

test('production defaults to the storefront while staging and explicit CDN origins are preserved', () => {
  assert.equal(publicAssetOrigin({ clientUrl: 'https://www.tokriii.com', apiUrl: 'https://server.tokriii.com' }), 'https://tokriii.com')
  assert.equal(publicAssetOrigin({ clientUrl: 'https://server.tokriii.com', apiUrl: 'https://server.tokriii.com' }), 'https://server.tokriii.com')
  assert.equal(publicAssetOrigin({ publicAssetUrl: 'https://cdn.example.com/', clientUrl: 'https://tokriii.com' }), 'https://cdn.example.com')
})
test('known upload URLs normalize, keeping their paths and options; external images remain untouched', () => {
  for (const value of ['/uploads/products/apple.webp?w=600#image', 'https://server.tokriii.com/uploads/products/apple.webp?w=600#image', '//www.tokriii.com/uploads/products/apple.webp?w=600#image']) {
    assert.equal(normalizeUploadUrl(value, 'https://tokriii.com'), 'https://tokriii.com/uploads/products/apple.webp?w=600#image')
  }
  for (const value of ['https://external.example/uploads/apple.webp', 'data:image/png;base64,abc', '/assets/logo.svg', 'https://server.tokriii.com/blog/apple']) assert.equal(normalizeUploadUrl(value, 'https://tokriii.com'), value)
  assert.equal(normalizeBrowserAsset('https://server.tokriii.com/uploads/apple.webp', 'www.tokriii.com'), 'https://tokriii.com/uploads/apple.webp')
  assert.equal(normalizeBrowserAsset('https://server.tokriii.com/uploads/apple.webp', 'server.tokriii.com'), 'https://server.tokriii.com/uploads/apple.webp')
})
test('rich-text images and picture sources normalize without rewriting external URL query values', () => {
  const html = `<img src="https://server.tokriii.com/uploads/a.webp"><source srcset='/uploads/a.webp 1x, https://server.tokriii.com/uploads/b.webp 2x'><img src="https://cdn.example/image?ref=https://server.tokriii.com/uploads/a.webp">`
  const result = normalizeUploadHtml(html, 'https://tokriii.com')
  assert.ok(result.includes('src="https://tokriii.com/uploads/a.webp"'))
  assert.ok(result.includes("srcset='https://tokriii.com/uploads/a.webp 1x, https://tokriii.com/uploads/b.webp 2x'"))
  assert.ok(result.includes('src="https://cdn.example/image?ref=https://server.tokriii.com/uploads/a.webp"'))
})
