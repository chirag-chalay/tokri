import ShopAllPage from '../../../pages/ShopAllPage'
import { publicGet } from '../../../lib/server/public-api'
import { assetUrl, plainText } from '../../../lib/server/content'
import { canonicalOrigin } from '../../../lib/server/indexing'

export const dynamic = 'force-dynamic'

async function categoryFor(searchParams) {
  const query = await searchParams
  const slug = Array.isArray(query.category) ? query.category[0] : query.category
  const categories = await publicGet('/categories')
  if (!Array.isArray(categories) || !categories.length) return { categories: [], selected: null, requested: slug }
  return { categories, selected: categories.find((category) => category.slug === slug) || categories[0], requested: slug }
}

export async function generateMetadata({ searchParams }) {
  const { categories, selected, requested } = await categoryFor(searchParams).catch(() => ({ categories: [], selected: null }))
  const exact = selected && requested && categories.some((category) => category.slug === requested)
  const canonical = exact ? `${canonicalOrigin}/shop?category=${encodeURIComponent(selected.slug)}` : `${canonicalOrigin}/shop`
  const title = exact ? `${selected.title || selected.label} · Tokriii` : 'Shop · Tokriii'
  const description = exact ? plainText(selected.description || selected.subtitle) : ''
  return { title, ...(description ? { description } : {}), alternates: { canonical }, openGraph: { title, ...(description ? { description } : {}), url: canonical, type: 'website', ...(exact && /^https?:\/\//i.test(selected.image || '') ? { images: [selected.image] } : {}) } }
}

export default async function ShopPage({ searchParams }) {
  const data = await categoryFor(searchParams).catch(() => null)
  if (!data || !data.selected) return <ShopAllPage />
  const categories = data.categories.map((item) => ({ ...item, id: item.slug || item.id, image: assetUrl(item.image) }))
  const selected = data.selected
  const page = await publicGet(`/products?category=${encodeURIComponent(selected.slug)}&page=1&limit=24`).catch(() => null)
  if (!page || !Array.isArray(page.products)) return <ShopAllPage />
  const products = page.products.map((item) => ({ ...item, id: item.slug || item.id, image: assetUrl(item.image) }))
  const sections = [{ slug: selected.slug, label: selected.label, products, firstPage: 1, lastPage: 1, hasMore: Boolean(page.hasMore) }]
  return <ShopAllPage initialData={{ categories, sections, activeSlug: selected.slug }} />
}
