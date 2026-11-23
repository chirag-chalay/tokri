import { ForbiddenError } from 'adminjs'
import { prisma } from '../lib/prisma.js'
import { hasPermission } from './permissions.js'
import { getCartReadOnly } from '../services/cart.js'

const ORDER_STATUSES = ['pending', 'paid', 'packed', 'shipped', 'delivered', 'cancelled']
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded']
const SORT_OPTIONS = {
  date_desc: { createdAt: 'desc' },
  date_asc: { createdAt: 'asc' },
  total_desc: { grandTotal: 'desc' },
  total_asc: { grandTotal: 'asc' },
}
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function toPaise(value) {
  return Math.round((Number(value) || 0) * 100)
}

function parseIstStart(dateStr) {
  if (!DATE_RE.test(String(dateStr || ''))) return null
  const parsed = new Date(`${dateStr}T00:00:00+05:30`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

/**
 * Re-verify the admin user's active status and required permissions from MySQL
 * so revoked permissions or deactivated accounts cannot access customer insights.
 */
export async function assertFreshPermissions(currentAdmin, keys, db = prisma) {
  if (!currentAdmin?.id) throw new ForbiddenError('Not authorized.')
  const user = await db.user.findUnique({
    where: { id: currentAdmin.id },
    include: { permissions: true },
  })
  if (!user?.isActive || !keys.every((key) => hasPermission(user, key))) {
    throw new ForbiddenError('Not authorized.')
  }
  return user
}

/**
 * Batch-compute active cart line count and item subtotal for a page of customers.
 */
export async function customerListExtras(rows = [], db = prisma) {
  const ids = rows.map((row) => row?.id).filter(Boolean)
  const map = new Map()
  if (!ids.length) return map

  for (const id of ids) {
    map.set(id, { cartItemCount: 0, cartTotal: '₹0.00' })
  }

  const carts = await db.cart.findMany({
    where: { customerId: { in: ids } },
    select: {
      customerId: true,
      items: {
        select: {
          quantity: true,
          product: {
            select: {
              priceValue: true,
              isActive: true,
            },
          },
        },
      },
    },
  })

  for (const cart of carts) {
    let activeLines = 0
    let totalPaise = 0
    for (const item of cart.items || []) {
      if (!item.product?.isActive) continue
      activeLines += 1
      totalPaise += toPaise(item.product.priceValue) * (Number(item.quantity) || 0)
    }
    map.set(cart.customerId, {
      cartItemCount: activeLines,
      cartTotal: `₹${(totalPaise / 100).toFixed(2)}`,
    })
  }

  return map
}

export async function getCustomerOrderHistory(customerId, query = {}, db = prisma) {
  const status = ORDER_STATUSES.includes(query.status) ? query.status : 'all'
  const paymentStatus = PAYMENT_STATUSES.includes(query.paymentStatus) ? query.paymentStatus : 'all'
  const fromStr = DATE_RE.test(String(query.from || '')) ? String(query.from) : ''
  const toStr = DATE_RE.test(String(query.to || '')) ? String(query.to) : ''
  const fromDate = parseIstStart(fromStr)
  const toStart = parseIstStart(toStr)
  const toExclusive = toStart ? new Date(toStart.getTime() + 24 * 60 * 60 * 1000) : null
  const sort = Object.hasOwn(SORT_OPTIONS, query.sort) ? query.sort : 'date_desc'
  const rawPerPage = Number.parseInt(query.perPage, 10)
  const perPage = [10, 25, 50].includes(rawPerPage) ? rawPerPage : 10
  const rawPage = Number.parseInt(query.page, 10)
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1

  const where = { customerId }
  if (status !== 'all') where.status = status
  if (paymentStatus !== 'all') where.paymentStatus = paymentStatus
  if (fromDate || toExclusive) {
    where.createdAt = {}
    if (fromDate) where.createdAt.gte = fromDate
    if (toExclusive) where.createdAt.lt = toExclusive
  }

  const canReuseEmailFromPage =
    sort === 'date_desc' && page === 1 && status === 'all' && paymentStatus === 'all' && !fromDate && !toExclusive

  const [customer, grouped, orders, total, latestOrderForEmail] = await Promise.all([
    db.customer.findUnique({
      where: { id: customerId },
      select: { id: true, name: true, phone: true },
    }),
    db.order.groupBy({
      by: ['status', 'paymentStatus'],
      where: { customerId },
      _count: { _all: true },
      _sum: { grandTotal: true },
      _max: { createdAt: true },
    }),
    db.order.findMany({
      where,
      orderBy: SORT_OPTIONS[sort],
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        orderNo: true,
        createdAt: true,
        status: true,
        paymentStatus: true,
        paymentMode: true,
        razorpayPaymentId: true,
        razorpayOrderId: true,
        grandTotal: true,
        address: true,
        items: {
          select: {
            name: true,
            quantity: true,
            weight: true,
            priceValue: true,
          },
        },
      },
    }),
    db.order.count({ where }),
    canReuseEmailFromPage
      ? Promise.resolve(null)
      : db.order.findFirst({
          where: { customerId },
          orderBy: { createdAt: 'desc' },
          select: { address: true },
        }),
  ])

  let totalOrders = 0
  let totalOrderPaise = 0
  let completedPaise = 0
  let completedCount = 0
  let cancelledRefundedPaise = 0
  let cancelledRefundedCount = 0
  let latestOrderAt = null

  for (const row of grouped) {
    const count = Number(row._count?._all || 0)
    const sumPaise = toPaise(row._sum?.grandTotal)
    const maxAt = row._max?.createdAt ? new Date(row._max.createdAt) : null

    totalOrders += count
    if (maxAt && (!latestOrderAt || maxAt > latestOrderAt)) {
      latestOrderAt = maxAt
    }

    const isCancelledOrRefunded = row.status === 'cancelled' || row.paymentStatus === 'refunded'
    if (isCancelledOrRefunded) {
      cancelledRefundedCount += count
      cancelledRefundedPaise += sumPaise
    } else {
      totalOrderPaise += sumPaise
      if (row.status === 'delivered') {
        completedCount += count
        completedPaise += sumPaise
      }
    }
  }

  const emailSource = canReuseEmailFromPage ? orders[0]?.address : latestOrderForEmail?.address
  const email = typeof emailSource?.email === 'string' && emailSource.email.trim()
    ? emailSource.email.trim()
    : null

  return {
    customer: {
      id: customer?.id || customerId,
      name: customer?.name || null,
      phone: customer?.phone || null,
      email,
    },
    summary: {
      totalOrders,
      totalOrderValue: totalOrderPaise / 100,
      completedValue: completedPaise / 100,
      completedCount,
      cancelledRefundedValue: cancelledRefundedPaise / 100,
      cancelledRefundedCount,
      latestOrderAt: latestOrderAt ? latestOrderAt.toISOString() : null,
    },
    orders: orders.map((order) => ({
      id: order.id,
      orderNo: order.orderNo,
      createdAt: order.createdAt.toISOString(),
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMode: order.paymentMode,
      razorpayPaymentId: order.razorpayPaymentId || null,
      razorpayOrderId: order.razorpayOrderId || null,
      grandTotal: Number(order.grandTotal || 0),
      items: (order.items || []).map((item) => ({
        name: item.name,
        quantity: Number(item.quantity || 0),
        weight: item.weight || null,
        priceValue: Number(item.priceValue || 0),
      })),
    })),
    meta: {
      page,
      perPage,
      total,
      status,
      paymentStatus,
      from: fromStr,
      to: toStr,
      sort,
    },
  }
}

export async function viewCustomerOrdersAction(request, _response, context) {
  const record = context.record.toJSON(context.currentAdmin)
  if (String(request.query?.load || '') !== '1') {
    return { record }
  }
  await assertFreshPermissions(context.currentAdmin, ['manageUsers', 'manageOrders'])
  const history = await getCustomerOrderHistory(context.record.id(), request.query || {})
  return { record, history }
}

export async function viewCustomerCartAction(request, _response, context) {
  const record = context.record.toJSON(context.currentAdmin)
  if (String(request.query?.load || '') !== '1') {
    return { record }
  }
  await assertFreshPermissions(context.currentAdmin, ['manageUsers'])
  const cart = await getCartReadOnly(context.record.id())
  const totalQuantity = (cart.items || []).reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0,
  )
  return {
    record,
    cart: {
      ...cart,
      totalQuantity,
    },
  }
}
