import {
  BLOCK_TYPES,
  LINK_TYPES,
  MAX_SECTIONS,
  MAX_SLIDES,
  PLATFORMS,
  SCHEMA_VERSION,
  getBlockType,
  normalizeDocument,
} from './blocks.js'

function pushError(errors, sectionId, field, message) {
  errors.push({ sectionId: sectionId || null, field, message })
}

function isIsoDate(value) {
  if (value == null || value === '') return true
  const date = new Date(value)
  return !Number.isNaN(date.getTime())
}

function validateLink(link, sectionId, fieldPrefix, errors, { required = false } = {}) {
  const type = String(link?.type || 'none')
  const value = String(link?.value || '').trim()
  if (!LINK_TYPES.includes(type)) {
    pushError(errors, sectionId, `${fieldPrefix}.type`, 'Invalid link type.')
    return
  }
  if (type === 'none') {
    if (required) pushError(errors, sectionId, fieldPrefix, 'A link is required.')
    return
  }
  if (type === 'shop') return
  if (type === 'url') {
    if (!/^https?:\/\//i.test(value)) {
      pushError(errors, sectionId, `${fieldPrefix}.value`, 'Enter a full URL starting with http:// or https://.')
    }
    return
  }
  if (!value) {
    pushError(errors, sectionId, `${fieldPrefix}.value`, `Choose a ${type}.`)
  }
}

function validateSchedule(schedule, sectionId, errors) {
  if (!isIsoDate(schedule?.startAt)) {
    pushError(errors, sectionId, 'schedule.startAt', 'Invalid start date.')
  }
  if (!isIsoDate(schedule?.endAt)) {
    pushError(errors, sectionId, 'schedule.endAt', 'Invalid end date.')
  }
  if (schedule?.startAt && schedule?.endAt) {
    const start = new Date(schedule.startAt).getTime()
    const end = new Date(schedule.endAt).getTime()
    if (start > end) {
      pushError(errors, sectionId, 'schedule', 'End date must be after start date.')
    }
  }
}

function slideHasImage(slide, platform) {
  if (platform === 'mobile' || !Object.prototype.hasOwnProperty.call(slide || {}, 'mobileImage')) {
    return Boolean(String(slide?.image || '').trim())
  }
  return Boolean(String(slide?.image || '').trim() || String(slide?.mobileImage || '').trim())
}

function isEmptySlide(slide, platform) {
  const linkType = String(slide?.link?.type || 'none')
  const linkValue = String(slide?.link?.value || '').trim()
  const hasLink = linkType !== 'none' && (linkType === 'shop' || Boolean(linkValue))
  return !slideHasImage(slide, platform) && !hasLink && !String(slide?.alt || '').trim()
}

function validateSlideList(section, errors, platform, { dualImage = false } = {}) {
  const slides = Array.isArray(section.settings?.slides) ? section.settings.slides : []
  if (slides.length > MAX_SLIDES) {
    pushError(errors, section.id, 'settings.slides', `At most ${MAX_SLIDES} slides.`)
  }
  const autoplay = Number(section.settings?.autoplaySeconds)
  if (!Number.isFinite(autoplay) || autoplay < 0 || autoplay > 60) {
    pushError(errors, section.id, 'settings.autoplaySeconds', 'Autoplay must be between 0 and 60 seconds.')
  }
  const filled = slides.filter((slide) => !isEmptySlide(slide, dualImage ? platform : 'mobile'))
  if (!filled.length) {
    pushError(errors, section.id, 'settings.slides', 'Add at least one slide with an image.')
    return
  }
  slides.forEach((slide, index) => {
    if (isEmptySlide(slide, dualImage ? platform : 'mobile')) return
    const prefix = `settings.slides[${index}]`
    if (dualImage && platform === 'web') {
      if (!String(slide?.image || '').trim() && !String(slide?.mobileImage || '').trim()) {
        pushError(errors, section.id, `${prefix}.image`, 'Each slide needs a desktop or mobile image.')
      }
    } else if (!String(slide?.image || '').trim()) {
      pushError(errors, section.id, `${prefix}.image`, 'Each slide needs an image.')
    }
    validateLink(slide?.link, section.id, `${prefix}.link`, errors)
  })
}

function validateBannerSlider(section, errors, platform) {
  validateSlideList(section, errors, platform, { dualImage: true })
}

function validatePromoSlider(section, errors) {
  validateSlideList(section, errors, 'mobile', { dualImage: false })
}

function validateMobileBanner(section, errors) {
  if (!String(section.settings?.image || '').trim()) {
    pushError(errors, section.id, 'settings.image', 'Upload an image.')
  }
  validateLink(section.settings?.link, section.id, 'settings.link', errors)
}

function validateCategoryStrip(section, errors) {
  const mode = String(section.settings?.mode || 'all')
  if (!['all', 'picked'].includes(mode)) {
    pushError(errors, section.id, 'settings.mode', 'Mode must be all or picked.')
  }
  if (mode === 'picked') {
    const slugs = Array.isArray(section.settings?.categorySlugs) ? section.settings.categorySlugs : []
    if (!slugs.length) {
      pushError(errors, section.id, 'settings.categorySlugs', 'Pick at least one category.')
    }
  }
}

function validateProductRail(section, errors) {
  const source = String(section.settings?.source || '')
  const allowed = ['bestSeller', 'featured', 'imported', 'category', 'picked']
  if (!allowed.includes(source)) {
    pushError(errors, section.id, 'settings.source', 'Choose a product source.')
  }
  if (source === 'category' && !String(section.settings?.categorySlug || '').trim()) {
    pushError(errors, section.id, 'settings.categorySlug', 'Choose a category.')
  }
  if (source === 'picked') {
    const slugs = Array.isArray(section.settings?.productSlugs) ? section.settings.productSlugs : []
    if (!slugs.length) {
      pushError(errors, section.id, 'settings.productSlugs', 'Pick at least one product.')
    }
  }
  const limit = Number(section.settings?.limit)
  if (!Number.isFinite(limit) || limit < 1 || limit > 100) {
    pushError(errors, section.id, 'settings.limit', 'Limit must be between 1 and 100.')
  }
  const layout = String(section.settings?.layout || 'grid')
  if (!['grid', 'carousel'].includes(layout)) {
    pushError(errors, section.id, 'settings.layout', 'Layout must be grid or carousel.')
  }
  if (section.settings?.seeAll) {
    validateLink(section.settings?.seeAllLink, section.id, 'settings.seeAllLink', errors, { required: true })
  }
}

function validateCategoryRails(section, errors) {
  const mode = String(section.settings?.mode || 'picked')
  if (!['all', 'picked'].includes(mode)) {
    pushError(errors, section.id, 'settings.mode', 'Mode must be all or picked.')
  }
  if (mode === 'picked') {
    const slugs = Array.isArray(section.settings?.categorySlugs) ? section.settings.categorySlugs : []
    if (!slugs.length) {
      pushError(errors, section.id, 'settings.categorySlugs', 'Pick at least one category.')
    }
  }
  const limit = Number(section.settings?.limitPerRow)
  if (!Number.isFinite(limit) || limit < 1 || limit > 48) {
    pushError(errors, section.id, 'settings.limitPerRow', 'Limit per row must be between 1 and 48.')
  }
}

function validateImageBanner(section, errors, platform) {
  if (platform === 'mobile') {
    if (!String(section.settings?.image || '').trim()) {
      pushError(errors, section.id, 'settings.image', 'Upload an image.')
    }
  } else if (!String(section.settings?.image || '').trim() && !String(section.settings?.mobileImage || '').trim()) {
    pushError(errors, section.id, 'settings.image', 'Upload an image.')
  }
  validateLink(section.settings?.link, section.id, 'settings.link', errors)
}

function validateLimitSection(section, errors, field = 'settings.limit', max = 50) {
  const limit = Number(section.settings?.limit)
  if (!Number.isFinite(limit) || limit < 1 || limit > max) {
    pushError(errors, section.id, field, `Limit must be between 1 and ${max}.`)
  }
}

export function validateDocument(document, platform) {
  const errors = []
  if (!PLATFORMS.includes(platform)) {
    pushError(errors, null, 'platform', 'Platform must be web or mobile.')
    return { ok: false, errors, document: normalizeDocument(document) }
  }

  const normalized = normalizeDocument(document, platform)
  if (normalized.schemaVersion !== SCHEMA_VERSION) {
    pushError(errors, null, 'schemaVersion', `Unsupported schema version ${normalized.schemaVersion}.`)
  }
  if (normalized.sections.length > MAX_SECTIONS) {
    pushError(errors, null, 'sections', `At most ${MAX_SECTIONS} sections.`)
  }

  const seenIds = new Set()
  for (const section of normalized.sections) {
    if (!section.id) pushError(errors, null, 'sections', 'Every section needs an id.')
    if (seenIds.has(section.id)) pushError(errors, section.id, 'id', 'Duplicate section id.')
    seenIds.add(section.id)

    const block = getBlockType(section.type)
    if (!block) {
      pushError(errors, section.id, 'type', `Unknown section type “${section.type}”.`)
      continue
    }
    if (!block.platforms.includes(platform)) {
      pushError(errors, section.id, 'type', `“${block.label}” is not available on ${platform}.`)
    }

    validateSchedule(section.schedule, section.id, errors)

    switch (section.type) {
      case 'banner_slider':
        validateBannerSlider(section, errors, platform)
        break
      case 'category_strip':
        validateCategoryStrip(section, errors)
        break
      case 'product_rail':
        validateProductRail(section, errors)
        break
      case 'category_rails':
        validateCategoryRails(section, errors)
        break
      case 'image_banner':
        validateImageBanner(section, errors, platform)
        break
      case 'mobile_banner':
        validateMobileBanner(section, errors)
        break
      case 'promo_slider':
        validatePromoSlider(section, errors)
        break
      case 'reviews':
      case 'blog_posts':
        validateLimitSection(section, errors)
        break
      default:
        break
    }
  }

  return { ok: errors.length === 0, errors, document: normalized }
}

export function assertKnownTypes(document) {
  return (document?.sections || []).every((section) => Boolean(BLOCK_TYPES[section?.type]))
}
