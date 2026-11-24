/** Single registry of homepage section types. Admin forms and API share this. */

export const PLATFORMS = ['web', 'mobile']
export const SCHEMA_VERSION = 1
export const MAX_SECTIONS = 40
export const MAX_SLIDES = 10
export const MAX_REVISION_HISTORY = 20
export const PREVIEW_TTL_SECONDS = 30 * 60

export const LINK_TYPES = ['none', 'shop', 'category', 'product', 'url']

const emptyLink = () => ({ type: 'none', value: '' })

const emptySchedule = () => ({ startAt: null, endAt: null })

export const BLOCK_TYPES = {
  banner_slider: {
    type: 'banner_slider',
    label: 'Banner slider',
    platforms: ['web', 'mobile'],
    description: 'One or more banner images with optional links.',
    recommended: {
      desktop: 'Best size: 1400×350 px (about 4:1). JPG/WebP · aim under 400KB (max 5MB).',
      mobile: 'Best size: 720×360 px (about 2:1). JPG/WebP · aim under 250KB (max 5MB).',
    },
    defaults: () => ({
      autoplaySeconds: 5,
      slides: [
        {
          id: newSectionId('slide'),
          image: '',
          mobileImage: '',
          alt: '',
          link: emptyLink(),
        },
      ],
    }),
  },
  category_strip: {
    type: 'category_strip',
    label: 'Category strip',
    platforms: ['web', 'mobile'],
    description: 'Horizontal row of category images.',
    defaults: () => ({
      mode: 'all',
      categorySlugs: [],
    }),
  },
  product_rail: {
    type: 'product_rail',
    label: 'Product rail',
    platforms: ['web', 'mobile'],
    description: 'Grid or carousel of products from a source.',
    defaults: () => ({
      source: 'bestSeller',
      categorySlug: '',
      productSlugs: [],
      limit: 12,
      layout: 'grid',
      seeAll: false,
      seeAllLink: emptyLink(),
    }),
  },
  category_rails: {
    type: 'category_rails',
    label: 'Category products',
    platforms: ['web', 'mobile'],
    description: 'One product row per category.',
    defaults: () => ({
      mode: 'picked',
      categorySlugs: [],
      limitPerRow: 12,
    }),
  },
  image_banner: {
    type: 'image_banner',
    label: 'Image banner',
    platforms: ['web'],
    description: 'Single promotional image with a link (website).',
    recommended: {
      desktop: 'Best size: 1200×500 px (about 2.4:1). JPG/WebP · aim under 400KB (max 5MB).',
      mobile: 'Best size: 720×360 px (about 2:1). JPG/WebP · aim under 250KB (max 5MB).',
    },
    defaults: () => ({
      image: '',
      mobileImage: '',
      alt: '',
      link: emptyLink(),
    }),
  },
  mobile_banner: {
    type: 'mobile_banner',
    label: 'Mobile banner',
    platforms: ['mobile'],
    description: 'Single full-width image with a link (app only).',
    recommended: {
      mobile: 'Best size: 720×360 px (about 2:1). JPG/WebP · aim under 250KB (max 5MB).',
    },
    defaults: () => ({
      image: '',
      alt: '',
      link: emptyLink(),
      fullWidth: false,
    }),
  },
  promo_slider: {
    type: 'promo_slider',
    label: 'Promo slider',
    platforms: ['mobile'],
    description: 'Peeking card carousel — one image and link per slide (app only).',
    recommended: {
      mobile: 'Best size: 720×360 px (about 2:1). Keep text/logo centered. JPG/WebP · aim under 250KB (max 5MB).',
    },
    defaults: () => ({
      autoplaySeconds: 3,
      slides: [
        {
          id: newSectionId('slide'),
          image: '',
          alt: '',
          link: emptyLink(),
        },
      ],
    }),
  },
  reviews: {
    type: 'reviews',
    label: 'Reviews',
    platforms: ['web'],
    description: 'Approved customer reviews (website only).',
    defaults: () => ({
      limit: 10,
    }),
  },
  blog_posts: {
    type: 'blog_posts',
    label: 'Blog posts',
    platforms: ['web'],
    description: 'Latest published blog posts (website only).',
    defaults: () => ({
      limit: 6,
    }),
  },
}

export function listBlockTypes(platform) {
  return Object.values(BLOCK_TYPES).filter((block) => block.platforms.includes(platform))
}

export function getBlockType(type) {
  return BLOCK_TYPES[type] || null
}

export function newSectionId(prefix = 's') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

export function createSection(type, overrides = {}) {
  const block = getBlockType(type)
  if (!block) throw new Error(`Unknown section type: ${type}`)
  return {
    id: newSectionId(),
    type,
    visible: true,
    title: defaultTitleFor(type),
    settings: block.defaults(),
    schedule: emptySchedule(),
    ...overrides,
    settings: {
      ...block.defaults(),
      ...(overrides.settings || {}),
    },
  }
}

function defaultTitleFor(type) {
  switch (type) {
    case 'product_rail':
      return 'Bestsellers'
    case 'category_strip':
      return 'Shop By Categories'
    case 'category_rails':
      return ''
    case 'reviews':
      return 'What customers say'
    case 'blog_posts':
      return 'From the blog'
    case 'image_banner':
      return ''
    case 'banner_slider':
      return ''
    default:
      return ''
  }
}

export function emptyDocument() {
  return { schemaVersion: SCHEMA_VERSION, sections: [] }
}

export function cloneDocument(document) {
  return JSON.parse(JSON.stringify(document || emptyDocument()))
}

export function documentsEqual(a, b) {
  return JSON.stringify(normalizeDocument(a)) === JSON.stringify(normalizeDocument(b))
}

function normalizeImagePair(image, mobileImage, platform) {
  let nextImage = image == null ? '' : String(image)
  let nextMobile = mobileImage == null ? '' : String(mobileImage)
  if (platform === 'mobile') {
    if (!nextImage.trim() && nextMobile.trim()) nextImage = nextMobile
    nextMobile = ''
  }
  return { image: nextImage, mobileImage: nextMobile }
}

function normalizeSectionSettings(type, settings, platform) {
  const base = settings && typeof settings === 'object' ? { ...settings } : {}
  if (type === 'banner_slider') {
    const slides = Array.isArray(base.slides) ? base.slides : []
    base.slides = slides.map((slide) => {
      const pair = normalizeImagePair(slide?.image, slide?.mobileImage, platform)
      return {
        ...slide,
        image: pair.image,
        mobileImage: pair.mobileImage,
      }
    })
  }
  if (type === 'promo_slider') {
    const slides = Array.isArray(base.slides) ? base.slides : []
    base.slides = slides.map((slide) => ({
      ...slide,
      image: slide?.image == null ? '' : String(slide.image),
      alt: slide?.alt == null ? '' : String(slide.alt),
      link: slide?.link && typeof slide.link === 'object' ? slide.link : emptyLink(),
    }))
  }
  if (type === 'image_banner') {
    const pair = normalizeImagePair(base.image, base.mobileImage, platform)
    base.image = pair.image
    base.mobileImage = pair.mobileImage
  }
  if (type === 'mobile_banner') {
    base.image = base.image == null ? '' : String(base.image)
    base.alt = base.alt == null ? '' : String(base.alt)
    base.fullWidth = Boolean(base.fullWidth)
    if (!base.link || typeof base.link !== 'object') base.link = emptyLink()
    delete base.mobileImage
  }
  return base
}

export function normalizeDocument(document, platform = null) {
  const sections = Array.isArray(document?.sections) ? document.sections : []
  return {
    schemaVersion: Number(document?.schemaVersion) || SCHEMA_VERSION,
    sections: sections.map((section) => {
      const type = String(section?.type || '')
      return {
        id: String(section?.id || newSectionId()),
        type,
        visible: section?.visible !== false,
        title: section?.title == null ? '' : String(section.title),
        settings: normalizeSectionSettings(type, section?.settings, platform),
        schedule: {
          startAt: section?.schedule?.startAt || null,
          endAt: section?.schedule?.endAt || null,
        },
      }
    }),
  }
}

export function buildDefaultDocument(platform, settings = {}) {
  const home = settings?.home || settings || {}
  const bannerImage = home.bannerImage || home.homeBannerImage || ''
  const mobileBannerImage = home.mobileBannerImage || home.homeMobileBannerImage || ''
  const highlightImage = home.highlightImage || home.homeHighlightImage || ''
  const featuredSlugs = Array.isArray(home.featuredCategorySlugs)
    ? home.featuredCategorySlugs
    : Array.isArray(home.homeFeaturedCategorySlugs)
      ? home.homeFeaturedCategorySlugs
      : []

  if (platform === 'mobile') {
    return normalizeDocument({
      schemaVersion: SCHEMA_VERSION,
      sections: [
        createSection('category_strip', { title: 'Categories' }),
        createSection('product_rail', {
          title: 'Bestsellers',
          settings: { source: 'bestSeller', limit: 12, layout: 'grid' },
        }),
        createSection('category_rails', {
          title: '',
          settings: { mode: 'all', categorySlugs: [], limitPerRow: 6 },
        }),
      ],
    })
  }

  const sections = []
  if (bannerImage || mobileBannerImage) {
    sections.push(
      createSection('banner_slider', {
        title: '',
        settings: {
          autoplaySeconds: 5,
          slides: [
            {
              id: newSectionId('slide'),
              image: String(bannerImage || ''),
              mobileImage: String(mobileBannerImage || ''),
              alt: 'Home banner',
              link: { type: 'shop', value: '' },
            },
          ],
        },
      }),
    )
  } else {
    sections.push(createSection('banner_slider'))
  }

  sections.push(createSection('category_strip', { title: 'Shop By Categories' }))
  sections.push(
    createSection('product_rail', {
      title: 'Shop Our Bestsellers',
      settings: { source: 'bestSeller', limit: 12, layout: 'grid' },
    }),
  )
  sections.push(
    createSection('product_rail', {
      title: 'Seasonal Fruits',
      settings: { source: 'featured', limit: 100, layout: 'carousel' },
    }),
  )

  if (highlightImage) {
    sections.push(
      createSection('image_banner', {
        settings: {
          image: String(highlightImage),
          mobileImage: '',
          alt: 'Home highlight',
          link: { type: 'shop', value: '' },
        },
      }),
    )
  }

  if (featuredSlugs.length) {
    sections.push(
      createSection('category_rails', {
        settings: {
          mode: 'picked',
          categorySlugs: featuredSlugs.map(String),
          limitPerRow: 12,
        },
      }),
    )
  }

  sections.push(createSection('reviews', { title: 'What customers say', settings: { limit: 10 } }))

  return normalizeDocument({ schemaVersion: SCHEMA_VERSION, sections })
}
