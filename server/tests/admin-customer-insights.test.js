import assert from 'node:assert/strict'
import { test } from 'node:test'

const url = new URL(process.env.DATABASE_URL || 'mysql://invalid')
assert.equal(url.hostname, '127.0.0.1')
assert.equal(url.port, '13319')
assert.equal(url.pathname, '/tokri_admin_insights_test')

const nativeFetch = globalThis.fetch
globalThis.fetch = async (input, options) => {
  const requestUrl = new URL(String(input))
  if (requestUrl.hostname === '127.0.0.1') return nativeFetch(input, options)
  throw new Error(`Unexpected external request blocked: ${requestUrl.hostname}`)
}

const { prisma } = await import('../src/lib/prisma.js')
const {
  addCartItem,
  getCart,
  getCartCheckoutItems,
  getCartReadOnly,
  removeCartItem,
  replaceCart,
  updateCartItem,
} = await import('../src/services/cart.js')
const {
  confirmCodOrder,
  createCheckoutOrder,
} = await import('../src/services/checkout.js')
const {
  customerListExtras,
  getCustomerOrderHistory,
} = await import('../src/admin/customer-insights.js')

function paise(value) {
  return Math.round(Number(value || 0) * 100)
}

await test('Admin Customer Insights: order history & current cart', async (t) => {
  assert.equal(Number((await prisma.$queryRaw`SELECT @@port AS port`)[0].port), 13319)

  const prefix = 'insights_test_'
  await prisma.serviceablePincode.upsert({
    where: { pincode: '110001' },
    create: { pincode: '110001', isActive: true, morningEnabled: true, expressEnabled: true },
    update: { isActive: true, morningEnabled: true, expressEnabled: true },
  })

  await prisma.setting.upsert({
    where: { id: 1 },
    create: {
      id: 1,
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
    update: {
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

  const productApple = await prisma.product.upsert({
    where: { slug: `${prefix}apple` },
    create: {
      slug: `${prefix}apple`,
      name: 'Insights Apple',
      weight: '500g',
      priceValue: 150,
      isActive: true,
    },
    update: {
      name: 'Insights Apple',
      weight: '500g',
      priceValue: 150,
      isActive: true,
    },
  })
  const productMango = await prisma.product.upsert({
    where: { slug: `${prefix}mango` },
    create: {
      slug: `${prefix}mango`,
      name: 'Insights Mango',
      weight: '1kg',
      priceValue: 400,
      isActive: true,
    },
    update: {
      name: 'Insights Mango',
      weight: '1kg',
      priceValue: 400,
      isActive: true,
    },
  })
  await prisma.product.upsert({
    where: { slug: `${prefix}inactive` },
    create: {
      slug: `${prefix}inactive`,
      name: 'Hidden Berry',
      weight: '250g',
      priceValue: 999,
      isActive: false,
    },
    update: {
      name: 'Hidden Berry',
      weight: '250g',
      priceValue: 999,
      isActive: false,
    },
  })

  const phones = ['9000000101', '9000000102', '9000000103']
  await prisma.customer.deleteMany({ where: { phone: { in: phones } } })

  const addressA = {
    id: 'addr-alpha',
    name: 'Customer Alpha',
    phone: phones[0],
    email: 'alpha@example.test',
    line1: '101 Fruit Lane',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110001',
  }
  const addressC = {
    id: 'addr-gamma',
    name: 'Customer Gamma',
    phone: phones[2],
    line1: '202 Orchard Road',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110001',
  }

  const customerA = await prisma.customer.create({
    data: { name: 'Customer Alpha', phone: phones[0], addresses: [addressA] },
  })
  const customerB = await prisma.customer.create({
    data: { name: 'Customer Beta', phone: phones[1] },
  })
  const customerC = await prisma.customer.create({
    data: { name: 'Customer Gamma', phone: phones[2], addresses: [addressC] },
  })

  // Create 12 orders for Customer A across mixed statuses, dates, and totals
  const createdOrdersA = []
  for (let i = 0; i < 12; i += 1) {
    const qty = i === 11 ? 3 : i === 0 ? 2 : 1
    const res = await createCheckoutOrder(customerA, {
      items: [{ slug: productApple.slug, quantity: qty }],
      addressId: addressA.id,
      paymentMode: 'cod',
      deliveryOption: 'morning',
    })
    createdOrdersA.push(res.order)
  }

  const orderSpecs = [
    { status: 'delivered', paymentStatus: 'paid', createdAt: '2026-10-01T10:00:00+05:30' },
    { status: 'delivered', paymentStatus: 'paid', createdAt: '2026-10-05T10:00:00+05:30' },
    { status: 'cancelled', paymentStatus: 'pending', createdAt: '2026-10-10T10:00:00+05:30' },
    { status: 'delivered', paymentStatus: 'refunded', createdAt: '2026-10-12T10:00:00+05:30' },
    { status: 'pending', paymentStatus: 'pending', createdAt: '2026-10-14T10:00:00+05:30' },
    { status: 'paid', paymentStatus: 'paid', createdAt: '2026-10-15T10:00:00+05:30' },
    { status: 'packed', paymentStatus: 'paid', createdAt: '2026-10-16T10:00:00+05:30' },
    { status: 'shipped', paymentStatus: 'paid', createdAt: '2026-10-17T10:00:00+05:30' },
    { status: 'pending', paymentStatus: 'pending', createdAt: '2026-10-18T10:00:00+05:30' },
    { status: 'pending', paymentStatus: 'pending', createdAt: '2026-10-19T10:00:00+05:30' },
    { status: 'delivered', paymentStatus: 'paid', createdAt: '2026-10-20T10:00:00+05:30' },
    { status: 'pending', paymentStatus: 'pending', createdAt: '2026-10-22T10:00:00+05:30' },
  ]

  for (let i = 0; i < createdOrdersA.length; i += 1) {
    await prisma.order.update({
      where: { id: createdOrdersA[i].id },
      data: {
        status: orderSpecs[i].status,
        paymentStatus: orderSpecs[i].paymentStatus,
        createdAt: new Date(orderSpecs[i].createdAt),
      },
    })
  }

  await t.test('1. Customer with multiple orders: summary, pagination, filters, sorting, items', async () => {
    const dbOrders = await prisma.order.findMany({
      where: { customerId: customerA.id },
      orderBy: { createdAt: 'desc' },
    })

    let expectedOrderValue = 0
    let expectedCompleted = 0
    let expectedCompletedCount = 0
    let expectedExcluded = 0
    let expectedExcludedCount = 0
    for (const o of dbOrders) {
      const p = paise(o.grandTotal)
      if (o.status === 'cancelled' || o.paymentStatus === 'refunded') {
        expectedExcluded += p
        expectedExcludedCount += 1
      } else {
        expectedOrderValue += p
        if (o.status === 'delivered') {
          expectedCompleted += p
          expectedCompletedCount += 1
        }
      }
    }

    const page1 = await getCustomerOrderHistory(customerA.id, { page: 1, perPage: 10 })
    assert.equal(page1.customer.name, 'Customer Alpha')
    assert.equal(page1.customer.phone, customerA.phone)
    assert.equal(page1.customer.email, 'alpha@example.test')

    assert.equal(page1.summary.totalOrders, 12)
    assert.equal(page1.summary.totalOrderValue, expectedOrderValue / 100)
    assert.equal(page1.summary.completedValue, expectedCompleted / 100)
    assert.equal(page1.summary.completedCount, expectedCompletedCount)
    assert.equal(page1.summary.cancelledRefundedValue, expectedExcluded / 100)
    assert.equal(page1.summary.cancelledRefundedCount, expectedExcludedCount)
    assert.equal(page1.summary.latestOrderAt, dbOrders[0].createdAt.toISOString())

    assert.equal(page1.meta.total, 12)
    assert.equal(page1.orders.length, 10)
    assert.equal(page1.orders[0].orderNo, dbOrders[0].orderNo)
    assert.equal(page1.orders[0].grandTotal, Number(dbOrders[0].grandTotal))
    assert.equal(page1.orders[0].items[0].name, 'Insights Apple')
    assert.equal(page1.orders[0].items[0].quantity, 3)

    const page2 = await getCustomerOrderHistory(customerA.id, { page: 2, perPage: 10 })
    assert.equal(page2.orders.length, 2)

    const deliveredOnly = await getCustomerOrderHistory(customerA.id, { status: 'delivered' })
    assert.equal(deliveredOnly.meta.total, 4)
    assert.equal(deliveredOnly.summary.totalOrders, 12)

    const refundedOnly = await getCustomerOrderHistory(customerA.id, { paymentStatus: 'refunded' })
    assert.equal(refundedOnly.meta.total, 1)

    const dateFiltered = await getCustomerOrderHistory(customerA.id, {
      from: '2026-10-05',
      to: '2026-10-12',
    })
    assert.equal(dateFiltered.meta.total, 3)

    const asc = await getCustomerOrderHistory(customerA.id, { sort: 'date_asc', perPage: 10 })
    assert.ok(new Date(asc.orders[0].createdAt) <= new Date(asc.orders[1].createdAt))

    const totalDesc = await getCustomerOrderHistory(customerA.id, { sort: 'total_desc', perPage: 10 })
    assert.ok(totalDesc.orders[0].grandTotal >= totalDesc.orders[1].grandTotal)

    const totalAsc = await getCustomerOrderHistory(customerA.id, { sort: 'total_asc', perPage: 10 })
    assert.ok(totalAsc.orders[0].grandTotal <= totalAsc.orders[1].grandTotal)
  })

  await t.test('2. Customer with no orders', async () => {
    const history = await getCustomerOrderHistory(customerB.id)
    assert.equal(history.summary.totalOrders, 0)
    assert.equal(history.summary.totalOrderValue, 0)
    assert.equal(history.summary.completedValue, 0)
    assert.equal(history.summary.cancelledRefundedValue, 0)
    assert.equal(history.summary.latestOrderAt, null)
    assert.equal(history.orders.length, 0)
    assert.equal(history.meta.total, 0)
    assert.equal(history.customer.email, null)
  })

  await t.test('3 & 5 & 7. Customer cart add/update/remove/replace and source-of-truth totals', async () => {
    await addCartItem(customerC.id, { slug: productApple.slug, quantity: 2 })
    let ro = await getCartReadOnly(customerC.id)
    let rw = await getCart(customerC.id)
    let extras = await customerListExtras([customerC])
    assert.equal(ro.exists, true)
    assert.equal(ro.itemsTotal, rw.itemsTotal)
    assert.equal(ro.itemsTotal, 300)
    assert.equal(ro.items[0].lineTotal, 300)
    assert.equal(extras.get(customerC.id).cartItemCount, 1)
    assert.equal(extras.get(customerC.id).cartTotal, '₹300.00')

    await addCartItem(customerC.id, { slug: productMango.slug, quantity: 1 })
    ro = await getCartReadOnly(customerC.id)
    rw = await getCart(customerC.id)
    extras = await customerListExtras([customerC])
    assert.equal(ro.itemsTotal, rw.itemsTotal)
    assert.equal(ro.itemsTotal, 700)
    assert.equal(extras.get(customerC.id).cartItemCount, 2)
    assert.equal(extras.get(customerC.id).cartTotal, '₹700.00')

    await updateCartItem(customerC.id, productApple.slug, 3)
    ro = await getCartReadOnly(customerC.id)
    rw = await getCart(customerC.id)
    extras = await customerListExtras([customerC])
    assert.equal(ro.itemsTotal, rw.itemsTotal)
    assert.equal(ro.itemsTotal, 850)
    assert.equal(extras.get(customerC.id).cartItemCount, 2)
    assert.equal(extras.get(customerC.id).cartTotal, '₹850.00')

    await removeCartItem(customerC.id, productMango.slug)
    ro = await getCartReadOnly(customerC.id)
    rw = await getCart(customerC.id)
    extras = await customerListExtras([customerC])
    assert.equal(ro.itemsTotal, rw.itemsTotal)
    assert.equal(ro.itemsTotal, 450)
    assert.equal(extras.get(customerC.id).cartItemCount, 1)
    assert.equal(extras.get(customerC.id).cartTotal, '₹450.00')

    await replaceCart(customerC.id, [
      { slug: productApple.slug, quantity: 1 },
      { slug: productMango.slug, quantity: 2 },
      { slug: `${prefix}inactive`, quantity: 1 },
    ])
    ro = await getCartReadOnly(customerC.id)
    rw = await getCart(customerC.id)
    extras = await customerListExtras([customerC])
    assert.equal(ro.items.length, 2)
    assert.equal(ro.itemsTotal, rw.itemsTotal)
    assert.equal(ro.itemsTotal, 950)
    assert.equal(extras.get(customerC.id).cartItemCount, 2)
    assert.equal(extras.get(customerC.id).cartTotal, '₹950.00')
  })

  await t.test('4. Customer with empty cart (read-only does not create Cart row)', async () => {
    const ro = await getCartReadOnly(customerB.id)
    assert.equal(ro.exists, false)
    assert.equal(ro.items.length, 0)
    assert.equal(ro.itemsTotal, 0)
    assert.equal(await prisma.cart.count({ where: { customerId: customerB.id } }), 0)

    const extras = await customerListExtras([customerB])
    assert.equal(extras.get(customerB.id).cartItemCount, 0)
    assert.equal(extras.get(customerB.id).cartTotal, '₹0.00')
  })

  await t.test('6 & 7. Placing order clears cart and updates customer order history', async () => {
    const items = await getCartCheckoutItems(customerC.id)
    const created = await createCheckoutOrder(customerC, {
      items,
      addressId: addressC.id,
      paymentMode: 'cod',
      deliveryOption: 'morning',
    })
    await confirmCodOrder(customerC, { orderNo: created.order.orderNo })

    const roAfter = await getCartReadOnly(customerC.id)
    assert.equal(roAfter.items.length, 0)
    assert.equal(roAfter.itemsTotal, 0)

    const extrasAfter = await customerListExtras([customerC])
    assert.equal(extrasAfter.get(customerC.id).cartItemCount, 0)
    assert.equal(extrasAfter.get(customerC.id).cartTotal, '₹0.00')

    const historyC = await getCustomerOrderHistory(customerC.id)
    const savedOrder = await prisma.order.findUnique({ where: { id: created.order.id } })
    assert.equal(historyC.summary.totalOrders, 1)
    assert.equal(historyC.orders[0].orderNo, created.order.orderNo)
    assert.equal(historyC.orders[0].grandTotal, Number(savedOrder.grandTotal))
  })

  await prisma.customer.deleteMany({ where: { phone: { in: phones } } })
  await prisma.$disconnect()
})
