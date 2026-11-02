import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { test } from 'node:test'
import { writeFile, mkdir } from 'node:fs/promises'

// This suite writes fixtures. Never import database modules until the isolated URL is checked.
const url = new URL(process.env.DATABASE_URL || 'mysql://invalid')
assert.equal(url.hostname, '127.0.0.1')
assert.equal(url.port, '13317')
assert.equal(url.pathname, '/tokri_discounts_test')
const { prisma } = await import('../src/lib/prisma.js')
const { validateDiscountConfig } = await import('../src/services/automaticDiscounts.js')
const { calculateCheckoutPricing } = await import('../src/services/pricing.js')
const { calcCartTotals, defaultChargeRates } = await import('../src/config/charges.js')
const { quoteCheckoutDelivery, deliveryDecision } = await import('../src/services/deliveryQuote.js')
const { getCart, replaceCart, clearCart } = await import('../src/services/cart.js')
const { createCheckoutOrder, resolveCartItems } = await import('../src/services/checkout.js')
const { generateOrderInvoicePdf } = await import('../src/services/invoice.js')
const { automaticDiscountHandler } = await import('../src/admin/automatic-discounts.js')
const { formatCustomerOrder } = await import('../src/services/customerOrders.js')
const { default: checkoutRouter } = await import('../src/routes/checkout.js')
const { default: express } = await import('express')
const axios = createRequire(import.meta.url)('axios').default
const tiers = [
  { id: 'tier-1', minimum: 700, percentage: 5, active: true },
  { id: 'tier-2', minimum: 1100, percentage: 10, active: true },
  { id: 'tier-3', minimum: 1500, percentage: 15, active: true },
]
const config = { enabled: true, tiers }
const item = (priceValue, extra = {}) => ({ priceValue, quantity: 1, slug: 'discount-fruit', ...extra })
const rates = defaultChargeRates()
const admin = { currentAdmin: { role: 'admin' } }
const postConfig = async (payload) => automaticDiscountHandler({ method: 'post', payload }, null, admin)
const settings = { firstThreeMorningEnabled: false, morningShippingFee: 25, expressShippingFee: 99, expressMinimumOrderValue: 1251, handlingFee: 2, codEnabled: true, razorpayEnabled: false }
let customer, fruit, dry, server
const app = express(); app.use(express.json()); app.use('/checkout', checkoutRouter)
app.use((error, _req, res, _next) => res.status(error.status || 500).json({ message: error.message, code: error.code }))
const cart = [{ id: 'discount-fruit', quantity: 1 }]
const orderInput = { items: cart, addressId: 'discount-address', paymentMode: 'cod', deliveryOption: 'morning' }

await test('Automatic discounts: isolated MySQL integration and API contract', async (t) => {
  try {
    const initial = await prisma.automaticDiscount.findUnique({ where: { id: 1 } })
    assert.ok(initial)
    assert.equal(initial.enabled, false)
    await prisma.setting.upsert({ where: { id: 1 }, create: { id: 1, ...settings }, update: settings })
    await prisma.automaticDiscount.update({ where: { id: 1 }, data: config })
    customer = await prisma.customer.upsert({ where: { phone: '9999900411' }, create: { name: 'Discount Test', phone: '9999900411' }, update: {} })
    await prisma.order.deleteMany({ where: { customerId: customer.id } })
    await clearCart(customer.id)
    await prisma.customer.update({ where: { id: customer.id }, data: { addresses: [{ id: 'discount-address', name: 'Discount Test', phone: customer.phone, line1: 'Test street', line2: 'Test area', city: 'Delhi', state: 'Delhi', pincode: '110001' }] } })
    for (const pincode of ['110001', '122002', '400020']) await prisma.serviceablePincode.upsert({ where: { pincode }, create: { pincode, morningEnabled: true, expressEnabled: true }, update: { isActive: true, morningEnabled: true, expressEnabled: true } })
    for (const data of [{ slug: 'discount-fruit', name: 'Discount Test Fruit', priceValue: 1500 }, { slug: 'discount-dry', name: 'Discount Test Dry Fruit', priceValue: 500, isTaxable: true, gstRate: 5 }]) {
      await prisma.product.upsert({ where: { slug: data.slug }, create: data, update: data })
    }
    fruit = await prisma.product.findUnique({ where: { slug: 'discount-fruit' } })
    dry = await prisma.product.findUnique({ where: { slug: 'discount-dry' } })
    for (const data of [
      { code: 'DISC_SMALL', type: 'flat', value: 100 },
      { code: 'DISC_LARGE', type: 'flat', value: 300 },
      { code: 'DISC_SHIP', type: 'flat', value: 20, applyOn: 'shipping' },
      { code: 'DISC_TARGET', type: 'percent', value: 50, targetType: 'products', targetSlugs: ['discount-dry'] },
      { code: 'DISC_SINGLE', type: 'flat', value: 300, usageType: 'single', usageLimit: 1 },
    ]) await prisma.coupon.upsert({ where: { code: data.code }, create: data, update: { ...data, usedCount: 0 } })
    const single = await prisma.coupon.findUnique({ where: { code: 'DISC_SINGLE' } })
    await prisma.couponRedemption.deleteMany({ where: { couponId: single.id } })
    server = app.listen(0, '127.0.0.1'); await new Promise((resolve) => server.once('listening', resolve))
    const endpoint = `http://127.0.0.1:${server.address().port}/checkout`
    const api = async (path, body, auth = false) => {
      const response = await fetch(`${endpoint}/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(auth ? { 'x-user-phone': customer.phone } : {}) }, body: JSON.stringify(body) })
      return { status: response.status, body: await response.json() }
    }
    await t.test('required thresholds and decimal boundaries', async () => {
      for (const [amount, expected] of [[699, 0], [700, 35], [1099, 54.95], [1100, 110], [1499, 149.90], [1500, 225], [2000, 300], [699.99, 0], [700.01, 35], [1099.99, 55], [1100.01, 110], [1499.99, 150], [1500.01, 225]]) {
        const { totals } = await calculateCheckoutPricing([item(amount)], rates, { config })
        assert.equal(totals.discount, expected, `₹${amount}`)
        console.log(`₹${amount} → ₹${totals.discount.toFixed(2)}`)
      }
    })
    await t.test('empty carts, quantity changes and removal', async () => {
      assert.equal((await api('quote', { items: [] })).body.totals.grandTotal, 0)
      const one = await calculateCheckoutPricing([item(500)], rates, { config })
      const three = await calculateCheckoutPricing([item(500, { quantity: 3 })], rates, { config })
      assert.equal(one.totals.discount, 0); assert.equal(three.totals.discount, 225)
      assert.equal((await calculateCheckoutPricing([], rates, { config })).totals.discount, 0)
      await assert.rejects(createCheckoutOrder(customer, { ...orderInput, items: [] }), /empty/)
      await assert.rejects(resolveCartItems([{ id: fruit.slug, quantity: 1.5 }]), /quantity/)
      const absent = await api('quote', { items: [{ id: 'missing-product', quantity: 1 }] })
      assert.equal(absent.status, 400)
    })
    await t.test('authoritative prices, ignores client discount, additive mobile contract', async () => {
      const result = await api('quote', { items: [{ id: fruit.slug, quantity: 1, priceValue: 1 }], discount: 999999 })
      assert.equal(result.status, 200); assert.equal(result.body.totals.itemsTotal, 1500)
      assert.equal(result.body.totals.discount, 225); assert.equal(result.body.totals.grandTotal, 1302)
      assert.ok(result.body.options.morning); assert.ok(result.body.options.express)
    })
    await t.test('highest tier only, disabled promotion, disabled individual tier, editable thresholds', async () => {
      assert.equal((await calculateCheckoutPricing([item(2000)], rates, { config })).totals.discount, 300)
      await prisma.automaticDiscount.update({ where: { id: 1 }, data: { enabled: false } })
      assert.equal((await api('quote', { items: cart })).body.totals.discount, 0)
      await prisma.automaticDiscount.update({ where: { id: 1 }, data: { enabled: true, tiers: tiers.map((row, i) => ({ ...row, active: i !== 2 })) } })
      assert.equal((await api('quote', { items: cart })).body.totals.discount, 150)
      await prisma.automaticDiscount.update({ where: { id: 1 }, data: { tiers: [{ id: 'custom', minimum: 1400, percentage: 12.34, active: true }] } })
      assert.equal((await api('quote', { items: cart })).body.totals.discount, 185.10)
      await prisma.automaticDiscount.update({ where: { id: 1 }, data: config })
    })
    await t.test('delivery type, pre-discount minimum, first-three delivery benefit and disabled benefit', async () => {
      const quote = await quoteCheckoutDelivery([item(1500)], customer.id, 'express')
      assert.equal(quote.totals.discount, 225); assert.equal(quote.totals.deliveryCharge, 99)
      assert.equal(quote.options.express.minimumMet, true)
      assert.equal(deliveryDecision(settings, null, 'express', 1250.99).minimumMet, false)
      assert.equal(deliveryDecision(settings, null, 'express', 1251).minimumMet, true)
      await prisma.setting.update({ where: { id: 1 }, data: { firstThreeMorningEnabled: true } })
      assert.equal((await quoteCheckoutDelivery([item(1500)], customer.id, 'morning')).totals.deliveryCharge, 0)
      assert.equal((await quoteCheckoutDelivery([item(1500)], customer.id, 'express')).totals.deliveryCharge, 99)
      await prisma.setting.update({ where: { id: 1 }, data: { firstThreeMorningEnabled: false } })
      assert.equal((await quoteCheckoutDelivery([item(1500)], customer.id, 'morning')).totals.deliveryCharge, 25)
    })
    await t.test('larger merchandise benefit only; shipping compatible; apply/remove coupon', async () => {
      for (const [code, discount, automatic] of [['DISC_SMALL', 225, true], ['DISC_LARGE', 300, false], ['DISC_SHIP', 245, true]]) {
        const result = await api('quote', { items: cart, couponCode: code }, true)
        assert.equal(result.status, 200); assert.equal(result.body.totals.discount, discount)
        assert.equal(Boolean(result.body.totals.automaticDiscount), automatic)
        const preview = await api('preview-coupon', { items: cart, code }, true)
        assert.equal(preview.body.totals.grandTotal, result.body.totals.grandTotal)
        assert.ok(preview.body.coupon.message)
      }
      assert.equal((await api('quote', { items: cart }, true)).body.totals.discount, 225)
    })
    await t.test('dry-fruit GST, mixed GST allocation and exact paise reconciliation', async () => {
      const taxable = await calculateCheckoutPricing([item(1500, { isTaxable: true, gstRate: 5 })], rates, { config })
      assert.equal(taxable.totals.taxTotal, 63.75); assert.equal(taxable.totals.grandTotal, 1365.75)
      const mixed = await calculateCheckoutPricing([item(1000), item(500, { slug: dry.slug, isTaxable: true, gstRate: 5 })], rates, { config })
      assert.deepEqual(mixed.totals.lineItems.map((line) => line.discount), [150, 75])
      assert.equal(mixed.totals.taxTotal, 21.25); assert.equal(mixed.totals.grandTotal, 1323.25)
      const target = await calculateCheckoutPricing([item(1000), item(500, { slug: dry.slug, isTaxable: true, gstRate: 5 })], rates, { config, couponCode: 'DISC_TARGET' })
      assert.deepEqual(target.totals.lineItems.map((line) => line.discount), [0, 250])
      assert.equal(target.totals.taxTotal, 12.5)
      const fractional = calcCartTotals([item('333.33', { isTaxable: true, gstRate: 5 }), item('333.33'), item('333.34')], rates, '54.95')
      assert.equal(fractional.lineItems.reduce((sum, row) => sum + Math.round(row.discount * 100), 0), 5495)
      assert.equal(Math.round((fractional.cgstTotal + fractional.sgstTotal) * 100), Math.round(fractional.taxTotal * 100))
    })
    await t.test('admin validates duplicates, ranges, decimals; permissions, preview, save and stale save', async () => {
      for (const invalid of [
        { ...config, tiers: [...tiers, { ...tiers[0], id: 'duplicate' }] },
        { ...config, tiers: [{ ...tiers[0], percentage: 101 }] },
        { ...config, tiers: [{ ...tiers[0], minimum: -1 }] },
        { ...config, tiers: [{ ...tiers[0], minimum: '700.001' }] },
        { ...config, tiers: [{ ...tiers[0], percentage: 0 }] },
        { ...config, tiers: [{ ...tiers[0], minimum: '' }] },
      ]) assert.throws(() => validateDiscountConfig(invalid))
      await assert.rejects(automaticDiscountHandler({ method: 'post', payload: config }, null, { currentAdmin: { role: 'staff' } }), /Forbidden/)
      const before = await prisma.automaticDiscount.findUnique({ where: { id: 1 } })
      const preview = await postConfig({ ...config, intent: 'preview', amount: 1500 })
      assert.equal(preview.preview.discount, 225)
      assert.equal((await prisma.automaticDiscount.findUnique({ where: { id: 1 } })).updatedAt.toISOString(), before.updatedAt.toISOString())
      const changed = await postConfig({ enabled: false, tiers: JSON.stringify(tiers), updatedAt: before.updatedAt.toISOString() })
      assert.equal(changed.config.enabled, false)
      const stale = await postConfig({ ...config, updatedAt: before.updatedAt.toISOString() })
      assert.equal(stale.notice.type, 'error')
      await prisma.automaticDiscount.update({ where: { id: 1 }, data: config })
    })
    await t.test('quote equals persisted COD and Razorpay amounts, invoices use snapshots; edits do not change old orders', async () => {
      const raw = [{ id: fruit.slug, quantity: 1 }, { id: dry.slug, quantity: 1 }]
      const q = await api('quote', { items: raw, addressId: orderInput.addressId }, true)
      const cod = await createCheckoutOrder(customer, { ...orderInput, items: raw, expectedGrandTotal: q.body.totals.grandTotal })
      const saved = await prisma.order.findUnique({ where: { id: cod.order.id }, include: { items: true } })
      for (const key of ['grandTotal', 'discount', 'itemsTotal', 'taxTotal', 'cgstTotal', 'sgstTotal']) assert.equal(Number(saved[key]), q.body.totals[key], key)
      assert.deepEqual(saved.automaticDiscount, q.body.totals.automaticDiscount)
      assert.equal(saved.items.reduce((sum, row) => sum + Number(row.discount), 0), q.body.totals.discount)
      await assert.rejects(createCheckoutOrder(customer, { ...orderInput, expectedGrandTotal: 1 }), (error) => error.code === 'QUOTE_CHANGED')
      // Replace the real SDK's HTTP transport only: execute real Razorpay amount conversion and order creation code.
      const originalAdapter = axios.defaults.adapter
      let captured
      axios.defaults.adapter = async (request) => {
        assert.equal(request.baseURL, 'https://api.razorpay.com')
        assert.equal(request.url, '/v1/orders')
        captured = JSON.parse(request.data)
        return { data: { id: 'order_isolated_test', amount: captured.amount }, status: 200, statusText: 'OK', headers: {}, config: request }
      }
      try {
        await prisma.setting.update({ where: { id: 1 }, data: { razorpayEnabled: true, razorpayKeyId: 'rzp_test_isolated', razorpayKeySecret: 'isolated-test' } })
        const online = await createCheckoutOrder(customer, { ...orderInput, items: raw, paymentMode: 'online' })
        assert.equal(online.order.grandTotal, cod.order.grandTotal)
        assert.equal(online.razorpay.amount, Math.round(cod.order.grandTotal * 100))
        assert.equal(captured.amount, online.razorpay.amount)
      } finally {
        axios.defaults.adapter = originalAdapter
        await prisma.setting.update({ where: { id: 1 }, data: { razorpayEnabled: false, razorpayKeyId: null, razorpayKeySecret: null } })
      }
      await prisma.automaticDiscount.update({ where: { id: 1 }, data: { enabled: false, tiers: [{ id: 'future', minimum: 1, percentage: 1, active: true }] } })
      const invoice = await generateOrderInvoicePdf(saved.id)
      assert.equal(Number(invoice.order.grandTotal), cod.order.grandTotal)
      assert.equal(invoice.order.automaticDiscount.percentage, 15)
      assert.equal(formatCustomerOrder(invoice.order).automaticDiscount.percentage, 15)
      await mkdir('../docs/automatic-discounts', { recursive: true })
      await writeFile('../docs/automatic-discounts/test-invoice.pdf', invoice.buffer)
      await prisma.automaticDiscount.update({ where: { id: 1 }, data: config })
      const legacy = await prisma.order.findUnique({ where: { id: 'legacy-order' } })
      if (legacy) { assert.equal(Number(legacy.grandTotal), 1527); assert.equal(legacy.automaticDiscount, null) }
    })
    await t.test('mobile account cart returns the shared automatic pricing fields', async () => {
      await replaceCart(customer.id, [{ slug: fruit.slug, quantity: 1 }])
      const mobileCart = await getCart(customer.id)
      const quote = await quoteCheckoutDelivery([item(1500)], customer.id, 'morning')
      assert.equal(mobileCart.discount, 225)
      assert.equal(mobileCart.grandTotal, quote.totals.grandTotal)
      assert.equal(mobileCart.automaticDiscount.percentage, 15)
    })
    await t.test('inter-state saved address agrees with quote; coupon limits and non-selected coupon not redeemed', async () => {
      const address = { id: 'inter', name: 'Interstate', phone: customer.phone, line1: 'Test', city: 'Mumbai', state: 'Maharashtra', pincode: '400020' }
      await prisma.customer.update({ where: { id: customer.id }, data: { addresses: [address] } })
      const raw = [{ id: dry.slug, quantity: 3 }]
      const quote = await api('quote', { items: raw, addressId: address.id }, true)
      assert.equal(quote.body.totals.igstTotal, 63.75); assert.equal(quote.body.totals.cgstTotal, 0)
      const order = await createCheckoutOrder(customer, { ...orderInput, addressId: address.id, items: raw, couponCode: 'DISC_SMALL' })
      assert.equal(order.order.grandTotal, quote.body.totals.grandTotal)
      assert.equal((await prisma.order.findUnique({ where: { id: order.order.id } })).couponCode, null)
      assert.equal(await prisma.couponRedemption.count({ where: { orderId: order.order.id } }), 0)
      await createCheckoutOrder(customer, { ...orderInput, addressId: address.id, couponCode: 'DISC_SINGLE' })
      await assert.rejects(createCheckoutOrder(customer, { ...orderInput, addressId: address.id, couponCode: 'DISC_SINGLE' }), /usage limit/)
      await prisma.customer.update({ where: { id: customer.id }, data: { addresses: [{ ...address, id: 'discount-address', city: 'Delhi', state: 'Delhi', pincode: '110001' }] } })
    })
  } finally {
    // The promotion always ends OFF even if a test fails.
    await prisma.automaticDiscount.update({ where: { id: 1 }, data: { enabled: false, tiers } })
    if (server) await new Promise((resolve) => server.close(resolve))
    await prisma.$disconnect()
  }
})
