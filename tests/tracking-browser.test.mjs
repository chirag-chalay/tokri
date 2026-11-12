import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
let fixture = 0
async function browser({ analytics = false, marketing = false, enabled = true } = {}) {
  const scripts = []
  const cookies = new Map([['tokriii_analytics_consent', analytics ? 'granted' : 'denied'], ['tokriii_marketing_consent', marketing ? 'granted' : 'denied']])
  globalThis.window = { location: new URL('https://tokriii.com/shop') }
  globalThis.document = {
    get cookie() { return [...cookies].map(([k, v]) => `${k}=${v}`).join('; ') },
    set cookie(value) { const [k, v] = value.split(';')[0].split('='); cookies.set(k, v) },
    addEventListener() {}, dispatchEvent() {},
    createElement: () => ({}), head: { appendChild: (script) => scripts.push(script) },
  }
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ enabled, allowedHosts: ['tokriii.com'], gtm: { enabled, containerId: 'GTM-ABC', measurementId: 'G-ABC' }, meta: { enabled, pixelId: '123456789' } }) })
  let source = await readFile(new URL('../src/lib/telemetry.js', import.meta.url), 'utf8')
  for (const file of ['trackingConfig', 'trackingEvents', 'trackingConsent', 'metaPixel']) source = source.replace(`'./${file}'`, JSON.stringify(new URL(`../src/lib/${file}.js`, import.meta.url).href))
  const adapter = await import(`data:text/javascript;base64,${Buffer.from(source + `\n// ${fixture++}`).toString('base64')}`)
  return { adapter, scripts }
}

test('runtime adapter enforces disabled configuration and category consent', async () => {
  let b = await browser()
  await b.adapter.trackPageView('/shop')
  assert.equal(b.scripts.length, 0)
  b = await browser({ analytics: true, marketing: true, enabled: false })
  await b.adapter.trackPageView('/shop')
  assert.equal(b.scripts.length, 0)
  b = await browser({ analytics: true })
  await b.adapter.trackPageView('/shop'); await b.adapter.trackPageView('/shop')
  assert.equal(b.scripts.length, 1)
  assert.match(b.scripts[0].src, /gtm.js\?id=GTM-ABC/)
  assert.equal(window.dataLayer.filter((event) => event.event === 'page_view').length, 1)
  assert.equal(window.fbq, undefined)
  b = await browser({ marketing: true })
  await b.adapter.trackPageView('/shop')
  assert.equal(b.scripts.length, 1)
  assert.equal(window.fbq.queue.find((entry) => entry[0] === 'init')[1], '123456789')
  assert.equal(window.dataLayer, undefined)
})

test('unsafe URLs and invalid commerce events do not send', async () => {
  const b = await browser({ analytics: true, marketing: true })
  window.location = new URL('https://tokriii.com/shop?phone=1234567890')
  await b.adapter.trackPageView('/shop?phone=1234567890')
  assert.equal(b.scripts.length, 0)
  assert.equal(await b.adapter.trackCommerce('purchase', { items: [] }), false)
})


test('Tag Assistant preview can initialize tags without forwarding its debug flag', async () => {
  const b = await browser({ analytics: true })
  window.location = new URL('https://tokriii.com/shop?gtm_debug=x&utm_source=preview')
  await b.adapter.trackPageView('/shop?gtm_debug=x&utm_source=preview')
  assert.equal(b.scripts.length, 1)
  const event = window.dataLayer.find((entry) => entry.event === 'page_view')
  assert.equal(event.page_location, 'https://tokriii.com/shop?utm_source=preview')
  assert.equal(JSON.stringify(event).includes('gtm_debug'), false)
})
