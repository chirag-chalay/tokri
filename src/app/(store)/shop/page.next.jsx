import ShopAllPage from '../../../pages/ShopAllPage'
import { publicGet } from '../../../lib/server/public-api'
import { assetUrl, plainText, jsonLd } from '../../../lib/server/content'
import { canonicalOrigin } from '../../../lib/server/indexing'
import {
  CORE_PAGES_METADATA,
  CATEGORY_METADATA,
  DEFAULT_OG_IMAGE,
  toAbsoluteUrl,
  getBreadcrumbSchema,
  getCollectionPageSchema,
} from '../../../lib/server/seo-defaults'

export const dynamic = 'force-dynamic'

async function categoryFor(searchParams) {
  const query = await searchParams
  const slug = Array.isArray(query?.category) ? query.category[0] : query?.category
  const categories = await publicGet('/categories')
  if (!Array.isArray(categories) || !categories.length) return { categories: [], selected: null, requested: slug }
  return { categories, selected: categories.find((category) => category.slug === slug) || categories[0], requested: slug }
}

export async function generateMetadata({ searchParams }) {
  const { categories, selected, requested } = await categoryFor(searchParams).catch(() => ({ categories: [], selected: null }))
  const exact = selected && requested && categories.some((category) => category.slug === requested)

  if (exact) {
    const predefined = CATEGORY_METADATA[selected.slug]
    const label = selected.label || selected.title || selected.slug
    const title = predefined?.title || `${selected.title || selected.label} · Tokriii`
    const description = predefined?.description || plainText(selected.description || selected.subtitle) || `Buy fresh ${label} online at Tokriii with morning delivery in Delhi NCR & Gurugram.`
    const canonical = `${canonicalOrigin}/shop?category=${encodeURIComponent(selected.slug)}`
    const image = toAbsoluteUrl(selected.image)

    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: canonical,
        type: 'website',
        images: [{ url: image, alt: label }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
    }
  }

  const shopSeo = CORE_PAGES_METADATA['/shop']
  const canonical = `${canonicalOrigin}/shop`
  return {
    title: shopSeo.title,
    description: shopSeo.description,
    alternates: { canonical },
    openGraph: {
      title: shopSeo.title,
      description: shopSeo.description,
      url: canonical,
      type: 'website',
      images: [{ url: DEFAULT_OG_IMAGE, alt: 'Tokriii Online Fruit Store' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: shopSeo.title,
      description: shopSeo.description,
      images: [DEFAULT_OG_IMAGE],
    },
  }
}

export default async function ShopPage({ searchParams }) {
  const data = await categoryFor(searchParams).catch(() => null)
  if (!data || !data.selected) return <ShopAllPage />
  const categories = data.categories.map((item) => ({ ...item, id: item.slug || item.id, image: assetUrl(item.image) }))
  const selected = data.selected
  const isExactCategory = Boolean(data.requested && data.categories.some((c) => c.slug === data.requested))

  const page = await publicGet(`/products?category=${encodeURIComponent(selected.slug)}&page=1&limit=24`).catch(() => null)
  if (!page || !Array.isArray(page.products)) return <ShopAllPage />
  const products = page.products.map((item) => ({ ...item, id: item.slug || item.id, image: assetUrl(item.image) }))
  const sections = [{ slug: selected.slug, label: selected.label, products, firstPage: 1, lastPage: 1, hasMore: Boolean(page.hasMore) }]

  const canonical = isExactCategory
    ? `${canonicalOrigin}/shop?category=${encodeURIComponent(selected.slug)}`
    : `${canonicalOrigin}/shop`

  const breadcrumbItems = [{ name: 'Home', item: `${canonicalOrigin}/` }]
  if (isExactCategory) {
    breadcrumbItems.push({ name: 'Shop', item: `${canonicalOrigin}/shop` })
    breadcrumbItems.push({ name: selected.label || selected.slug, item: canonical })
  } else {
    breadcrumbItems.push({ name: 'Shop', item: canonical })
  }

  const breadcrumbsSchema = getBreadcrumbSchema(breadcrumbItems)
  const collectionTitle = isExactCategory ? (selected.label || selected.slug) : 'Shop All Fruits & Gourmet Hampers'
  const collectionDesc = isExactCategory
    ? (CATEGORY_METADATA[selected.slug]?.description || `Fresh ${selected.label} delivered in Delhi NCR.`)
    : CORE_PAGES_METADATA['/shop'].description
  const collectionSchema = getCollectionPageSchema(collectionTitle, canonical, collectionDesc, products)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(collectionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbsSchema) }} />
      <ShopAllPage initialData={{ categories, sections, activeSlug: selected.slug }} />
    </>
  )
}
