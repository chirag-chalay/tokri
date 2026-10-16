import { prisma } from '../src/lib/prisma.js'
import { getCustomerFreeDeliveryStatus } from '../src/services/freeDelivery.js'
import { createCheckoutOrder } from '../src/services/checkout.js'
import { generateOrderInvoicePdf } from '../src/services/invoice.js'

async function assert(condition, message) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`)
  }
  console.log(`  ✓ ${message}`)
}

async function runTests() {
  console.log('\n=== RUNNING COMPREHENSIVE VERIFICATION TESTS ===\n')

  // Setup test customer
  const phone = `9999${Math.floor(100000 + Math.random() * 900000)}`
  const customer = await prisma.customer.create({
    data: {
      phone,
      name: 'Verification Customer',
      isActive: true,
      addresses: [
        {
          id: 'addr_1',
          name: 'Verification Customer',
          phone,
          line1: 'Flat 402, Green Heights',
          line2: 'Sector 5',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110001',
          landmark: 'Near Metro',
          isDefault: true,
          serviceable: true,
          delivery: {
            serviceable: true,
            morning: { enabled: true },
            express: { enabled: true },
            defaultOption: 'morning',
          },
        },
      ],
    },
  })

  // Ensure serviceable pincode 110001 exists
  await prisma.serviceablePincode.upsert({
    where: { pincode: '110001' },
    update: { isActive: true, morningEnabled: true, expressEnabled: true },
    create: { pincode: '110001', city: 'New Delhi', isActive: true, morningEnabled: true, expressEnabled: true },
  })

  // Get a test product
  const product = await prisma.product.findFirst({ where: { isActive: true } })
  if (!product) throw new Error('No active products found in DB')

  const items = [{ id: product.slug, quantity: 2 }]
  const expectedItemsTotal = Number(product.priceValue) * 2

  console.log(`[1] Testing initial status for new customer ${customer.id}:`)
  let status = await getCustomerFreeDeliveryStatus(customer.id)
  await assert(status.quota === 3, 'Quota is 3')
  await assert(status.used === 0, 'Used count is 0')
  await assert(status.remaining === 3, 'Remaining is 3')
  await assert(status.isEligible === true, 'isEligible is true')

  console.log('\n[2] Testing Order 1 (Morning delivery):')
  const order1Result = await createCheckoutOrder(
    customer,
    { items, addressId: 'addr_1', paymentMode: 'cod', deliveryOption: 'morning' },
  )
  const order1 = await prisma.order.findUnique({ where: { id: order1Result.order.id } })
  await assert(order1.freeDeliveryApplied === true, 'Order 1 has freeDeliveryApplied = true')
  await assert(Number(order1.deliveryCharge) === 0, 'Order 1 deliveryCharge is 0')
  await assert(Number(order1.grandTotal) === expectedItemsTotal + Number(order1.handlingCharge), 'Order 1 grandTotal excludes delivery charge')

  status = await getCustomerFreeDeliveryStatus(customer.id)
  await assert(status.used === 1, 'Used count is 1 after Order 1')
  await assert(status.remaining === 2, 'Remaining is 2 after Order 1')
  await assert(status.isEligible === true, 'isEligible is still true')

  console.log('\n[3] Testing Order 2 (Express delivery):')
  const order2Result = await createCheckoutOrder(
    customer,
    { items, addressId: 'addr_1', paymentMode: 'cod', deliveryOption: 'express' },
  )
  const order2 = await prisma.order.findUnique({ where: { id: order2Result.order.id } })
  await assert(order2.freeDeliveryApplied === true, 'Order 2 has freeDeliveryApplied = true')
  await assert(Number(order2.deliveryCharge) === 0, 'Order 2 express delivery charge is waived to 0')

  status = await getCustomerFreeDeliveryStatus(customer.id)
  await assert(status.used === 2, 'Used count is 2 after Order 2')
  await assert(status.remaining === 1, 'Remaining is 1 after Order 2')

  console.log('\n[4] Testing Order 3 (Morning delivery):')
  const order3Result = await createCheckoutOrder(
    customer,
    { items, addressId: 'addr_1', paymentMode: 'cod', deliveryOption: 'morning' },
  )
  const order3 = await prisma.order.findUnique({ where: { id: order3Result.order.id } })
  await assert(order3.freeDeliveryApplied === true, 'Order 3 has freeDeliveryApplied = true')
  await assert(Number(order3.deliveryCharge) === 0, 'Order 3 deliveryCharge is 0')

  status = await getCustomerFreeDeliveryStatus(customer.id)
  await assert(status.used === 3, 'Used count is 3 after Order 3')
  await assert(status.remaining === 0, 'Remaining is 0 after Order 3')
  await assert(status.isEligible === false, 'isEligible is false after 3 orders')

  console.log('\n[5] Testing Order 4 (Quota consumed -> normal delivery fee applies):')
  const order4Result = await createCheckoutOrder(
    customer,
    { items, addressId: 'addr_1', paymentMode: 'cod', deliveryOption: 'morning' },
  )
  const order4 = await prisma.order.findUnique({ where: { id: order4Result.order.id } })
  await assert(order4.freeDeliveryApplied === false, 'Order 4 has freeDeliveryApplied = false')
  await assert(Number(order4.deliveryCharge) === 25, 'Order 4 has normal delivery charge of 25')
  await assert(
    Number(order4.grandTotal) === expectedItemsTotal + 25 + Number(order4.handlingCharge),
    'Order 4 grandTotal includes standard delivery charge',
  )

  console.log('\n[6] Testing cancellation of Order 2 (Restores 1 free delivery):')
  await prisma.order.update({
    where: { id: order2.id },
    data: { status: 'cancelled' },
  })

  status = await getCustomerFreeDeliveryStatus(customer.id)
  await assert(status.used === 2, 'Cancelled order does NOT consume quota; used drops to 2')
  await assert(status.remaining === 1, 'Remaining free deliveries increases back to 1')
  await assert(status.isEligible === true, 'Customer is eligible again')

  console.log('\n[7] Testing Order 5 after cancellation (Consumes the restored free delivery):')
  const order5Result = await createCheckoutOrder(
    customer,
    { items, addressId: 'addr_1', paymentMode: 'cod', deliveryOption: 'morning' },
  )
  const order5 = await prisma.order.findUnique({ where: { id: order5Result.order.id } })
  await assert(order5.freeDeliveryApplied === true, 'Order 5 gets free delivery')
  await assert(Number(order5.deliveryCharge) === 0, 'Order 5 delivery charge is 0')

  status = await getCustomerFreeDeliveryStatus(customer.id)
  await assert(status.used === 3, 'Used is now 3 again')
  await assert(status.remaining === 0, 'Remaining is 0 again')

  console.log('\n[8] Testing Order 6 (Exceeded quota again):')
  const order6Result = await createCheckoutOrder(
    customer,
    { items, addressId: 'addr_1', paymentMode: 'cod', deliveryOption: 'morning' },
  )
  const order6 = await prisma.order.findUnique({ where: { id: order6Result.order.id } })
  await assert(order6.freeDeliveryApplied === false, 'Order 6 has freeDeliveryApplied = false')
  await assert(Number(order6.deliveryCharge) === 25, 'Order 6 delivery charge is 25')

  console.log('\n[9] Testing Invoice PDF Generation:')
  const { buffer, invoiceNo } = await generateOrderInvoicePdf(order1.id)
  await assert(Buffer.isBuffer(buffer), 'Invoice returns a valid Buffer')
  await assert(buffer.length > 2000, `Invoice PDF size is substantial (${buffer.length} bytes)`)
  const pdfHeader = buffer.slice(0, 5).toString('ascii')
  await assert(pdfHeader === '%PDF-', 'Buffer starts with %PDF- header')
  await assert(invoiceNo === `INV-${order1.orderNo}`, `Invoice number is correctly formatted (${invoiceNo})`)

  console.log('\n[10] Testing Invoice Generation for Order 4 (Paid delivery):')
  const paidInvoice = await generateOrderInvoicePdf(order4.orderNo)
  await assert(paidInvoice.buffer.length > 2000, 'Paid delivery invoice generated successfully')

  console.log('\n=== ALL 10 TESTS PASSED SUCCESSFULLY! ===\n')
}

runTests()
  .catch((err) => {
    console.error('TEST ERROR:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
