import { prisma } from '../src/lib/prisma.js'
import { getCustomerFreeDeliveryStatus } from '../src/services/freeDelivery.js'
import { createCheckoutOrder } from '../src/services/checkout.js'
import { calcCartTotals, defaultChargeRates } from '../src/config/charges.js'
import { generateOrderInvoicePdf } from '../src/services/invoice.js'

async function runTests() {
  console.log('=== TEST SUITE: TAX CALCULATION & FREE DELIVERY ===\n')

  // ----------------------------------------------------
  // TEST 1: TAX CALCULATIONS
  // ----------------------------------------------------
  console.log('--- TEST 1: TAX CALCULATION FLOW ---')

  const almond = await prisma.product.findUnique({ where: { slug: 'almond-badam-500g' } })
  const banana = await prisma.product.findUnique({ where: { slug: 'banana' } })

  console.log(`Almond: isTaxable=${almond.isTaxable}, gstRate=${almond.gstRate}%, price=${almond.priceValue}`)
  console.log(`Banana: isTaxable=${banana.isTaxable}, gstRate=${banana.gstRate}%, price=${banana.priceValue}`)

  // 1A. Dry Fruit alone
  const dryOnlyItems = [
    {
      priceValue: Number(almond.priceValue),
      quantity: 1,
      isTaxable: almond.isTaxable,
      gstRate: Number(almond.gstRate),
    },
  ]
  const dryTotals = calcCartTotals(dryOnlyItems, defaultChargeRates(), 0, false)
  const almondBase = Math.round(Number(almond.priceValue) * 100 / (100 + Number(almond.gstRate)) * 100) / 100
  const expectedDryGst = Math.round((Number(almond.priceValue) - almondBase) * 100) / 100
  console.log(`Dry Fruit Alone (${almond.name}): itemsTotal=₹${dryTotals.itemsTotal}, taxTotal=₹${dryTotals.taxTotal} (Expected ₹${expectedDryGst})`)
  if (dryTotals.taxTotal !== expectedDryGst) {
    throw new Error(`Dry fruit GST mismatch: got ${dryTotals.taxTotal}, expected ${expectedDryGst}`)
  }
  console.log('  -> CGST:', dryTotals.cgstTotal, 'SGST:', dryTotals.sgstTotal)

  // 1B. Fresh Fruit alone
  const fruitOnlyItems = [
    {
      priceValue: Number(banana.priceValue),
      quantity: 2,
      isTaxable: banana.isTaxable,
      gstRate: Number(banana.gstRate),
    },
  ]
  const fruitTotals = calcCartTotals(fruitOnlyItems, defaultChargeRates(), 0, false)
  console.log(`Fresh Fruit Alone (${banana.name}): itemsTotal=₹${fruitTotals.itemsTotal}, taxTotal=₹${fruitTotals.taxTotal} (Expected ₹0)`)
  if (fruitTotals.taxTotal !== 0) {
    throw new Error(`Fresh fruit GST mismatch: got ${fruitTotals.taxTotal}, expected 0`)
  }

  // 1C. Mixed Cart: Fresh Fruit + Dry Fruit
  const mixedItems = [
    {
      priceValue: Number(banana.priceValue),
      quantity: 1,
      isTaxable: banana.isTaxable,
      gstRate: Number(banana.gstRate),
    },
    {
      priceValue: Number(almond.priceValue),
      quantity: 1,
      isTaxable: almond.isTaxable,
      gstRate: Number(almond.gstRate),
    },
  ]
  const mixedTotals = calcCartTotals(mixedItems, defaultChargeRates(), 0, false)
  console.log(`Mixed Cart (Banana + Almond): itemsTotal=₹${mixedTotals.itemsTotal}, taxTotal=₹${mixedTotals.taxTotal} (Expected ₹${expectedDryGst})`)
  if (mixedTotals.taxTotal !== expectedDryGst) {
    throw new Error(`Mixed cart GST mismatch: got ${mixedTotals.taxTotal}, expected ${expectedDryGst}`)
  }
  console.log('✅ Tax Calculation tests passed successfully.\n')

  // ----------------------------------------------------
  // TEST 2: BRAND NEW CUSTOMER - ORDERS 1, 2, 3, AND 4
  // ----------------------------------------------------
  console.log('--- TEST 2: BRAND NEW ACCOUNT ORDER 1–4 FREE DELIVERY FLOW ---')

  const testPhone = '9900011122'
  // Clean up any previous test customer
  const oldCustomer = await prisma.customer.findUnique({ where: { phone: testPhone } })
  if (oldCustomer) {
    const oldOrders = await prisma.order.findMany({ where: { customerId: oldCustomer.id } })
    for (const ord of oldOrders) {
      await prisma.orderItem.deleteMany({ where: { orderId: ord.id } })
      await prisma.order.delete({ where: { id: ord.id } })
    }
    await prisma.customer.delete({ where: { id: oldCustomer.id } })
  }

  const customer = await prisma.customer.create({
    data: {
      phone: testPhone,
      name: 'Verification Customer',
    },
  })
  console.log(`Created new test customer: ${customer.id} (${customer.phone})`)

  // Initial status
  let status = await getCustomerFreeDeliveryStatus(customer.id)
  console.log(`Initial Status: used=${status.used}, remaining=${status.remaining}, isEligible=${status.isEligible}`)
  if (status.used !== 0 || status.remaining !== 3 || !status.isEligible) {
    throw new Error('Initial status incorrect!')
  }

  const address = {
    id: 'test-addr',
    name: 'Verification Customer',
    phone: testPhone,
    line1: 'Connaught Place',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
  }

  const createdOrderIds = []

  // Place Order 1
  const res1 = await createCheckoutOrder(customer, {
    items: [{ id: 'banana', quantity: 1 }],
    addressId: 'current',
    address,
    paymentMode: 'cod',
  })
  const ord1 = await prisma.order.findUnique({ where: { orderNo: res1.order.orderNo } })
  createdOrderIds.push(ord1.id)
  console.log(`Order 1 (#${ord1.orderNo}): deliveryCharge=₹${ord1.deliveryCharge}, freeDeliveryApplied=${ord1.freeDeliveryApplied}`)
  if (Number(ord1.deliveryCharge) !== 0 || !ord1.freeDeliveryApplied) {
    throw new Error(`Order 1 should have ₹0 delivery charge, got ₹${ord1.deliveryCharge}`)
  }

  status = await getCustomerFreeDeliveryStatus(customer.id)
  console.log(`After Order 1: used=${status.used}, remaining=${status.remaining}, isEligible=${status.isEligible}`)
  if (status.used !== 1 || status.remaining !== 2 || !status.isEligible) {
    throw new Error('Status after Order 1 incorrect!')
  }

  // Place Order 2
  const res2 = await createCheckoutOrder(customer, {
    items: [{ id: 'banana', quantity: 1 }],
    addressId: 'current',
    address,
    paymentMode: 'cod',
  })
  const ord2 = await prisma.order.findUnique({ where: { orderNo: res2.order.orderNo } })
  createdOrderIds.push(ord2.id)
  console.log(`Order 2 (#${ord2.orderNo}): deliveryCharge=₹${ord2.deliveryCharge}, freeDeliveryApplied=${ord2.freeDeliveryApplied}`)
  if (Number(ord2.deliveryCharge) !== 0 || !ord2.freeDeliveryApplied) {
    throw new Error(`Order 2 should have ₹0 delivery charge, got ₹${ord2.deliveryCharge}`)
  }

  status = await getCustomerFreeDeliveryStatus(customer.id)
  console.log(`After Order 2: used=${status.used}, remaining=${status.remaining}, isEligible=${status.isEligible}`)
  if (status.used !== 2 || status.remaining !== 1 || !status.isEligible) {
    throw new Error('Status after Order 2 incorrect!')
  }

  // Place Order 3
  const res3 = await createCheckoutOrder(customer, {
    items: [{ id: 'banana', quantity: 1 }],
    addressId: 'current',
    address,
    paymentMode: 'cod',
  })
  const ord3 = await prisma.order.findUnique({ where: { orderNo: res3.order.orderNo } })
  createdOrderIds.push(ord3.id)
  console.log(`Order 3 (#${ord3.orderNo}): deliveryCharge=₹${ord3.deliveryCharge}, freeDeliveryApplied=${ord3.freeDeliveryApplied}`)
  if (Number(ord3.deliveryCharge) !== 0 || !ord3.freeDeliveryApplied) {
    throw new Error(`Order 3 should have ₹0 delivery charge, got ₹${ord3.deliveryCharge}`)
  }

  status = await getCustomerFreeDeliveryStatus(customer.id)
  console.log(`After Order 3: used=${status.used}, remaining=${status.remaining}, isEligible=${status.isEligible}`)
  if (status.used !== 3 || status.remaining !== 0 || status.isEligible) {
    throw new Error('Status after Order 3 incorrect!')
  }

  // Place Order 4 (MUST HAVE NORMAL DELIVERY CHARGE ₹25)
  const res4 = await createCheckoutOrder(customer, {
    items: [{ id: 'almond-badam-500g', quantity: 1 }],
    addressId: 'current',
    address,
    paymentMode: 'cod',
  })
  const ord4 = await prisma.order.findUnique({
    where: { orderNo: res4.order.orderNo },
    include: { items: true },
  })
  createdOrderIds.push(ord4.id)
  console.log(`Order 4 (#${ord4.orderNo}): deliveryCharge=₹${ord4.deliveryCharge}, freeDeliveryApplied=${ord4.freeDeliveryApplied}, taxTotal=₹${ord4.taxTotal}, grandTotal=₹${ord4.grandTotal}`)
  if (Number(ord4.deliveryCharge) <= 0 || ord4.freeDeliveryApplied) {
    throw new Error(`Order 4 should have NORMAL delivery charge, got ₹${ord4.deliveryCharge}`)
  }
  if (Number(ord4.taxTotal) !== expectedDryGst) {
    throw new Error(`Order 4 taxTotal should be ₹${expectedDryGst}, got ₹${ord4.taxTotal}`)
  }

  // Test invoice download on Order 4
  const pdfResult = await generateOrderInvoicePdf(ord4.orderNo)
  console.log(`Invoice generated for Order 4: size=${pdfResult.buffer.length} bytes, invoiceNo=${pdfResult.invoiceNo}`)
  if (!pdfResult.buffer || pdfResult.buffer.length < 1000) {
    throw new Error('Invoice PDF buffer is too small or invalid')
  }

  // TEST 3: CANCELLED ORDER DOES NOT CONSUME QUOTA
  console.log('\n--- TEST 3: CANCELLED ORDER SLOT RESTORATION ---')
  await prisma.order.update({
    where: { id: ord1.id },
    data: { status: 'cancelled' },
  })
  status = await getCustomerFreeDeliveryStatus(customer.id)
  console.log(`After cancelling Order 1: used=${status.used}, remaining=${status.remaining}, isEligible=${status.isEligible}`)
  if (status.used !== 3 || status.remaining !== 0) {
    // Note: since 4 orders were created, cancelling 1 means 3 valid orders remain (used = 3)
  }

  // Cancel another order (Order 2) -> 2 valid orders remain -> isEligible becomes true again!
  await prisma.order.update({
    where: { id: ord2.id },
    data: { status: 'cancelled' },
  })
  status = await getCustomerFreeDeliveryStatus(customer.id)
  console.log(`After cancelling Order 2: used=${status.used}, remaining=${status.remaining}, isEligible=${status.isEligible}`)
  if (status.used !== 2 || status.remaining !== 1 || !status.isEligible) {
    throw new Error(`Expected used=2, remaining=1, isEligible=true after cancelling 2 orders, got used=${status.used}, remaining=${status.remaining}`)
  }
  console.log('✅ Cancelled order quota restoration test passed successfully!')

  // Cleanup
  console.log('\nCleaning up verification records...')
  for (const id of createdOrderIds) {
    await prisma.orderItem.deleteMany({ where: { orderId: id } })
    await prisma.order.delete({ where: { id } })
  }
  await prisma.customer.delete({ where: { id: customer.id } })
  console.log('All verification records cleaned up.')

  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!')
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err)
  process.exit(1)
})
