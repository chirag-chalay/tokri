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
import { calcCartTotals, calcItemTax, publicDeliveryConfig } from '../config/charges.js'
import { clearCart, getCartCheckoutItems } from './cart.js'
import { applyCouponToItems, findActiveCoupon, redeemCoupon } from './coupons.js'
import { PRODUCT_CATEGORY_INCLUDE } from '../utils/catalog.js'
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
  const quantity = Math.max(1, Number(raw?.quantity) || 1)
  if (!slug) throw Object.assign(new Error('Invalid cart item.'), { status: 400 })
  return { slug, quantity }
}

async function resolveCartItems(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw Object.assign(new Error('Your cart is empty.'), { status: 400 })
  }

  const normalized = rawItems.map(normalizeCartItem)
  const slugs = normalized.map((item) => item.slug)
  const products = await prisma.product.findMany({
    where: { slug: { in: slugs }, isActive: true },
    include: PRODUCT_CATEGORY_INCLUDE,
  })

  const productMap = new Map(products.map((product) => [product.slug, product]))
  const items = []

  for (const entry of normalized) {
    const product = productMap.get(entry.slug)
    if (!product) {
      throw Object.assign(new Error(`Product "${entry.slug}" is no longer available.`), { status: 400 })
    }
    items.push({
      product,
      quantity: entry.quantity,
      priceValue: Number(product.priceValue),
      slug: product.slug,
      isTaxable: Boolean(product.isTaxable),
      gstRate: Number(product.gstRate || 0),
      hsnCode: product.hsnCode || '0808',
      category: product.category,
      categories: (product.categoryLinks || []).map((row) => row.category).filter(Boolean),
    })
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

export async function createCheckoutOrder(user, { items: rawItems, addressId, address: addressSnapshot, paymentMode = 'online', couponCode, upiApp, deliveryOption }, meta = {}) {
  const sourceItems =
    Array.isArray(rawItems) && rawItems.length > 0
      ? rawItems
      : await getCartCheckoutItems(user.id)
  const cartItems = await resolveCartItems(sourceItems)
  const address = await resolveAddress(user, addressId, addressSnapshot)
  const { option } = await assertDeliveryOptionEnabled(address.pincode, deliveryOption || address.delivery?.defaultOption)
  const itemsTotal = cartItems.reduce((sum, item) => sum + item.priceValue * item.quantity, 0)
  const decision = await getDeliveryDecision(user.id, option, itemsTotal)
  if (!decision.minimumMet) {
    throw Object.assign(new Error(decision.minimumMessage), { status: 400 })
  }
  const rates = decision.rates
  const isFreeDelivery = decision.freeDeliveryApplied

  const isInterState = !isStoreIntraState(address.state)
  let totals = calcCartTotals(cartItems, rates, 0, isInterState)
  let appliedCoupon = null

  if (String(couponCode || '').trim()) {
    const coupon = await findActiveCoupon(couponCode)
    const applied = await applyCouponToItems(coupon, cartItems, user.id, option, isInterState)
    totals = applied.totals
    appliedCoupon = applied.coupon
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

  const orderItemsData = cartItems.map((entry) => {
    const itemTax = calcItemTax(entry, isInterState)
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
      taxAmount: itemTax.taxAmount,
      cgstAmount: itemTax.cgstAmount,
      sgstAmount: itemTax.sgstAmount,
      igstAmount: itemTax.igstAmount,
    }
  })

  const { deliveryPartnerId, ...deliveryFields } = delivery

  const order = await prisma.order.create({
    data: {
      orderNo,
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

  if (appliedCoupon) {
    await redeemCoupon({ coupon: appliedCoupon, customerId: user.id, orderId: order.id }).catch((error) => {
      console.error('Failed to record coupon use:', error)
    })
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
        console.error('UPI intent was not created:', {
          orderNo,
          message: intentError,
          razorpayStatus: error.razorpayStatus,
          razorpayCode: error.razorpayCode,
        })
      }
    }
  }

  return {
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

  await clearCart(user.id).catch((error) => console.error('Failed to clear cart:', error))
  notifyOrderStatus(updated, 'paid').catch((error) => console.error('Failed to send push:', error))
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
      console.error('Razorpay reconcile failed:', order.orderNo, error.message)
    }
  }
  return recovered
}

export async function markOnlineOrderPaidFromWebhook({ orderNo, razorpayOrderId, paymentId }) {
  let order = null
  if (orderNo) order = await prisma.order.findUnique({ where: { orderNo } })
  if (!order && razorpayOrderId) {
    order = await prisma.order.findFirst({ where: { razorpayOrderId } })
  }
  if (!order || order.paymentMode !== 'online') return null
  if (order.paymentStatus === 'paid') return order

  const customer = order.customerId
    ? await prisma.customer.findUnique({ where: { id: order.customerId } })
    : null

  return markOnlineOrderPaid(
    { id: order.customerId, phone: customer?.phone || '', name: customer?.name || '' },
    order,
    paymentId,
  )
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
    await markOnlineOrderPaid(user, order, payment.id)
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

  await clearCart(user.id).catch((error) => console.error('Failed to clear cart:', error))
  notifyOrderStatus(order, order.status || 'pending').catch((error) =>
    console.error('Failed to send push:', error),
  )
  notifyConfirmedOrder(order, { phone: user.phone, name: user.name })

  return { orderNo: order.orderNo, paymentStatus: order.paymentStatus, status: order.status }
}
