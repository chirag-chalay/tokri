import Home from '../../pages/Home'
import { publicGet } from '../../lib/server/public-api'
import { assetUrl, jsonLd } from '../../lib/server/content'
import { canonicalOrigin } from '../../lib/server/indexing'
import { getDiwaliStatus } from '../../lib/diwaliConfig'
import {
  CORE_PAGES_METADATA,
  DEFAULT_OG_IMAGE,
  getWebSiteSchema,
  getOrganizationSchema,
  getLocalStoreSchema,
} from '../../lib/server/seo-defaults'

export const dynamic = 'force-dynamic'

const homeSeo = CORE_PAGES_METADATA['/']

export const metadata = {
  title: homeSeo.title,
  description: homeSeo.description,
  alternates: { canonical: `${canonicalOrigin}/` },
  openGraph: {
    title: homeSeo.title,
    description: homeSeo.description,
    url: `${canonicalOrigin}/`,
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, alt: 'Tokriii Fresh Fruits Delhi NCR' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: homeSeo.title,
    description: homeSeo.description,
    images: [DEFAULT_OG_IMAGE],
  },
}

export default async function HomePage(props) {
  const resolvedSearchParams = props?.searchParams ? await props.searchParams : null
  const searchString = resolvedSearchParams
    ? new URLSearchParams(
        Object.entries(resolvedSearchParams).flatMap(([k, v]) =>
          Array.isArray(v) ? v.map((item) => [k, item]) : [[k, v]]
        )
      ).toString()
    : ''
  const diwaliStatus = getDiwaliStatus({ searchParams: searchString })
  const previewToken = resolvedSearchParams?.homePreview
    ? String(Array.isArray(resolvedSearchParams.homePreview) ? resolvedSearchParams.homePreview[0] : resolvedSearchParams.homePreview)
    : ''

  const homepagePath = previewToken
    ? `/home?platform=web&previewToken=${encodeURIComponent(previewToken)}`
    : '/home?platform=web'

  const [settings, categoryResponse, bestsellerResponse, featuredResponse, reviewResponse, homepage] = await Promise.all([
    publicGet('/settings/public'),
    publicGet('/categories'),
    publicGet('/products?flag=bestSeller&limit=12'),
    publicGet('/products?flag=featured&limit=100'),
    publicGet('/reviews'),
    publicGet(homepagePath).catch(() => null),
  ])
  if (!settings || !Array.isArray(categoryResponse) || !Array.isArray(bestsellerResponse) || !Array.isArray(featuredResponse) || !Array.isArray(reviewResponse)) throw new Error('Incomplete public homepage data')
  const normalizeProducts = (items) => Array.isArray(items)
    ? items.map((item) => ({ ...item, id: item.slug || item.id, image: assetUrl(item.image) }))
    : undefined
  const categories = Array.isArray(categoryResponse)
    ? categoryResponse.map((item) => ({ ...item, id: item.slug || item.id, image: assetUrl(item.image) }))
    : undefined
  const sourceHome = settings?.home || {}
  const home = {
    bannerImage: sourceHome.bannerImage || null,
    mobileBannerImage: sourceHome.mobileBannerImage || null,
    highlightImage: sourceHome.highlightImage || null,
    featuredCategorySlugs: Array.isArray(sourceHome.featuredCategorySlugs) ? sourceHome.featuredCategorySlugs : [],
  }
  const categorySections = await Promise.all(home.featuredCategorySlugs.filter(Boolean).map(async (slug) => {
    const category = categories?.find((item) => item.slug === slug)
    const products = await publicGet(`/products?category=${encodeURIComponent(slug)}&limit=12`)
    return { slug, title: category?.title || category?.label || slug.replace(/-/g, ' '), products: normalizeProducts(Array.isArray(products) ? products : products?.products) || [] }
  }))
  const homepagePayload =
    homepage && Array.isArray(homepage.sections) && homepage.sections.length
      ? homepage
      : { sections: null }
  const websiteSchema = getWebSiteSchema()
  const organizationSchema = getOrganizationSchema()
  const localStoreSchema = getLocalStoreSchema()

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(localStoreSchema) }} />
      <Home
        initialData={{
          home,
          categories,
          categorySections,
          bestSellers: normalizeProducts(bestsellerResponse),
          featured: normalizeProducts(featuredResponse),
          reviews: Array.isArray(reviewResponse) ? reviewResponse : undefined,
          diwaliStatus,
          homepage: homepagePayload,
        }}
      />
    </>
  )
}
