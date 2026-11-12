import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { createRequire } from 'node:module'

// Opt-in only. Never use DATABASE_URL from the developer's environment/.env.
test('isolated MySQL + real AdminJS/browser + simulated Razorpay regression', { skip: !process.env.MONITORING_TEST_DATABASE_URL, timeout: 120000 }, async (t) => {
  const { root } = await import('./helpers/isolation.js')
  const { prisma } = await import('../src/lib/prisma.js')
  await prisma.user.update({ where: { username: 'review-admin' }, data: { role: 'super_admin', name: 'Monitoring Test Admin' } })
  const { log, logContext, startCriticalOutbox, workerCall, closeMonitoring, monitoringState, setDebug, requestLogging } = await import('../src/monitoring/index.js')
  const { default: express } = await import('express')
  const { buildAdminRouter } = await import('../src/admin/index.js')
  const { default: apiRouter } = await import('../src/routes/api.js')
  const { handleRazorpayWebhook } = await import('../src/routes/webhooks.js')
  const { errorHandler } = await import('../src/middleware/errorHandler.js')
  const { chromium } = await import('playwright-core')
  const require = createRequire(import.meta.url)
  const RazorpayAPI = require(path.join(path.dirname(require.resolve('razorpay')), 'api.js'))
  const originalPost = RazorpayAPI.prototype.post
  const nativeFetch = globalThis.fetch
  const payments = new Map(), gatewayOrders = new Map()
  let nextOrder = 0, gatewayFails = false
  RazorpayAPI.prototype.post = async ({ url, data }) => {
    if (gatewayFails) throw { statusCode: 503, error: { description: 'PRIVATE_PROVIDER_ERROR' } }
    assert.equal(url, '/orders', 'only simulated order creation is permitted')
    const order = { id: `order_review${runId}${++nextOrder}`, ...data }
    gatewayOrders.set(order.id, order)
    return order
  }
  globalThis.fetch = async (input, options) => {
    const url = new URL(String(input))
    if (url.hostname !== 'api.razorpay.com') {
      assert.equal(url.hostname, '127.0.0.1', 'outbound real network access is blocked')
      return nativeFetch(input, options)
    }
    const id = url.pathname.match(/\/payments\/(pay_[a-zA-Z0-9]+)/)?.[1]
    const payment = payments.get(id)
    return { ok: Boolean(payment), status: payment ? 200 : 404, json: async () => payment || { error: { code: 'NOT_FOUND', description: 'PRIVATE_PROVIDER_ERROR' } } }
  }
  const { admin, adminRouter } = await buildAdminRouter({ watch: false })
  await startCriticalOutbox()
  const app = express()
  app.use(requestLogging)
  app.post('/api/v1/webhooks/razorpay', express.raw({ type: 'application/json' }), handleRazorpayWebhook)
  app.use(admin.options.rootPath, adminRouter)
  app.use('/api/v1', express.json(), apiRouter)
  app.use(errorHandler)
  const server = await new Promise((resolve) => { const current = app.listen(0, '127.0.0.1', () => resolve(current)) })
  const runId = crypto.randomUUID().slice(0, 8)
  const origin = `http://127.0.0.1:${server.address().port}`
  const adminPath = admin.options.rootPath
  let browser, page, cookie, customerToken, customerId, codOrder, customerPhone = `98${String(Date.now()).slice(-8)}`, paidOrder
  const secret = 'synthetic-provider-secret-never-log'
  const request = async (route, body, headers = {}) => {
    const response = await nativeFetch(origin + route, { method: body === undefined ? 'GET' : 'POST', headers: { ...(body === undefined ? {} : { 'content-type': 'application/json' }), ...headers }, body: body === undefined ? undefined : JSON.stringify(body), redirect: 'manual' })
    const text = await response.text()
    let json
    try { json = JSON.parse(text) } catch { json = {} }
    return { response, json, text }
  }
  const adminRequest = (route, body) => request(`${adminPath}/api/${route}`, body, { cookie })
  const checkout = (route, body) => request(`/api/v1/checkout/${route}`, body, { authorization: `Bearer ${customerToken}` })
  const rows = async (filters = {}) => { await workerCall('flush'); return workerCall('read', filters) }
  const webhook = async (payload, signature, eventId = 'evt_review') => {
    const body = JSON.stringify(payload)
    return nativeFetch(`${origin}/api/v1/webhooks/razorpay`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-razorpay-event-id': eventId, 'x-razorpay-signature': signature || crypto.createHmac('sha256', secret).update(body).digest('hex') }, body })
  }
  let broken = false
  const check = (name, fn) => t.test(name, { skip: broken ? 'Earlier flow boundary failed' : false }, async () => {
    try { await fn() } catch (error) {
      broken = true
      if (page) {
        await page.screenshot({ path: path.join(root, 'failure.png'), fullPage: true }).catch(() => {})
        await fs.writeFile(path.join(root, 'failure.html'), await page.content()).catch(() => {})
        t.diagnostic(`Browser failure: ${(await page.locator('body').innerText()).slice(-2500)}`)
      }
      throw error
    }
  })
  try {
    await check('browser login and monitoring page render through real AdminJS sessions', async () => {
      browser = await chromium.launch({ executablePath: process.env.MONITORING_TEST_CHROME || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
      const context = await browser.newContext()
      context.setDefaultTimeout(10000)
      await context.route('**/*', (route) => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort())
      page = await context.newPage()
      const errors = []
      page.on('pageerror', (error) => errors.push(error.message))
      await page.goto(`${origin}${adminPath}/login`)
      await page.locator('input[name="email"]').fill('review-admin')
      await page.locator('input[name="password"]').fill('Isolated-review-password-123')
      await Promise.all([page.waitForURL(`${origin}${adminPath}`), page.locator('button[type="submit"]').click()])
      cookie = (await context.cookies()).map(({ name, value }) => `${name}=${value}`).join('; ')
      await page.goto(`${origin}${adminPath}/pages/logs`)
      await page.getByRole('heading', { name: 'Logs & Monitoring' }).waitFor()
      await page.getByRole('status').filter({ hasText: 'Disabled' }).waitFor()
      const debugBox = await page.getByRole('complementary', { name: 'Debug logging controls' }).boundingBox()
      const profileBox = await page.locator('[data-css="logged-in"]').boundingBox()
      assert.ok(debugBox.y >= profileBox.y + profileBox.height, 'debug controls sit below the profile')
      assert.ok(Math.abs(debugBox.x + debugBox.width - profileBox.x - profileBox.width) < 45, 'debug controls align to the profile side')
      assert.equal(await page.locator('.tokri-monitoring pre, .tokri-monitoring code').count(), 0)
      assert.equal(errors.length, 0, errors.join('\n'))
      await page.screenshot({ path: path.join(root, 'admin-monitoring.png'), fullPage: true })
    })
    await check('customer registration/login, COD checkout, API and database errors produce real events', async () => {
      const sent = await request('/api/v1/auth/send-otp', { phone: customerPhone })
      assert.equal(sent.response.status, 200)
      assert.ok(sent.json.devOtp, 'only isolated development OTP is used')
      assert.equal((await request('/api/v1/auth/verify-otp', { phone: customerPhone, otp: '0000' })).response.status, 400)
      const verified = await request('/api/v1/auth/verify-otp', { phone: customerPhone, otp: sent.json.devOtp })
      assert.equal(verified.response.status, 200)
      customerToken = verified.json.token; customerId = verified.json.user.id
      const added = await request('/api/v1/account/addresses', { name: 'PRIVATE_CUSTOMER_NAME', phone: customerPhone, line1: 'PRIVATE_ADDRESS', line2: 'Test Area', city: 'Delhi', state: 'Delhi', pincode: '110001' }, { authorization: `Bearer ${customerToken}` })
      assert.equal(added.response.status, 201)
      const cod = await checkout('create-order', { items: [{ slug: 'banana', quantity: 2 }], addressId: added.json.address.id, paymentMode: 'cod', deliveryOption: 'morning' })
      assert.equal(cod.response.status, 201)
      const confirmation = await checkout('confirm-cod', { orderNo: cod.json.order.orderNo })
      assert.equal(confirmation.response.status, 200)
      codOrder = await prisma.order.findUnique({ where: { orderNo: cod.json.order.orderNo } })
      assert.equal((await prisma.order.findUnique({ where: { orderNo: cod.json.order.orderNo } })).paymentMode, 'cod')
      const accounts = await rows({ category: 'account', user: customerId })
      assert.equal(accounts.total, 1)
      const access = await rows({ category: 'api', search: 'customer.login' })
      assert.ok(access.rows.some((row) => row.status === 'failure'))
      assert.equal(access.rows.find(row => row.status === 'failure').failureReason, 'otp_incorrect')
      assert.ok(access.rows.some((row) => row.status === 'success' && row.actorId === customerId))
      await assert.rejects(prisma.product.update({ where: { id: 'missing-review-product' }, data: { priceValue: 1 } }))
      assert.ok((await rows({ category: 'error' })).rows.some((row) => row.source === 'database'))
      t.diagnostic(`COD order ${cod.json.order.orderNo}; customer account and login events verified`)
    })
    await check('real cart totals and confirmed failures are visible inline and searchable in plain English', async () => {
      const quote = await checkout('quote', { items: [{ slug: 'banana', quantity: 2 }], deliveryOption: 'morning' })
      assert.equal(quote.response.status, 200)
      const failed = await checkout('quote', { items: [{ slug: 'banana', quantity: 0 }] })
      assert.equal(failed.response.status, 400)
      const records = await rows({ category: 'api', search: 'shopping cart total' })
      assert.ok(records.rows.some(row => row.grandTotal === quote.json.totals.grandTotal && row.productCount === 1))
      assert.ok(records.rows.some(row => row.failureReason === 'quantity_invalid'))
      await page.goto(`${origin}${adminPath}/pages/logs`)
      await page.getByRole('button', { name: 'API access', exact: true }).click()
      await page.getByLabel('Search', { exact: true }).fill('shopping cart total')
      await page.getByRole('button', { name: 'Apply filters', exact: true }).click()
      await page.getByText("Customer's shopping cart total was calculated successfully.", { exact: true }).waitFor()
      await page.locator('.monitor-reason').filter({ hasText: 'A product quantity was not valid.' }).waitFor()
      assert.equal(await page.locator('tbody details,tbody pre,tbody code').count(), 0)
      assert.ok(!(await page.locator('tbody').innerText()).includes('/api/v1/'))
      assert.ok((await page.locator('tbody').innerText()).includes('Final amount'))
      await page.getByText('2 matching rows · Page 1', { exact: true }).waitFor()
      await page.setViewportSize({ width: 1440, height: 1200 })
      await page.getByRole('heading', { name: 'Logs & Monitoring', exact: true }).scrollIntoViewIfNeeded()
      await page.screenshot({ path: path.join(root, 'inline-desktop.png') })
      await page.setViewportSize({ width: 390, height: 844 })
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
      await page.locator('tbody tr').first().scrollIntoViewIfNeeded()
      await page.screenshot({ path: path.join(root, 'inline-mobile.png') })
      await page.locator('tbody tr').last().scrollIntoViewIfNeeded()
      await page.screenshot({ path: path.join(root, 'inline-mobile-totals.png') })
      await page.setViewportSize({ width: 768, height: 1024 })
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
      await page.screenshot({ path: path.join(root, 'inline-tablet.png') })
      await page.setViewportSize({ width: 1440, height: 900 })
    })
    let addressId
    const newOrder = async () => {
      addressId ||= (await prisma.customer.findUnique({ where: { id: customerId } })).addresses[0].id
      const result = await checkout('create-order', { items: [{ slug: 'banana', quantity: 2 }], addressId, paymentMode: 'online', deliveryOption: 'morning' })
      assert.equal(result.response.status, 201, result.text)
      return prisma.order.findUnique({ where: { orderNo: result.json.order.orderNo } })
    }
    await check('successful simulated payment and repeated confirmation update paid state once', async () => {
      await prisma.setting.update({ where: { id: 1 }, data: { razorpayEnabled: true, razorpayKeyId: 'rzp_test_SIMULATED', razorpayKeySecret: secret } })
      paidOrder = await newOrder()
      const paymentId = 'pay_reviewsuccess'
      const signature = crypto.createHmac('sha256', secret).update(`${paidOrder.razorpayOrderId}|${paymentId}`).digest('hex')
      const body = { orderNo: paidOrder.orderNo, razorpayOrderId: paidOrder.razorpayOrderId, razorpayPaymentId: paymentId, razorpaySignature: signature }
      assert.equal((await checkout('verify-payment', { ...body, razorpaySignature: 'invalid' })).response.status, 400)
      assert.equal((await checkout('verify-payment', body)).json.paymentStatus, 'paid')
      assert.equal((await checkout('verify-payment', body)).json.paymentStatus, 'paid')
      const updated = await prisma.order.findUnique({ where: { id: paidOrder.id } })
      assert.equal(updated.razorpayPaymentId, paymentId)
      const paymentLogs = await rows({ category: 'payment', orderId: paidOrder.id })
      assert.equal(paymentLogs.rows.filter((row) => row.event === 'order.payment.updated' && row.status === 'paid').length, 1)
    })
    await check('failed payment returned with HTTP 200 is logged as failed; provider errors remain safe', async () => {
      const order = await newOrder()
      payments.set('pay_reviewfailed', { id: 'pay_reviewfailed', order_id: order.razorpayOrderId, amount: Math.round(Number(order.grandTotal) * 100), status: 'failed', error_description: 'PRIVATE_PROVIDER_ERROR' })
      const failed = await checkout('confirm-intent', { orderNo: order.orderNo, razorpayPaymentId: 'pay_reviewfailed' })
      assert.equal(failed.response.status, 200)
      assert.equal(failed.json.status, 'failed')
      assert.equal(failed.response.headers.get('x-tokri-operation-status'), 'failure')
      assert.ok((await rows({ category: 'api', orderId: order.orderNo, status: 'Failed' })).rows.some(row => row.httpStatus === 200 && row.paymentStatus === 'failed'))
      assert.notEqual((await prisma.order.findUnique({ where: { id: order.id } })).paymentStatus, 'paid')
      assert.ok((await rows({ category: 'payment', orderId: order.orderNo, status: 'failed' })).rows.some((row) => row.event === 'checkout.request'))
      gatewayFails = true
      const result = await checkout('create-order', { items: [{ slug: 'banana' }], addressId, paymentMode: 'online' })
      gatewayFails = false
      assert.equal(result.response.status, 503)
    })
    await check('signed/invalid/duplicate/unmatched webhooks and refunds have correct outcomes', async () => {
      const order = await newOrder()
      const payload = { event: 'payment.captured', payload: { payment: { entity: { id: 'pay_reviewwebhook', order_id: order.razorpayOrderId, notes: { orderNo: order.orderNo, email: 'PRIVATE_EMAIL' } } } } }
      assert.equal((await webhook(payload, 'invalid')).status, 400)
      const duplicate = await Promise.all([webhook(payload), webhook(payload)])
      assert.deepEqual(duplicate.map((r) => r.status), [200, 200])
      assert.equal((await prisma.order.findUnique({ where: { id: order.id } })).paymentStatus, 'paid')
      const logs = await rows({ category: 'payment', orderId: order.id })
      assert.equal(logs.rows.filter((row) => row.event === 'order.payment.updated' && row.status === 'paid').length, 1)
      const received = await rows({ category: 'payment', orderId: order.orderNo, search: 'webhook.received' })
      assert.equal(received.total, 2)
      assert.ok(received.rows.every((row) => row.providerEventId === 'evt_review'))
      for (const [event, status] of [['refund.created', 'pending'], ['refund.processed', 'refunded'], ['refund.failed', 'failed'], ['payment.failed', 'failed']]) {
        const result = await webhook({ event, payload: { refund: { entity: { id: `rfnd_${event.replace('.', '_')}`, payment_id: 'pay_reviewwebhook', amount: 100, email: 'PRIVATE_EMAIL' } }, payment: { entity: { id: 'pay_reviewwebhook', notes: { orderNo: order.orderNo } } } } })
        assert.equal(result.status, 200)
        assert.ok((await rows({ category: 'payment', status, search: event })).total > 0)
      }
      assert.equal((await prisma.order.findUnique({ where: { id: order.id } })).paymentStatus, 'paid', 'refund observation does not change existing commerce behavior')
      await webhook({ event: 'payment.captured', payload: { payment: { entity: { id: 'pay_unknown', order_id: 'order_unknown', notes: {} } } } })
      assert.ok((await rows({ category: 'payment', search: 'unmatched' })).total > 0)
      // Force the valid interleaving where both COD handlers have read 'pending'.
      const cash = await import('../src/services/partnerOrders.js')
      for (const mode of ['qr', 'cash']) {
        const created = await checkout('create-order', { items: [{ slug: 'banana' }], addressId, paymentMode: 'cod' })
        assert.equal(created.response.status, 201)
        const cod = await prisma.order.findUnique({ where: { orderNo: created.json.order.orderNo } })
        const originalFind = prisma.order.findUnique
        let ready = 0, release
        const barrier = new Promise((resolve) => { release = resolve })
        prisma.order.findUnique = async (args) => {
          const result = await originalFind(args)
          if (result?.id === cod.id && result.paymentStatus === 'pending') { if (++ready === 2) release(); await barrier }
          return result
        }
        try {
          if (mode === 'qr') {
            const event = { event: 'payment_link.paid', payload: { payment: { entity: { id: 'pay_reviewcod', notes: { orderNo: cod.orderNo } } }, payment_link: { entity: { reference_id: cod.orderNo } } } }
            assert.deepEqual((await Promise.all([webhook(event), webhook(event)])).map((r) => r.status), [200, 200])
          } else {
            const results = await Promise.all([cash.collectCashForOrder(cod.id), cash.collectCashForOrder(cod.id)])
            assert.ok(results.every((row) => row.paymentStatus === 'paid' && Array.isArray(row.items)))
          }
        } finally { prisma.order.findUnique = originalFind }
        const transitions = await rows({ category: 'payment', orderId: cod.id, search: 'order.payment.updated' })
        assert.equal(transitions.total, 1, `${mode}: a single transition under concurrent replays`)
        assert.equal(transitions.rows[0].status, 'paid')
      }
    })
    await check('real AdminJS product edit/delete, coupon/settings/team actions have safe audit values', async () => {
      const created = await adminRequest('resources/Product/actions/new', { name: 'Review Delete', slug: `review-delete-${runId}`, priceValue: 12, isActive: true })
      assert.equal(created.response.status, 200, created.text)
      const product = await prisma.product.findUnique({ where: { slug: `review-delete-${runId}` } })
      assert.ok(product, created.text)
      const edited = await adminRequest(`resources/Product/records/${product.id}/edit`, { name: 'Review Delete', slug: `review-delete-${runId}`, priceValue: 34, isActive: true })
      assert.equal(edited.response.status, 200, edited.text)
      assert.equal(Number((await prisma.product.findUnique({ where: { id: product.id } })).priceValue), 34)
      const rejected = await adminRequest(`resources/Product/records/${product.id}/edit`, { name: '', slug: '', description: 'PRIVATE_UNSAVED_VALUE' })
      assert.ok(rejected.response.status >= 400 || rejected.json.notice?.type === 'error')
      assert.equal(Number((await prisma.product.findUnique({ where: { id: product.id } })).priceValue), 34)
      const rejectedLogs = await rows({ category: 'api', search: product.id, status: 'Failed' })
      assert.ok(rejectedLogs.rows.some(row => row.model === 'Product' && row.operation === 'update' && row.failureReason === 'product_name_required'))
      const deleted = await adminRequest(`resources/Product/records/${product.id}/delete`, {})
      assert.equal(deleted.response.status, 200)
      assert.equal(await prisma.product.findUnique({ where: { id: product.id } }), null)
      const audit = await rows({ category: 'audit', search: product.id })
      assert.equal(audit.rows.find((row) => row.event === 'Product.create').new.priceValue, '12')
      assert.equal(audit.rows.find((row) => row.event === 'Product.update').old.priceValue, '12')
      assert.equal(audit.rows.find((row) => row.event === 'Product.delete').old.priceValue, '34')
      assert.equal(audit.rows.find((row) => row.event === 'Product.delete').new, null)
      const bulkProducts = await Promise.all([1, 2].map((n) => prisma.product.create({ data: { slug: `bulk-delete-${runId}-${n}`, name: 'Bulk fixture', priceValue: n } })))
      assert.equal((await adminRequest(`resources/Product/bulk/bulkDelete?recordIds=${bulkProducts.map((p) => p.id).join(',')}`, {})).response.status, 200)
      for (const item of bulkProducts) {
        assert.equal(await prisma.product.findUnique({ where: { id: item.id } }), null)
        assert.equal((await rows({ category: 'audit', search: item.id })).rows.find((row) => row.event === 'Product.delete').new, null)
      }
      const coupon = await adminRequest('resources/Coupon/actions/new', { code: `REVIEWCOUPON-${runId}`, type: 'flat', value: 20, isActive: true })
      assert.equal(coupon.response.status, 200, coupon.text)
      const savedCoupon = await prisma.coupon.findUnique({ where: { code: `REVIEWCOUPON-${runId}`.toUpperCase() } })
      assert.ok(savedCoupon)
      assert.equal((await adminRequest(`resources/Coupon/records/${savedCoupon.id}/edit`, { code: savedCoupon.code, type: 'flat', value: 25, isActive: true })).response.status, 200)
      assert.equal((await adminRequest(`resources/Coupon/records/${savedCoupon.id}/delete`, {})).response.status, 200)
      const couponAudit = await rows({ category: 'audit', search: savedCoupon.id })
      assert.ok(couponAudit.rows.some((row) => row.event === 'Coupon.update' && row.old.value === '20' && row.new.value === '25'))
      assert.ok(couponAudit.rows.some((row) => row.event === 'Coupon.delete' && row.new === null))
      const settingsResult = await adminRequest('resources/Setting/records/1/edit', { handlingFee: 3, razorpayKeySecret: secret })
      assert.equal(settingsResult.response.status, 200, settingsResult.text)
      const changedOrder = await adminRequest(`resources/Order/records/${codOrder.id}/edit`, {
        status: 'packed', paymentStatus: 'pending', contactName: 'PRIVATE_CUSTOMER_NAME', contactPhone: customerPhone,
        addressLine1: 'PRIVATE_ADDRESS', addressLine2: 'Test Area', addressCity: 'Delhi', addressState: 'Delhi', addressPincode: '110001',
      })
      assert.equal(changedOrder.response.status, 200, changedOrder.text)
      assert.equal((await prisma.order.findUnique({ where: { id: codOrder.id } })).status, 'packed')
      assert.ok((await rows({ category: 'audit', search: codOrder.id })).rows.some((row) => row.old?.status === 'pending' && row.new?.status === 'packed'))
      const team = await adminRequest('resources/User/actions/new', { name: 'PRIVATE_ADMIN_NAME', username: `review-new-admin-${runId}`, email: `new-admin-${runId}@example.invalid`, password: 'PRIVATE_ADMIN_PASSWORD', confirmPassword: 'PRIVATE_ADMIN_PASSWORD', role: 'admin', isActive: true })
      assert.equal(team.response.status, 200)
      assert.ok(await prisma.user.findUnique({ where: { username: `review-new-admin-${runId}` } }), team.text)
      const account = await rows({ category: 'account', search: 'User.created' })
      assert.ok(account.rows.some((row) => row.role === 'admin'))
      const settings = await rows({ category: 'audit', search: 'Setting.update' })
      assert.ok(settings.rows.some((row) => row.new.handlingFee === '3'))
    })
    await check('real MySQL callback and array transaction rollbacks do not publish audit events', async () => {
      const actor = { req: { session: { adminUser: { id: 'review-admin-transaction' } } } }
      await assert.rejects(logContext.run(actor, () => prisma.$transaction(async (tx) => { await tx.product.create({ data: { slug: 'rollback-callback', name: 'Rollback', priceValue: 1 } }); throw new Error('rollback') })))
      await assert.rejects(logContext.run(actor, () => prisma.$transaction([prisma.product.create({ data: { slug: 'rollback-array', name: 'Rollback', priceValue: 1 } }), prisma.product.update({ where: { id: 'no-product' }, data: { priceValue: 2 } })])))
      assert.equal((await rows({ category: 'audit', user: 'review-admin-transaction' })).total, 0)
      assert.equal(await prisma.product.count({ where: { slug: { in: ['rollback-callback', 'rollback-array'] } } }), 0)
    })
    await check('browser date/type/search and 50/100-row pages; debug controls and expiry', async () => {
      assert.equal(monitoringState().debugUntil, null)
      for (let i = 0; i < 123; i++) log('api', `browser.pagination.${runId}`, { orderNo: `pagination-${i}`, status: 200, actorId: 'pagination-user', ip: '127.0.0.2' })
      await workerCall('flush')
      await page.getByRole('button', { name: 'API access', exact: true }).click()
      await page.getByLabel('Search', { exact: true }).fill(`browser.pagination.${runId}`)
      const date = new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10)
      await page.getByLabel('Date (IST)', { exact: true }).fill(date)
      await page.getByLabel('User ID', { exact: true }).fill('pagination-user')
      await page.getByLabel('IP', { exact: true }).fill('127.0.0.2')
      await page.getByLabel('Status / outcome', { exact: true }).selectOption('Successful')
      await page.getByLabel('Order ID / number', { exact: true }).fill('pagination-')
      await page.getByRole('button', { name: 'Apply filters', exact: true }).click()
      await page.getByText('123 matching rows · Page 1').waitFor()
      assert.equal(await page.locator('tbody tr').count(), 50)
      assert.ok((await page.locator('tbody tr').first().innerText()).includes('IST'))
      await page.getByLabel('Date (IST)', { exact: true }).fill('2000-01-01')
      await page.getByRole('button', { name: 'Apply filters', exact: true }).click()
      await page.getByText('0 matching rows · Page 1').waitFor()
      await page.getByLabel('Date (IST)', { exact: true }).fill(date)
      await page.getByRole('button', { name: 'Apply filters', exact: true }).click()
      await page.getByText('123 matching rows · Page 1').waitFor()
      await page.getByRole('button', { name: 'Next', exact: true }).click()
      await page.getByText('123 matching rows · Page 2').waitFor()
      assert.equal(await page.locator('tbody tr').count(), 50)
      await page.getByLabel('Rows per page').selectOption('100')
      await page.getByRole('button', { name: 'Apply filters', exact: true }).click()
      await page.getByText('123 matching rows · Page 1').waitFor()
      assert.equal(await page.locator('tbody tr').count(), 100)
      await page.getByRole('button', { name: 'Next', exact: true }).click()
      await page.getByText('123 matching rows · Page 2').waitFor()
      assert.equal(await page.locator('tbody tr').count(), 23)
      await page.getByRole('button', { name: 'Enable debug logging', exact: true }).click()
      await page.getByRole('status').filter({ hasText: 'Enabled' }).waitFor()
      await request('/api/v1/health')
      await page.getByRole('button', { name: 'Disable debug logging', exact: true }).click()
      await page.getByRole('status').filter({ hasText: 'Disabled' }).waitFor()
      const debug = await rows({ category: 'debug' })
      assert.ok(debug.total > 0)
      setDebug(true, 1)
      const now = Date.now
      Date.now = () => now() + 61000
      try { log('debug', 'expired-never-write'); assert.equal(monitoringState().debugUntil, null) } finally { Date.now = now; setDebug(false) }
      assert.equal((await rows({ category: 'debug', search: 'expired-never-write' })).total, 0)
      await page.screenshot({ path: path.join(root, 'admin-pagination.png'), fullPage: true })
      await page.setViewportSize({ width: 390, height: 844 })
      assert.ok(await page.getByRole('complementary', { name: 'Debug logging controls' }).isVisible())
      const overflow = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, viewport: window.innerWidth, content: document.querySelector('.tokri-monitoring').getBoundingClientRect().right }))
      assert.ok(overflow.page <= overflow.viewport + 1, `mobile page overflows: ${JSON.stringify(overflow)}`)
      assert.ok(overflow.content <= overflow.viewport + 1)
      assert.equal(await page.locator('.tokri-monitoring pre, .tokri-monitoring code').count(), 0)
      assert.equal(await page.getByText('View details', { exact: true }).count(), 0)
      await page.locator('tbody tr').first().scrollIntoViewIfNeeded()
      assert.ok(!(await page.locator('.tokri-monitoring').innerText()).includes('browser.pagination.'))
      assert.ok(!(await page.locator('tbody').innerText()).includes('pagination-user'))
      await page.screenshot({ path: path.join(root, 'admin-monitoring-mobile.png'), fullPage: false })
      await page.setViewportSize({ width: 1440, height: 900 })
    })
    await check('anonymous/staff/revoked sessions and invalid dates are rejected; CSRF protected', async () => {
      assert.equal((await request(`${adminPath}/api/pages/logs`)).response.status, 302)
      assert.equal((await request(`${adminPath}/api/pages/logs`, { action: 'enable' }, { 'x-tokri-monitoring': '1', 'sec-fetch-site': 'same-origin' })).response.status, 302)
      assert.equal((await adminRequest('pages/logs?date=2026-02-31')).response.status, 400)
      const user = await prisma.user.findUnique({ where: { username: 'review-admin' } })
      await prisma.user.update({ where: { id: user.id }, data: { role: 'staff' } })
      assert.equal((await adminRequest('pages/logs')).response.status, 403)
      const spoofed = await request(`${adminPath}/api/pages/logs`, { action: 'enable', canManageDebug: true }, { cookie, 'x-tokri-monitoring': '1', 'sec-fetch-site': 'same-origin' })
      assert.equal(spoofed.response.status, 403)
      await prisma.user.update({ where: { id: user.id }, data: { role: 'admin', isActive: false } })
      assert.equal((await adminRequest('pages/logs')).response.status, 403)
      await prisma.user.update({ where: { id: user.id }, data: { isActive: true } })
      assert.equal((await adminRequest('pages/logs', { action: 'enable' })).response.status, 403)
      assert.equal((await adminRequest('resources/MonitoringOutbox/actions/list')).response.status, 404)
      assert.equal((await adminRequest('resources/MonitoringOutboxBudget/actions/list')).response.status, 404)
      const result = await adminRequest('pages/logs')
      assert.equal(result.response.headers.get('cache-control'), 'no-store')
      assert.equal(result.json.outbox.enabled, true)
      assert.equal(result.json.outbox.available, true)
      assert.equal(result.json.canManageDebug, true)
      const adminControl = await request(`${adminPath}/api/pages/logs`, { action: 'enable' }, { cookie, 'x-tokri-monitoring': '1', 'sec-fetch-site': 'same-origin' })
      assert.equal(adminControl.response.status, 200)
      await page.goto(`${origin}${adminPath}/pages/logs`)
      const second = await browser.newPage()
      await second.goto(`${origin}${adminPath}/login`)
      await second.locator('input[name=email]').fill('review-admin')
      await second.locator('input[name=password]').fill('Isolated-review-password-123')
      await second.locator('button[type=submit]').click()
      await second.waitForURL(`${origin}${adminPath}`)
      await second.goto(`${origin}${adminPath}/pages/logs`)
      await second.getByRole('status').filter({ hasText: 'Enabled' }).waitFor()
      await page.getByRole('button', { name: 'Disable debug logging', exact: true }).click()
      await page.getByRole('button', { name: 'Enable debug logging', exact: true }).waitFor()
      await second.getByRole('status').filter({ hasText: 'Disabled' }).waitFor()
      await second.getByRole('button', { name: 'Enable debug logging', exact: true }).click()
      await page.getByRole('status').filter({ hasText: 'Enabled' }).waitFor()
      await second.getByRole('button', { name: 'Disable debug logging', exact: true }).click()
      await page.getByRole('status').filter({ hasText: 'Disabled' }).waitFor()
      await second.close()

      await prisma.user.update({ where: { id: user.id }, data: { role: 'super_admin' } })
      await page.goto(`${origin}${adminPath}/pages/logs`)
    })
    await check('storage failure preserves checkout, persists critical events and keeps debug controls available', async () => {
      await workerCall('flush')
      const toDelete = await prisma.product.create({ data: { slug: `storage-delete-${runId}`, name: 'Storage Delete', priceValue: 77 } })
      const logDir = process.env.LOG_DIRECTORY, backup = logDir + '.failure-test'
      await fs.rename(logDir, backup); await fs.writeFile(logDir, 'not a directory')
      const originalWrite = process.stderr.write, emergency = []
      process.stderr.write = function (chunk, ...args) { if (String(chunk).startsWith('{"event":"monitoring.delivery.failed"')) { emergency.push(JSON.parse(String(chunk))); const callback = args.find((arg) => typeof arg === 'function'); callback?.(); return true } return originalWrite.call(this, chunk, ...args) }
      try {
        const started = performance.now()
        const order = await checkout('create-order', { items: [{ slug: 'banana' }], addressId, paymentMode: 'cod' })
        assert.equal(order.response.status, 201, order.text)
        const online = await checkout('create-order', { items: [{ slug: 'banana' }], addressId, paymentMode: 'online' })
        assert.equal(online.response.status, 201, online.text)
        const onlineOrder = await prisma.order.findUnique({ where: { orderNo: online.json.order.orderNo } })
        const signature = crypto.createHmac('sha256', secret).update(`${onlineOrder.razorpayOrderId}|pay_storageoutage`).digest('hex')
        const paid = await checkout('verify-payment', { orderNo: onlineOrder.orderNo, razorpayOrderId: onlineOrder.razorpayOrderId, razorpayPaymentId: 'pay_storageoutage', razorpaySignature: signature })
        assert.equal(paid.json.paymentStatus, 'paid')
        assert.equal((await request('/api/v1/health')).response.status, 200)
        t.diagnostic(`Storage unavailable: COD + online order creation + payment confirmation + health completed in ${Math.round(performance.now() - started)} ms`)
        const deleted = await adminRequest(`resources/Product/records/${toDelete.id}/delete`, {})
        assert.equal(deleted.response.status, 200)
        assert.equal(await prisma.product.findUnique({ where: { id: toDelete.id } }), null)
        await workerCall('flush').catch(() => {})
        const pending = await prisma.monitoringOutbox.findMany({ where: { deliveredAt: null } })
        assert.ok(pending.some((entry) => entry.category === 'audit' && entry.payload.event === 'Product.delete' && entry.payload.old.priceValue === '77' && entry.payload.new === null))
        assert.ok(pending.some((entry) => entry.category === 'payment'))
        assert.ok(monitoringState().degraded)
        const logs = await adminRequest('pages/logs')
        assert.equal(logs.response.status, 200)
        assert.ok(logs.json.storageError)
        const control = await request(`${adminPath}/api/pages/logs`, { action: 'disable' }, { cookie, 'x-tokri-monitoring': '1', 'sec-fetch-site': 'same-origin' })
        assert.equal(control.response.status, 200)
      } finally { process.stderr.write = originalWrite; await fs.unlink(logDir); await fs.rename(backup, logDir) }
    })
    await prisma.monitoringOutbox.updateMany({ where: { deliveredAt: null }, data: { nextAttemptAt: new Date(0), leaseUntil: null } })
    await workerCall('flush')
    await check('all six daily categories exist and payment/customer/admin secrets never enter files', async () => {
      const result = await rows()
      for (const type of ['api', 'error', 'audit', 'debug', 'payment', 'account']) assert.ok(result.files.some((file) => file.category === type), type)
      let text = ''
      for (const file of result.files) text += await fs.readFile(path.join(process.env.LOG_DIRECTORY, file.name), 'utf8')
      const stored = await prisma.monitoringOutbox.findMany()
      text += JSON.stringify(stored.map((row) => row.payload))
      for (const value of [secret, customerToken, customerPhone, 'PRIVATE_PROVIDER_ERROR', 'PRIVATE_UNSAVED_VALUE', 'PRIVATE_CUSTOMER_NAME', 'PRIVATE_ADMIN_NAME', 'PRIVATE_ADMIN_PASSWORD', 'PRIVATE_EMAIL', 'PRIVATE_ADDRESS']) assert.ok(!text.includes(value), `no leakage of ${value.startsWith('PRIVATE') ? value : 'synthetic secret'}`)
      assert.equal(monitoringState().pending, 0)
      t.diagnostic(`Daily files: ${result.files.map((f) => f.name).join(', ')}`)
    })
  } finally {
    globalThis.fetch = nativeFetch; RazorpayAPI.prototype.post = originalPost
    if (browser) await browser.close()
    server.closeAllConnections()
    await new Promise((resolve) => server.close(resolve))
    await closeMonitoring(); await prisma.$disconnect()
  }
})
