import test from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { Worker } from 'node:worker_threads'
import { buildReport } from '../src/admin/report-tables.js'
import { periodBounds, reportCsv } from '../src/admin/reports.js'
import { paise, reportFact, uniqueReportFacts } from '../src/monitoring/report-facts.js'

const first = Date.parse('2026-11-21T00:00:00+05:30')
const hour = 3600000
const visit = randomUUID()
const time = (offset = 0) => new Date(first + offset).toISOString()
const fact = (event, fields = {}, category = 'api') => reportFact({
  event, platform: 'website', timestamp: time(), sessionId: visit, eventId: randomUUID(), status: 'success', ...fields,
}, category)
const report = (section, fields) => buildReport({ section, facts: [], orders: [], coverage: new Map(), products: [], end: first + 8 * hour, ...fields })
const card = (view, label) => view.cards.find(item => item.label === label)?.value

test('report periods use IST and compare a partial day through the same time yesterday', () => {
  const bounds = periodBounds({ from: '2026-11-21', to: '2026-11-21' }, first + 2 * hour)
  assert.equal(bounds.start, first)
  assert.equal(bounds.end, first + 2 * hour)
  assert.equal(bounds.previousEnd - bounds.previousStart, 2 * hour)
  assert.equal(periodBounds({ from: '2026-11-31', to: '2026-11-21' }, first), null)
  assert.equal(periodBounds({ from: '2026-11-21', to: '2026-11-22' }, first), null)
  assert.equal(paise('129.05'), 12905)
  assert.equal(paise('0.10'), 10)
  assert.equal(paise('129.005'), null)
  const csv = reportCsv({ headers: ['Pincode', 'Product'], rows: [{ values: ['001234', '=SUM(1,2)'] }] })
  assert.match(csv, /"001234","'=SUM\(1,2\)"/)
})

test('pincode totals count checks, rejections, visits, option failures and missing visits separately', () => {
  const failed = { enteredPincode: '302017', pincodeServiceable: false, reasonCode: 'PINCODE_NOT_SERVICEABLE', status: 'failure' }
  const requestId = randomUUID()
  const primary = fact('request.completed', { ...failed, route: '/api/v1/account/addresses', method: 'POST', requestId })
  const duplicate = fact('operation.failed', { ...failed, route: '/api/v1/account/addresses', requestId }, 'error')
  const browser = fact('delivery.pin.checked', failed, 'website')
  const app = fact('request.completed', { ...failed, platform: 'android', sessionId: undefined, route: '/api/v1/geo/pincode', method: 'POST' })
  const rejectedOption = fact('request.completed', { enteredPincode: '110047', pincodeServiceable: true, failureReason: 'delivery_option_unavailable',
    status: 400, route: '/api/v1/checkout/create-order', method: 'POST' })
  const view = report('pincodes', { facts: uniqueReportFacts([duplicate, primary, browser, app, rejectedOption]),
    coverage: new Map([['110047', { city: 'Delhi', express: true }]]) })
  assert.deepEqual(view.main.rows[0].values, ['302017', 'Unrecorded', 'Unavailable', 2, 1, 3, 1, 1, 0, 0, 0])
  assert.deepEqual(view.main.rows[1].values.slice(1), ['Delhi', 'Express', 0, 1, 0, 0, 0, 1, 0, 0])
  assert.equal(card(view, 'Visits with coverage rejections'), 1)
  assert.equal(view.details.get('302017').rows.length, 3)
  assert.ok(view.details.get('302017').rows.some(row => row.values[3] === 'Address rejected'))
  assert.equal(view.details.get('denied').rows.length, 3)
})

test('funnel keeps quick adds, unlinked requests, and recently active visits out of unsupported rates', () => {
  const active = randomUUID()
  const other = randomUUID()
  const rows = [
    fact('website.navigation', { pagePath: '/product/banana', product: 'Banana' }, 'website'),
    fact('cart.added', { timestamp: time(1000), product: 'Banana' }, 'website'),
    fact('website.navigation', { timestamp: time(2000), pagePath: '/checkout', visitorKind: 'guest' }, 'website'),
    fact('checkout.guest.blocked', { timestamp: time(3000), visitorKind: 'guest', reasonCode: 'AUTH_REQUIRED', status: 'failure' }, 'website'),
    fact('customer.login', { timestamp: time(4000), verifiedCustomerId: 'verified-customer' }),
    fact('request.completed', { timestamp: time(5000), orderNo: 'TKR12345678901', route: '/api/v1/checkout/confirm-cod', httpStatus: 200 }),
    fact('cart.added', { sessionId: other }, 'website'),
    fact('website.navigation', { sessionId: active, timestamp: time(8 * hour - 5000), pagePath: '/checkout', visitorKind: 'guest' }, 'website'),
    fact('request.completed', { platform: 'ios', sessionId: undefined, route: '/api/v1/checkout/create-order', method: 'POST' }),
  ]
  const facts = uniqueReportFacts(rows)
  const sales = report('funnel', { facts })
  const guests = report('guest', { facts })
  assert.deepEqual(sales.main.rows.map(row => row.values[1]), [3, 1, 2, 2, 1, 1])
  assert.equal(card(sales, 'Closed checkout conversion'), '100.0%')
  assert.equal(card(sales, 'Shopping events without a visit'), 1)
  assert.equal(card(guests, 'Closed guest checkout without a recorded order'), '0.0%')
  assert.equal(guests.details.get('signed-in').rows.length, 1)
  assert.equal(guests.details.get('open').rows.length, 1)
  const channel = report('channels', { facts })
  assert.equal(channel.main.rows.find(row => row.values[0] === 'iPhone').values.at(-1), 'Unavailable')
})

test('ad refusals stay out of checkout counts and pending orders stay out of paid value', () => {
  const ignored = fact('request.completed', { route: '/api/v1/tracking/events', httpStatus: 403, status: 403 })
  assert.equal(ignored, null)
  const pending = { time: first, amount: 12905, platform: 'website', orderNo: 'TKR10000000001', mode: 'cod', paymentStatus: 'pending', status: 'pending', confirmed: true }
  const paid = { ...pending, orderNo: 'TKR10000000002', mode: 'online', paymentStatus: 'paid', status: 'paid' }
  const refund = fact('webhook.received', { platform: undefined, sessionId: undefined, provider: 'razorpay', source: 'payment', outcome: 'refund.processed',
    status: 'refunded', amount: 1575 }, 'payment')
  const snapshot = report('orders', { orders: [pending, paid], facts: [refund] })
  assert.equal(card(snapshot, 'Pending payment'), 1)
  assert.equal(card(snapshot, 'Order value marked paid'), '₹129.05')
  assert.equal(card(snapshot, 'Recorded COD confirmations'), 1)
  assert.equal(snapshot.details.get('provider').rows[0].values.at(-1), '₹15.75')
  assert.equal(report('hours', {}).main.rows.length, 24)
})

test('report reader uses the recorded IST window and sanitizes report output', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'tokri-report-test-'))
  const worker = new Worker(new URL('../src/monitoring/worker.js', import.meta.url), {
    workerData: { directory, readerOnly: true, retentionDays: 90, preserveRetention: true, maxBytes: 1048576 },
  })
  try {
    await writeFile(path.join(directory, 'website-2026-11-21.log'), [
      { timestamp: time(), event: 'website.navigation', platform: 'website', pagePath: '/', page: 'Home', sessionId: visit, status: 'observed', ip: '203.0.113.12' },
      { timestamp: time(1000), event: 'cart.added', platform: 'website', product: 'Banana', status: 'success', eventId: randomUUID() },
      { timestamp: time(hour), event: 'website.navigation', platform: 'website', pagePath: '/cart', status: 'observed' },
    ].map(row => JSON.stringify(row)).join('\n') + '\n')
    const result = await new Promise((resolve, reject) => {
      worker.once('error', reject)
      worker.once('message', ({ result, error }) => error ? reject(new Error(error)) : resolve(result))
      worker.postMessage({ type: 'read', id: 1, query: { report: { start: first, end: first + hour } } })
    })
    assert.equal(result.facts.length, 2)
    assert.equal(result.facts[1].product, 'Banana')
    assert.equal(result.facts[1].session, null)
    assert.doesNotMatch(JSON.stringify(result), /203\.0\.113\.12/)
  } finally {
    await worker.terminate()
    await rm(directory, { recursive: true, force: true })
  }
})
