const IST = 'Asia/Kolkata'

export function formatOrderDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: IST,
  })
}

export function formatExpectedDeliveryDate(value) {
  return formatOrderDate(value)
}

/** Match Admin fulfillment labels so partners aren’t confused with payment “Paid”. */
export function formatOrderStatus(status) {
  const key = String(status || '').toLowerCase()
  const labels = {
    pending: 'Waiting',
    paid: 'Processing',
    packed: 'Packed',
    shipped: 'Out for delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  }
  return labels[key] || (key ? key.replace(/_/g, ' ') : 'Unknown')
}

export function formatPaymentStatus(status) {
  const key = String(status || '').toLowerCase()
  const labels = {
    pending: 'Unpaid',
    paid: 'Paid',
    failed: 'Failed',
    refunded: 'Refunded',
  }
  return labels[key] || (key ? key.replace(/_/g, ' ') : 'Unknown')
}

export function paymentTone(status) {
  const key = String(status || '').toLowerCase()
  if (key === 'paid') return 'success'
  if (key === 'failed' || key === 'refunded') return 'danger'
  return 'warning'
}

export function formatDeliveryOption(option) {
  const key = String(option || '').toLowerCase()
  if (key === 'morning') return 'Morning'
  if (key === 'express') return 'Express'
  return key ? key.replace(/_/g, ' ') : ''
}

export function statusTone(status) {
  const key = String(status || '').toLowerCase()
  if (key === 'cancelled') return 'danger'
  if (key === 'delivered') return 'success'
  if (key === 'shipped' || key === 'packed' || key === 'paid') return 'warning'
  return 'muted'
}

export function canCollectPayment(order) {
  if (!order) return false
  if (String(order.status || '').toLowerCase() === 'cancelled') return false
  if (String(order.paymentStatus || '').toLowerCase() === 'paid') return false
  return true
}

/** Keep orders from the last `days` calendar days in IST (inclusive of today). */
export function filterRecentOrders(orders, days = 4) {
  const cutoff = new Date()
  cutoff.setHours(0, 0, 0, 0)
  cutoff.setDate(cutoff.getDate() - (days - 1))
  return (orders || []).filter((order) => {
    const created = new Date(order.createdAt)
    if (Number.isNaN(created.getTime())) return false
    return created >= cutoff
  })
}

export function paginate(items, page, perPage = 10) {
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / perPage) || 1)
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * perPage
  return {
    page: safePage,
    totalPages,
    total,
    items: items.slice(start, start + perPage),
  }
}
