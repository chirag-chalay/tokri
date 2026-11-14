import { createAppTrackingContext, appPurchasePayload, isCapturedAppPayment } from './appTrackingPurchase.js'
import { captureTrackingContext, enqueuePurchase, purchaseSummary, purchaseIdentity } from './trackingPurchase.js'
import { logError } from '../monitoring/database.js'
import { subtotal } from '../utils/money.js'
import { calculateCheckoutPricing } from './pricing.js'
import { prisma } from '../lib/prisma.js'
import {
  captureRazorpayPayment,
  createRazorpayOrder,
  createUpiIntentPayment,
  fetchRazorpayPayment,
  getPublicPaymentConfig,
  listRazorpayOrderPayments,
  listRazorpayOrdersByReceipt,
  verifyRazorpayPayment,
} from './razorpay.js'
import { listAddresses, snapshotCurrentAddress } from './addresses.js'
import { publicDeliveryConfig } from '../config/charges.js'
import { clearCart, getCartCheckoutItems } from './cart.js'
import { redeemCoupon } from './coupons.js'
import { PRODUCT_CATEGORY_INCLUDE, productCategoryList } from '../utils/catalog.js'
import { formatProduct, toPublicAssetUrl } from '../utils/formatters.js'
import { notifyOrderStatus } from './push.js'
import { notifyConfirmedOrder } from './msg91.js'
import { assignmentForPincode, assertDeliveryOptionEnabled, expectedDeliveryDate } from './delivery.js'
import { getCustomerFreeDeliveryStatus } from './freeDelivery.js'
import { getDeliveryDecision } from './deliveryQuote.js'

export function isStoreIntraState(customerState) {
  if (!customerState) return true
  const norm = String(customerState).trim().toLowerCase()
  return (
    norm === 'dl' ||
    norm === 'delhi' ||
    norm.includes('delhi') ||
    norm.includes('nct')
  )
}

function parseAddresses(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  return []
}

function buildOrderNo() {
  const stamp = Date.now().toString().slice(-8)
  const rand = Math.floor(Math.random() * 900 + 100)
  return `TKR${stamp}${rand}`
}

function normalizeCartItem(raw) {
  const slug = String(raw?.id || raw?.slug || '').trim()
  const quantity = Number(raw?.quantity ?? 1)
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 10000) throw Object.assign(new Error('Invalid product quantity.'), { status: 400 })
  if (!slug) throw Object.assign(new Error('Invalid cart item.'), { status: 400 })
  return { slug, quantity }
}

function formatUnavailableCartItem(entry, product) {
  if (!product) {
    return {
      slug: entry.slug,
      id: entry.slug,
      name: entry.slug,
      image: null,
      weight: null,
      quantity: entry.quantity,
      categoryId: null,
    }
  }
  const categories = productCategoryList(product)
  const primary = categories[0] || null
  return {
    slug: product.slug,
    id: product.slug,
    name: product.name,
    image: toPublicAssetUrl(product.image),
    weight: product.weight || null,
    quantity: entry.quantity,
    categoryId: primary?.slug || null,
  }
}

function toResolvedCartItem(product, quantity) {
  return {
    product,
    quantity,
    priceValue: Number(product.priceValue),
    slug: product.slug,
    isTaxable: Boolean(product.isTaxable),
    gstRate: Number(product.gstRate || 0),
    hsnCode: product.hsnCode || '0808',
    category: product.category,
    categories: (product.categoryLinks || []).map((row) => row.category).filter(Boolean),
  }
}

/** Split cart lines into active (billable) vs inactive/missing (not billed). */
export async function partitionCartItems(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return { items: [], unavailableItems: [] }
  }

  const normalized = rawItems.map(normalizeCartItem)
  const slugs = normalized.map((item) => item.slug)
  const products = await prisma.product.findMany({
    where: { slug: { in: slugs } },
    include: PRODUCT_CATEGORY_INCLUDE,
  })
  const productMap = new Map(products.map((product) => [product.slug, product]))

  const items = []
  const unavailableItems = []
  for (const entry of normalized) {
    const product = productMap.get(entry.slug)
    if (!product || !product.isActive) {
      unavailableItems.push(formatUnavailableCartItem(entry, product))
      continue
    }
    items.push(toResolvedCartItem(product, entry.quantity))
  }
  return { items, unavailableItems }
}

/** Same-category active products for OOS suggestions (max 4). */
export async function suggestionsForUnavailable(unavailableItems, excludeSlugs = [], limit = 4) {
  if (!unavailableItems?.length) return []

  const categorySlugs = [
    ...new Set(unavailableItems.map((item) => item.categoryId).filter(Boolean)),
  ]
  const categories = categorySlugs.length
    ? await prisma.category.findMany({ where: { slug: { in: categorySlugs } }, select: { id: true } })
    : []
  const categoryIds = categories.map((row) => row.id)
  if (!categoryIds.length) return []

  const blocked = new Set([
    ...excludeSlugs,
    ...unavailableItems.map((item) => item.slug),
  ].filter(Boolean))

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      slug: blocked.size ? { notIn: [...blocked] } : undefined,
      OR: [
        { categoryId: { in: categoryIds } },
        { categoryLinks: { some: { categoryId: { in: categoryIds } } } },
      ],
    },
    include: PRODUCT_CATEGORY_INCLUDE,
    orderBy: [{ isBestSeller: 'desc' }, { sortOrder: 'asc' }],
    take: Math.max(1, Math.min(Number(limit) || 4, 8)),
  })
  return products.map(formatProduct)
}

export async function resolveCartItems(rawItems, { allowPartial = false } = {}) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw Object.assign(new Error('Your cart is empty.'), { status: 400 })
  }

  const { items, unavailableItems } = await partitionCartItems(rawItems)
  if (!items.length) {
    throw Object.assign(
      new Error(
        unavailableItems.length === 1
          ? `Product "${unavailableItems[0].slug}" is no longer available.`
          : 'Those products are no longer available.',
      ),
      { status: 400, unavailableItems },
    )
  }
  if (!allowPartial && unavailableItems.length) {
    throw Object.assign(
      new Error(`Product "${unavailableItems[0].slug}" is no longer available.`),
      { status: 400, unavailableItems },
    )
  }
  return items
}

async function resolveAddress(user, addressId, addressSnapshot) {
  if (String(addressId) === 'current') {
    return await snapshotCurrentAddress(user, addressSnapshot)
  }
  const addresses = await listAddresses(user.id)
  const address = addresses.find((item) => item.id === addressId)
  if (!address) {
    throw Object.assign(new Error('Please select a valid delivery address.'), { status: 400 })
  }
  return address
}

export async function getCheckoutConfig(customer) {
  const [payment, settings, freeDelivery] = await Promise.all([
    getPublicPaymentConfig(),
    prisma.setting.findUnique({ where: { id: 1 } }),
    customer?.id ? getCustomerFreeDeliveryStatus(customer.id) : null,
  ])
  return {
    ...payment,
    delivery: publicDeliveryConfig(settings),
    freeDelivery: freeDelivery || { quota: 3, used: 0, remaining: 0, isEligible: false },
  }
}

export async function createCheckoutOrder(user, { items: rawItems, addressId, address: addressSnapshot, paymentMode = 'online', couponCode, upiApp, deliveryOption, expectedGrandTotal, tracking }, meta = {}) {
  const sourceItems =
    Array.isArray(rawItems) && rawItems.length > 0
      ? rawItems
      : await getCartCheckoutItems(user.id)
  // Soft-skip inactive lines so remaining in-stock items can still check out.
  const cartItems = await resolveCartItems(sourceItems, { allowPartial: true })
  const address = await resolveAddress(user, addressId, addressSnapshot)
  const { option } = await assertDeliveryOptionEnabled(address.pincode, deliveryOption || address.delivery?.defaultOption)
  const itemsTotal = subtotal(cartItems)
  const decision = await getDeliveryDecision(user.id, option, itemsTotal)
  if (!decision.minimumMet) {
    throw Object.assign(new Error(decision.minimumMessage), { status: 400 })
  }
  const rates = decision.rates
  const isFreeDelivery = decision.freeDeliveryApplied

  const isInterState = !isStoreIntraState(address.state)
  const { totals, coupon: appliedCoupon } = await calculateCheckoutPricing(cartItems, rates, {
    customerId: user.id, couponCode, isInterState,
  })

  if (expectedGrandTotal != null && Number(expectedGrandTotal) !== totals.grandTotal) {
    throw Object.assign(new Error('Your order total changed. Please review the updated total before paying.'), { status: 409, code: 'QUOTE_CHANGED', totals })
  }
  const paymentConfig = await getPublicPaymentConfig()
  const requestedMode = String(paymentMode || '').toLowerCase() === 'cod' ? 'cod' : 'online'
  const razorpayOn = Boolean(paymentConfig.razorpay?.enabled)
  const codOn = paymentConfig.codEnabled !== false

  if (requestedMode === 'online' && !razorpayOn) {
    throw Object.assign(
      new Error('Online payment is not available. Choose cash on delivery or enable Razorpay in admin.'),
      { status: 400, code: 'RAZORPAY_NOT_CONFIGURED' },
    )
  }
  if (requestedMode === 'cod' && !codOn) {
    throw Object.assign(new Error('Cash on delivery is not available for this order.'), { status: 400 })
  }
  if (!razorpayOn && !codOn) {
    throw Object.assign(new Error('Checkout is temporarily unavailable. Enable a payment method in admin.'), {
      status: 400,
    })
  }

  const useRazorpay = requestedMode === 'online'
  const delivery = await assignmentForPincode(address.pincode)

  const orderNo = buildOrderNo()
  let razorpayOrderId = null

  if (useRazorpay) {
    const razorpayOrder = await createRazorpayOrder({
      amountInr: totals.grandTotal,
      receipt: orderNo,
      notes: { orderNo, customerId: user.id },
    })
    razorpayOrderId = razorpayOrder.id
  }

  const orderItemsData = cartItems.map((entry, index) => {
    const itemTax = totals.lineItems[index]
    return {
      productId: entry.product.id,
      name: entry.product.name,
      priceValue: entry.priceValue,
      quantity: entry.quantity,
      image: entry.product.image,
      weight: entry.product.weight,
      hsnCode: entry.hsnCode || '0808',
      isTaxable: Boolean(entry.isTaxable),
      gstRate: entry.gstRate || 0,
      discount: itemTax.discount,
      taxAmount: itemTax.taxAmount,
      cgstAmount: itemTax.cgstAmount,
      sgstAmount: itemTax.sgstAmount,
      igstAmount: itemTax.igstAmount,
    }
  })

  // Native tracking is optional and never controls order creation or price calculation.
  const trackingContext = captureTrackingContext(tracking, meta) || createAppTrackingContext(tracking, meta.appPlatform, totals, orderItemsData, cartItems, meta.appBuild)

  const { deliveryPartnerId, ...deliveryFields } = delivery

  const order = await prisma.$transaction(async (tx) => {
    if (appliedCoupon) {
      await tx.$queryRaw`SELECT id FROM Coupon WHERE id = ${appliedCoupon.id} FOR UPDATE`
      const fresh = await calculateCheckoutPricing(cartItems, rates, { customerId: user.id, couponCode: appliedCoupon.code, isInterState, db: tx })
      if (fresh.totals.grandTotal !== totals.grandTotal || JSON.stringify(fresh.totals.lineItems) !== JSON.stringify(totals.lineItems)) throw Object.assign(new Error('Your order total changed. Please review it before paying.'), { status: 409, code: 'QUOTE_CHANGED' })
    }
    const created = await tx.order.create({
      data: {
        orderNo,
        ...(trackingContext ? { trackingContext } : {}),
        customer: { connect: { id: user.id } },
        status: 'pending',
        paymentStatus: 'pending',
        paymentMode: requestedMode,
        itemsTotal: totals.itemsTotal,
        deliveryCharge: totals.deliveryCharge,
        handlingCharge: totals.handlingCharge,
        smallCartCharge: totals.smallCartCharge,
        discount: totals.discount,
        taxTotal: totals.taxTotal,
        cgstTotal: totals.cgstTotal,
        sgstTotal: totals.sgstTotal,
        igstTotal: totals.igstTotal,
        isInterState,
        couponCode: appliedCoupon?.code || null,
        deliveryOption: option,
        expectedDeliveryDate: expectedDeliveryDate(option),
        freeDeliveryApplied: isFreeDelivery,
        grandTotal: totals.grandTotal,
        address,
        razorpayOrderId,
        ...deliveryFields,
        ...(deliveryPartnerId ? { deliveryPartner: { connect: { id: deliveryPartnerId } } } : {}),
        items: {
          create: orderItemsData,
        },
      },
      include: { items: true },
    })
    if (appliedCoupon) await redeemCoupon({ coupon: appliedCoupon, customerId: user.id, orderId: created.id }, tx)
    return created
  })

  if (order.trackingContext?.source === 'app') {
    prisma.trackingPurchaseLookup?.upsert({ where: { id: purchaseIdentity(order.id) }, create: { id: purchaseIdentity(order.id), orderId: order.id }, update: {} }).catch(() => console.error('Tracking lookup index unavailable'))
  }

  let intent = null
  let intentError = null
  const directUpi = useRazorpay && ['gpay', 'phonepe', 'paytm', 'cred', 'amazon', 'bhim', 'upi'].includes(upiApp)
  if (directUpi) {
    const contact = paymentPhone(user, address)
    if (contact.length !== 10) {
      intentError = 'A 10-digit phone number is required for UPI.'
    } else {
      try {
        intent = await createUpiIntentPayment({
          orderId: razorpayOrderId,
          amountPaise: Math.round(totals.grandTotal * 100),
          contact,
          email: `pay.${contact}@tokriii.com`,
          description: `Order ${orderNo}`,
          orderNo,
          ip: meta.ip,
          userAgent: meta.userAgent,
        })
      } catch (error) {
        intentError = error.message || 'UPI could not be started.'
        logError(error, 'upi-intent')
      }
    }
  }

  return {
    totals,
    ...(order.trackingContext?.source === 'web' ? { trackingPurchase: purchaseSummary({ ...order, items: order.items.map((item) => ({ ...item, product: { slug: cartItems.find((entry) => entry.product.id === item.productId)?.slug } })) }) } : {}),
    order: {
      id: order.id,
      orderNo: order.orderNo,
      grandTotal: Number(order.grandTotal),
      paymentMode: requestedMode,
      expectedDeliveryDate: order.expectedDeliveryDate,
    },
    razorpay: useRazorpay
      ? {
          keyId: paymentConfig.razorpay.keyId,
          orderId: razorpayOrderId,
          amount: Math.round(totals.grandTotal * 100),
          currency: 'INR',
          name: 'Tokriii',
          description: `Order ${orderNo}`,
          prefill: {
            name: address.name,
            contact: address.phone,
          },
          upiApp: directUpi ? upiApp : undefined,
        }
      : null,
    intent,
    intentError,
  }
}

function paymentPhone(user, address) {
  const raw = address?.phone || user?.phone || ''
  return String(raw).replace(/\D/g, '').slice(-10)
}

async function markOnlineOrderPaid(user, order, razorpayPaymentId) {
  if (order.paymentStatus === 'paid' && order.razorpayPaymentId) return order

  const result = await prisma.order.updateMany({
    where: { id: order.id, paymentStatus: { not: 'paid' } },
    data: {
      paymentStatus: 'paid',
      status: order.status === 'pending' ? 'paid' : order.status,
      paymentCollectedAs: 'online',
      razorpayPaymentId,
    },
  })

  const updated = await prisma.order.findUnique({ where: { id: order.id } })
  if (result.count === 0) return updated
  enqueuePurchase(updated.id).catch(() => console.error('Tracking purchase enqueue failed'))

  await clearCart(user.id).catch((error) => logError(error, 'background'))
  notifyOrderStatus(updated, 'paid').catch((error) => logError(error, 'background'))
  notifyConfirmedOrder(updated, { phone: user.phone, name: user.name })

  return updated
}

function expectedAmountPaise(order) {
  return Math.round(Number(order.grandTotal) * 100)
}

function pickSuccessfulPayment(payments, expectedPaise) {
  const list = Array.isArray(payments) ? payments : []
  const matching = list.filter((payment) => Number(payment.amount) === expectedPaise)
  return (
    matching.find((payment) => payment.status === 'captured') ||
    matching.find((payment) => payment.status === 'authorized') ||
    null
  )
}

async function captureIfNeeded(payment, expectedPaise) {
  if (!payment) return payment
  if (payment.status === 'captured') return payment
  if (payment.status !== 'authorized') return payment
  try {
    return await captureRazorpayPayment(payment.id, expectedPaise, payment.currency || 'INR')
  } catch (error) {
    const latest = await fetchRazorpayPayment(payment.id)
    if (latest.status === 'captured') return latest
    throw error
  }
}

export async function reconcileOnlineOrderFromRazorpay(order) {
  if (!order) return { status: 'missing', order: null }
  if (order.paymentStatus === 'paid') return { status: 'paid', order }
  if (order.paymentMode !== 'online') {
    return { status: order.paymentStatus || 'pending', order }
  }

  let razorpayOrderId = String(order.razorpayOrderId || '').trim()
  if (!razorpayOrderId) {
    const remoteOrders = await listRazorpayOrdersByReceipt(order.orderNo)
    razorpayOrderId = remoteOrders[0]?.id || ''
    if (razorpayOrderId) {
      await prisma.order.update({
        where: { id: order.id },
        data: { razorpayOrderId },
      })
      order = { ...order, razorpayOrderId }
    }
  }
  if (!razorpayOrderId) return { status: order.paymentStatus || 'pending', order }

  const expected = expectedAmountPaise(order)
  const payments = await listRazorpayOrderPayments(razorpayOrderId)
  let payment = pickSuccessfulPayment(payments, expected)
  if (!payment) return { status: 'pending', order }

  payment = await captureIfNeeded(payment, expected)
  if (payment.status !== 'captured' && payment.status !== 'authorized') {
    return { status: 'pending', order }
  }

  const customer = order.customerId
    ? await prisma.customer.findUnique({ where: { id: order.customerId } })
    : null
  const updated = await markOnlineOrderPaid(
    { id: order.customerId, phone: customer?.phone || '', name: customer?.name || '' },
    order,
    payment.id,
  )
  recordCapturedAppPurchase(updated, payment)
  return { status: 'paid', order: updated }
}

export async function syncOnlineOrderPayment(user, { orderNo }) {
  const order = await prisma.order.findFirst({
    where: { orderNo, customerId: user.id },
  })
  if (!order) throw Object.assign(new Error('Order not found.'), { status: 404 })
  return reconcileOnlineOrderFromRazorpay(order)
}

export async function getCheckoutOrderStatus(user, { orderNo }) {
  let order = await prisma.order.findFirst({
    where: { orderNo, customerId: user.id },
  })
  if (!order) throw Object.assign(new Error('Order not found.'), { status: 404 })

  if (order.paymentMode === 'online' && order.paymentStatus !== 'paid') {
    const result = await reconcileOnlineOrderFromRazorpay(order)
    if (result.order) order = result.order
  }

  return {
    orderNo: order.orderNo,
    paymentMode: order.paymentMode,
    paymentStatus: order.paymentStatus,
    status: order.status,
    grandTotal: order.grandTotal,
    expectedDeliveryDate: order.expectedDeliveryDate,
  }
}

export async function completeRazorpayCallback({ razorpayOrderId, razorpayPaymentId, razorpaySignature, orderNo }) {
  if (razorpayOrderId && razorpayPaymentId && razorpaySignature) {
    await verifyRazorpayPayment({ razorpayOrderId, razorpayPaymentId, razorpaySignature })
  }
  const marked = await markOnlineOrderPaidFromWebhook({
    orderNo,
    razorpayOrderId,
    paymentId: razorpayPaymentId,
  })
  return marked
}

export async function recoverPendingOnlinePayments({ lookbackHours = 24, limit = 20 } = {}) {
  const since = new Date(Date.now() - lookbackHours * 60 * 60 * 1000)
  const orders = await prisma.order.findMany({
    where: {
      paymentMode: 'online',
      paymentStatus: { not: 'paid' },
      createdAt: { gte: since },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  const recovered = []
  for (const order of orders) {
    try {
      const result = await reconcileOnlineOrderFromRazorpay(order)
      if (result.status === 'paid') recovered.push(result.order.orderNo)
    } catch (error) {
      logError(error, 'payment-recovery')
    }
  }
  return recovered
}

export async function markOnlineOrderPaidFromWebhook({ orderNo, razorpayOrderId, paymentId, capturedPayment }) {
  let order = null
  if (orderNo) order = await prisma.order.findUnique({ where: { orderNo } })
  if (!order && razorpayOrderId) {
    order = await prisma.order.findFirst({ where: { razorpayOrderId } })
  }
  if (!order || order.paymentMode !== 'online') return null
  if (order.paymentStatus === 'paid') {
    recordCapturedAppPurchase(order, capturedPayment)
    return order
  }

  const customer = order.customerId
    ? await prisma.customer.findUnique({ where: { id: order.customerId } })
    : null

  const updated = await markOnlineOrderPaid(
    { id: order.customerId, phone: customer?.phone || '', name: customer?.name || '' },
    order,
    paymentId,
  )
  recordCapturedAppPurchase(updated, capturedPayment)
  return updated
}

export async function confirmCheckoutPayment(user, { orderNo, razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  const order = await prisma.order.findFirst({
    where: { orderNo, customerId: user.id },
  })

  if (!order) throw Object.assign(new Error('Order not found.'), { status: 404 })
  if (order.paymentStatus === 'paid') {
    return { orderNo: order.orderNo, paymentStatus: order.paymentStatus }
  }

  if (order.razorpayOrderId !== razorpayOrderId) {
    throw Object.assign(new Error('Payment details do not match this order.'), { status: 400 })
  }

  await verifyRazorpayPayment({ razorpayOrderId, razorpayPaymentId, razorpaySignature })
  const updated = await markOnlineOrderPaid(user, order, razorpayPaymentId)
  return { orderNo: updated.orderNo, paymentStatus: updated.paymentStatus }
}

export async function startUpiIntent(user, { orderNo }, meta = {}) {
  const order = await prisma.order.findFirst({
    where: { orderNo, customerId: user.id },
  })
  if (!order) throw Object.assign(new Error('Order not found.'), { status: 404 })
  if (order.paymentStatus === 'paid') {
    throw Object.assign(new Error('This order is already paid.'), { status: 400 })
  }
  if (order.paymentMode !== 'online' || !order.razorpayOrderId) {
    throw Object.assign(new Error('This order is not waiting for an online payment.'), { status: 400 })
  }

  const address = order.address && typeof order.address === 'object' ? order.address : {}
  const contact = paymentPhone(user, address)
  if (contact.length !== 10) {
    throw Object.assign(new Error('A 10-digit phone number is required for UPI.'), { status: 400 })
  }

  const intent = await createUpiIntentPayment({
    orderId: order.razorpayOrderId,
    amountPaise: Math.round(Number(order.grandTotal) * 100),
    contact,
    email: `pay.${contact}@tokriii.com`,
    description: `Order ${order.orderNo}`,
    orderNo: order.orderNo,
    ip: meta.ip,
    userAgent: meta.userAgent,
  })

  return { orderNo: order.orderNo, paymentId: intent.paymentId, intentUrl: intent.intentUrl }
}

export async function syncIntentPayment(user, { orderNo, razorpayPaymentId }) {
  const order = await prisma.order.findFirst({
    where: { orderNo, customerId: user.id },
  })
  if (!order) throw Object.assign(new Error('Order not found.'), { status: 404 })
  if (order.paymentStatus === 'paid') return { status: 'paid', orderNo: order.orderNo }
  if (!razorpayPaymentId) {
    throw Object.assign(new Error('Payment details do not match this order.'), { status: 400 })
  }

  let payment = await fetchRazorpayPayment(razorpayPaymentId)
  const expected = expectedAmountPaise(order)
  if (payment.order_id !== order.razorpayOrderId || Number(payment.amount) !== expected) {
    throw Object.assign(new Error('Payment details do not match this order.'), { status: 400 })
  }

  if (payment.status === 'authorized') {
    payment = await captureIfNeeded(payment, expected)
  }

  if (payment.status === 'captured') {
    const updated = await markOnlineOrderPaid(user, order, payment.id)
    recordCapturedAppPurchase(updated, payment)
    return { status: 'paid', orderNo: order.orderNo }
  }

  if (payment.status === 'failed') {
    return {
      status: 'failed',
      message: payment.error_description || payment.error_reason || 'Payment failed. Please try again.',
    }
  }

  return { status: 'pending', orderNo: order.orderNo }
}

export async function confirmCodOrder(user, { orderNo }) {
  const order = await prisma.order.findFirst({
    where: { orderNo, customerId: user.id },
  })

  if (!order) throw Object.assign(new Error('Order not found.'), { status: 404 })

  if (order.paymentMode !== 'cod') throw Object.assign(new Error('This order is not cash on delivery.'), { status: 400 })
  if (order.trackingContext?.source === 'app') {
    await recordAppConfirmation(order.id, 'cod').catch(() => console.error('App purchase confirmation recording failed'))
  } else if (order.trackingContext && !order.trackingContext.codConfirmed) {
    await prisma.order.update({ where: { id: order.id }, data: { trackingContext: { ...order.trackingContext, codConfirmed: true, confirmedAt: Date.now() } } })
  }
  enqueuePurchase(order.id).catch(() => console.error('Tracking purchase enqueue failed'))
  await clearCart(user.id).catch((error) => logError(error, 'background'))
  notifyOrderStatus(order, order.status || 'pending').catch((error) =>
    logError(error, 'background'),
  )
  notifyConfirmedOrder(order, { phone: user.phone, name: user.name })

  return { orderNo: order.orderNo, paymentStatus: order.paymentStatus, status: order.status }
}

// Tracking cannot make a successful payment fail. Verify all capture facts first.
function recordCapturedAppPurchase(order, payment) {
  if (order?.trackingContext?.source !== 'app' || !isCapturedAppPayment(order, payment)) return
  recordAppConfirmation(order.id, 'captured').catch(() => console.error('App purchase confirmation recording failed'))
}

// Lock the order so repeated confirmations keep their original timestamp.
async function recordAppConfirmation(orderId, kind) {
  await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM \`Order\` WHERE id = ${orderId} FOR UPDATE`
    const order = await tx.order.findUnique({ where: { id: orderId } })
    const context = order?.trackingContext
    if (context?.source !== 'app' || context.confirmedAt) return
    if (kind === 'cod' && order.paymentMode !== 'cod') return
    if (kind === 'captured' && (order.paymentMode !== 'online' || order.paymentStatus !== 'paid')) return
    await tx.order.update({ where: { id: orderId }, data: { trackingContext: { ...context, confirmedAt: Date.now(), ...(kind === 'cod' ? { codConfirmed: true } : { captured: true }) } } })
  })
}

// Only recent app-origin orders belonging to a verified bearer customer qualify.
export async function getAppTrackingPurchases(user, consentId, { db = prisma, fetchPayment = fetchRazorpayPayment, confirm = recordAppConfirmation, now = Date.now, cursor } = {}) {
  if (!/^[a-zA-Z0-9_-]{16,80}$/.test(consentId || '')) return { purchases: [], nextCursor: null }
  const orders = await db.order.findMany({
    where: { customerId: user.id, createdAt: { gte: new Date(now() - 90 * 86400000) } },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 30,
    ...(/^[a-zA-Z0-9_-]{1,80}$/.test(cursor || '') ? { cursor: { id: cursor }, skip: 1 } : {}),
  })
  const purchases = []
  for (let order of orders) {
    const context = order.trackingContext
    if (order.customerId !== user.id || context?.source !== 'app' || context.consentId !== consentId || context.googleDispatch) continue
    if (order.paymentMode === 'online' && order.paymentStatus === 'paid' && !context.confirmedAt && order.razorpayPaymentId) {
      try {
        const payment = await fetchPayment(order.razorpayPaymentId)
        if (isCapturedAppPayment(order, payment)) {
          await confirm(order.id, 'captured')
          order = await db.order.findUnique({ where: { id: order.id } })
        }
      } catch { continue }
    }
    if (!order || order.customerId !== user.id) continue
    const payload = appPurchasePayload(order, consentId)
    if (payload) purchases.push({ ...payload, orderKey: order.id })
  }
  return { purchases, nextCursor: orders.length === 30 ? orders.at(-1).id : null }
}
