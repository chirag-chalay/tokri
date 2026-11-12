import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createRequire } from 'node:module'
import { mkdir, writeFile } from 'node:fs/promises'
const url = new URL(process.env.DATABASE_URL || 'mysql://invalid')
assert.equal(url.hostname, '127.0.0.1')
assert.equal(url.port, '13318')
assert.equal(url.pathname, '/tokri_manual_coupons_test')
const { prisma } = await import('../src/lib/prisma.js')
const { calculateCheckoutPricing: pricing } = await import(
  '../src/services/pricing.js'
)
const { checkoutCouponOffers: offers, redeemCoupon } = await import(
  '../src/services/coupons.js'
)
const { defaultChargeRates } = await import('../src/config/charges.js')
const { quoteCheckoutDelivery: quote, deliveryDecision } = await import(
  '../src/services/deliveryQuote.js'
)
const {
  createCheckoutOrder: create,
  resolveCartItems,
  markOnlineOrderPaidFromWebhook,
  syncIntentPayment,
} = await import('../src/services/checkout.js')
const { getCart, replaceCart } = await import('../src/services/cart.js')
const { generateOrderInvoicePdf } = await import('../src/services/invoice.js')
const { prepareCouponPayload } = await import('../src/admin/coupon-handlers.js')
const { default: checkoutRouter } = await import('../src/routes/checkout.js')
const { default: express } = await import('express')
const axios = createRequire(import.meta.url)('axios').default
const bcrypt = createRequire(import.meta.url)('bcryptjs')
const item = (priceValue, extra = {}) => ({
  slug: 'manual-fruit',
  quantity: 1,
  priceValue,
  ...extra,
})
const rates = defaultChargeRates()
let server
const nativeFetch = globalThis.fetch
let mockedPayment = null
// Fail closed: payment helpers use both Axios and fetch. Only local API traffic
// may leave the harness; Razorpay fetch responses are supplied explicitly.
globalThis.fetch = async (input, options) => {
  const requestUrl = new URL(String(input))
  if (requestUrl.hostname === '127.0.0.1') return nativeFetch(input, options)
  if (requestUrl.hostname === 'api.razorpay.com' && mockedPayment)
    return new Response(JSON.stringify(mockedPayment), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  throw new Error(`Unexpected external request blocked: ${requestUrl.hostname}`)
}
await test('Customer-selected coupons: isolated MySQL + checkout API', async (t) => {
  try {
    assert.equal(
      Number((await prisma.$queryRaw`SELECT @@port AS port`)[0].port),
      13318,
    )
    await prisma.user.upsert({
      where: { email: 'admin@tokriii.com' },
      create: {
        email: 'admin@tokriii.com',
        username: 'couponadmin',
        name: 'Coupon Test Admin',
        password: await bcrypt.hash(
          process.env.TOKRIII_TEST_ADMIN_PASSWORD || 'local-coupon-preview',
          10,
        ),
        role: 'admin',
      },
      update: {},
    })
    for (const [pincode, morningEnabled, expressEnabled] of [
      ['122002', true, true],
      ['122017', true, false],
      ['110033', false, true],
    ])
      await prisma.serviceablePincode.upsert({
        where: { pincode },
        create: { pincode, morningEnabled, expressEnabled },
        update: { isActive: true, morningEnabled, expressEnabled },
      })
    await prisma.setting.upsert({
      where: { id: 1 },
      create: { id: 1 },
      update: {},
    })
    await prisma.setting.update({
      where: { id: 1 },
      data: {
        firstThreeMorningEnabled: false,
        morningShippingFee: 25,
        expressShippingFee: 99,
        expressMinimumOrderValue: 1251,
        handlingFee: 2,
        codEnabled: true,
        razorpayEnabled: false,
        msg91Enabled: false,
        msg91WhatsappEnabled: false,
      },
    })
    const customer = await prisma.customer.upsert({
      where: { phone: '9999900511' },
      create: { name: 'Coupon Test', phone: '9999900511' },
      update: {},
    })
    await prisma.order.deleteMany({ where: { customerId: customer.id } })
    await prisma.couponRedemption.deleteMany({
      where: { customerId: customer.id },
    })
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        addresses: [
          {
            id: 'coupon-address',
            name: 'Coupon Test',
            phone: customer.phone,
            line1: 'Test street',
            city: 'Delhi',
            state: 'Delhi',
            pincode: '110001',
          },
        ],
      },
    })
    await prisma.serviceablePincode.upsert({
      where: { pincode: '110001' },
      create: { pincode: '110001', morningEnabled: true, expressEnabled: true },
      update: { isActive: true, morningEnabled: true, expressEnabled: true },
    })
    for (const data of [
      { slug: 'manual-fruit', name: 'Test Fruit', priceValue: 1500 },
      {
        slug: 'manual-dry',
        name: 'Test Dry Fruit',
        priceValue: 500,
        isTaxable: true,
        gstRate: 5,
      },
    ])
      await prisma.product.upsert({
        where: { slug: data.slug },
        create: data,
        update: data,
      })
    for (const [value, minCart] of [
      [5, 700],
      [10, 1100],
      [15, 1500],
    ])
      await prisma.coupon.upsert({
        where: { code: `TOKRII${value}` },
        create: {
          code: `TOKRII${value}`,
          type: 'percent',
          value,
          minCart,
          showAtCheckout: true,
        },
        update: { value, minCart, isActive: true, showAtCheckout: true },
      })
    await prisma.coupon.upsert({
      where: { code: 'PRIVATE50' },
      create: { code: 'PRIVATE50', value: 50, type: 'flat' },
      update: {},
    })
    await prisma.automaticDiscount.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        enabled: true,
        tiers: [{ minimum: 1, percentage: 100, active: true }],
      },
      update: { enabled: true },
    })
    const app = express()
    app.use(express.json())
    app.use('/checkout', checkoutRouter)
    app.use((error, _req, res, _next) =>
      res
        .status(error.status || 500)
        .json({ message: error.message, code: error.code }),
    )
    server = app.listen(0, '127.0.0.1')
    await new Promise((resolve) => server.once('listening', resolve))
    const api = async (path, body) => {
      const res = await fetch(
        `http://127.0.0.1:${server.address().port}/checkout/${path}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-phone': customer.phone,
          },
          body: JSON.stringify(body),
        },
      )
      return { status: res.status, body: await res.json() }
    }
    const price = (amount, code, extra = {}) =>
      pricing([item(amount)], rates, {
        customerId: customer.id,
        couponCode: code,
        ...extra,
      })
    const input = {
      items: [{ slug: 'manual-fruit', quantity: 1 }],
      addressId: 'coupon-address',
      paymentMode: 'cod',
      deliveryOption: 'morning',
    }
    await t.test(
      'inclusive thresholds; all public offers visible; no automatic discounts even with retired config enabled',
      async () => {
        for (const [amount, expected] of [
          [699.99, []],
          [700, [5]],
          [1099.99, [5]],
          [1100, [5, 10]],
          [1499.99, [5, 10]],
          [1500, [5, 10, 15]],
          [2000, [5, 10, 15]],
        ]) {
          const rows = await offers([item(amount)], rates, {
            customerId: customer.id,
          })
          assert.equal(rows.length, 3)
          assert.deepEqual(
            rows.filter((x) => x.eligible).map((x) => x.percentage),
            expected,
          )
          assert.equal((await price(amount)).totals.discount, 0)
          assert.ok(rows.every((x) => !x.applied))
          console.log(
            `₹${amount}: ${expected.join(', ') || 'none'}; unselected discount ₹0`,
          )
        }
      },
    )
    await t.test(
      'each selected percentage; switching/remove/manual never stacks or upgrades; private codes hidden',
      async () => {
        for (const [code, expected] of [
          ['TOKRII5', 75],
          ['TOKRII10', 150],
          ['TOKRII15', 225],
          [undefined, 0],
          ['PRIVATE50', 50],
        ])
          assert.equal((await price(1500, code)).totals.discount, expected)
        const rows = await offers([item(1500)], rates, {
          selectedCode: 'TOKRII5',
        })
        assert.equal(rows.filter((x) => x.applied).length, 1)
        assert.ok(!rows.some((x) => x.code === 'PRIVATE50'))
      },
    )
    await t.test(
      'A/B below-minimum removal; no reapply; C valid coupon retained with recalculated savings',
      async () => {
        assert.equal((await price(1600, 'TOKRII15')).totals.discount, 240)
        const reduced = await price(1200, 'TOKRII15', {
          allowCouponRemoval: true,
        })
        assert.equal(reduced.totals.discount, 0)
        assert.equal(reduced.couponStatus.status, 'removed')
        assert.equal(
          reduced.couponStatus.message,
          'Your 15% coupon was removed because your cart is now below ₹1,500.',
        )
        assert.equal((await price(1600)).totals.discount, 0)
        assert.equal((await price(1300, 'TOKRII10')).totals.discount, 130)
        assert.equal((await price(1200, 'TOKRII10')).totals.discount, 120)
        await assert.rejects(price(1200, 'TOKRII15'), /₹1500/)
      },
    )
    await t.test(
      'quote ignores spoofed prices/discount; graceful empty cart; mobile cart zero discount',
      async () => {
        let q = await api('quote', {
          items: [{ slug: 'manual-fruit', quantity: 1, priceValue: 1 }],
          discount: 999999,
        })
        assert.equal(q.status, 200)
        assert.equal(q.body.totals.itemsTotal, 1500)
        assert.equal(q.body.totals.discount, 0)
        assert.equal(q.body.totals.automaticDiscount, null)
        q = await api('quote', { items: [], couponCode: 'TOKRII15' })
        assert.equal(q.status, 200)
        assert.equal(q.body.totals.grandTotal, 0)
        assert.equal(q.body.couponStatus.status, 'removed')
        await assert.rejects(
          resolveCartItems([{ slug: 'manual-fruit', quantity: 1.5 }]),
          /quantity/,
        )
        await replaceCart(customer.id, input.items)
        assert.equal((await getCart(customer.id)).discount, 0)
      },
    )
    await t.test(
      'disabled/expired/future/exhausted/admin-edited coupons; login restriction; manual preview',
      async () => {
        for (const patch of [
          { isActive: false },
          { expiresAt: new Date(0) },
          { startsAt: new Date('2099-01-01') },
          { usageLimit: 1, usedCount: 1 },
        ]) {
          await prisma.coupon.update({
            where: { code: 'TOKRII15' },
            data: patch,
          })
          const q = await price(1600, 'TOKRII15', { allowCouponRemoval: true })
          assert.equal(q.totals.discount, 0)
          assert.equal(q.couponStatus.status, 'removed')
          await prisma.coupon.update({
            where: { code: 'TOKRII15' },
            data: {
              isActive: true,
              expiresAt: null,
              startsAt: null,
              usageLimit: null,
              usedCount: 0,
            },
          })
        }
        await prisma.coupon.update({
          where: { code: 'TOKRII15' },
          data: { minCart: 1700, value: 12 },
        })
        assert.equal(
          (await price(1600, 'TOKRII15', { allowCouponRemoval: true })).totals
            .discount,
          0,
        )
        assert.equal((await price(2000, 'TOKRII15')).totals.discount, 240)
        await prisma.coupon.update({
          where: { code: 'TOKRII15' },
          data: { minCart: 1500, value: 15 },
        })
        await prisma.coupon.update({
          where: { code: 'PRIVATE50' },
          data: { usageType: 'single' },
        })
        await assert.rejects(
          pricing([item(1500)], rates, { couponCode: 'PRIVATE50' }),
          /log in/,
        )
        await prisma.coupon.update({
          where: { code: 'PRIVATE50' },
          data: { usageType: 'unlimited' },
        })
        assert.equal(
          (await api('preview-coupon', { ...input, code: 'PRIVATE50' })).body
            .totals.discount,
          50,
        )
      },
    )
    await t.test(
      'dry/mixed/targeted GST; pre-discount express minimum; first-three delivery preserved',
      async () => {
        assert.equal(
          (
            await pricing(
              [item(1500, { isTaxable: true, gstRate: 5 })],
              rates,
              { couponCode: 'TOKRII15' },
            )
          ).totals.taxTotal,
          60.71,
        )
        const mixed = await pricing(
          [
            item(1000),
            item(500, { slug: 'manual-dry', isTaxable: true, gstRate: 5 }),
          ],
          rates,
          { couponCode: 'TOKRII15' },
        )
        assert.deepEqual(
          mixed.totals.lineItems.map((x) => x.discount),
          [150, 75],
        )
        assert.equal(mixed.totals.taxTotal, 20.24)
        await prisma.coupon.update({
          where: { code: 'PRIVATE50' },
          data: { targetType: 'products', targetSlugs: ['manual-dry'] },
        })
        const targeted = await pricing(
          [
            item(1000),
            item(500, { slug: 'manual-dry', isTaxable: true, gstRate: 5 }),
          ],
          rates,
          { couponCode: 'PRIVATE50' },
        )
        assert.deepEqual(
          targeted.totals.lineItems.map((x) => x.discount),
          [0, 50],
        )
        assert.equal(targeted.totals.taxTotal, 21.43)
        await prisma.coupon.update({
          where: { code: 'PRIVATE50' },
          data: { targetType: 'all', targetSlugs: [] },
        })
        const q = await quote([item(1500)], customer.id, 'express', {
          couponCode: 'TOKRII15',
        })
        assert.equal(q.totals.discount, 225)
        assert.equal(q.totals.deliveryCharge, 99)
        assert.equal(q.options.express.minimumMet, true)
        assert.equal(
          deliveryDecision(
            { expressMinimumOrderValue: 1251 },
            null,
            'express',
            1250.99,
          ).minimumMet,
          false,
        )
        await prisma.setting.update({
          where: { id: 1 },
          data: { firstThreeMorningEnabled: true },
        })
        assert.equal(
          (
            await quote([item(1500)], customer.id, 'morning', {
              couponCode: 'TOKRII15',
            })
          ).totals.deliveryCharge,
          0,
        )
        await prisma.setting.update({
          where: { id: 1 },
          data: { firstThreeMorningEnabled: false },
        })
      },
    )
    await t.test(
      'quote/COD/Razorpay/saved order/invoice totals; changed-total guard; historical snapshots',
      async () => {
        const raw = [
            { slug: 'manual-fruit', quantity: 1 },
            { slug: 'manual-dry', quantity: 1 },
          ],
          q = await api('quote', {
            items: raw,
            couponCode: 'TOKRII15',
            addressId: input.addressId,
          })
        const cod = await create(customer, {
            ...input,
            items: raw,
            couponCode: 'TOKRII15',
            expectedGrandTotal: q.body.totals.grandTotal,
          }),
          saved = await prisma.order.findUnique({
            where: { id: cod.order.id },
            include: { items: true },
          })
        for (const key of [
          'grandTotal',
          'discount',
          'itemsTotal',
          'taxTotal',
          'cgstTotal',
          'sgstTotal',
        ])
          assert.equal(Number(saved[key]), q.body.totals[key], key)
        assert.equal(saved.automaticDiscount, null)
        assert.equal(saved.couponCode, 'TOKRII15')
        assert.equal(
          saved.items.reduce((a, x) => a + Number(x.discount), 0),
          300,
        )
        await assert.rejects(
          create(customer, {
            ...input,
            couponCode: 'TOKRII15',
            expectedGrandTotal: 1,
          }),
          (e) => e.code === 'QUOTE_CHANGED',
        )
        const adapter = axios.defaults.adapter
        let amount
        axios.defaults.adapter = async (request) => {
          amount = JSON.parse(request.data).amount
          return {
            data: { id: 'order_manual_test', amount },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: request,
          }
        }
        try {
          await prisma.setting.update({
            where: { id: 1 },
            data: {
              razorpayEnabled: true,
              razorpayKeyId: 'rzp_test_isolated',
              razorpayKeySecret: 'isolated',
            },
          })
          const online = await create(customer, {
            ...input,
            items: raw,
            couponCode: 'TOKRII15',
            paymentMode: 'online',
          })
          assert.equal(online.order.grandTotal, cod.order.grandTotal)
          const redemptionBefore = await prisma.couponRedemption.count({
            where: { orderId: online.order.id },
          })
          // A failed attempt leaves this order retryable without a second reservation.
          mockedPayment = {
            id: 'pay_failed_test',
            order_id: 'order_manual_test',
            amount,
            status: 'failed',
          }
          const failed = await syncIntentPayment(customer, {
            orderNo: online.order.orderNo,
            razorpayOrderId: 'order_manual_test',
            razorpayPaymentId: 'pay_failed_test',
          })
          assert.equal(failed.status, 'failed')
          await markOnlineOrderPaidFromWebhook({
            orderNo: online.order.orderNo,
            paymentId: 'pay_retry_success',
          })
          await markOnlineOrderPaidFromWebhook({
            orderNo: online.order.orderNo,
            paymentId: 'pay_retry_success',
          })
          assert.equal(
            await prisma.couponRedemption.count({
              where: { orderId: online.order.id },
            }),
            redemptionBefore,
          )

          assert.equal(amount, Math.round(Number(saved.grandTotal) * 100))
        } finally {
          axios.defaults.adapter = adapter
          await prisma.setting.update({
            where: { id: 1 },
            data: {
              razorpayEnabled: false,
              razorpayKeyId: null,
              razorpayKeySecret: null,
            },
          })
        }
        const invoice = await generateOrderInvoicePdf(saved.id)
        assert.equal(Number(invoice.order.grandTotal), Number(saved.grandTotal))
        await mkdir('../docs/manual-coupons', { recursive: true })
        await writeFile(
          '../docs/manual-coupons/test-invoice.pdf',
          invoice.buffer,
        )
        await prisma.order.update({
          where: { id: saved.id },
          data: { automaticDiscount: { percentage: 15, discount: 300 } },
        })
        const before = await prisma.order.findUnique({
          where: { id: saved.id },
          include: { items: true },
        })
        await prisma.coupon.update({
          where: { code: 'TOKRII15' },
          data: { value: 13 },
        })
        await price(2000)
        assert.deepEqual(
          await prisma.order.findUnique({
            where: { id: saved.id },
            include: { items: true },
          }),
          before,
        )
        assert.equal(
          (await generateOrderInvoicePdf(saved.id)).order.automaticDiscount
            .percentage,
          15,
        )
        await prisma.coupon.update({
          where: { code: 'TOKRII15' },
          data: { value: 15 },
        })
      },
    )
    await t.test(
      'concurrent global/single-use limit; atomic reservation; retries do not redeem twice',
      async () => {
        const coupon = await prisma.coupon.create({
            data: {
              code: `CAP${Date.now()}`,
              type: 'percent',
              value: 10,
              minCart: 700,
              usageLimit: 1,
              usageType: 'single',
            },
          }),
          results = await Promise.allSettled([
            create(customer, { ...input, couponCode: coupon.code }),
            create(customer, { ...input, couponCode: coupon.code }),
          ])
        assert.equal(results.filter((x) => x.status === 'fulfilled').length, 1)
        const order = results.find((x) => x.status === 'fulfilled').value.order
        assert.equal(
          await prisma.couponRedemption.count({
            where: { couponId: coupon.id },
          }),
          1,
        )
        await redeemCoupon({
          coupon,
          customerId: customer.id,
          orderId: order.id,
        })
        assert.equal(
          (await prisma.coupon.findUnique({ where: { id: coupon.id } }))
            .usedCount,
          1,
        )
        assert.equal(
          await prisma.order.count({ where: { couponCode: coupon.code } }),
          1,
        )
      },
    )
    await t.test(
      'shipping coupons, category restrictions and strict final-order invalidation',
      async () => {
        const shipping = await prisma.coupon.create({
          data: {
            code: `SHIP${Date.now()}`,
            type: 'flat',
            value: 20,
            applyOn: 'shipping',
          },
        })
        const priced = await price(1500, shipping.code)
        assert.equal(priced.totals.discount, 20)
        assert.equal(priced.totals.deliveryCharge, 25)
        assert.equal(priced.totals.shippingDiscount, 20)
        assert.equal(priced.totals.grandTotal, 1507)
        assert.ok(priced.totals.lineItems.every((line) => line.discount === 0))
        const category = await prisma.coupon.create({
          data: {
            code: `CATEGORY${Date.now()}`,
            type: 'percent',
            value: 10,
            targetType: 'categories',
            targetSlugs: ['dry-fruits'],
          },
        })
        const targeted = await pricing(
          [
            item(1000),
            item(500, {
              categories: [{ slug: 'dry-fruits' }],
              isTaxable: true,
              gstRate: 5,
            }),
          ],
          rates,
          { couponCode: category.code },
        )
        assert.deepEqual(
          targeted.totals.lineItems.map((line) => line.discount),
          [0, 50],
        )
        assert.equal(targeted.totals.taxTotal, 21.43)
        const count = await prisma.order.count()
        await assert.rejects(
          create(customer, {
            ...input,
            items: [{ slug: 'manual-dry', quantity: 2 }],
            couponCode: 'TOKRII15',
          }),
          /₹1500/,
        )
        assert.equal(await prisma.order.count(), count)
      },
    )
    await t.test(
      'admin validation and private-by-default visibility',
      async () => {
        const base = { code: 'test', type: 'percent', value: 5 }
        assert.equal(
          (await prepareCouponPayload({ method: 'post', payload: { ...base } }))
            .payload.showAtCheckout,
          false,
        )
        assert.equal(
          (
            await prepareCouponPayload({
              method: 'post',
              payload: { ...base, showAtCheckout: true },
            })
          ).payload.showAtCheckout,
          true,
        )
        for (const patch of [
          { value: 101 },
          { minCart: -1 },
          { usageLimit: 1.5 },
          { startsAt: 'bad' },
          { expiresAt: '2020-01-01', startsAt: '2021-01-01' },
        ])
          await assert.rejects(
            prepareCouponPayload({
              method: 'post',
              payload: { ...base, ...patch },
            }),
          )
      },
    )
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve))
    await prisma.automaticDiscount.update({
      where: { id: 1 },
      data: { enabled: false },
    })
    globalThis.fetch = nativeFetch
    await prisma.$disconnect()
  }
})
