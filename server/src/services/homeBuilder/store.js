import { prisma } from '../../lib/prisma.js'
import { parseFeaturedCategorySlugs } from '../../utils/settings.js'
import {
  MAX_REVISION_HISTORY,
  PLATFORMS,
  buildDefaultDocument,
  cloneDocument,
  documentsEqual,
  emptyDocument,
  normalizeDocument,
} from './blocks.js'
import { validateDocument } from './validate.js'
import { resolveDocument } from './resolve.js'
import { createPreviewToken } from './preview.js'

const cache = new Map()
const CACHE_TTL_MS = 30_000

function cacheKey(platform, mode) {
  return `${platform}:${mode}`
}

export function invalidateHomeCache(platform) {
  if (platform) {
    cache.delete(cacheKey(platform, 'published'))
    cache.delete(cacheKey(platform, 'draft'))
    return
  }
  cache.clear()
}

function readCache(key) {
  const hit = cache.get(key)
  if (!hit) return null
  if (Date.now() > hit.expiresAt) {
    cache.delete(key)
    return null
  }
  return hit.value
}

function writeCache(key, value) {
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS })
  return value
}

function assertPlatform(platform) {
  if (!PLATFORMS.includes(platform)) {
    const error = new Error('Platform must be web or mobile.')
    error.status = 400
    throw error
  }
}

async function settingsForDefault() {
  const settings = await prisma.setting.findUnique({ where: { id: 1 } })
  if (!settings) return {}
  return {
    bannerImage: settings.homeBannerImage || '',
    mobileBannerImage: settings.homeMobileBannerImage || '',
    highlightImage: settings.homeHighlightImage || '',
    featuredCategorySlugs: parseFeaturedCategorySlugs(settings.homeFeaturedCategorySlugs),
  }
}

export async function getDefaultDocument(platform) {
  assertPlatform(platform)
  return buildDefaultDocument(platform, await settingsForDefault())
}

async function getOrNullLayout(platform) {
  return prisma.homeLayout.findUnique({ where: { platform } })
}

export async function getLayoutState(platform) {
  assertPlatform(platform)
  const layout = await getOrNullLayout(platform)
  const defaultDocument = await getDefaultDocument(platform)
  if (!layout) {
    return {
      platform,
      exists: false,
      draft: defaultDocument,
      published: null,
      version: 0,
      publishedAt: null,
      hasUnpublishedChanges: true,
      revisions: [],
      previewToken: createPreviewToken(platform),
      blockTypes: null,
    }
  }

  const draft = normalizeDocument(layout.draft, platform)
  const published = layout.published ? normalizeDocument(layout.published, platform) : null
  const revisions = await prisma.homeLayoutRevision.findMany({
    where: { layoutId: layout.id },
    orderBy: { version: 'desc' },
    take: MAX_REVISION_HISTORY,
    select: {
      id: true,
      version: true,
      publishedById: true,
      createdAt: true,
    },
  })

  return {
    platform,
    exists: true,
    draft,
    published,
    version: layout.version,
    publishedAt: layout.publishedAt,
    publishedById: layout.publishedById,
    hasUnpublishedChanges: !published || !documentsEqual(draft, published),
    revisions,
    previewToken: createPreviewToken(platform),
  }
}

export async function saveDraft(platform, document, { allowInvalid = true } = {}) {
  assertPlatform(platform)
  if (document == null || typeof document !== 'object') {
    const error = new Error('Draft document is missing. Reload the builder and try again.')
    error.status = 400
    throw error
  }
  const validation = validateDocument(document, platform)
  if (!validation.ok && !allowInvalid) {
    const error = new Error('Draft has validation errors.')
    error.status = 400
    error.errors = validation.errors
    throw error
  }

  const draft = validation.document
  const existing = await getOrNullLayout(platform)
  if (!existing) {
    await prisma.homeLayout.create({
      data: {
        platform,
        draft,
        published: null,
        version: 0,
      },
    })
  } else {
    await prisma.homeLayout.update({
      where: { platform },
      data: { draft },
    })
  }
  invalidateHomeCache(platform)
  return getLayoutState(platform)
}

export async function publishLayout(platform, { publishedById = null, document } = {}) {
  assertPlatform(platform)
  let draftDocument = document
  if (!draftDocument) {
    const state = await getLayoutState(platform)
    draftDocument = state.draft
  }

  const validation = validateDocument(draftDocument, platform)
  if (!validation.ok) {
    const error = new Error('Fix validation errors before publishing.')
    error.status = 400
    error.errors = validation.errors
    throw error
  }

  const draft = validation.document
  const existing = await getOrNullLayout(platform)
  const nextVersion = (existing?.version || 0) + 1

  const layout = await prisma.$transaction(async (tx) => {
    let current = existing
    if (!current) {
      current = await tx.homeLayout.create({
        data: {
          platform,
          draft,
          published: draft,
          version: nextVersion,
          publishedAt: new Date(),
          publishedById,
        },
      })
    } else {
      current = await tx.homeLayout.update({
        where: { platform },
        data: {
          draft,
          published: draft,
          version: nextVersion,
          publishedAt: new Date(),
          publishedById,
        },
      })
    }

    await tx.homeLayoutRevision.create({
      data: {
        layoutId: current.id,
        version: nextVersion,
        document: draft,
        publishedById,
      },
    })

    const revisions = await tx.homeLayoutRevision.findMany({
      where: { layoutId: current.id },
      orderBy: { version: 'desc' },
      select: { id: true, version: true },
    })
    const overflow = revisions.slice(MAX_REVISION_HISTORY)
    if (overflow.length) {
      await tx.homeLayoutRevision.deleteMany({
        where: { id: { in: overflow.map((item) => item.id) } },
      })
    }

    return current
  })

  invalidateHomeCache(platform)
  return {
    ...(await getLayoutState(platform)),
    publishedVersion: layout.version,
  }
}

export async function discardDraft(platform) {
  assertPlatform(platform)
  const existing = await getOrNullLayout(platform)
  if (!existing) {
    return getLayoutState(platform)
  }
  if (!existing.published) {
    await prisma.homeLayout.update({
      where: { platform },
      data: { draft: await getDefaultDocument(platform) },
    })
  } else {
    await prisma.homeLayout.update({
      where: { platform },
      data: { draft: normalizeDocument(existing.published, platform) },
    })
  }
  invalidateHomeCache(platform)
  return getLayoutState(platform)
}

export async function restoreRevision(platform, version, { publishedById = null } = {}) {
  assertPlatform(platform)
  const existing = await getOrNullLayout(platform)
  if (!existing) {
    const error = new Error('No layout to restore.')
    error.status = 404
    throw error
  }
  const revision = await prisma.homeLayoutRevision.findFirst({
    where: { layoutId: existing.id, version: Number(version) },
  })
  if (!revision) {
    const error = new Error('Revision not found.')
    error.status = 404
    throw error
  }
  await prisma.homeLayout.update({
    where: { platform },
    data: { draft: normalizeDocument(revision.document, platform) },
  })
  invalidateHomeCache(platform)
  return getLayoutState(platform)
}

export async function getPublishedHome(platform) {
  assertPlatform(platform)
  const key = cacheKey(platform, 'published')
  const cached = readCache(key)
  if (cached) return cached

  const layout = await getOrNullLayout(platform)
  if (!layout?.published) {
    return writeCache(key, { platform, version: 0, publishedAt: null, sections: null })
  }

  const resolved = await resolveDocument(layout.published, { platform })
  // Empty published layouts must not blank the storefront — clients fall back to legacy home.
  if (!Array.isArray(resolved.sections) || resolved.sections.length === 0) {
    return writeCache(key, { platform, version: layout.version, publishedAt: layout.publishedAt, sections: null })
  }
  return writeCache(key, {
    platform,
    version: layout.version,
    publishedAt: layout.publishedAt,
    ...resolved,
  })
}

export async function getDraftPreview(platform) {
  assertPlatform(platform)
  const state = await getLayoutState(platform)
  const resolved = await resolveDocument(state.draft, { platform })
  return {
    platform,
    preview: true,
    version: state.version,
    ...resolved,
  }
}

export async function searchCategories(query = '', limit = 30) {
  const q = String(query || '').trim()
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
      ...(q
        ? {
            OR: [
              { label: { contains: q } },
              { title: { contains: q } },
              { slug: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { sortOrder: 'asc' },
    take: Math.min(Math.max(Number(limit) || 30, 1), 100),
  })
  return categories.map((category) => ({
    slug: category.slug,
    label: category.label,
    title: category.title || category.label,
    image: category.image,
  }))
}

export async function searchProducts(query = '', limit = 30) {
  const q = String(query || '').trim()
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { slug: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    take: Math.min(Math.max(Number(limit) || 30, 1), 100),
  })
  return products.map((product) => ({
    slug: product.slug,
    name: product.name,
    image: product.image,
    priceValue: Number(product.priceValue),
  }))
}

export { emptyDocument, normalizeDocument, cloneDocument }
