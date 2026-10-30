import Home from '../../pages/Home'
import { publicGet } from '../../lib/server/public-api'
import { assetUrl } from '../../lib/server/content'
import { canonicalOrigin } from '../../lib/server/indexing'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Tokriii — Premium & Exotic Fruits',
  alternates: { canonical: `${canonicalOrigin}/` },
  openGraph: { title: 'Tokriii — Premium & Exotic Fruits', url: `${canonicalOrigin}/`, type: 'website' },
}

export default async function HomePage() {
  const [settings, categoryResponse, bestsellerResponse, featuredResponse, reviewResponse] = await Promise.all([
    publicGet('/settings/public'),
    publicGet('/categories'),
    publicGet('/products?flag=bestSeller&limit=12'),
    publicGet('/products?flag=featured&limit=100'),
    publicGet('/reviews'),
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
  return <Home initialData={{ home, categories, categorySections, bestSellers: normalizeProducts(bestsellerResponse), featured: normalizeProducts(featuredResponse), reviews: Array.isArray(reviewResponse) ? reviewResponse : undefined }} />
}
