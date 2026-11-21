import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
let fixture = 0
async function browser({ analytics = false, marketing = false, enabled = true } = {}) {
  const scripts = []
  const requests = []
  const cookies = new Map([['tokriii_analytics_consent', analytics ? 'granted' : 'denied'], ['tokriii_marketing_consent', marketing ? 'granted' : 'denied']])
  globalThis.window = { location: new URL('https://tokriii.com/shop') }
  globalThis.document = {
    get cookie() { return [...cookies].map(([k, v]) => `${k}=${v}`).join('; ') },
    set cookie(value) { const [k, v] = value.split(';')[0].split('='); cookies.set(k, v) },
    addEventListener() {}, dispatchEvent() {},
    createElement: () => ({}), head: { appendChild: (script) => scripts.push(script) },
  }
  globalThis.localStorage = { getItem: () => null }
  globalThis.fetch = async (url, init) => {
    if (url.endsWith('/events')) {
      requests.push({ ...JSON.parse(init.body), headers: init.headers })
      return { status: 202 }
    }
    return { ok: true, json: async () => ({ enabled, eventToken: 'event-token', allowedHosts: ['tokriii.com'], gtm: { enabled, containerId: 'GTM-ABC', measurementId: 'G-ABC' }, meta: { enabled, pixelId: '123456789' } }) }
  }
  let source = await readFile(new URL('../src/lib/telemetry.js', import.meta.url), 'utf8')
  for (const file of ['trackingConfig', 'trackingEvents', 'trackingConsent', 'metaPixel']) source = source.replace(`'./${file}'`, JSON.stringify(new URL(`../src/lib/${file}.js`, import.meta.url).href))
  source = source.replace("'../../shared/metaSearch'", JSON.stringify(new URL('../shared/metaSearch.js', import.meta.url).href))
  const adapter = await import(`data:text/javascript;base64,${Buffer.from(source + `\n// ${fixture++}`).toString('base64')}`)
  return { adapter, scripts, requests, cookies }
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

test('granted Search and checkout share a Pixel and server event identity', async () => {
  const b = await browser({ marketing: true, analytics: true })
  globalThis.localStorage.getItem = () => JSON.stringify({ token: 'verified-bearer', phone: '9876543210' })
  window.location = new URL('https://tokriii.com/shop?fbclid=real-test-click')
  await b.adapter.trackPageView('/shop?fbclid=real-test-click')
  assert.match(b.cookies.get('_fbc'), /^fb\.1\.\d{13}\.real-test-click$/)
  b.adapter.trackSearch('Dragon Fruit')
  b.adapter.trackSearch('98765-43210')
  await b.adapter.trackCommerce('begin_checkout', {
    addressId: 'stored-address',
    items: [{ id: 'apple', name: 'Apple', price: 99, quantity: 2 }],
  }, 'checkout-event')
  const checkout = b.requests.find(event => event.eventName === 'InitiateCheckout')
  const checkoutPixel = window.fbq.queue.find(event => event[2] === 'InitiateCheckout')
  assert.equal(checkout.eventId, checkoutPixel[4].eventID)
  assert.deepEqual(checkout.ecommerce, { currency: 'INR', items: [{ item_id: 'apple', quantity: 2 }], value: 198 })
  assert.deepEqual(checkoutPixel[3].content_ids, ['apple'])
  assert.equal(checkout.addressId, 'stored-address')
  assert.equal(checkout.headers.Authorization, 'Bearer verified-bearer')
  assert.equal(JSON.stringify(window.dataLayer).includes('verified-bearer'), false)
  assert.equal(JSON.stringify(window.dataLayer).includes('stored-address'), false)
  const searches = b.requests.filter(event => event.eventName === 'Search')
  assert.equal(searches.length, 1)
  assert.equal(searches[0].searchTerm, 'Dragon Fruit')
  assert.equal(searches[0].eventId, window.fbq.queue.find(event => event[2] === 'Search')[4].eventID)
})

test('a click is only persisted on marketing consent and retains its original timestamp', async () => {
  const b = await browser()
  window.location = new URL('https://tokriii.com/?fbclid=consent-test-click')
  await b.adapter.trackPageView('/?fbclid=consent-test-click')
  assert.equal(b.cookies.has('_fbc'), false)
  window.location = new URL('https://tokriii.com/shop')
  b.cookies.set('tokriii_marketing_consent', 'granted')
  await b.adapter.trackPageView('/shop')
  const cookie = b.cookies.get('_fbc')
  assert.match(cookie, /^fb\.1\.\d{13}\.consent-test-click$/)
  window.location = new URL('https://tokriii.com/?fbclid=consent-test-click')
  await b.adapter.trackPageView('/?fbclid=consent-test-click')
  assert.equal(b.cookies.get('_fbc'), cookie)
})
