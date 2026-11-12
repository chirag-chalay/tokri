import { logError } from '../monitoring/database.js'
import { listUserDeviceTokens, deleteDeviceTokens } from './devices.js'

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

const STATUS_COPY = {
  pending: {
    title: 'Order placed',
    body: (orderNo) => `Order ${orderNo} has been placed. We will update you soon.`,
  },
  paid: {
    title: 'Payment received',
    body: (orderNo) => `Payment for order ${orderNo} was successful.`,
  },
  packed: {
    title: 'Order packed',
    body: (orderNo) => `Order ${orderNo} is packed and ready to go.`,
  },
  shipped: {
    title: 'Out for delivery',
    body: (orderNo) => `Order ${orderNo} is on the way.`,
  },
  delivered: {
    title: 'Delivered',
    body: (orderNo) => `Order ${orderNo} has been delivered. Enjoy your fruits!`,
  },
  cancelled: {
    title: 'Order cancelled',
    body: (orderNo) => `Order ${orderNo} was cancelled.`,
  },
}

async function sendExpoMessages(messages) {
  if (!messages.length) return []

  const response = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messages),
  })

  const payload = await response.json().catch(() => ({}))
  return payload?.data || []
}

export async function notifyUser(userId, { title, body, data = {} }) {
  if (!userId) return { sent: 0 }

  const devices = await listUserDeviceTokens(userId)
  const expoDevices = devices.filter((device) => device.provider === 'expo')
  if (!expoDevices.length) return { sent: 0 }

  const messages = expoDevices.map((device) => ({
    to: device.token,
    sound: 'default',
    title,
    body,
    data,
  }))

  try {
    const tickets = await sendExpoMessages(messages)
    const invalid = []
    tickets.forEach((ticket, index) => {
      const details = ticket?.details || {}
      if (ticket?.status === 'error' && details.error === 'DeviceNotRegistered') {
        invalid.push(expoDevices[index].token)
      }
    })
    if (invalid.length) await deleteDeviceTokens(invalid)
    return { sent: expoDevices.length - invalid.length }
  } catch (error) {
    logError(error, 'background')
    return { sent: 0, error: error.message }
  }
}

export async function notifyOrderStatus(order, status = order?.status) {
  if (!order?.customerId) return { sent: 0 }
  const copy = STATUS_COPY[status]
  if (!copy) return { sent: 0 }

  return notifyUser(order.customerId, {
    title: copy.title,
    body: copy.body(order.orderNo),
    data: {
      type: 'order_status',
      orderNo: order.orderNo,
      status,
    },
  })
}
