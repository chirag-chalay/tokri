import dotenv from 'dotenv'
import { prisma } from '../src/lib/prisma.js'
import { createCheckoutOrder } from '../src/services/checkout.js'
import { generateOrderInvoicePdf } from '../src/services/invoice.js'
import { getCustomerFreeDeliveryStatus, applyFreeDeliveryRates } from '../src/services/freeDelivery.js'

dotenv.config()

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ Assertion failed: ${message}`)
    throw new Error(message)
  }
  console.log(`  ✓ ${message}`)
}

function extractGst(inclusiveAmount, rate) {
  const taxableAmount = Math.round((inclusiveAmount * 100) / (100 + rate) * 100) / 100
  return Math.round((inclusiveAmount - taxableAmount) * 100) / 100
}

async function main() {
  console.log('========================================================')
  console.log('🧪 RUNNING TAX MANAGEMENT & GST CHECKOUT/INVOICE TESTS')
  console.log('========================================================')

  // Ensure test serviceable pincode for inter-state exists
  await prisma.serviceablePincode.upsert({
    where: { pincode: '400020' },
    create: {
      pincode: '400020',
      city: 'Mumbai',
      stateCode: null,
      isActive: true,
      morningEnabled: true,
      expressEnabled: true,
    },
    update: {
      isActive: true,
      morningEnabled: true,
    },
  })

  // Setup test customer
  const testPhone = '9999900077'
  let customer = await prisma.customer.findUnique({ where: { phone: testPhone } })
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        phone: testPhone,
        name: 'GST Test Customer',
        addresses: [
          {
            id: 'addr-delhi-1',
            name: 'GST Customer Delhi',
            phone: testPhone,
            line1: '10 Connaught Place',
            city: 'New Delhi',
            state: 'Delhi',
            pincode: '110001',
          },
          {
            id: 'addr-mumbai-1',
            name: 'GST Customer Mumbai',
            phone: testPhone,
            line1: '25 Marine Drive',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400020',
          },
        ],
      },
    })
  } else {
    // Ensure both addresses exist
    customer = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        addresses: [
          {
            id: 'addr-delhi-1',
            name: 'GST Customer Delhi',
            phone: testPhone,
            line1: '10 Connaught Place',
            city: 'New Delhi',
            state: 'Delhi',
            pincode: '110001',
          },
          {
            id: 'addr-mumbai-1',
            name: 'GST Customer Mumbai',
            phone: testPhone,
            line1: '25 Marine Drive',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400020',
          },
        ],
      },
    })
  }

  // Get products
  const freshFruit = await prisma.product.findFirst({
    where: { isTaxable: false, isActive: true },
  })
  assert(freshFruit, `Found fresh fruit product: ${freshFruit?.name} (Taxable: ${freshFruit?.isTaxable}, GST: ${freshFruit?.gstRate}%)`)

  const almond = await prisma.product.findUnique({ where: { slug: 'almond-badam-500g' } })
  const cashew = await prisma.product.findUnique({ where: { slug: 'cashew-kaju-500g' } })
  const pistachio = await prisma.product.findUnique({ where: { slug: 'pistachio-pista-250g' } })
  const raisin = await prisma.product.findUnique({ where: { slug: 'raisin-kishmish-500g' } })
  assert(almond && cashew && pistachio && raisin, 'All 4 dry fruit products exist in catalog')

  console.log('\n--- Test 1: Only fruits → ₹0 GST ---')
  const order1Result = await createCheckoutOrder(customer, {
    items: [{ slug: freshFruit.slug, quantity: 2 }],
    addressId: 'addr-delhi-1',
    paymentMode: 'cod',
    deliveryOption: 'morning',
  })
  const order1 = await prisma.order.findUnique({
    where: { id: order1Result.order.id },
    include: { items: true },
  })
  assert(Number(order1.taxTotal) === 0, `Order 1 Tax total is ₹0 (got ₹${order1.taxTotal})`)
  assert(Number(order1.cgstTotal) === 0, `Order 1 CGST is ₹0`)
  assert(Number(order1.sgstTotal) === 0, `Order 1 SGST is ₹0`)
  assert(Number(order1.igstTotal) === 0, `Order 1 IGST is ₹0`)
  assert(order1.items.every((it) => Number(it.taxAmount) === 0), `All items in Order 1 have ₹0 taxAmount`)

  console.log('\n--- Test 2: Only dry fruits → 5% GST (Intra-state: CGST 2.5% + SGST 2.5%) ---')
  const almondQty = 2
  const almondPrice = Number(almond.priceValue)
  const expectedSubtotal2 = almondPrice * almondQty
  const expectedTax2 = extractGst(expectedSubtotal2, 5)
  const expectedCgst2 = Math.round((expectedTax2 / 2) * 100) / 100
  const expectedSgst2 = Math.round((expectedTax2 - expectedCgst2) * 100) / 100

  const order2Result = await createCheckoutOrder(customer, {
    items: [{ slug: almond.slug, quantity: almondQty }],
    addressId: 'addr-delhi-1',
    paymentMode: 'cod',
    deliveryOption: 'morning',
  })
  const order2 = await prisma.order.findUnique({
    where: { id: order2Result.order.id },
    include: { items: true },
  })
  assert(Number(order2.itemsTotal) === expectedSubtotal2, `Order 2 subtotal is ₹${expectedSubtotal2}`)
  assert(Number(order2.taxTotal) === expectedTax2, `Order 2 Tax total is 5% = ₹${expectedTax2} (got ₹${order2.taxTotal})`)
  assert(order2.isInterState === false, `Order 2 is intra-state (Delhi)`)
  assert(Number(order2.cgstTotal) === expectedCgst2, `Order 2 CGST 2.5% is ₹${expectedCgst2}`)
  assert(Number(order2.sgstTotal) === expectedSgst2, `Order 2 SGST 2.5% is ₹${expectedSgst2}`)
  assert(Number(order2.igstTotal) === 0, `Order 2 IGST is ₹0`)

  console.log('\n--- Test 3: Mixed fruit + dry fruit cart → GST only on dry fruits ---')
  const mixedItems = [
    { slug: freshFruit.slug, quantity: 2 },
    { slug: cashew.slug, quantity: 1 },
  ]
  const cashewTotal = Number(cashew.priceValue) * 1
  const expectedTax3 = extractGst(cashewTotal, 5)

  const order3Result = await createCheckoutOrder(customer, {
    items: mixedItems,
    addressId: 'addr-delhi-1',
    paymentMode: 'cod',
    deliveryOption: 'morning',
  })
  const order3 = await prisma.order.findUnique({
    where: { id: order3Result.order.id },
    include: { items: true },
  })
  const fruitItem = order3.items.find((it) => it.productId === freshFruit.id)
  const cashewItem = order3.items.find((it) => it.productId === cashew.id)
  assert(Number(fruitItem.taxAmount) === 0, `Fresh fruit item tax is ₹0`)
  assert(Number(cashewItem.taxAmount) === expectedTax3, `Cashew item tax is 5% = ₹${expectedTax3}`)
  assert(Number(order3.taxTotal) === expectedTax3, `Order 3 Tax total matches dry fruit tax only: ₹${expectedTax3}`)

  console.log('\n--- Test 4: Inter-state order (Maharashtra) → IGST 5% ---')
  const order4Result = await createCheckoutOrder(customer, {
    items: [{ slug: cashew.slug, quantity: 1 }],
    addressId: 'addr-mumbai-1',
    paymentMode: 'cod',
    deliveryOption: 'morning',
  })
  const order4 = await prisma.order.findUnique({
    where: { id: order4Result.order.id },
    include: { items: true },
  })
  assert(order4.isInterState === true, `Order 4 is recognized as inter-state`)
  assert(Number(order4.taxTotal) === expectedTax3, `Order 4 Tax total is ₹${expectedTax3}`)
  assert(Number(order4.cgstTotal) === 0, `Order 4 CGST is ₹0`)
  assert(Number(order4.sgstTotal) === 0, `Order 4 SGST is ₹0`)
  assert(Number(order4.igstTotal) === expectedTax3, `Order 4 IGST 5% is ₹${expectedTax3}`)

  console.log('\n--- Test 5: Multiple dry fruits → correct per-item GST ---')
  const multiDryItems = [
    { slug: almond.slug, quantity: 1 },
    { slug: pistachio.slug, quantity: 2 },
    { slug: raisin.slug, quantity: 1 },
  ]
  const almondLineTax = extractGst(Number(almond.priceValue), 5)
  const pistaLineTax = extractGst(Number(pistachio.priceValue) * 2, 5)
  const raisinLineTax = extractGst(Number(raisin.priceValue), 5)
  const expectedTotalTax5 = Math.round((almondLineTax + pistaLineTax + raisinLineTax) * 100) / 100

  const order5Result = await createCheckoutOrder(customer, {
    items: multiDryItems,
    addressId: 'addr-delhi-1',
    paymentMode: 'cod',
    deliveryOption: 'morning',
  })
  const order5 = await prisma.order.findUnique({
    where: { id: order5Result.order.id },
    include: { items: true },
  })
  const itAlmond = order5.items.find((it) => it.productId === almond.id)
  const itPista = order5.items.find((it) => it.productId === pistachio.id)
  const itRaisin = order5.items.find((it) => it.productId === raisin.id)
  assert(Number(itAlmond.taxAmount) === almondLineTax, `Almond line tax matches: ₹${almondLineTax}`)
  assert(Number(itPista.taxAmount) === pistaLineTax, `Pistachio line tax matches: ₹${pistaLineTax}`)
  assert(Number(itRaisin.taxAmount) === raisinLineTax, `Raisin line tax matches: ₹${raisinLineTax}`)
  assert(Number(order5.taxTotal) === expectedTotalTax5, `Order 5 tax total matches sum of line items: ₹${expectedTotalTax5}`)

  console.log('\n--- Test 6: Admin changes product GST → checkout immediately uses new rate ---')
  // Update Almond GST to 12% in DB
  await prisma.product.update({
    where: { id: almond.id },
    data: { gstRate: 12.00 },
  })
  await prisma.productTax.update({
    where: { productId: almond.id },
    data: { gstRate: 12.00 },
  })

  const expectedTax12 = extractGst(Number(almond.priceValue), 12)
  const order6Result = await createCheckoutOrder(customer, {
    items: [{ slug: almond.slug, quantity: 1 }],
    addressId: 'addr-delhi-1',
    paymentMode: 'cod',
    deliveryOption: 'morning',
  })
  const order6 = await prisma.order.findUnique({
    where: { id: order6Result.order.id },
    include: { items: true },
  })
  assert(Number(order6.items[0].gstRate) === 12.00, `OrderItem stores applied rate of 12%`)
  assert(Number(order6.taxTotal) === expectedTax12, `Order tax total immediately reflects 12% GST = ₹${expectedTax12}`)

  console.log('\n--- Test 7: Order permanently stores applied tax rate/amount ---')
  // Revert Almond back to 5%
  await prisma.product.update({
    where: { id: almond.id },
    data: { gstRate: 5.00 },
  })
  await prisma.productTax.update({
    where: { productId: almond.id },
    data: { gstRate: 5.00 },
  })

  // Check Order 6 again - it must STILL show 12%
  const order6Reloaded = await prisma.order.findUnique({
    where: { id: order6.id },
    include: { items: true },
  })
  assert(Number(order6Reloaded.items[0].gstRate) === 12.00, `Historical order still has 12% GST after catalog rate was changed back to 5%`)
  assert(Number(order6Reloaded.taxTotal) === expectedTax12, `Historical order still has ₹${expectedTax12} taxTotal`)

  console.log('\n--- Test 8: Invoice generation & matching totals ---')
  const { buffer: pdfBuf, invoiceNo } = await generateOrderInvoicePdf(order3.id)
  assert(Buffer.isBuffer(pdfBuf) && pdfBuf.length > 1000, `Invoice PDF generated successfully (${pdfBuf.length} bytes, ${invoiceNo})`)

  const grandTotal3 = Number(order3.grandTotal)
  const calculatedGrandTotal3 = Math.round((Number(order3.itemsTotal) + Number(order3.deliveryCharge) + Number(order3.handlingCharge) - Number(order3.discount)) * 100) / 100
  assert(grandTotal3 === calculatedGrandTotal3, `Order Grand Total (₹${grandTotal3}) matches GST-inclusive items + Delivery + Handling - Discount`)

  console.log('\n--- Test 9: First 3 free deliveries offer works with GST ---')
  const freeStatus = await getCustomerFreeDeliveryStatus(customer.id)
  assert(freeStatus !== null, `Free delivery status retrieved: ${JSON.stringify(freeStatus)}`)

  // Clean up test orders
  const testOrderIds = [order1.id, order2.id, order3.id, order4.id, order5.id, order6.id]
  await prisma.orderItem.deleteMany({ where: { orderId: { in: testOrderIds } } })
  await prisma.order.deleteMany({ where: { id: { in: testOrderIds } } })

  console.log('\n========================================================')
  console.log('🎉 ALL TAX & GST FEATURE TESTS PASSED SUCCESSFULLY!')
  console.log('========================================================')
}

main()
  .catch((err) => {
    console.error('Test execution failed:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
