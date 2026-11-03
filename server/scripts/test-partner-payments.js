import bcrypt from 'bcryptjs'
import { prisma } from '../src/lib/prisma.js'
import {
  collectCashForOrder,
  formatPartnerOrder,
  getPartnerOrder,
  markOrderPaidByQr,
} from '../src/services/partnerOrders.js'

async function assert(condition, message) {
  if (!condition) throw new Error(`ASSERTION FAILED: ${message}`)
  console.log(`  ✓ ${message}`)
}

async function assertThrows(fn, status, message) {
  try {
    await fn()
    throw new Error(`ASSERTION FAILED: expected throw for ${message}`)
  } catch (error) {
    if (error.message.startsWith('ASSERTION FAILED')) throw error
    await assert(error.status === status, `${message} (status ${status})`)
  }
}

async function cleanup(ids) {
  const { orderIds, partnerIds, customerIds } = ids
  if (orderIds.length) {
    await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } })
    await prisma.order.deleteMany({ where: { id: { in: orderIds } } })
  }
  if (partnerIds.length) {
    await prisma.partnerDeviceToken.deleteMany({ where: { partnerId: { in: partnerIds } } })
    await prisma.partnerPasswordToken.deleteMany({ where: { partnerId: { in: partnerIds } } })
    await prisma.deliveryPartner.deleteMany({ where: { id: { in: partnerIds } } })
  }
  if (customerIds.length) {
    await prisma.customer.deleteMany({ where: { id: { in: customerIds } } })
  }
}

async function createPartner(suffix) {
  const password = await bcrypt.hash('partner-test-pass', 8)
  const n = String(Math.floor(Math.random() * 1e10)).padStart(10, '0')
  return prisma.deliveryPartner.create({
    data: {
      name: `Partner ${suffix}`,
      email: `partner.${suffix}.${Date.now()}.${n}@tokriii.test`,
      phone: n,
      password,
      isActive: true,
    },
  })
}

async function createCustomer(suffix) {
  const n = String(Math.floor(Math.random() * 1e10)).padStart(10, '0')
  return prisma.customer.create({
    data: { phone: n, name: `Cust ${suffix}`, isActive: true },
  })
}

async function createOrder({ customerId, partnerId, paymentMode = 'cod', status = 'shipped', paymentStatus = 'pending', extras = {} }) {
  const orderNo = `PTEST-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  return prisma.order.create({
    data: {
      orderNo,
      customerId,
      deliveryPartnerId: partnerId,
      deliveryPartnerName: 'Test Partner',
      status,
      paymentStatus,
      paymentMode,
      itemsTotal: 100,
      grandTotal: 127,
      deliveryCharge: 25,
      handlingCharge: 2,
      address: {
        name: 'Test Customer',
        phone: '9999999999',
        line1: '12 Test Lane',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        latitude: 28.6139,
        longitude: 77.209,
      },
      items: {
        create: [
          {
            name: 'Test Mango',
            quantity: 1,
            priceValue: 100,
            image: '/uploads/test-mango.jpg',
            weight: '1 kg',
          },
        ],
      },
      ...extras,
    },
    include: {
      customer: { select: { name: true, phone: true } },
      items: true,
    },
  })
}

async function run() {
  console.log('\n=== PARTNER PAYMENT TESTS ===\n')
  const ids = { orderIds: [], partnerIds: [], customerIds: [] }

  try {
    const partnerA = await createPartner('a')
    const partnerB = await createPartner('b')
    ids.partnerIds.push(partnerA.id, partnerB.id)

    const customer = await createCustomer('1')
    ids.customerIds.push(customer.id)

    console.log('[1] Cash collect → paid + delivered')
    const cashOrder = await createOrder({ customerId: customer.id, partnerId: partnerA.id })
    ids.orderIds.push(cashOrder.id)
    const afterCash = await collectCashForOrder(cashOrder.id, { partnerId: partnerA.id })
    await assert(afterCash.paymentStatus === 'paid', 'cash sets paymentStatus=paid')
    await assert(afterCash.paymentCollectedAs === 'cash', 'cash sets paymentCollectedAs=cash')
    await assert(afterCash.status === 'delivered', 'cash sets status=delivered')

    console.log('\n[2] Cash collect idempotent when already paid')
    const again = await collectCashForOrder(cashOrder.id, { partnerId: partnerA.id })
    await assert(again.paymentCollectedAs === 'cash', 'idempotent cash keeps collectedAs=cash')
    await assert(again.paymentStatus === 'paid', 'idempotent cash stays paid')

    console.log('\n[3] QR webhook → paid + delivered')
    const qrOrder = await createOrder({ customerId: customer.id, partnerId: partnerA.id })
    ids.orderIds.push(qrOrder.id)
    const afterQr = await markOrderPaidByQr({ orderNo: qrOrder.orderNo, paymentId: 'pay_test_qr_1' })
    await assert(afterQr.paymentStatus === 'paid', 'QR sets paymentStatus=paid')
    await assert(afterQr.paymentCollectedAs === 'qr', 'QR sets paymentCollectedAs=qr')
    await assert(afterQr.status === 'delivered', 'QR sets status=delivered')
    await assert(afterQr.razorpayPaymentId === 'pay_test_qr_1', 'QR stores payment id')

    console.log('\n[4] Late QR after cash does not flip collectedAs')
    const race = await markOrderPaidByQr({ orderNo: cashOrder.orderNo, paymentId: 'pay_late' })
    await assert(race.paymentCollectedAs === 'cash', 'late QR leaves cash collection method')
    await assert(race.razorpayPaymentId !== 'pay_late', 'late QR does not overwrite cash row payment id')

    console.log('\n[5] Non-COD reject')
    const online = await createOrder({
      customerId: customer.id,
      partnerId: partnerA.id,
      paymentMode: 'online',
    })
    ids.orderIds.push(online.id)
    await assertThrows(
      () => collectCashForOrder(online.id, { partnerId: partnerA.id }),
      400,
      'non-COD cash rejected',
    )

    console.log('\n[6] Wrong partner 403')
    const assigned = await createOrder({ customerId: customer.id, partnerId: partnerA.id })
    ids.orderIds.push(assigned.id)
    await assertThrows(
      () => collectCashForOrder(assigned.id, { partnerId: partnerB.id }),
      403,
      'wrong partner rejected',
    )

    console.log('\n[7] Cancelled order reject')
    const cancelled = await createOrder({
      customerId: customer.id,
      partnerId: partnerA.id,
      status: 'cancelled',
    })
    ids.orderIds.push(cancelled.id)
    await assertThrows(
      () => collectCashForOrder(cancelled.id, { partnerId: partnerA.id }),
      400,
      'cancelled cash rejected',
    )

    console.log('\n[8] GET order DTO includes lat/lng')
    const dto = await getPartnerOrder(assigned.id, partnerA.id)
    await assert(dto.latitude === 28.6139, 'latitude present')
    await assert(dto.longitude === 77.209, 'longitude present')
    await assert(dto.address?.latitude === 28.6139, 'address.latitude present')
    const formatted = formatPartnerOrder(assigned)
    await assert(formatted.orderNo === assigned.orderNo, 'formatPartnerOrder keeps orderNo')

    console.log('\nAll partner payment tests passed.\n')
  } finally {
    await cleanup(ids)
    await prisma.$disconnect()
  }
}

run().catch(async (error) => {
  console.error('\nPartner payment tests failed:', error)
  await prisma.$disconnect().catch(() => {})
  process.exit(1)
})
