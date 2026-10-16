import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { optionalCustomer } from '../middleware/customerAuth.js'
import { formatPublicSettings } from '../utils/settings.js'
import { formatCategory, formatProduct, toPublicAssetUrl } from '../utils/formatters.js'
import { PRODUCT_CATEGORY_INCLUDE } from '../utils/catalog.js'
import { getChargeRates } from '../config/charges.js'
import { getCart } from '../services/cart.js'
import { getCustomerFreeDeliveryStatus } from '../services/freeDelivery.js'
import { readAppRelease } from '../services/appRelease.js'

const router = Router()

router.get('/bootstrap', optionalCustomer, async (req, res, next) => {
  try {
    const [settings, categories, bestSellers, imported, featured, reviews, charges] = await Promise.all([
      prisma.setting.findUnique({ where: { id: 1 } }),
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: { _count: { select: { productLinks: true } } },
      }),
      prisma.product.findMany({
        where: { isActive: true, isBestSeller: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        take: 12,
        include: PRODUCT_CATEGORY_INCLUDE,
      }),
      prisma.product.findMany({
        where: { isActive: true, isImported: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        take: 12,
        include: PRODUCT_CATEGORY_INCLUDE,
      }),
      prisma.product.findMany({
        where: { isActive: true, isFeatured: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        take: 8,
        include: PRODUCT_CATEGORY_INCLUDE,
      }),
      prisma.review.findMany({
        where: { isApproved: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      getChargeRates(),
    ])

    let cart = null
    let freeDelivery = { quota: 3, used: 0, remaining: 3, isEligible: true }
    if (req.customer) {
      try {
        const [customerCart, deliveryStatus] = await Promise.all([
          getCart(req.customer.id),
          getCustomerFreeDeliveryStatus(req.customer.id),
        ])
        cart = customerCart
        freeDelivery = deliveryStatus
      } catch (error) {
        console.error('bootstrap cart/freeDelivery failed:', error)
      }
    }

    res.json({
      settings: formatPublicSettings(settings),
      categories: categories.map((category) => formatCategory(category)),
      bestSellers: bestSellers.map(formatProduct),
      imported: imported.map(formatProduct),
      featured: featured.map(formatProduct),
      reviews: reviews.map((review) => ({
        id: review.id,
        title: review.title,
        content: review.content,
        name: review.name,
        image: toPublicAssetUrl(review.image),
        rating: review.rating,
      })),
      charges: {
        deliveryCharge: charges.deliveryCharge,
        handlingCharge: charges.handlingCharge,
        smallCartCharge: charges.smallCartCharge,
        delivery: {
          morning: charges.morning,
          express: charges.express,
        },
      },
      freeDelivery,
      cart,
    })
  } catch (error) {
    next(error)
  }
})

router.get('/release', async (req, res, next) => {
  try {
    const decision = await readAppRelease(req.query.platform, req.query.build)
    res.json(decision)
  } catch (error) {
    next(error)
  }
})

export default router
