import { prisma } from '../lib/prisma.js'
import { canManage } from './permissions.js'
import { notifyOrderStatus } from '../services/push.js'
import { assertPincodeServiceable, normalizePincode } from '../services/delivery.js'
import { readAdminSearch } from './list-search.js'
import {
  isConfirmedCheckoutOrder,
  sendDeliveryPartnerAssignment,
  sendOrderConfirmation,
} from '../services/msg91.js'

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

export function flattenOrder(order) {
  const address = parseAddress(order.address)
  const customerName = order.customer?.name || address?.name || 'Guest'
  const customerPhone = order.customer?.phone || address?.phone || ''

  return {
    id: order.id,
    orderNo: order.orderNo,
    status: order.status,
    paymentStatus: order.paymentStatus,
    itemsTotal: String(order.itemsTotal),
    deliveryCharge: String(order.deliveryCharge),
    handlingCharge: String(order.handlingCharge),
    smallCartCharge: String(order.smallCartCharge),
    discount: String(order.discount),
    taxTotal: String(order.taxTotal || 0),
    cgstTotal: String(order.cgstTotal || 0),
    sgstTotal: String(order.sgstTotal || 0),
    igstTotal: String(order.igstTotal || 0),
    isInterState: Boolean(order.isInterState),
    grandTotal: String(order.grandTotal),
    couponCode: order.couponCode || '',
    deliveryOption: order.deliveryOption || '',
    expectedDeliveryDate: order.expectedDeliveryDate || null,
    freeDeliveryApplied: Boolean(order.freeDeliveryApplied),
    razorpayOrderId: order.razorpayOrderId || '',
    razorpayPaymentId: order.razorpayPaymentId || '',
    razorpayQrUrl: order.razorpayQrUrl || '',
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    customerName,
    customerPhone,
    contactName: address?.name || customerName,
    contactPhone: address?.phone || customerPhone,
    addressLine1: address?.line1 || '',
    addressLine2: address?.line2 || '',
    addressCity: address?.city || '',
    addressState: address?.state || '',
    addressPincode: address?.pincode || '',
    addressLandmark: address?.landmark || '',
    customerEmail: '',
    addressLabel: address?.label || 'Delivery',
    addressFormatted: formatAddress(address),
    addressJson: JSON.stringify(address || {}),
    deliveryPartnerId: order.deliveryPartnerId || '',
    deliveryPartnerName: order.deliveryPartner?.name || order.deliveryPartnerName || '',
    deliveryPartnerPhone: order.deliveryPartner?.phone || order.deliveryPartnerPhone || '',
    paymentMode: order.paymentMode || (order.razorpayPaymentId ? 'online' : 'cod'),
    paymentCollectedAs: order.paymentCollectedAs || '',
    itemsJson: JSON.stringify(
      (order.items || []).map((item) => ({
        id: item.id,
        name: item.name,
        priceValue: String(item.priceValue),
        quantity: item.quantity,
        weight: item.weight || '',
        image: item.image || '',
        hsnCode: item.hsnCode || '—',
        isTaxable: Boolean(item.isTaxable),
        gstRate: String(item.gstRate || 0),
        taxAmount: String(item.taxAmount || 0),
        cgstAmount: String(item.cgstAmount || 0),
        sgstAmount: String(item.sgstAmount || 0),
        igstAmount: String(item.igstAmount || 0),
        lineTotal: String(Number(item.priceValue) * item.quantity),
      })),
    ),
    paymentMethod:
      order.paymentCollectedAs === 'cash'
        ? 'Cash on delivery'
        : order.paymentCollectedAs === 'qr'
          ? 'Razorpay QR'
          : order.paymentMode === 'online' || order.razorpayPaymentId
            ? 'Razorpay'
            : 'Cash on delivery',
  }
}

async function loadOrder(recordId) {
  return prisma.order.findUnique({
    where: { id: recordId },
    include: {
      customer: { select: { id: true, name: true, phone: true } },
      deliveryPartner: { select: { id: true, name: true, phone: true } },
      items: { orderBy: { id: 'asc' } },
    },
  })
}

export const orderListHandler = {
  isAccessible: canManage('manageOrders'),
  handler: async (request, _response, context) => {
    const { query } = request
    const perPage = Math.min(Number(query.perPage) || 10, 50)
    const page = Number(query.page) || 1
    const searchTerm = readAdminSearch(query)

    const searchOr = searchTerm
      ? [
          { orderNo: { contains: searchTerm } },
          { couponCode: { contains: searchTerm } },
          { deliveryPincode: { contains: searchTerm } },
          { deliveryPartnerName: { contains: searchTerm } },
          { deliveryPartnerPhone: { contains: searchTerm } },
          { razorpayPaymentId: { contains: searchTerm } },
          { razorpayOrderId: { contains: searchTerm } },
          { customer: { is: { name: { contains: searchTerm } } } },
          { customer: { is: { phone: { contains: searchTerm } } } },
          { items: { some: { name: { contains: searchTerm } } } },
          { address: { path: '$.name', string_contains: searchTerm } },
          { address: { path: '$.phone', string_contains: searchTerm } },
          { address: { path: '$.pincode', string_contains: searchTerm } },
        ]
      : null

    const runQuery = async (where) => Promise.all([
      prisma.order.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true, phone: true } },
        },
      }),
      prisma.order.count({ where }),
    ])

    let orders
    let total
    try {
      ;[orders, total] = await runQuery(searchOr ? { OR: searchOr } : {})
    } catch {
      const withoutAddress = searchOr?.filter((clause) => !clause.address) || null
      try {
        ;[orders, total] = await runQuery(withoutAddress ? { OR: withoutAddress } : {})
      } catch {
        orders = []
        total = 0
      }
    }

    const records = orders.map((order) => {
      const address = parseAddress(order.address)
      return context.resource.build({
        id: order.id,
        orderNo: order.orderNo,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMode: order.paymentMode || '',
        razorpayPaymentId: order.razorpayPaymentId || '',
        razorpayOrderId: order.razorpayOrderId || '',
        grandTotal: String(order.grandTotal),
        createdAt: order.createdAt,
        customerName: order.customer?.name || address?.name || 'Guest',
        customerPhone: order.customer?.phone || address?.phone || '',
        deliveryPartnerName: order.deliveryPartnerName || '',
      }).toJSON(context.currentAdmin)
    })

    return {
      meta: { total, perPage, page, direction: 'desc', sortBy: 'createdAt' },
      records,
    }
  },
}

export const orderShowHandler = {
  isAccessible: canManage('manageOrders'),
  isVisible: true,
  handler: async (request, _response, context) => {
    const order = await loadOrder(request.params.recordId)
    if (!order) {
      throw new Error('Order not found')
    }
    return {
      record: context.resource.build(flattenOrder(order)).toJSON(context.currentAdmin),
    }
  },
}

export const orderEditHandler = {
  isAccessible: canManage('manageOrders'),
  isVisible: true,
  before: async (request) => {
    if (request.method === 'post') {
      const payload = request.payload || {}
      request.payload = {
        status: payload.status,
        paymentStatus: payload.paymentStatus,
        deliveryPartnerId: payload.deliveryPartnerId,
        contactName: payload.contactName,
        contactPhone: payload.contactPhone,
        addressLine1: payload.addressLine1,
        addressLine2: payload.addressLine2,
        addressCity: payload.addressCity,
        addressState: payload.addressState,
        addressPincode: payload.addressPincode,
        addressLandmark: payload.addressLandmark,
      }
    }
    return request
  },
  handler: async (request, _response, context) => {
    if (request.method === 'get') {
      const order = await loadOrder(request.params.recordId)
      if (!order) throw new Error('Order not found')
      return {
        record: context.resource.build(flattenOrder(order)).toJSON(context.currentAdmin),
      }
    }

    const previous = await prisma.order.findUnique({
      where: { id: request.params.recordId },
    })

    const {
      status,
      paymentStatus,
      deliveryPartnerId,
      contactName,
      contactPhone,
      addressLine1,
      addressLine2,
      addressCity,
      addressState,
      addressPincode,
      addressLandmark,
    } = request.payload || {}

    const phoneDigits = String(contactPhone || '').replace(/\D/g, '')
    const phone = phoneDigits.length === 12 && phoneDigits.startsWith('91') ? phoneDigits.slice(2) : phoneDigits
    const pincode = normalizePincode(addressPincode)
    const reject = async (message) => {
      const current = await loadOrder(request.params.recordId)
      return {
        record: context.resource.build({
          ...flattenOrder(current),
          contactName,
          contactPhone,
          addressLine1,
          addressLine2,
          addressCity,
          addressState,
          addressPincode,
          addressLandmark,
        }).toJSON(context.currentAdmin),
        notice: { message, type: 'error' },
      }
    }
    if (!String(contactName || '').trim()) return reject('Customer name is required.')
    if (phone.length !== 10) return reject('Enter a 10-digit contact number.')
    if (!String(addressLine1 || '').trim() || !String(addressCity || '').trim() || !String(addressState || '').trim()) {
      return reject('Address, city, and state are required.')
    }
    try {
      await assertPincodeServiceable(pincode)
    } catch (error) {
      return reject(error.message || 'This pincode is not serviceable.')
    }

    const currentAddress = parseAddress(previous.address) || {}
    const nextAddress = {
      ...currentAddress,
      name: String(contactName).trim(),
      phone,
      line1: String(addressLine1).trim(),
      line2: String(addressLine2 || '').trim(),
      city: String(addressCity).trim(),
      state: String(addressState).trim(),
      pincode,
      landmark: String(addressLandmark || '').trim(),
    }
    const addressTextChanged = ['line1', 'line2', 'city', 'state', 'pincode', 'landmark'].some(
      (key) => String(nextAddress[key] || '') !== String(currentAddress[key] || ''),
    )
    if (addressTextChanged) {
      delete nextAddress.latitude
      delete nextAddress.longitude
    }
    let partnerPatch = {}
    if (deliveryPartnerId) {
      const partner = await prisma.deliveryPartner.findUnique({ where: { id: deliveryPartnerId } })
      if (partner) {
        partnerPatch = {
          deliveryPartnerId: partner.id,
          deliveryPartnerName: partner.name,
          deliveryPartnerPhone: partner.phone,
          deliveryAssignedAt: new Date(),
        }
      }
    } else if (deliveryPartnerId === '') {
      partnerPatch = {
        deliveryPartnerId: null,
        deliveryPartnerName: null,
        deliveryPartnerPhone: null,
        deliveryAssignedAt: null,
      }
    }

    await prisma.order.update({
      where: { id: request.params.recordId },
      data: {
        ...(status ? { status } : {}),
        ...(paymentStatus ? { paymentStatus } : {}),
        address: nextAddress,
        deliveryPincode: pincode,
        ...partnerPatch,
      },
    })

    const order = await loadOrder(request.params.recordId)
    if (status && previous?.status !== status) {
      notifyOrderStatus(order, status).catch((error) => console.error('Failed to send push:', error))
    }

    const becamePaid = order.paymentStatus === 'paid' && previous?.paymentStatus !== 'paid'
    const partnerAssigned = Boolean(order.deliveryPartnerId) && previous?.deliveryPartnerId !== order.deliveryPartnerId
    if (becamePaid) {
      sendOrderConfirmation(order, {
        phone: order.customer?.phone,
        name: order.customer?.name,
      }).catch((error) => console.error('Failed to send order confirmation:', error))
    }
    if (isConfirmedCheckoutOrder(order) && (becamePaid || partnerAssigned)) {
      sendDeliveryPartnerAssignment(order).catch((error) =>
        console.error('Failed to notify delivery partner:', error),
      )
    }

    return {
      record: context.resource.build(flattenOrder(order)).toJSON(context.currentAdmin),
      notice: { message: 'Order updated successfully.', type: 'success' },
    }
  },
}

export async function resendPartnerWhatsappAction(request, _response, context) {
  const order = await loadOrder(request.params.recordId)
  if (!order) {
    throw Object.assign(new Error('Order not found.'), { status: 404 })
  }

  const result = await sendDeliveryPartnerAssignment(order)
  return {
    record: context.resource.build(flattenOrder(order)).toJSON(context.currentAdmin),
    notice: {
      message: result.sent
        ? `MSG91 accepted the delivery-partner WhatsApp${result.requestId ? ` (${result.requestId})` : ''}. Refresh the log for 15553141704. It can take a minute to appear.`
        : result.reason || 'Could not send WhatsApp to the delivery partner.',
      type: result.sent ? 'success' : 'error',
    },
  }
}

export async function syncRazorpayAction(request, _response, context) {
  const order = await loadOrder(request.params.recordId)
  if (!order) {
    throw Object.assign(new Error('Order not found.'), { status: 404 })
  }
  const { reconcileOnlineOrderFromRazorpay } = await import('../services/checkout.js')
  const result = await reconcileOnlineOrderFromRazorpay(order)
  const updated = await loadOrder(request.params.recordId)
  return {
    record: context.resource.build(flattenOrder(updated)).toJSON(context.currentAdmin),
    notice: {
      message:
        result.status === 'paid'
          ? 'Razorpay payment found and marked as paid.'
          : 'No captured Razorpay payment found for this order yet.',
      type: result.status === 'paid' ? 'success' : 'error',
    },
  }
}
