import { notFound } from 'next/navigation'
import NextShell from '../../_components/NextShell'
import ProductView from '../../_components/ProductView'
import { publicGet } from '../../../lib/server/public-api'
import { getProduct, cleanHtml, plainText, assetUrl, detailMetadata, jsonLd } from '../../../lib/server/content'
import { canonicalOrigin } from '../../../lib/server/indexing'

export async function generateMetadata({ params }) {
  const { productId } = await params
  const product = await getProduct(productId)
  return product ? detailMetadata('product', product) : {}
}

export default async function ProductPage({ params }) {
  const { productId } = await params
  const item = await getProduct(productId)
  if (!item) notFound()
  const categoryQuery = item.categoryId ? `&category=${encodeURIComponent(item.categoryId)}` : ''
  const items = await publicGet(`/products?limit=12${categoryQuery}`).catch(() => [])
  const seen = new Set([productId])
  const relatedProducts = []
  for (const related of Array.isArray(items) ? items : []) {
    const id = related.slug || related.id
    if (seen.has(id)) continue
    seen.add(id)
    relatedProducts.push({ ...related, id, image: assetUrl(related.image) })
    if (relatedProducts.length >= 10) break
  }
  const product = { ...item, id: item.slug || item.id, image: assetUrl(item.image), description: cleanHtml(item.description) }
  const url = `${canonicalOrigin}/product/${encodeURIComponent(item.slug)}`
  const json = {
    '@context': 'https://schema.org', '@type': 'Product', name: item.name,
    ...(item.description ? { description: plainText(item.description) } : {}),
    ...(item.image && /^https?:\/\//i.test(item.image) ? { image: item.image } : {}),
    ...(item.sku ? { sku: item.sku } : {}),
    ...(item.currency && Number.isFinite(Number(item.priceValue)) ? {
      offers: { '@type': 'Offer', url, priceCurrency: item.currency, price: item.priceValue },
    } : {}),
  }
  const breadcrumbItems = [{ name: 'Home', item: `${canonicalOrigin}/` }]
  if (item.category?.label && (item.category.slug || item.categoryId)) {
    breadcrumbItems.push({ name: item.category.label, item: `${canonicalOrigin}/shop?category=${encodeURIComponent(item.category.slug || item.categoryId)}` })
  }
  breadcrumbItems.push({ name: item.name, item: url })
  const breadcrumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((entry, index) => ({ '@type': 'ListItem', position: index + 1, ...entry })) }
  return <NextShell><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(json) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }} /><ProductView product={product} relatedProducts={relatedProducts} /></NextShell>
}
