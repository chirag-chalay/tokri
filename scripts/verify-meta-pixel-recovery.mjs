import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import vm from 'node:vm'

const source = await fs.readFile(new URL('../src/lib/metaPixel.js', import.meta.url), 'utf8')
function load(enabled = false) {
  const scripts = [], listeners = new Map()
  const location = new URL('https://tokriii.com/')
  const document = {
    cookie: 'tokriii_marketing_consent=granted',
    querySelector: () => scripts[0], createElement: () => ({}),
    head: { appendChild: (script) => scripts.push(script) },
    addEventListener: (name, listener) => listeners.set(name, listener), dispatchEvent() {},
  }
  const context = vm.createContext({ window: { location }, document, URL, console: { error() {} }, CustomEvent: class {} })
  vm.runInContext(source.replaceAll('export ', '').replaceAll('import.meta.env.VITE_META_PIXEL_ENABLED', JSON.stringify(enabled ? 'true' : 'false')) + '\nglobalThis.api = { installMetaPixel, trackMetaPageView, setMarketingConsent };', context)
  return { ...context, scripts, listeners, api: context.api }
}

test('kill switch blocks SDK and every route event while preserving consent choices', () => {
  const { api, window, document, scripts } = load()
  assert.equal(api.installMetaPixel(), false)
  for (const route of ['/', '/product/banana', '/', '/shop']) assert.equal(api.trackMetaPageView(route), false)
  api.setMarketingConsent(false)
  assert.match(document.cookie, /consent=denied/)
  api.setMarketingConsent(true)
  assert.match(document.cookie, /consent=granted/)
  assert.equal(scripts.length, 0)
  assert.equal(window.fbq, undefined)
})

test('enabled integration deduplicates, tracks return views, and handles revoke/regrant', () => {
  const { api, window, scripts } = load(true)
  api.installMetaPixel(); api.installMetaPixel()
  api.trackMetaPageView('/'); api.trackMetaPageView('/')
  api.trackMetaPageView('/product/banana'); api.trackMetaPageView('/')
  assert.equal(scripts.length, 1)
  assert.equal(window.fbq.queue.filter((entry) => entry[0] === 'init').length, 1)
  assert.equal(window.fbq.queue.filter((entry) => entry[0] === 'trackSingle').length, 3)
  api.setMarketingConsent(false)
  assert.equal(api.trackMetaPageView('/shop'), false)
  api.setMarketingConsent(true)
  assert.equal(window.fbq.queue.filter((entry) => entry[0] === 'init').length, 1)
  assert.equal(scripts.length, 1)
  assert.equal(window.fbq.queue.filter((entry) => entry[0] === 'trackSingle').length, 4)
})

test('external SDK re-entry and failure cannot break shopping or permanently suppress retries', () => {
  const { api, window } = load(true)
  let events = 0
  window.fbq = (command) => {
    if (command === 'init') assert.equal(api.installMetaPixel(), false)
    if (command === 'trackSingle') { events++; assert.equal(api.trackMetaPageView('/'), false) }
  }
  assert.equal(api.trackMetaPageView('/'), true)
  assert.equal(events, 1)
  window.fbq = () => { throw new Error('SDK failed') }
  assert.equal(api.trackMetaPageView('/shop'), false)
  window.fbq = () => { events++ }
  assert.equal(api.trackMetaPageView('/shop'), true)
  assert.equal(events, 2)
})
