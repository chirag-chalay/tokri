import BlogListPage from '../../../pages/BlogListPage'
import { publicGet } from '../../../lib/server/public-api'
import { canonicalOrigin } from '../../../lib/server/indexing'
import { jsonLd } from '../../../lib/server/content'
import {
  CORE_PAGES_METADATA,
  DEFAULT_OG_IMAGE,
  getBreadcrumbSchema,
  getCollectionPageSchema,
} from '../../../lib/server/seo-defaults'

export const dynamic = 'force-dynamic'

const blogSeo = CORE_PAGES_METADATA['/blog']
const canonical = `${canonicalOrigin}/blog`

export const metadata = {
  title: blogSeo.title,
  description: blogSeo.description,
  alternates: { canonical },
  openGraph: {
    title: blogSeo.title,
    description: blogSeo.description,
    url: canonical,
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, alt: 'The Tokriii Journal' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: blogSeo.title,
    description: blogSeo.description,
    images: [DEFAULT_OG_IMAGE],
  },
}

export default async function BlogPage() {
  const data = await publicGet('/blogs?limit=18&offset=0')
  if (!data || !Array.isArray(data.posts)) throw new Error('Incomplete public blog listing')

  const breadcrumbsSchema = getBreadcrumbSchema([
    { name: 'Home', item: `${canonicalOrigin}/` },
    { name: 'The Tokriii Journal', item: canonical },
  ])

  const collectionSchema = getCollectionPageSchema(
    blogSeo.title,
    canonical,
    blogSeo.description,
    data.posts.map((p) => ({ slug: `blog/${p.slug}`, name: p.title }))
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(collectionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbsSchema) }} />
      <BlogListPage initialData={{ posts: data.posts, total: data.total }} />
    </>
  )
}
