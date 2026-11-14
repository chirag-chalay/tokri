import { Router } from 'express'
import { log, logDurable } from '../monitoring/index.js'
import { logError } from '../monitoring/database.js'
import { optionalCustomer, requireCustomer } from '../middleware/customerAuth.js'
import {
  partitionCartItems,
  suggestionsForUnavailable,
  isStoreIntraState,
  completeRazorpayCallback,
  confirmCheckoutPayment,
  confirmCodOrder,
  createCheckoutOrder,
  getCheckoutConfig,
  getCheckoutOrderStatus,
  getAppTrackingPurchases,
  startUpiIntent,
  syncIntentPayment,
  syncOnlineOrderPayment,
} from '../services/checkout.js'
import { previewCoupon } from '../services/coupons.js'
import { env } from '../config/env.js'
import { assertAppReleaseAllowed } from '../services/appRelease.js'
import { quoteCheckoutDelivery } from '../services/deliveryQuote.js'
import { metaAttribution, cookieValue } from '../utils/metaAttribution.js'

const router = Router()
router.use((req, res, next) => {
  if (req.method === 'POST' && !['/quote', '/preview-coupon'].includes(req.path)) {
    let outcome, orderNo
    const json = res.json.bind(res)
    res.json = (body) => {
      const status = body?.status || body?.paymentStatus || body?.order?.paymentStatus
      outcome = ['paid', 'failed', 'pending', 'refunded'].includes(status) ? status : undefined
      orderNo = body?.orderNo || body?.order?.orderNo
      return json(body)
    }
    res.once('finish', () => log('payment', 'checkout.request', {
      route: req.route?.path, status: res.statusCode < 400 ? outcome || 'success' : 'failure',
      httpStatus: res.statusCode, orderNo: orderNo || req.body?.orderNo,
    }))
  }
  next()
})

async function resolvePreviewPartition(rawItems) {
  if (Array.isArray(rawItems) && rawItems.length === 0) {
    return { items: [], unavailableItems: [] }
  }
  return partitionCartItems(rawItems)
}

function emptyQuoteTotals() {
  return {
    itemsTotal: 0,
    taxTotal: 0,
    deliveryCharge: 0,
    handlingCharge: 0,
    discount: 0,
    grandTotal: 0,
  }
}

function emptyQuoteShell(option) {
  const totals = emptyQuoteTotals()
  const blankOption = {
    title: option === 'express' ? 'Same Day Delivery' : 'Morning Delivery',
    subtitle: '',
    deliveryFee: 0,
    deliverySavings: 0,
    minimumOrderValue: 0,
    minimumMet: true,
    minimumMessage: null,
    freeDeliveryApplied: false,
    offerRemaining: 0,
    offerMessage: null,
    deliveryMessage: null,
    freeAboveMessage: null,
    freeAbove: 0,
    totals,
  }
  return {
    items: [],
    couponStatus: null,
    availableCoupons: [],
    deliveryType: option,
    options: {
      morning: option === 'morning' ? blankOption : { ...blankOption, title: 'Morning Delivery', totals: undefined },
      express: option === 'express' ? blankOption : { ...blankOption, title: 'Same Day Delivery', totals: undefined },
    },
    totals,
  }
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
    const { items, unavailableItems } = await resolvePreviewPartition(req.body?.items)
    if (!items.length && !unavailableItems.length) {
      throw Object.assign(new Error('Your cart is empty.'), { status: 400 })
    }
    const option = req.body?.deliveryOption === 'express' ? 'express' : 'morning'
    const quote = items.length
      ? await quoteCheckoutDelivery(items, req.customer?.id || null, option, {
          couponCode: req.body?.couponCode, isInterState: await quoteIsInterState(req),
        })
      : emptyQuoteShell(option)
    const excludeSlugs = [
      ...items.map((item) => item.slug),
      ...(Array.isArray(req.body?.items) ? req.body.items.map((row) => row?.slug || row?.id).filter(Boolean) : []),
    ]
    const suggestions = await suggestionsForUnavailable(unavailableItems, excludeSlugs, 4)
    res.json({ ...quote, unavailableItems, suggestions })
  } catch (error) {
    next(error)
  }
})

router.post('/preview-coupon', optionalCustomer, async (req, res, next) => {
  try {
    const { items, unavailableItems } = await resolvePreviewPartition(req.body?.items)
    if (!items.length) {
      throw Object.assign(
        new Error(
          unavailableItems.length
            ? 'Those products are no longer available.'
            : 'Your cart is empty.',
        ),
        { status: 400, unavailableItems },
      )
    }
    const result = await previewCoupon({
      code: req.body?.code,
      taxOptions: { isInterState: await quoteIsInterState(req) },
      items,
      customerId: req.customer?.id || null,
      deliveryOption: req.body?.deliveryOption,
    })
    res.json({ coupon: result.preview, totals: result.totals, unavailableItems })
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
      attribution: metaAttribution(req),
      marketingConsent: cookieValue(req, 'tokriii_marketing_consent') === 'granted',
      appPlatform: String(req.get('X-App-Platform') || '').toLowerCase(),
      appBuild: Number(req.get('X-App-Build')),
    })
    res.status(201).json(result)
  } catch (error) {
    next(error)
  }
})

router.get('/app-purchases', async (req, res, next) => {
  try {
    if (!/^Bearer\s+\S+/i.test(req.headers.authorization || '')) return res.status(401).json({ message: 'Please log in to continue.' })
    res.set('Cache-Control', 'no-store')
    const purchases = await getAppTrackingPurchases(req.customer, String(req.query.consentId || ''))
    res.json({ purchases })
  } catch (error) { next(error) }
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
  let outcome = 'skipped'
  try {
    if (razorpayOrderId && razorpayPaymentId && razorpaySignature) {
      await completeRazorpayCallback({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        orderNo: orderNo || null,
      })
      outcome = 'success'
    }
  } catch (error) {
    outcome = 'failure'
    logError(error, 'checkout-callback')
  }
  await logDurable('payment', 'checkout.callback', { status: outcome, orderNo })
  const target = orderNo
    ? `${env.clientUrl}/order/${encodeURIComponent(orderNo)}`
    : `${env.clientUrl}/account?section=orders`
  return res.redirect(302, target)
}

export default router
