import test from 'node:test'
import assert from 'node:assert/strict'
import {
  SCHEMA_VERSION,
  buildDefaultDocument,
  createSection,
  documentsEqual,
  listBlockTypes,
  normalizeDocument,
} from '../src/services/homeBuilder/blocks.js'
import { validateDocument } from '../src/services/homeBuilder/validate.js'
import { createPreviewToken, verifyPreviewToken } from '../src/services/homeBuilder/preview.js'
import { resolveDocument } from '../src/services/homeBuilder/resolve.js'
import {
  discardDraft,
  getLayoutState,
  getPublishedHome,
  invalidateHomeCache,
  publishLayout,
  restoreRevision,
  saveDraft,
} from '../src/services/homeBuilder/store.js'
import { prisma } from '../src/lib/prisma.js'

test('block registry exposes platform-specific types', () => {
  const webTypes = listBlockTypes('web').map((item) => item.type)
  const mobileTypes = listBlockTypes('mobile').map((item) => item.type)
  assert.ok(webTypes.includes('reviews'))
  assert.ok(webTypes.includes('blog_posts'))
  assert.ok(webTypes.includes('image_banner'))
  assert.equal(webTypes.includes('mobile_banner'), false)
  assert.equal(mobileTypes.includes('reviews'), false)
  assert.equal(mobileTypes.includes('image_banner'), false)
  assert.ok(mobileTypes.includes('product_rail'))
  assert.ok(mobileTypes.includes('mobile_banner'))
  assert.ok(mobileTypes.includes('promo_slider'))
  assert.equal(
    listBlockTypes('web').find((item) => item.type === 'category_rails')?.label,
    'Category products',
  )
})

test('default documents seed from settings-like home fields', () => {
  const web = buildDefaultDocument('web', {
    bannerImage: '/uploads/general/banner.webp',
    mobileBannerImage: '/uploads/general/banner-m.webp',
    highlightImage: '/uploads/general/highlight.webp',
    featuredCategorySlugs: ['apples', 'mangoes'],
  })
  assert.equal(web.schemaVersion, SCHEMA_VERSION)
  assert.equal(web.sections[0].type, 'banner_slider')
  assert.equal(web.sections[0].settings.slides[0].image, '/uploads/general/banner.webp')
  assert.ok(web.sections.some((section) => section.type === 'category_rails'))
  assert.ok(web.sections.some((section) => section.type === 'reviews'))

  const mobile = buildDefaultDocument('mobile', {})
  assert.equal(mobile.sections[0].type, 'category_strip')
  assert.equal(mobile.sections.some((section) => section.type === 'reviews'), false)
})

test('validation catches missing images, bad links, and platform mismatches', () => {
  const section = createSection('banner_slider', {
    settings: {
      autoplaySeconds: 5,
      slides: [{ id: 'slide_1', image: '', mobileImage: '', alt: '', link: { type: 'url', value: 'not-a-url' } }],
    },
  })
  const bad = validateDocument({ schemaVersion: SCHEMA_VERSION, sections: [section] }, 'web')
  assert.equal(bad.ok, false)
  assert.ok(bad.errors.some((error) => error.field.includes('image')))
  assert.ok(bad.errors.some((error) => error.field.includes('link')))

  const reviewsOnMobile = validateDocument(
    { schemaVersion: SCHEMA_VERSION, sections: [createSection('reviews')] },
    'mobile',
  )
  assert.equal(reviewsOnMobile.ok, false)
  assert.ok(reviewsOnMobile.errors.some((error) => /not available on mobile/.test(error.message)))
})

test('banner slider ignores empty extra slides until a real slide is missing', () => {
  const section = createSection('banner_slider', {
    settings: {
      autoplaySeconds: 5,
      slides: [
        { id: 'slide_1', image: '/uploads/home/a.webp', mobileImage: '', alt: '', link: { type: 'none', value: '' } },
        { id: 'slide_2', image: '', mobileImage: '', alt: '', link: { type: 'none', value: '' } },
      ],
    },
  })
  const ok = validateDocument({ schemaVersion: SCHEMA_VERSION, sections: [section] }, 'web')
  assert.equal(ok.ok, true)

  const onlyEmpty = createSection('banner_slider', {
    settings: {
      autoplaySeconds: 5,
      slides: [{ id: 'slide_1', image: '', mobileImage: '', alt: '', link: { type: 'none', value: '' } }],
    },
  })
  const bad = validateDocument({ schemaVersion: SCHEMA_VERSION, sections: [onlyEmpty] }, 'web')
  assert.equal(bad.ok, false)
  assert.ok(bad.errors.some((error) => /at least one slide/i.test(error.message)))
})

test('mobile normalize migrates mobileImage into image and clears dual field', () => {
  const section = createSection('banner_slider', {
    settings: {
      autoplaySeconds: 5,
      slides: [{ id: 'slide_1', image: '', mobileImage: '/uploads/home/app.webp', alt: '', link: { type: 'none', value: '' } }],
    },
  })
  const normalized = normalizeDocument({ schemaVersion: SCHEMA_VERSION, sections: [section] }, 'mobile')
  assert.equal(normalized.sections[0].settings.slides[0].image, '/uploads/home/app.webp')
  assert.equal(normalized.sections[0].settings.slides[0].mobileImage, '')

  const mobileOnlySlide = createSection('banner_slider', {
    settings: {
      autoplaySeconds: 5,
      slides: [{ id: 'slide_1', image: '', mobileImage: '/uploads/home/s.webp', alt: '', link: { type: 'none', value: '' } }],
    },
  })
  const okMobile = validateDocument({ schemaVersion: SCHEMA_VERSION, sections: [mobileOnlySlide] }, 'mobile')
  assert.equal(okMobile.ok, true)
  assert.equal(okMobile.document.sections[0].settings.slides[0].image, '/uploads/home/s.webp')
  assert.equal(okMobile.document.sections[0].settings.slides[0].mobileImage, '')

  const missingMobileBanner = validateDocument(
    {
      schemaVersion: SCHEMA_VERSION,
      sections: [createSection('mobile_banner', { settings: { image: '', alt: '', link: { type: 'none', value: '' } } })],
    },
    'mobile',
  )
  assert.equal(missingMobileBanner.ok, false)
  assert.ok(missingMobileBanner.errors.some((error) => error.field.includes('image')))

  const promoOk = validateDocument(
    {
      schemaVersion: SCHEMA_VERSION,
      sections: [
        createSection('promo_slider', {
          settings: {
            autoplaySeconds: 0,
            slides: [
              { id: 'p1', image: '/uploads/home/promo.webp', alt: '', link: { type: 'shop', value: '' } },
              { id: 'p2', image: '', alt: '', link: { type: 'none', value: '' } },
            ],
          },
        }),
      ],
    },
    'mobile',
  )
  assert.equal(promoOk.ok, true)
})

test('preview tokens expire and reject tampering', () => {
  const token = createPreviewToken('web', 60)
  assert.equal(verifyPreviewToken(token, 'web').ok, true)
  assert.equal(verifyPreviewToken(token, 'mobile').ok, false)

  const [payload] = token.split('.')
  assert.equal(verifyPreviewToken(`${payload}.deadbeef`, 'web').ok, false)

  const expired = createPreviewToken('mobile', -10)
  assert.equal(verifyPreviewToken(expired, 'mobile').reason, 'expired')
})

test('documentsEqual ignores equivalent normalized shapes', () => {
  const left = normalizeDocument({ sections: [createSection('category_strip')] })
  const right = normalizeDocument(JSON.parse(JSON.stringify(left)))
  assert.equal(documentsEqual(left, right), true)
  right.sections[0].title = 'Changed'
  assert.equal(documentsEqual(left, right), false)
})

async function withDb(name, fn) {
  try {
    await prisma.$queryRaw`SELECT 1`
  } catch {
    test.skip(`${name} (database unreachable)`, () => {})
    return
  }
  await test(name, fn)
}

await withDb('resolver drops hidden, scheduled, empty, and unknown sections while keeping order', async () => {
  const past = new Date(Date.now() - 60_000).toISOString()
  const future = new Date(Date.now() + 60 * 60 * 1000).toISOString()
  const document = {
    schemaVersion: SCHEMA_VERSION,
    sections: [
      createSection('product_rail', {
        id: 'a',
        visible: true,
        title: 'Visible empty',
        settings: { source: 'picked', productSlugs: ['no-such-product'], limit: 4, layout: 'grid' },
      }),
      createSection('category_strip', {
        id: 'b',
        visible: false,
        title: 'Hidden',
      }),
      createSection('image_banner', {
        id: 'c',
        visible: true,
        schedule: { startAt: future, endAt: null },
        settings: { image: '/uploads/general/x.webp', mobileImage: '', alt: '', link: { type: 'none', value: '' } },
      }),
      createSection('image_banner', {
        id: 'd',
        visible: true,
        schedule: { startAt: null, endAt: past },
        settings: { image: '/uploads/general/y.webp', mobileImage: '', alt: '', link: { type: 'none', value: '' } },
      }),
      { id: 'e', type: 'unknown_future', visible: true, title: '', settings: {}, schedule: { startAt: null, endAt: null } },
      createSection('image_banner', {
        id: 'f',
        visible: true,
        settings: { image: '/uploads/general/live.webp', mobileImage: '', alt: 'Live', link: { type: 'shop', value: '' } },
      }),
    ],
  }

  const resolved = await resolveDocument(document)
  assert.deepEqual(
    resolved.sections.map((section) => section.id),
    ['f'],
  )
  assert.equal(resolved.sections[0].image.includes('/uploads/general/live.webp'), true)
})

await withDb('publish flow creates revisions, caps history, and serves published home', async () => {
  invalidateHomeCache()
  await prisma.homeLayoutRevision.deleteMany({})
  await prisma.homeLayout.deleteMany({ where: { platform: 'web' } })

  const draft = buildDefaultDocument('web', {
    bannerImage: '/uploads/general/banner.webp',
    mobileBannerImage: '',
    highlightImage: '/uploads/general/highlight.webp',
    featuredCategorySlugs: [],
  })
  // Ensure banner slide has an image so publish validates.
  draft.sections = draft.sections.map((section) => {
    if (section.type !== 'banner_slider') return section
    return {
      ...section,
      settings: {
        ...section.settings,
        slides: [
          {
            id: 'slide_pub',
            image: '/uploads/general/banner.webp',
            mobileImage: '',
            alt: 'Banner',
            link: { type: 'shop', value: '' },
          },
        ],
      },
    }
  })

  await saveDraft('web', draft)
  const published = await publishLayout('web', { publishedById: 'test-admin' })
  assert.equal(published.version, 1)
  assert.equal(published.hasUnpublishedChanges, false)

  const home = await getPublishedHome('web')
  assert.ok(Array.isArray(home.sections))
  assert.notEqual(home.sections, null)

  for (let i = 0; i < 22; i += 1) {
    const next = normalizeDocument(draft)
    next.sections[0].title = `v${i + 2}`
    await saveDraft('web', next)
    await publishLayout('web', { publishedById: 'test-admin' })
  }

  const state = await getLayoutState('web')
  assert.ok(state.version >= 20)
  assert.ok(state.revisions.length <= 20)

  const older = state.revisions[state.revisions.length - 1]
  await restoreRevision('web', older.version)
  const restored = await getLayoutState('web')
  assert.equal(restored.hasUnpublishedChanges, true)

  await discardDraft('web')
  const discarded = await getLayoutState('web')
  assert.equal(discarded.hasUnpublishedChanges, false)

  await prisma.homeLayoutRevision.deleteMany({})
  await prisma.homeLayout.deleteMany({ where: { platform: 'web' } })
  invalidateHomeCache()
  const empty = await getPublishedHome('web')
  assert.equal(empty.sections, null)
})
