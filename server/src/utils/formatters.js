import { env } from '../config/env.js'
import { formatCategoryRef, productCategoryList } from './catalog.js'

const KNOWN_UPLOAD_HOSTS = new Set(['tokriii.com', 'www.tokriii.com', 'server.tokriii.com'])

export function toPublicAssetUrl(value) {
  if (!value) return null
  const raw = String(value)

  // Absolute upload URLs: normalize to the configured public asset host for this environment.
  if (/^(https?:|data:|blob:)/i.test(raw)) {
    try {
      const url = new URL(raw)
      if (url.pathname.startsWith('/uploads/') && KNOWN_UPLOAD_HOSTS.has(url.hostname)) {
        return `${env.publicAssetUrl}${url.pathname}${url.search}`
      }
    } catch {
      // keep raw
    }
    return raw
  }

  if (raw.startsWith('/')) {
    return `${env.publicAssetUrl}${raw}`
  }
  return raw
}

export function formatProduct(product) {
  const priceValue = Number(product.priceValue)
  const oldPriceValue = product.oldPriceValue ? Number(product.oldPriceValue) : null

  const categories = productCategoryList(product).map(formatCategoryRef)
  const primary = categories[0] || null

  return {
    id: product.slug,
    slug: product.slug,
    name: product.name,
    description: product.description,
    price: formatCurrency(priceValue),
    priceValue,
    oldPrice: oldPriceValue ? formatCurrency(oldPriceValue) : null,
    oldPriceValue,
    currency: product.currency,
    weight: product.weight,
    image: toPublicAssetUrl(product.image),
    badge: product.badge,
    categoryId: primary?.slug ?? null,
    category: primary,
    categories,
    isBestSeller: product.isBestSeller,
    isImported: product.isImported,
    isFeatured: product.isFeatured,
    stock: product.stock,
    hsnCode: product.hsnCode || '0808',
    gstRate: Number(product.gstRate ?? 0),
    isTaxable: Boolean(product.isTaxable),
  }
}

export function formatCategory(category, { includeProducts = false } = {}) {
  const base = {
    id: category.slug,
    slug: category.slug,
    label: category.label,
    title: category.title || category.label,
    subtitle: category.subtitle,
    description: category.description,
    image: toPublicAssetUrl(category.image),
    bannerImage: toPublicAssetUrl(category.bannerImage),
    sortOrder: category.sortOrder,
    productDisplayLimit: Math.min(
      Math.max(Number(category.productDisplayLimit) || 12, 1),
      100,
    ),
    productCount:
      category._count?.productLinks ??
      category._count?.products ??
      category.products?.length ??
      0,
  }

  if (includeProducts && category.products) {
    base.products = category.products.map(formatProduct)
  }

  return base
}

export function formatPage(page) {
  return {
    slug: page.slug,
    title: page.title,
    body: page.body || '',
    updatedAt: page.updatedAt,
  }
}

export function formatBlogSummary(post) {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || '',
    coverImage: post.coverImage || '',
    author: post.author || 'Tokriii',
    category: post.category || '',
    publishedAt: post.publishedAt || post.createdAt,
  }
}

export function formatBlog(post) {
  return {
    ...formatBlogSummary(post),
    body: post.body || '',
  }
}

function formatCurrency(value) {
  return `₹${value.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`
}
