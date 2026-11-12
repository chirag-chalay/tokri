import { Router } from 'express'
import { optionalCustomer, requireCustomer } from '../middleware/customerAuth.js'
import {
  resolveCartItems,
  isStoreIntraState,
  completeRazorpayCallback,
  confirmCheckoutPayment,
  confirmCodOrder,
  createCheckoutOrder,
  getCheckoutConfig,
  getCheckoutOrderStatus,
  startUpiIntent,
  syncIntentPayment,
  syncOnlineOrderPayment,
} from '../services/checkout.js'
import { previewCoupon } from '../services/coupons.js'
import { env } from '../config/env.js'
import { assertAppReleaseAllowed } from '../services/appRelease.js'
import { quoteCheckoutDelivery } from '../services/deliveryQuote.js'

const router = Router()

async function resolvePreviewItems(rawItems) {
  if (Array.isArray(rawItems) && rawItems.length === 0) return []
  return resolveCartItems(rawItems)
}

// Quote tax jurisdiction follows the same saved address resolution as checkout.
async function quoteIsInterState(req) {
  if (req.customer && req.body?.addressId) {
    const { listAddresses, snapshotCurrentAddress } = await import('../services/addresses.js')
    const address = req.body.addressId === 'current'
      ? await snapshotCurrentAddress(req.customer, req.body.address)
      : (await listAddresses(req.customer.id)).find((row) => row.id === req.body.addressId)
    if (!address) throw Object.assign(new Error('Please select a valid delivery address.'), { status: 400 })
    return !isStoreIntraState(address.state)
  }
  return false
}

router.get('/config', optionalCustomer, async (req, res, next) => {
  try {
    const config = await getCheckoutConfig(req.customer)
    res.json(config)
  } catch (error) {
    next(error)
  }
})

router.post('/quote', optionalCustomer, async (req, res, next) => {
  try {
    const items = await resolvePreviewItems(req.body?.items)
    const option = req.body?.deliveryOption === 'express' ? 'express' : 'morning'
    const quote = await quoteCheckoutDelivery(items, req.customer?.id || null, option, {
      couponCode: req.body?.couponCode, isInterState: await quoteIsInterState(req),
    })
    res.json(quote)
  } catch (error) {
    next(error)
  }
})

router.post('/preview-coupon', optionalCustomer, async (req, res, next) => {
  try {
    const items = await resolvePreviewItems(req.body?.items)
    const result = await previewCoupon({
      code: req.body?.code,
      taxOptions: { isInterState: await quoteIsInterState(req) },
      items,
      customerId: req.customer?.id || null,
      deliveryOption: req.body?.deliveryOption,
    })
    res.json({ coupon: result.preview, totals: result.totals })
  } catch (error) {
    next(error)
  }
})

router.use(requireCustomer)

router.use(async (req, res, next) => {
  try {
    await assertAppReleaseAllowed(req)
    next()
  } catch (error) {
    next(error)
  }
})

router.post('/create-order', async (req, res, next) => {
  try {
    const result = await createCheckoutOrder(req.customer, { ...req.body, tracking: /^Bearer /i.test(req.headers.authorization || '') ? req.body?.tracking : undefined }, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    })
    res.status(201).json(result)
  } catch (error) {
    next(error)
  }
})

router.post('/upi-intent', async (req, res, next) => {
  try {
    const result = await startUpiIntent(req.customer, req.body, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    })
    res.json(result)
  } catch (error) {
    next(error)
  }
})

router.post('/confirm-intent', async (req, res, next) => {
  try {
    const result = await syncIntentPayment(req.customer, req.body)
    res.json(result)
  } catch (error) {
    next(error)
  }
})

router.post('/verify-payment', async (req, res, next) => {
  try {
    const result = await confirmCheckoutPayment(req.customer, req.body)
    res.json({ ok: true, ...result })
  } catch (error) {
    next(error)
  }
})

router.post('/sync-payment', async (req, res, next) => {
  try {
    const result = await syncOnlineOrderPayment(req.customer, req.body)
    res.json({
      ok: result.status === 'paid',
      status: result.status,
      orderNo: result.order?.orderNo,
      paymentStatus: result.order?.paymentStatus,
    })
  } catch (error) {
    next(error)
  }
})

router.get('/status/:orderNo', async (req, res, next) => {
  try {
    const result = await getCheckoutOrderStatus(req.customer, { orderNo: req.params.orderNo })
    res.json(result)
  } catch (error) {
    next(error)
  }
})

router.post('/confirm-cod', async (req, res, next) => {
  try {
    const result = await confirmCodOrder(req.customer, req.body)
    res.json({ ok: true, ...result })
  } catch (error) {
    next(error)
  }
})

export async function handleRazorpayCheckoutCallback(req, res) {
  const orderNo = String(req.query.orderNo || req.body?.orderNo || '').trim()
  const razorpayOrderId = req.body?.razorpay_order_id
  const razorpayPaymentId = req.body?.razorpay_payment_id
  const razorpaySignature = req.body?.razorpay_signature
  try {
    if (razorpayOrderId && razorpayPaymentId && razorpaySignature) {
      await completeRazorpayCallback({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        orderNo: orderNo || null,
      })
    }
  } catch (error) {
    console.error('Razorpay checkout callback failed:', error.message)
  }
  const target = orderNo
    ? `${env.clientUrl}/order/${encodeURIComponent(orderNo)}`
    : `${env.clientUrl}/account?section=orders`
  return res.redirect(302, target)
}

export default router
