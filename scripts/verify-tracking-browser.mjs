import assert from 'node:assert/strict'
import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
import { chromium } from 'playwright-core'
const server = await createServer({ configFile: false, plugins: [react(), { name: 'tracking-harness', configureServer(vite) { vite.middlewares.use(async (req, res, next) => {
  if (req.url !== '/__tracking-test') return next()
  res.setHeader('Content-Type', 'text/html')
  res.end(await vite.transformIndexHtml('/__tracking-test', `<html><body><div id="root"></div><script type="module">
import React from 'react';
import {createRoot} from 'react-dom/client';
import Consent, {CookieSettings} from '/src/components/MarketingConsent.jsx';
import SearchBox from '/src/components/SearchBox.jsx';
import * as tracking from '/src/lib/telemetry.js';
window.tracking=tracking; createRoot(document.getElementById('root')).render(React.createElement(React.Fragment, null, React.createElement(Consent), React.createElement(CookieSettings), React.createElement(SearchBox))); tracking.installAnalytics(); tracking.trackPageView('/__tracking-test');
</script></body></html>`))
}) } }], server: { host: '127.0.0.1', port: 15434, strictPort: true }, optimizeDeps: { include: ['react', 'react-dom/client'] } })
let browser
try {
  await server.listen()
  browser = await chromium.launch({ executablePath: process.env.CHROME_BIN || '/home/tokriii/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome', headless: true })
  const context = await browser.newContext()
  await context.routeWebSocket('**/*', () => {})
  const vendors = []
  await context.route('**/*', async (route) => {
    const url = new URL(route.request().url())
    if (url.hostname === 'www.googletagmanager.com' || url.hostname === 'connect.facebook.net') { vendors.push(url.href); return route.fulfill({ contentType: 'application/javascript', body: '' }) }
    if (url.hostname !== 'tokriii.com') return route.abort()
    if (url.pathname === '/api/v1/tracking/config') return route.fulfill({ json: { enabled: true, eventToken: 'test', allowedHosts: ['tokriii.com'], gtm: { enabled: true, containerId: 'GTM-ABC', measurementId: 'G-ABC' }, meta: { enabled: true, pixelId: '123456789' } } })
    if (url.pathname === '/api/v1/search') return route.fulfill({ json: { query: url.searchParams.get('q'), products: [], suggestions: [], total: 0, hasMore: false } })
    if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 202, body: '' })
    const response = await route.fetch({ url: `http://127.0.0.1:15434${url.pathname}${url.search}` })
    return route.fulfill({ response })
  })
  const page = await context.newPage()
  const pageErrors = []
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto('https://tokriii.com/__tracking-test')
  await page.getByRole('button', { name: 'Allow all', exact: true }).waitFor()
  assert.equal(vendors.length, 0)
  await page.getByRole('button', { name: 'Allow all', exact: true }).click()
  await page.waitForFunction(() => window.dataLayer?.some((event) => event.event === 'page_view') && window.fbq?.queue?.some((event) => event[0] === 'trackSingle'))
  assert.equal(await page.evaluate(() => window.dataLayer.filter((event) => event.event === 'page_view').length), 1)
  assert.equal(vendors.length, 2)
  await page.evaluate(() => { document.body.style.minHeight = '5000px'; window.scrollTo(0, document.body.scrollHeight) })
  await page.waitForFunction(() => window.fbq?.queue?.some((event) => event[0] === 'trackSingleCustom' && event[2] === 'Scroll'))
  await page.evaluate(() => { window.dispatchEvent(new Event('scroll')) })
  assert.equal(await page.evaluate(() => window.fbq.queue.filter((event) => event[0] === 'trackSingleCustom' && event[2] === 'Scroll').length), 1)
  await page.evaluate(async () => {
    history.replaceState(null, '', '/shop?category=fruit')
    await window.tracking.trackPageView('/shop?category=fruit')
    const panel = document.createElement('div')
    panel.id = 'scroll-fixture'
    panel.dataset.trackScroll = ''
    panel.style.cssText = 'height:100px;overflow:auto'
    panel.innerHTML = '<div style="height:1000px"></div>'
    document.body.appendChild(panel)
    panel.scrollTop = 200
  })
  await page.waitForTimeout(100)
  assert.equal(await page.evaluate(() => window.fbq.queue.filter((event) => event[0] === 'trackSingleCustom' && event[2] === 'Scroll').length), 1)
  await page.evaluate(() => { document.getElementById('scroll-fixture').scrollTop = 900 })
  await page.waitForFunction(() => window.fbq.queue.filter((event) => event[0] === 'trackSingleCustom' && event[2] === 'Scroll').length === 2)
  await page.evaluate(() => { history.replaceState(null, '', '/__tracking-test'); document.getElementById('scroll-fixture').remove() })
  const search = page.getByRole('textbox', { name: 'Search products' })
  await search.fill('apple')
  await page.waitForFunction(() => window.dataLayer?.filter((event) => event.event === 'search' && event.search_term === 'apple').length === 1)
  await search.press('Enter')
  assert.equal(await page.evaluate(() => window.dataLayer.filter((event) => event.event === 'search').length), 1)
  await search.fill('dragon-fruit')
  await page.waitForFunction(() => window.dataLayer?.some((event) => event.event === 'search' && event.search_term === 'dragon-fruit'))
  assert.equal(await page.evaluate(() => window.dataLayer.filter((event) => event.event === 'search').length), 2)
  await search.fill('test@example.com')
  await page.getByText('No products found for "test@example.com"', { exact: true }).waitFor()
  assert.equal(await page.evaluate(() => window.dataLayer.filter((event) => event.event === 'search').length), 2)
  await page.evaluate(async () => {
    const purchase = { transactionId: 'fixture-order', items: [{ id: 'apple', name: 'Apple', priceValue: 20, quantity: 1 }] }
    await window.tracking.trackCommerce('purchase', purchase, '11111111-1111-4111-8111-111111111111')
    await window.tracking.trackCommerce('purchase', purchase, '11111111-1111-4111-8111-111111111111')
  })
  assert.equal(await page.evaluate(() => window.dataLayer.filter((event) => event.event === 'purchase').length), 1)
  await page.getByRole('button', { name: 'Cookie settings', exact: true }).click()
  await page.getByRole('button', { name: 'Reject', exact: true }).click()
  const views = await page.evaluate(() => window.dataLayer.filter((event) => event.event === 'page_view').length)
  await page.evaluate(() => window.tracking.trackPageView('/shop'))
  assert.equal(await page.evaluate(() => window.dataLayer.filter((event) => event.event === 'page_view').length), views)
  await page.reload()
  await page.waitForFunction(() => window.tracking)
  assert.equal(await page.getByRole('button', { name: 'Allow all', exact: true }).count(), 0)
  await context.clearCookies()
  await page.reload()
  await page.getByRole('button', { name: 'Analytics only', exact: true }).click()
  await page.waitForFunction(() => window.dataLayer?.some((event) => event.event === 'page_view'))
  assert.equal(await page.evaluate(() => typeof window.fbq), 'undefined')
  await page.evaluate(() => { document.body.style.minHeight = '5000px'; window.scrollTo(0, document.body.scrollHeight) })
  await page.waitForFunction(() => window.dataLayer?.filter((event) => event.event === 'tokri_scroll' && event.percent_scrolled === 90).length === 1)
  assert.equal(await page.evaluate(() => typeof window.fbq), 'undefined')
  assert.deepEqual(pageErrors, [])
  console.log('Browser checks PASS: consent isolation, 90% document and category-panel scrolls, scroll deduplication, purchase deduplication, and search tracking.')
  await context.close()
} finally { await browser?.close(); await server.close() }
