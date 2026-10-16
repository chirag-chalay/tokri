import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { optionalCustomer, requireCustomer } from '../middleware/customerAuth.js'
import {
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
import { PRODUCT_CATEGORY_INCLUDE } from '../utils/catalog.js'
import { env } from '../config/env.js'
import { assertAppReleaseAllowed } from '../services/appRelease.js'

const router = Router()

async function resolvePreviewItems(rawItems) {
  const list = Array.isArray(rawItems) ? rawItems : []
  const slugs = list
    .map((item) => String(item?.slug || item?.id || '').trim())
    .filter(Boolean)
  if (!slugs.length) {
    throw Object.assign(new Error('Add items to your cart before applying a coupon.'), { status: 400 })
  }

  const products = await prisma.product.findMany({
    where: { slug: { in: slugs }, isActive: true },
    include: PRODUCT_CATEGORY_INCLUDE,
  })
  const productMap = new Map(products.map((product) => [product.slug, product]))
  const items = []

  for (const raw of list) {
    const slug = String(raw?.slug || raw?.id || '').trim()
    const product = productMap.get(slug)
    if (!product) continue
    items.push({
      slug: product.slug,
      quantity: Math.max(1, Number(raw?.quantity) || 1),
      priceValue: Number(product.priceValue),
      isTaxable: Boolean(product.isTaxable),
      gstRate: Number(product.gstRate ?? 0),
      hsnCode: product.hsnCode || '0808',
      category: product.category,
      categories: (product.categoryLinks || []).map((row) => row.category).filter(Boolean),
    })
  }

  if (!items.length) {
    throw Object.assign(new Error('Your cart items are no longer available.'), { status: 400 })
  }

  return items
}

router.get('/config', optionalCustomer, async (req, res, next) => {
  try {
    const config = await getCheckoutConfig(req.customer)
    res.json(config)
  } catch (error) {
    next(error)
  }
})

router.post('/preview-coupon', optionalCustomer, async (req, res, next) => {
  try {
    const items = await resolvePreviewItems(req.body?.items)
    const result = await previewCoupon({
      code: req.body?.code,
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
    const result = await createCheckoutOrder(req.customer, req.body, {
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
