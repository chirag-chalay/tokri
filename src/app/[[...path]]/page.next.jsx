import { cache } from 'react'
import { notFound } from 'next/navigation'
import LegacyBridge from '../LegacyBridge'
import { publicGet } from '../../lib/server/public-api'
import { canonicalOrigin } from '../../lib/server/indexing'

const singleSegmentRoutes = new Set([
  'shop', 'blog', 'cart', 'checkout', 'account', 'login', 'profile',
  'about', 'careers', 'privacy-policy', 'terms-and-conditions',
  'help-faqs', 'returns-policy', 'support-center',
])
const twoSegmentRoutes = new Set(['blog', 'order', 'p'])
const privateRoutes = new Set(['cart', 'checkout', 'account', 'login', 'profile', 'order'])
const loadPublicDetail = cache((kind, slug) => publicGet(`/${kind === 'product' ? 'products' : 'blogs'}/${encodeURIComponent(slug)}`))

function descriptionText(value) {
  return String(value || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/\s+/g, ' ').trim()
}

export async function generateMetadata({ params }) {
  const { path = [] } = await params
  if (privateRoutes.has(path[0])) return { robots: { index: false, follow: false } }
  if (path.length !== 2 || path[0] !== 'blog') return {}
  const item = await loadPublicDetail(path[0], path[1])
  if (!item) return {}
  const title = path[0] === 'product' ? item.name : item.title
  const description = descriptionText(path[0] === 'product' ? item.description : item.excerpt)
  const canonical = `${canonicalOrigin}/${path[0]}/${encodeURIComponent(item.slug || path[1])}`
  const image = path[0] === 'product' ? item.image : item.coverImage
  return {
    title: `${title} · Tokriii`,
    ...(description ? { description } : {}),
    alternates: { canonical },
    openGraph: {
      title: `${title} · Tokriii`,
      ...(description ? { description } : {}),
      url: canonical,
      type: path[0] === 'blog' ? 'article' : 'website',
      ...(typeof image === 'string' && /^https?:\/\//i.test(image) ? { images: [image] } : {}),
    },
  }
}

export default async function Page({ params }) {
  const { path = [] } = await params
  const known = path.length === 0 ||
    (path.length === 1 && singleSegmentRoutes.has(path[0])) ||
    (path.length === 2 && twoSegmentRoutes.has(path[0]))
  if (!known) notFound()
  if (path.length === 2 && path[0] === 'blog') {
    const item = await loadPublicDetail(path[0], path[1])
    if (!item) notFound()
  }
  return <LegacyBridge />
}
