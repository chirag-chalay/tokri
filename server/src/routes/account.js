import { Router } from 'express'
import { requireCustomer } from '../middleware/customerAuth.js'
import {
  createAddress,
  deleteAddress,
  listAddresses,
  updateAddress,
} from '../services/addresses.js'
import { getCustomerOrder, listCustomerOrders } from '../services/customerOrders.js'
import { formatAuthUser } from '../services/jwt.js'
import { parseDateOfBirth } from '../services/customers.js'
import { prisma } from '../lib/prisma.js'
import { generateOrderInvoicePdf } from '../services/invoice.js'
import {
  addCartItem,
  clearCart,
  getCart,
  removeCartItem,
  replaceCart,
  updateCartItem,
} from '../services/cart.js'
import { registerDevice, unregisterDevice } from '../services/devices.js'

const router = Router()

router.use(requireCustomer)

router.get('/me', (req, res) => {
  res.json({ user: formatAuthUser(req.customer) })
})

router.patch('/profile', async (req, res, next) => {
  try {
    const name = String(req.body?.name || '').trim()
    if (!name) {
      throw Object.assign(new Error('Name is required.'), { status: 400 })
    }
    if (name.length > 80) {
      throw Object.assign(new Error('Name is too long.'), { status: 400 })
    }

    const dateOfBirth = parseDateOfBirth(req.body?.dateOfBirth)
    const customer = await prisma.customer.update({
      where: { id: req.customer.id },
      data: {
        name,
        ...(dateOfBirth !== undefined
          ? { dateOfBirth: dateOfBirth ? new Date(`${dateOfBirth}T12:00:00.000Z`) : null }
          : {}),
      },
    })

    res.json({ user: formatAuthUser(customer) })
  } catch (error) {
    next(error)
  }
})

router.get('/addresses', async (req, res, next) => {
  try {
    const addresses = await listAddresses(req.customer.id)
    res.json({ addresses })
  } catch (error) {
    next(error)
  }
})

router.post('/addresses', async (req, res, next) => {
  try {
    const address = await createAddress(req.customer.id, req.body)
    res.status(201).json({ address })
  } catch (error) {
    next(error)
  }
})

router.put('/addresses/:id', async (req, res, next) => {
  try {
    const address = await updateAddress(req.customer.id, req.params.id, req.body)
    res.json({ address })
  } catch (error) {
    next(error)
  }
})

router.delete('/addresses/:id', async (req, res, next) => {
  try {
    await deleteAddress(req.customer.id, req.params.id)
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})

router.get('/orders', async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1
    const perPage = Number(req.query.perPage) || 10
    const result = await listCustomerOrders(req.customer.id, { page, perPage })
    res.json(result)
  } catch (error) {
    next(error)
  }
})

router.get('/orders/:orderNo', async (req, res, next) => {
  try {
    const order = await getCustomerOrder(req.customer.id, req.params.orderNo)
    res.json({ order })
  } catch (error) {
    next(error)
  }
})

router.get('/orders/:orderNo/invoice', async (req, res, next) => {
  try {
    const customerOrder = await getCustomerOrder(req.customer.id, req.params.orderNo)
    if (!customerOrder) {
      return res.status(404).json({ message: 'Order not found.' })
    }
    const { buffer, order } = await generateOrderInvoicePdf(customerOrder.id)
    const filename = `invoice-${order.orderNo}.pdf`
    const disposition = req.query.download === '1' ? 'attachment' : 'inline'
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `${disposition}; filename="${filename}"`)
    res.setHeader('Content-Length', buffer.length)
    return res.send(buffer)
  } catch (error) {
    next(error)
  }
})

router.get('/cart', async (req, res, next) => {
  try {
    const cart = await getCart(req.customer.id)
    res.json({ cart })
  } catch (error) {
    next(error)
  }
})

router.put('/cart', async (req, res, next) => {
  try {
    const cart = await replaceCart(req.customer.id, req.body?.items || [], {
      revision: req.body?.revision,
      merge: req.body?.merge === true,
    })
    res.json({ cart })
  } catch (error) {
    next(error)
  }
})

router.delete('/cart', async (req, res, next) => {
  try {
    const platform = req.get('X-App-Platform')
    const build = Number(req.get('X-App-Build'))
    // These app releases call DELETE after payment as part of checkout cleanup.
    const legacyCheckoutCleanup = build > 0 && ((platform === 'android' && build <= 51) || (platform === 'ios' && build <= 16))
    const cart = await (legacyCheckoutCleanup ? getCart(req.customer.id) : clearCart(req.customer.id))
    res.json({ cart })
  } catch (error) {
    next(error)
  }
})

router.post('/cart/items', async (req, res, next) => {
  try {
    const cart = await addCartItem(req.customer.id, req.body)
    res.json({ cart })
  } catch (error) {
    next(error)
  }
})

router.patch('/cart/items/:slug', async (req, res, next) => {
  try {
    const cart = await updateCartItem(req.customer.id, req.params.slug, req.body?.quantity)
    res.json({ cart })
  } catch (error) {
    next(error)
  }
})

router.delete('/cart/items/:slug', async (req, res, next) => {
  try {
    const cart = await removeCartItem(req.customer.id, req.params.slug)
    res.json({ cart })
  } catch (error) {
    next(error)
  }
})

router.post('/devices', async (req, res, next) => {
  try {
    const device = await registerDevice(req.customer.id, req.body || {})
    res.status(201).json({ device })
  } catch (error) {
    next(error)
  }
})

router.delete('/devices', async (req, res, next) => {
  try {
    await unregisterDevice(req.customer.id, req.body?.token || req.query.token)
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})

export default router
