import { logError } from '../monitoring/database.js'
import { prisma } from '../lib/prisma.js'

export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseCategoryIds(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return [...new Set(raw.map((item) => String(item).trim()).filter(Boolean))]
  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (!trimmed) return []
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) return parseCategoryIds(parsed)
    } catch {
      // comma-separated
    }
    return trimmed
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

export async function uniqueProductSlug(value, currentId) {
  const base = slugify(value)
  if (!base) return ''

  let candidate = base
  let suffix = 2

  while (
    await prisma.product.findFirst({
      where: {
        slug: candidate,
        ...(currentId ? { NOT: { id: currentId } } : {}),
      },
      select: { id: true },
    })
  ) {
    candidate = `${base}-${suffix}`
    suffix += 1
  }

  return candidate
}

export async function syncProductCategories(productId, categoryIds) {
  if (!prisma.productCategory) return
  const unique = [...new Set((categoryIds || []).filter(Boolean))]
  try {
    await prisma.productCategory.deleteMany({ where: { productId } })
    if (!unique.length) return
    await prisma.productCategory.createMany({
      data: unique.map((categoryId) => ({ productId, categoryId })),
    })
  } catch (error) {
    logError(error, 'background')
  }
}

export async function prepareProductPayload(request) {
  if (request.method !== 'post') return request

  const payload = request.payload || {}
  const currentId = request.params?.recordId
  const source = String(payload.slug ?? '').trim() || String(payload.name ?? '').trim()

  if (!source) {
    throw new Error('Product name is required to generate a slug.')
  }

  payload.slug = await uniqueProductSlug(source, currentId)

  if (payload.mediaId && !payload.image) {
    const media = await prisma.media.findUnique({ where: { id: payload.mediaId } })
    if (media) payload.image = media.path
  }

  const slugs = parseCategoryIds(payload.categoryIds)
  const matched = slugs.length
    ? await prisma.category.findMany({
        where: { slug: { in: slugs } },
        select: { id: true, slug: true },
      })
    : []
  const categoryBySlug = new Map(matched.map((item) => [item.slug, item.id]))
  const categoryIds = slugs.map((slug) => categoryBySlug.get(slug)).filter(Boolean)
  request.tokriCategoryIds = categoryIds
  payload.category = categoryIds[0] || null
  delete payload.categoryIds

  request.payload = payload
  return request
}

export async function afterProductForm(response, request) {
  const record = response?.record
  if (!record) return response

  try {
    const productId = record.id || record.params?.id
    const postedIds = request.tokriCategoryIds || parseCategoryIds(record.params?.categoryIds)

    if (request.method === 'post' && productId) {
      await syncProductCategories(productId, postedIds)
      if (postedIds[0]) {
        await prisma.product.update({
          where: { id: productId },
          data: { categoryId: postedIds[0] },
        })
      }

      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { category: true },
      })
      if (product) {
        const catName = product.category?.label || 'General'
        await prisma.productTax.upsert({
          where: { productId },
          create: {
            productId,
            productName: product.name,
            categoryName: catName,
            hsnCode: product.hsnCode || '0808',
            gstRate: product.gstRate || 0,
            isTaxable: Boolean(product.isTaxable),
          },
          update: {
            productName: product.name,
            categoryName: catName,
            hsnCode: product.hsnCode || '0808',
            gstRate: product.gstRate || 0,
            isTaxable: Boolean(product.isTaxable),
          },
        }).catch((err) => logError(err, 'background'))
      }
    }

    if (productId && prisma.productCategory) {
      const rows = await prisma.productCategory.findMany({
        where: { productId },
        include: { category: { select: { slug: true } } },
      })
      let slugs = rows.map((row) => row.category?.slug).filter(Boolean)
      if (!slugs.length && record.params?.category) {
        const primary = await prisma.category.findUnique({
          where: { id: String(record.params.category) },
          select: { slug: true },
        })
        if (primary?.slug) slugs = [primary.slug]
      }
      record.params.categoryIds = JSON.stringify(slugs)
    }
  } catch (error) {
    logError(error, 'background')
  }

  return response
}
