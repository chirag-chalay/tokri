import assert from 'node:assert/strict'
import http from 'node:http'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { chromium } from 'playwright-core'

// Serve the production build locally, including SSR fixture data. Every browser
// request is intercepted; no requests reach Tokriii, Meta, or Google.
const fixture = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json')
  const pathname = new URL(req.url, 'http://fixture').pathname
  if (pathname.includes('/pages/')) {
    res.end(JSON.stringify({ title: 'About us', body: '<p>Test content</p>' }))
  } else if (pathname.endsWith('/settings/public')) res.end('{}')
  else res.end('[]')
})
fixture.listen(0, '127.0.0.1')
await once(fixture, 'listening')
const fixtureOrigin = `http://127.0.0.1:${fixture.address().port}`
const reservation = http.createServer()
reservation.listen(0, '127.0.0.1')
await once(reservation, 'listening')
const port = reservation.address().port
await new Promise((resolve) => reservation.close(resolve))
const localOrigin = `http://127.0.0.1:${port}`
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
  env: { ...process.env, TOKRIII_SERVER_API_ORIGIN: fixtureOrigin },
  stdio: ['ignore', 'pipe', 'pipe'],
})
let logs = ''
server.stdout.on('data', (chunk) => { logs += chunk })
server.stderr.on('data', (chunk) => { logs += chunk })
let browser
try {
  let ready = false
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      const response = await fetch(`${localOrigin}/cart`)
      if (response.ok) { ready = true; break }
    } catch { /* wait for the isolated server */ }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  assert.ok(ready, `Production test server did not start: ${logs}`)
  browser = await chromium.launch({ executablePath: process.env.CHROME_BIN || '/usr/bin/google-chrome', headless: true })

  async function session(host, { consent = false, javaScriptEnabled = true } = {}) {
    const context = await browser.newContext({ javaScriptEnabled, serviceWorkers: 'block' })
    if (consent) await context.addCookies([{ name: 'tokriii_marketing_consent', value: 'granted', domain: host, path: '/', secure: true }])
    const metaRequests = []
    const errors = []
    await context.route('**/*', async (route) => {
      const request = route.request()
      const url = new URL(request.url())
      if (['connect.facebook.net', 'www.facebook.com'].includes(url.hostname)) {
        metaRequests.push(url.href)
        if (url.pathname.endsWith('/fbevents.js')) {
          // Simulate SDK queue draining and live command handling.
          return route.fulfill({ contentType: 'application/javascript', body: `
            window.__metaCalls = [];
            window.fbq.callMethod = function(...args) { window.__metaCalls.push(args); };
            for (const args of window.fbq.queue) window.fbq.callMethod(...args);
            window.fbq.queue = [];
          ` })
        }
        return route.fulfill({ status: 204 })
      }
      if (url.hostname !== host) return route.abort()
      if (url.pathname.startsWith('/api/')) {
        return route.fulfill({ contentType: 'application/json', body: url.pathname.endsWith('/settings/public') ? '{}' : '[]' })
      }
      const response = await route.fetch({
        url: `${localOrigin}${url.pathname}${url.search}`,
        headers: { ...request.headers(), host },
      })
      return route.fulfill({ response })
    })
    const page = await context.newPage()
    page.on('pageerror', (error) => errors.push(error.message))
    return { context, page, metaRequests, errors }
  }
  const countViews = (page) => page.evaluate(() => (window.__metaCalls || []).filter((args) => args[0] === 'trackSingle' && args[1] === '891089060757681' && args[2] === 'PageView').length)

  const p = await session('tokriii.com')
  await p.page.goto('https://tokriii.com/cart', { waitUntil: 'networkidle' })
  assert.equal(p.metaRequests.length, 0, 'No Meta request before consent')
  await p.page.getByRole('button', { name: 'Allow marketing', exact: true }).click()
  await p.page.waitForFunction(() => window.__metaCalls?.some((args) => args[0] === 'trackSingle'))
  assert.equal(await countViews(p.page), 1, 'Consent sends exactly one PageView')
  const documentMarker = await p.page.evaluate(() => { window.__documentMarker = Math.random(); return window.__documentMarker })
  await p.page.getByRole('link', { name: 'About us', exact: true }).click()
  await p.page.waitForURL('**/about')
  await p.page.waitForFunction(() => window.__metaCalls.filter((args) => args[0] === 'trackSingle').length === 2)
  assert.equal(await p.page.evaluate(() => window.__documentMarker), documentMarker, 'Real Next Link navigation must preserve the document')
  // Next integrates the native History API with usePathname/useSearchParams.
  await p.page.evaluate(() => window.history.pushState(null, '', '/about?utm_source=test'))
  await p.page.waitForFunction(() => window.__metaCalls.filter((args) => args[0] === 'trackSingle').length === 3)
  await p.page.evaluate(() => window.history.replaceState(null, '', '/about?utm_source=test'))
  await p.page.waitForTimeout(150)
  assert.equal(await countViews(p.page), 3, 'Repeated route effects must deduplicate')
  await p.page.getByRole('button', { name: 'Cookie settings', exact: true }).click()
  await p.page.getByRole('button', { name: 'Reject', exact: true }).click()
  await p.page.evaluate(() => window.history.pushState(null, '', '/about?utm_source=revoked'))
  await p.page.waitForTimeout(150)
  assert.equal(await countViews(p.page), 3, 'Withdrawal stops subsequent tracking')
  await p.page.getByRole('button', { name: 'Cookie settings', exact: true }).click()
  await p.page.getByRole('button', { name: 'Allow marketing', exact: true }).click()
  assert.equal(await countViews(p.page), 4, 'Re-acceptance tracks the current route once')
  assert.deepEqual(await p.page.evaluate(() => window.__metaCalls.filter((args) => args[0] === 'consent').map((args) => args[1])), ['grant', 'revoke', 'grant'])
  assert.equal(p.metaRequests.filter((url) => url.endsWith('/fbevents.js')).length, 1)
  assert.deepEqual(p.errors, [])
  await p.context.close()

  const rejected = await session('tokriii.com')
  await rejected.page.goto('https://tokriii.com/cart', { waitUntil: 'networkidle' })
  for (const width of [320, 390, 1440]) {
    await rejected.page.setViewportSize({ width, height: 900 })
    const panel = await rejected.page.getByRole('region', { name: 'Allow marketing cookies?' }).boundingBox()
    assert.ok(panel && panel.x >= 0 && panel.x + panel.width <= width, `${width}px: panel fits viewport`)
    if (width < 1024) assert.ok(panel.y + panel.height <= 804, 'Mobile panel leaves room for cart controls')
    if (process.env.TOKRIII_PIXEL_SCREENSHOTS) {
      await rejected.page.screenshot({ path: `${process.env.TOKRIII_PIXEL_SCREENSHOTS}/consent-${width}.png` })
    }
  }
  await rejected.page.getByRole('button', { name: 'Reject', exact: true }).click()
  assert.ok((await rejected.context.cookies()).some((cookie) => cookie.name === 'tokriii_marketing_consent' && cookie.value === 'denied'))
  await rejected.page.reload({ waitUntil: 'networkidle' })
  assert.equal(await rejected.page.getByRole('region', { name: 'Allow marketing cookies?' }).count(), 0, 'Remember rejection after reload')
  assert.equal(rejected.metaRequests.length, 0, 'Rejection never loads the SDK')
  await rejected.page.getByRole('button', { name: 'Cookie settings', exact: true }).click()
  await rejected.page.getByRole('button', { name: 'Allow marketing', exact: true }).click()
  await rejected.page.waitForFunction(() => window.__metaCalls?.some((args) => args[0] === 'trackSingle'))
  assert.equal(await countViews(rejected.page), 1, 'Visitor can change rejection to acceptance')
  assert.deepEqual(rejected.errors, [])
  await rejected.context.close()

  for (const host of ['tokriii.com', 'www.tokriii.com', 'server.tokriii.com', 'staging.tokriii.com', 'localhost', '127.0.0.1']) {
    const s = await session(host, { consent: true })
    await s.page.goto(`https://${host}/cart`, { waitUntil: 'networkidle' })
    const allowed = ['tokriii.com', 'www.tokriii.com'].includes(host)
    assert.equal(await countViews(s.page), allowed ? 1 : 0, `${host}: initial PageView count`)
    assert.equal(s.metaRequests.length, allowed ? 1 : 0, `${host}: SDK request count`)
    assert.equal(await s.page.getByRole('button', { name: 'Cookie settings', exact: true }).count(), allowed ? 1 : 0, 'Consent UI is production-only')
    assert.deepEqual(s.errors, [])
    await s.context.close()
  }
  for (const [host, consent] of [['tokriii.com', true], ['tokriii.com', false], ['server.tokriii.com', true]]) {
    const s = await session(host, { consent, javaScriptEnabled: false })
    await s.page.goto(`https://${host}/cart`, { waitUntil: 'networkidle' })
    assert.equal(s.metaRequests.length, host === 'tokriii.com' && consent ? 1 : 0, 'Noscript must respect host and consent')
    await s.context.close()
  }
  console.log('PASS: production Next.js hydration, real Next Link navigation, query changes, deduplication, withdrawal/re-acceptance, six-host matrix, and noscript gating.')
  console.log('Meta SDK simulated locally; live Meta delivery remains unverified.')
} finally {
  if (browser) await browser.close()
  server.kill('SIGTERM')
  await new Promise((resolve) => fixture.close(resolve))
}
