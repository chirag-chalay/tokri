import { normalizeUploadUrl, normalizeUploadHtml } from '../../../shared/assets.js'
import { env } from '../config/env.js'
import { formatCategoryRef, productCategoryList } from './catalog.js'

export function toPublicAssetUrl(value) {
  if (!value) return null
  const normalized = normalizeUploadUrl(String(value), env.publicAssetUrl)
  return normalized.startsWith('/') && !normalized.startsWith('//')
    ? `${env.publicAssetUrl}${normalized}`
    : normalized
}

export function toPublicAssetHtml(value) {
  return normalizeUploadHtml(value, env.publicAssetUrl)
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
    description: toPublicAssetHtml(product.description),
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
    body: toPublicAssetHtml(page.body) || '',
    updatedAt: page.updatedAt,
  }
}

export function formatBlogSummary(post) {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || '',
    coverImage: toPublicAssetUrl(post.coverImage) || '',
    author: post.author || 'Tokriii',
    category: post.category || '',
    publishedAt: post.publishedAt || post.createdAt,
  }
}

export function formatBlog(post) {
  return {
    ...formatBlogSummary(post),
    body: toPublicAssetHtml(post.body) || '',
  }
}

function formatCurrency(value) {
  return `₹${value.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`
}
