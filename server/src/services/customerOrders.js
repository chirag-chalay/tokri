import { prisma } from '../lib/prisma.js'
import { toPublicAssetUrl } from '../utils/formatters.js'

function parseAddress(address) {
  if (!address || typeof address !== 'object') return null
  return address
}

function formatAddress(address) {
  if (!address) return ''
  const parts = [
    address.name,
    address.line1,
    address.line2,
    [address.city, address.state, address.pincode].filter(Boolean).join(', '),
    address.landmark ? `Landmark: ${address.landmark}` : null,
  ].filter(Boolean)
  return parts.join(', ')
}

export function formatCustomerOrder(order) {
  const address = parseAddress(order.address)

  return {
    id: order.id,
    orderNo: order.orderNo,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod:
      order.paymentCollectedAs === 'cash'
        ? 'Cash on delivery'
        : order.paymentCollectedAs === 'qr'
          ? 'Razorpay QR'
          : order.paymentMode === 'online' || order.razorpayPaymentId
            ? 'Razorpay'
            : 'Cash on delivery',
    createdAt: order.createdAt,
    itemsTotal: Number(order.itemsTotal),
    deliveryCharge: Number(order.deliveryCharge),
    deliveryOption: order.deliveryOption || null,
    expectedDeliveryDate: order.expectedDeliveryDate || null,
    handlingCharge: Number(order.handlingCharge),
    smallCartCharge: Number(order.smallCartCharge),
    taxTotal: Number(order.taxTotal || 0),
    cgstTotal: Number(order.cgstTotal || 0),
    sgstTotal: Number(order.sgstTotal || 0),
    igstTotal: Number(order.igstTotal || 0),
    discount: Number(order.discount),
    automaticDiscount: order.automaticDiscount || null,
    couponCode: order.couponCode || null,
    grandTotal: Number(order.grandTotal),
    itemCount: order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
    address: address
      ? {
          label: address.label || 'Delivery',
          name: address.name,
          phone: address.phone,
          formatted: formatAddress(address),
        }
      : null,
    items: (order.items || []).map((item) => ({
      id: item.id,
      slug: item.product?.slug || null,
      name: item.name,
      priceValue: Number(item.priceValue),
      oldPriceValue: item.product?.oldPriceValue ? Number(item.product.oldPriceValue) : null,
      quantity: item.quantity,
      weight: item.weight || item.product?.weight || '',
      image: toPublicAssetUrl(item.image || item.product?.image) || '',
      lineTotal: Number(item.priceValue) * item.quantity,
      discount: Number(item.discount || 0),
      taxAmount: Number(item.taxAmount || 0),
    })),
  }
}

const orderInclude = {
  items: {
    orderBy: { id: 'asc' },
    include: {
      product: {
        select: {
          slug: true,
          name: true,
          image: true,
          priceValue: true,
          oldPriceValue: true,
          weight: true,
          isActive: true,
        },
      },
    },
  },
}

const DEFAULT_PER_PAGE = 10
const MAX_PER_PAGE = 20

export async function listCustomerOrders(customerId, { page = 1, perPage = DEFAULT_PER_PAGE } = {}) {
  const requestedPerPage = Number(perPage) || DEFAULT_PER_PAGE
  const safePerPage = Math.min(MAX_PER_PAGE, Math.max(1, requestedPerPage))
  const where = { customerId }

  const totalCount = await prisma.order.count({ where })
  const totalPages = Math.max(1, Math.ceil(totalCount / safePerPage))
  const safePage = Math.min(Math.max(1, Number(page) || 1), totalPages)
  const skip = (safePage - 1) * safePerPage

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip,
    take: safePerPage,
    include: orderInclude,
  })

  return {
    orders: orders.map(formatCustomerOrder),
    pagination: {
      page: safePage,
      perPage: safePerPage,
      totalCount,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
    },
  }
}

export async function getCustomerOrder(customerId, orderNo) {
  const order = await prisma.order.findFirst({
    where: { customerId, orderNo },
    include: orderInclude,
  })

  if (!order) {
    throw Object.assign(new Error('Order not found.'), { status: 404 })
  }

  return formatCustomerOrder(order)
}
