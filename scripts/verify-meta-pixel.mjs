import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const moduleUrl = pathToFileURL(path.join(ROOT, 'src/lib/metaPixel.js')).href
let testId = 0
let passed = 0

async function newBrowserFixture(hostname, route = '/') {
  const scripts = []
  const listeners = new Map()
  const cookies = new Map()
  const window = {
    location: new URL(`https://${hostname}${route}`),
  }
  const document = {
    title: 'Tokriii',
    head: {
      appendChild(el) { scripts.push(el) },
    },
    createElement(tag) {
      return { tagName: tag, async: false, src: '' }
    },
    querySelector(selector) {
      return scripts.find((el) => selector.includes(`src="${el.src}"`)) || null
    },
    addEventListener(name, handler) { listeners.set(name, handler) },
  }
  Object.defineProperty(document, 'cookie', {
    get() {
      return [...cookies].map(([key, value]) => `${key}=${value}`).join('; ')
    },
    set(value) {
      const [assignment, ...attributes] = value.split(';').map((part) => part.trim())
      const pos = assignment.indexOf('=')
      const key = assignment.slice(0, pos)
      const val = assignment.slice(pos + 1)
      const expiration = attributes.some((part) => part.toLowerCase() === 'max-age=0')
      if (expiration) cookies.delete(key)
      else cookies.set(key, val)
    },
  })

  globalThis.window = window
  globalThis.document = document
  const pixel = await import(`${moduleUrl}?fixture=${testId++}`)
  return {
    pixel,
    window,
    document,
    scripts,
    cookies,
    setRoute(route) { window.location = new URL(`https://${hostname}${route}`) },
    events() { return window.fbq?.queue || [] },
    pageViews() {
      return this.events().filter((x) => x[0] === 'trackSingle' && x[1] === '891089060757681' && x[2] === 'PageView')
    },
    emitConsent(value) { listeners.get('tokriii:marketing-consent-change')?.({ detail: { granted: value } }) },
  }
}

const p = await newBrowserFixture('tokriii.com')
assert.equal(p.pixel.installMetaPixel(), false)
assert.equal(p.pixel.trackMetaPageView('/'), false)
assert.equal(p.scripts.length, 0, 'Must not load Meta script before consent')
passed++

assert.equal(p.pixel.setMarketingConsent(true), true)
assert.equal(p.scripts.length, 1)
assert.equal(p.scripts[0].src, 'https://connect.facebook.net/en_US/fbevents.js')
assert.equal(p.document.cookie.includes('tokriii_marketing_consent=granted'), true)
assert.equal(p.events().filter((x) => x[0] === 'init').length, 1)
assert.equal(p.pageViews().length, 1, 'Consent opt-in sends one initial PageView')
passed++

p.pixel.installMetaPixel()
p.pixel.trackMetaPageView('/')
p.pixel.trackMetaPageView('/')
assert.equal(p.scripts.length, 1, 'StrictMode effects must not insert two scripts')
assert.equal(p.pageViews().length, 1, 'Same route must not send duplicate PageViews')
passed++

p.setRoute('/shop?category=exotic')
assert.equal(p.pixel.trackMetaPageView('/shop?category=exotic'), true)
assert.equal(p.pageViews().length, 2, 'Safe query-string route change sends one PageView')
p.pixel.trackMetaPageView('/shop?category=exotic')
assert.equal(p.pageViews().length, 2)
p.setRoute('/shop?category=fresh-fruits')
p.pixel.trackMetaPageView('/shop?category=fresh-fruits')
assert.equal(p.pageViews().length, 3, 'Second category change sends another PageView')
passed++

p.setRoute('/checkout?token=an-access-token')
assert.equal(p.pixel.trackMetaPageView('/checkout?token=an-access-token'), false)
p.setRoute('/order/ORD-771122')
assert.equal(p.pixel.trackMetaPageView('/order/ORD-771122'), false)
p.setRoute('/shop?email=a%40b.com')
assert.equal(p.pixel.trackMetaPageView('/shop?email=a%40b.com'), false)
assert.equal(p.pageViews().length, 3, 'Potentially sensitive URLs must not trigger Pixel')
passed++

p.setRoute('/shop?category=exotic')
assert.equal(p.pixel.trackMetaPageView('/shop?category=exotic'), true)
assert.equal(p.pageViews().length, 4, 'Return from private route can be counted')
passed++

assert.equal(p.pixel.setMarketingConsent(false), false)
assert.equal(p.document.cookie.includes('tokriii_marketing_consent=granted'), false)
p.setRoute('/blog')
assert.equal(p.pixel.trackMetaPageView('/blog'), false)
assert.equal(p.pageViews().length, 4)
assert.ok(p.events().some((x) => x[0] === 'consent' && x[1] === 'revoke'))
passed++

p.emitConsent(true)
assert.deepEqual(p.events().filter((x) => x[0] === 'consent').map((x) => x[1]), ['grant', 'revoke', 'grant'], 'Re-acceptance must re-grant SDK consent')
assert.equal(p.pageViews().length, 5, 'CMP consent-change event activates the current PageView')
assert.equal(p.scripts.length, 1, 'Consent toggles must not reload the script')
passed++

const returning = await newBrowserFixture('tokriii.com')
returning.cookies.set('tokriii_marketing_consent', 'granted')
returning.pixel.installMetaPixel()
returning.pixel.trackMetaPageView('/')
returning.pixel.installMetaPixel()
returning.pixel.trackMetaPageView('/')
assert.equal(returning.pageViews().length, 1, 'Returning consent sends exactly one initial PageView')
passed++

const privateEntry = await newBrowserFixture('tokriii.com', '/checkout?token=private')
privateEntry.cookies.set('tokriii_marketing_consent', 'granted')
assert.equal(privateEntry.pixel.installMetaPixel(), false)
assert.equal(privateEntry.scripts.length, 0, 'Do not initialize SDK on a sensitive entry URL')
passed++

const staging = await newBrowserFixture('server.tokriii.com')
staging.cookies.set('tokriii_marketing_consent', 'granted')
assert.equal(staging.pixel.installMetaPixel(), false)
assert.equal(staging.pixel.setMarketingConsent(true), false)
assert.equal(staging.pixel.trackMetaPageView('/'), false)
assert.equal(staging.scripts.length, 0, 'Staging must not send any Meta Pixel traffic')
passed++

const local = await newBrowserFixture('localhost')
local.cookies.set('tokriii_marketing_consent', 'granted')
assert.equal(local.pixel.installMetaPixel(), false)
assert.equal(local.scripts.length, 0, 'Local host must not load Meta Pixel')
passed++

const existing = await newBrowserFixture('www.tokriii.com')
existing.cookies.set('tokriii_marketing_consent', 'granted')
const preexistingEvents = []
existing.window.fbq = (...args) => preexistingEvents.push(args)
existing.window.fbq.getState = () => ({ pixels: [{ id: '891089060757681' }] })
existing.scripts.push({ src: 'https://connect.facebook.net/en_US/fbevents.js' })
assert.equal(existing.pixel.installMetaPixel(), true)
assert.equal(preexistingEvents.some((x) => x[0] === 'init'), false, 'Do not re-init registered Pixel')
assert.equal(existing.scripts.length, 1, 'Do not add duplicate Meta script')
passed++

const telemetry = readFileSync(path.join(ROOT, 'src/lib/telemetry.js'), 'utf8')
const ga = await newBrowserFixture('localhost')
const isolatedTelemetry = telemetry
  .replace(/import \{ installMetaPixel, trackMetaPageView \} from '.\/metaPixel'/, 'const installMetaPixel = () => {}; const trackMetaPageView = () => {}')
  .replace('import.meta.env.VITE_GA_MEASUREMENT_ID', JSON.stringify('G-TEST123'))
const analytics = await import(`data:text/javascript;base64,${Buffer.from(isolatedTelemetry).toString('base64')}`)
analytics.installAnalytics()
analytics.installAnalytics()
analytics.trackPageView('/shop')
assert.equal(ga.scripts.length, 1, 'Google Analytics still loads exactly once')
assert.equal(ga.scripts[0].src, 'https://www.googletagmanager.com/gtag/js?id=G-TEST123')
assert.deepEqual(Array.from(ga.window.dataLayer[1]), ['config', 'G-TEST123', { send_page_view: false }])
assert.equal(ga.window.dataLayer[2][0], 'event')
assert.equal(ga.window.dataLayer[2][1], 'page_view')
assert.equal(ga.window.dataLayer[2][2].page_path, '/shop')
passed++

const nextLayout = readFileSync(path.join(ROOT, 'src/app/layout.next.jsx'), 'utf8')
assert.match(telemetry, /installMetaPixel\(\)/)
assert.match(telemetry, /trackMetaPageView\(path\)/)
assert.match(nextLayout, /renderNoScriptPixel/)
assert.match(nextLayout, /tokriii_marketing_consent/)
assert.match(nextLayout, /referrerPolicy="origin"/)
assert.match(nextLayout, /891089060757681/)
passed++

console.log(`Meta Pixel isolation and consent tests: PASS (${passed}/${passed}).`)
console.log('NOTE: This is an isolated unit test, not Meta Events Manager delivery verification.')
