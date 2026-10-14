import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { formatPublicSettings } from '../utils/settings.js'
import { formatCategory, formatProduct, formatPage, formatBlog, formatBlogSummary } from '../utils/formatters.js'
import { PRODUCT_CATEGORY_INCLUDE, categoryProductWhere } from '../utils/catalog.js'
import { reverseGeocode } from '../services/geocode.js'
import authRouter from './auth.js'
import accountRouter from './account.js'
import checkoutRouter from './checkout.js'
import appRouter from './app.js'
import partnerRouter from './partner.js'

const router = Router()

router.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'tokri-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    cartStorage: 'sql',
    models: {
      customer: Boolean(prisma.customer),
      cart: Boolean(prisma.cart),
      cartItem: Boolean(prisma.cartItem),
      deviceToken: Boolean(prisma.deviceToken),
      otpRequest: Boolean(prisma.otpRequest),
      user: Boolean(prisma.user),
    },
  })
})

router.use('/auth', authRouter)
router.use('/account', accountRouter)
router.use('/checkout', checkoutRouter)
router.use('/app', appRouter)
router.use('/partner', partnerRouter)

router.get('/geo/reverse', async (req, res, next) => {
  try {
    const address = await reverseGeocode(req.query.lat, req.query.lng)
    res.json({ address })
  } catch (error) {
    next(error)
  }
})

router.get('/settings/public', async (_req, res, next) => {
  try {
    const settings = await prisma.setting.findUnique({ where: { id: 1 } })
    res.json(formatPublicSettings(settings))
  } catch (error) {
    next(error)
  }
})

router.get('/categories', async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { productLinks: true } } },
    })

    res.json(categories.map((c) => formatCategory(c)))
  } catch (error) {
    next(error)
  }
})

router.get('/categories/:slug', async (req, res, next) => {
  try {
    const category = await prisma.category.findFirst({
      where: { slug: req.params.slug, isActive: true },
    })

    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }

    const products = await prisma.product.findMany({
      where: { isActive: true, ...categoryProductWhere(category.id) },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: PRODUCT_CATEGORY_INCLUDE,
    })

    res.json(formatCategory({ ...category, products, _count: { productLinks: products.length } }, { includeProducts: true }))
  } catch (error) {
    next(error)
  }
})

router.get('/products', async (req, res, next) => {
  try {
    const { flag, category, limit, page: pageQuery } = req.query
    const pageSize = limit ? Math.min(Number(limit) || 20, 100) : undefined
    const page = pageQuery ? Math.max(1, Number(pageQuery) || 1) : null

    const where = { isActive: true }

    if (flag === 'bestSeller') where.isBestSeller = true
    if (flag === 'imported') where.isImported = true
    if (flag === 'featured') where.isFeatured = true

    if (category) {
      const cat = await prisma.category.findUnique({ where: { slug: String(category) } })
      if (cat) Object.assign(where, categoryProductWhere(cat.id))
      else if (page) {
        return res.json({
          products: [],
          total: 0,
          page: 1,
          pageSize: pageSize || 24,
          hasMore: false,
        })
      }
    }

    // Paginated response when ?page= is provided (category browse / infinite scroll)
    if (page) {
      const take = pageSize || 24
      const skip = (page - 1) * take
      const [rows, total] = await Promise.all([
        prisma.product.findMany({
          where,
          take,
          skip,
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
          include: PRODUCT_CATEGORY_INCLUDE,
        }),
        prisma.product.count({ where }),
      ])

      return res.json({
        products: rows.map(formatProduct),
        total,
        page,
        pageSize: take,
        hasMore: skip + rows.length < total,
      })
    }

    const products = await prisma.product.findMany({
      where,
      take: pageSize,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: PRODUCT_CATEGORY_INCLUDE,
    })

    res.json(products.map(formatProduct))
  } catch (error) {
    next(error)
  }
})

router.get('/search', async (req, res, next) => {
  try {
    const term = String(req.query.q || '').trim()
    const page = Math.max(1, Number(req.query.page) || 1)
    const pageSize = Math.min(Math.max(Number(req.query.limit) || 12, 1), 48)

    if (!term) {
      return res.json({
        query: '',
        total: 0,
        page: 1,
        pageSize,
        hasMore: false,
        products: [],
        suggestions: [],
      })
    }

    const where = {
      isActive: true,
      OR: [
        { name: { contains: term } },
        { description: { contains: term } },
        { badge: { contains: term } },
        { category: { is: { label: { contains: term } } } },
        { categoryLinks: { some: { category: { is: { label: { contains: term } } } } } },
      ],
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ isBestSeller: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
        include: PRODUCT_CATEGORY_INCLUDE,
      }),
    ])

    let suggestions = []
    if (page === 1) {
      const suggested = await prisma.product.findMany({
        where: { isActive: true, name: { contains: term } },
        take: 5,
        orderBy: [{ isBestSeller: 'desc' }, { name: 'asc' }],
        include: PRODUCT_CATEGORY_INCLUDE,
      })
      suggestions = suggested.map(formatProduct)
    }

    res.json({
      query: term,
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
      products: products.map(formatProduct),
      suggestions,
    })
  } catch (error) {
    next(error)
  }
})

router.get('/products/:slug', async (req, res, next) => {
  try {
    const product = await prisma.product.findFirst({
      where: { slug: req.params.slug, isActive: true },
      include: PRODUCT_CATEGORY_INCLUDE,
    })

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    res.json(formatProduct(product))
  } catch (error) {
    next(error)
  }
})

router.get('/reviews', async (_req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    res.json(reviews)
  } catch (error) {
    next(error)
  }
})

router.get('/blogs', async (req, res, next) => {
  try {
    const limitRaw = Number(req.query.limit)
    const offsetRaw = Number(req.query.offset)
    const limit = Number.isFinite(limitRaw) ? Math.min(50, Math.max(1, Math.floor(limitRaw))) : 18
    const offset = Number.isFinite(offsetRaw) ? Math.max(0, Math.floor(offsetRaw)) : 0
    const where = { isPublished: true }
    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        skip: offset,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ])
    res.json({ posts: posts.map(formatBlogSummary), total })
  } catch (error) {
    next(error)
  }
})

router.get('/blogs/:slug', async (req, res, next) => {
  try {
    const post = await prisma.blogPost.findFirst({
      where: {
        slug: String(req.params.slug || '').trim(),
        isPublished: true,
      },
    })
    if (!post) return res.status(404).json({ message: 'Blog post not found' })
    res.json(formatBlog(post))
  } catch (error) {
    next(error)
  }
})

router.get('/pages/:slug', async (req, res, next) => {
  try {
    const page = await prisma.page.findFirst({
      where: {
        slug: String(req.params.slug || '').trim(),
        isPublished: true,
      },
    })

    if (!page) {
      return res.status(404).json({ message: 'Page not found' })
    }

    res.json(formatPage(page))
  } catch (error) {
    next(error)
  }
})

export default router
