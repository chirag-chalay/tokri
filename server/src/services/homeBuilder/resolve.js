import { prisma } from '../../lib/prisma.js'
import { formatBlogSummary, formatCategory, formatProduct, toPublicAssetUrl } from '../../utils/formatters.js'
import { PRODUCT_CATEGORY_INCLUDE, categoryProductWhere } from '../../utils/catalog.js'
import { normalizeDocument } from './blocks.js'

function isSectionLive(section, now = new Date()) {
  if (section.visible === false) return false
  const startAt = section.schedule?.startAt ? new Date(section.schedule.startAt) : null
  const endAt = section.schedule?.endAt ? new Date(section.schedule.endAt) : null
  if (startAt && !Number.isNaN(startAt.getTime()) && startAt > now) return false
  if (endAt && !Number.isNaN(endAt.getTime()) && endAt < now) return false
  return true
}

function publicLink(link) {
  const type = String(link?.type || 'none')
  const value = String(link?.value || '').trim()
  if (!['none', 'shop', 'category', 'product', 'url'].includes(type)) {
    return { type: 'none', value: '' }
  }
  return { type, value: type === 'none' || type === 'shop' ? '' : value }
}

async function loadProductsBySource(settings) {
  const limit = Math.min(Math.max(Number(settings?.limit) || 12, 1), 100)
  const source = String(settings?.source || 'bestSeller')
  const where = { isActive: true }

  if (source === 'bestSeller') where.isBestSeller = true
  else if (source === 'featured') where.isFeatured = true
  else if (source === 'imported') where.isImported = true
  else if (source === 'category') {
    const slug = String(settings?.categorySlug || '').trim()
    if (!slug) return []
    const category = await prisma.category.findFirst({ where: { slug, isActive: true } })
    if (!category) return []
    Object.assign(where, categoryProductWhere(category.id))
  } else if (source === 'picked') {
    const slugs = (Array.isArray(settings?.productSlugs) ? settings.productSlugs : [])
      .map((item) => String(item || '').trim())
      .filter(Boolean)
    if (!slugs.length) return []
    const products = await prisma.product.findMany({
      where: { isActive: true, slug: { in: slugs } },
      include: PRODUCT_CATEGORY_INCLUDE,
    })
    const bySlug = new Map(products.map((product) => [product.slug, product]))
    return slugs.map((slug) => bySlug.get(slug)).filter(Boolean).map(formatProduct)
  } else {
    return []
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    take: limit,
    include: PRODUCT_CATEGORY_INCLUDE,
  })
  return products.map(formatProduct)
}

async function loadCategories(settings) {
  const mode = String(settings?.mode || 'all')
  if (mode === 'picked') {
    const slugs = (Array.isArray(settings?.categorySlugs) ? settings.categorySlugs : [])
      .map((item) => String(item || '').trim())
      .filter(Boolean)
    if (!slugs.length) return []
    const categories = await prisma.category.findMany({
      where: { isActive: true, slug: { in: slugs } },
      include: { _count: { select: { productLinks: true } } },
    })
    const bySlug = new Map(categories.map((category) => [category.slug, category]))
    return slugs.map((slug) => bySlug.get(slug)).filter(Boolean).map((category) => formatCategory(category))
  }

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { productLinks: true } } },
  })
  return categories.map((category) => formatCategory(category))
}

async function resolveBannerSlider(section) {
  const slides = (Array.isArray(section.settings?.slides) ? section.settings.slides : [])
    .map((slide) => ({
      id: String(slide?.id || ''),
      image: toPublicAssetUrl(slide?.image) || null,
      mobileImage: toPublicAssetUrl(slide?.mobileImage) || null,
      alt: String(slide?.alt || ''),
      link: publicLink(slide?.link),
    }))
    .filter((slide) => slide.image || slide.mobileImage)

  if (!slides.length) return null
  return {
    id: section.id,
    type: section.type,
    title: section.title || '',
    autoplaySeconds: Math.min(Math.max(Number(section.settings?.autoplaySeconds) || 5, 0), 60),
    slides,
  }
}

async function resolveCategoryStrip(section) {
  const categories = await loadCategories(section.settings)
  if (!categories.length) return null
  return {
    id: section.id,
    type: section.type,
    title: section.title || '',
    categories,
  }
}

async function resolveProductRail(section) {
  const products = await loadProductsBySource(section.settings)
  if (!products.length) return null
  return {
    id: section.id,
    type: section.type,
    title: section.title || '',
    layout: section.settings?.layout === 'carousel' ? 'carousel' : 'grid',
    seeAll: Boolean(section.settings?.seeAll),
    seeAllLink: publicLink(section.settings?.seeAllLink),
    products,
  }
}

async function resolveCategoryRails(section) {
  const categories = await loadCategories(section.settings)
  if (!categories.length) return null
  const limit = Math.min(Math.max(Number(section.settings?.limitPerRow) || 12, 1), 48)
  const rows = []
  for (const category of categories) {
    const dbCategory = await prisma.category.findFirst({ where: { slug: category.slug, isActive: true } })
    if (!dbCategory) continue
    const products = await prisma.product.findMany({
      where: { isActive: true, ...categoryProductWhere(dbCategory.id) },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      take: limit,
      include: PRODUCT_CATEGORY_INCLUDE,
    })
    if (!products.length) continue
    rows.push({
      category,
      products: products.map(formatProduct),
    })
  }
  if (!rows.length) return null
  return {
    id: section.id,
    type: section.type,
    title: section.title || '',
    rows,
  }
}

async function resolveImageBanner(section) {
  const image = toPublicAssetUrl(section.settings?.image)
  const mobileImage = toPublicAssetUrl(section.settings?.mobileImage)
  if (!image && !mobileImage) return null
  return {
    id: section.id,
    type: section.type,
    title: section.title || '',
    image: image || null,
    mobileImage: mobileImage || null,
    alt: String(section.settings?.alt || ''),
    link: publicLink(section.settings?.link),
  }
}

async function resolveMobileBanner(section) {
  const image = toPublicAssetUrl(section.settings?.image)
  if (!image) return null
  return {
    id: section.id,
    type: section.type,
    title: section.title || '',
    image,
    alt: String(section.settings?.alt || ''),
    fullWidth: Boolean(section.settings?.fullWidth),
    link: publicLink(section.settings?.link),
  }
}

async function resolvePromoSlider(section) {
  const slides = (Array.isArray(section.settings?.slides) ? section.settings.slides : [])
    .map((slide) => ({
      id: String(slide?.id || ''),
      image: toPublicAssetUrl(slide?.image) || null,
      alt: String(slide?.alt || ''),
      link: publicLink(slide?.link),
    }))
    .filter((slide) => slide.image)

  if (!slides.length) return null
  return {
    id: section.id,
    type: section.type,
    title: section.title || '',
    autoplaySeconds: Math.min(
      Math.max(Number(section.settings?.autoplaySeconds) > 0 ? Number(section.settings.autoplaySeconds) : 3, 1),
      60,
    ),
    slides,
  }
}

async function resolveReviews(section) {
  const limit = Math.min(Math.max(Number(section.settings?.limit) || 10, 1), 50)
  const reviews = await prisma.review.findMany({
    where: { isApproved: true },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
  if (!reviews.length) return null
  return {
    id: section.id,
    type: section.type,
    title: section.title || '',
    reviews: reviews.map((review) => ({
      id: review.id,
      title: review.title,
      content: review.content,
      name: review.name,
      image: toPublicAssetUrl(review.image),
      rating: review.rating,
    })),
  }
}

async function resolveBlogPosts(section) {
  const limit = Math.min(Math.max(Number(section.settings?.limit) || 6, 1), 50)
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    take: limit,
  })
  if (!posts.length) return null
  return {
    id: section.id,
    type: section.type,
    title: section.title || '',
    posts: posts.map(formatBlogSummary),
  }
}

const RESOLVERS = {
  banner_slider: resolveBannerSlider,
  category_strip: resolveCategoryStrip,
  product_rail: resolveProductRail,
  category_rails: resolveCategoryRails,
  image_banner: resolveImageBanner,
  mobile_banner: resolveMobileBanner,
  promo_slider: resolvePromoSlider,
  reviews: resolveReviews,
  blog_posts: resolveBlogPosts,
}

export async function resolveDocument(document, { now = new Date(), platform = null } = {}) {
  const normalized = normalizeDocument(document, platform)
  const sections = []
  for (const section of normalized.sections) {
    if (!isSectionLive(section, now)) continue
    const resolver = RESOLVERS[section.type]
    if (!resolver) continue
    const resolved = await resolver(section)
    if (resolved) sections.push(resolved)
  }
  return { schemaVersion: normalized.schemaVersion, sections }
}
