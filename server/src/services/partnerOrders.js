import { logError } from '../monitoring/database.js'
import { prisma } from '../lib/prisma.js'
import { cancelOrderPaymentLink, createOrderPaymentLink } from './razorpay.js'
import { toPublicAssetUrl } from '../utils/formatters.js'
import { notifyOrderStatus } from './push.js'

function parseAddress(address) {
  if (!address || typeof address !== 'object') return null
  return address
}

function toCoord(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

/** Single place to change later if auto-delivered should stop. */
export function deliveryPaidUpdate(paymentCollectedAs, paymentId) {
  const data = {
    paymentStatus: 'paid',
    paymentCollectedAs,
    status: 'delivered',
  }
  if (paymentId) data.razorpayPaymentId = paymentId
  return data
}

export function formatPartnerOrder(order) {
  const address = parseAddress(order.address)
  return {
    id: order.id,
    orderNo: order.orderNo,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMode: order.paymentMode || 'cod',
    paymentCollectedAs: order.paymentCollectedAs || null,
    grandTotal: Number(order.grandTotal),
    itemsTotal: Number(order.itemsTotal),
    createdAt: order.createdAt,
    expectedDeliveryDate: order.expectedDeliveryDate || null,
    deliveryOption: order.deliveryOption || null,
    razorpayQrUrl: order.razorpayQrUrl || null,
    razorpayPaymentLinkId: order.razorpayPaymentLinkId || null,
    customerName: order.customer?.name || address?.name || 'Customer',
    customerPhone: order.customer?.phone || address?.phone || '',
    latitude: toCoord(address?.latitude),
    longitude: toCoord(address?.longitude),
    address: address
      ? {
          name: address.name,
          phone: address.phone,
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          landmark: address.landmark,
          latitude: toCoord(address.latitude),
          longitude: toCoord(address.longitude),
        }
      : null,
    items: (order.items || []).map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      priceValue: Number(item.priceValue),
      image: toPublicAssetUrl(item.image) || '',
      weight: item.weight || '',
    })),
  }
}

const partnerOrderInclude = {
  customer: { select: { name: true, phone: true } },
  items: { orderBy: { id: 'asc' } },
}

async function loadAssignedOrder(orderId, partnerId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: partnerOrderInclude,
  })
  if (!order) throw Object.assign(new Error('Order not found.'), { status: 404 })
  if (partnerId && order.deliveryPartnerId !== partnerId) {
    throw Object.assign(new Error('This order is not assigned to you.'), { status: 403 })
  }
  return order
}

function assertCodCollectable(order) {
  if (order.status === 'cancelled') {
    throw Object.assign(new Error('This order was cancelled.'), { status: 400 })
  }
  if (order.paymentMode !== 'cod') {
    throw Object.assign(new Error('This order was not placed as cash on delivery.'), { status: 400 })
  }
}

function sortPartnerOrders(orders) {
  const rank = (order) => {
    if (order.status === 'cancelled') return 2
    if (order.status === 'delivered' || order.paymentStatus === 'paid') return 1
    return 0
  }
  return [...orders].sort((a, b) => {
    const diff = rank(a) - rank(b)
    if (diff !== 0) return diff
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export async function listPartnerOrders(partnerId) {
  // Include cancelled so partners see the order was cancelled (not “vanished”).
  const orders = await prisma.order.findMany({
    where: {
      deliveryPartnerId: partnerId,
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: partnerOrderInclude,
  })
  return sortPartnerOrders(orders).map(formatPartnerOrder)
}

export async function getPartnerOrder(orderId, partnerId) {
  const order = await loadAssignedOrder(orderId, partnerId)
  return formatPartnerOrder(order)
}

async function reloadPartnerOrder(orderId) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: partnerOrderInclude,
  })
}

export async function collectCashForOrder(orderId, { partnerId } = {}) {
  const order = await loadAssignedOrder(orderId, partnerId)
  assertCodCollectable(order)
  if (order.paymentStatus === 'paid') {
    return order
  }

  const result = await prisma.order.updateMany({
    where: {
      id: order.id,
      paymentStatus: { not: 'paid' },
      status: { not: 'cancelled' },
      paymentMode: 'cod',
    },
    data: deliveryPaidUpdate('cash'),
  })

  const updated = (await reloadPartnerOrder(order.id)) || order
  if (result.count > 0) {
    if (order.razorpayPaymentLinkId) {
      await cancelOrderPaymentLink(order.razorpayPaymentLinkId)
    }
    notifyOrderStatus(updated, 'delivered').catch((error) =>
      logError(error, 'background'),
    )
  }
  return updated
}

export async function createOrderPaymentQr(orderId, { partnerId } = {}) {
  const order = await loadAssignedOrder(orderId, partnerId)
  assertCodCollectable(order)
  if (order.paymentStatus === 'paid') {
    return order
  }
  if (order.razorpayPaymentLinkId && order.razorpayQrUrl) {
    return order
  }

  const address = parseAddress(order.address)
  const link = await createOrderPaymentLink({
    amountInr: order.grandTotal,
    orderNo: order.orderNo,
    customer: {
      name: order.customer?.name || address?.name,
      phone: order.customer?.phone || address?.phone,
    },
  })

  return prisma.order.update({
    where: { id: order.id },
    data: {
      razorpayPaymentLinkId: link.id,
      razorpayQrUrl: link.qrUrl || link.shortUrl,
    },
    include: partnerOrderInclude,
  })
}

export async function markOrderPaidByQr({ orderNo, paymentId }) {
  if (!orderNo) return null
  const order = await prisma.order.findUnique({ where: { orderNo } })
  if (!order) return null
  if (order.paymentStatus === 'paid') return order
  if (order.status === 'cancelled') return order

  const result = await prisma.order.updateMany({
    where: {
      id: order.id,
      paymentStatus: { not: 'paid' },
      status: { not: 'cancelled' },
    },
    data: deliveryPaidUpdate('qr', paymentId || order.razorpayPaymentId),
  })

  const updated = await prisma.order.findUnique({ where: { id: order.id } })
  if (result.count > 0 && updated) {
    notifyOrderStatus(updated, 'delivered').catch((error) =>
      logError(error, 'background'),
    )
  }
  return updated
}
