import BlogListPage from '../../../pages/BlogListPage'
import { publicGet } from '../../../lib/server/public-api'
import { canonicalOrigin } from '../../../lib/server/indexing'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Blog · Tokriii',
  alternates: { canonical: `${canonicalOrigin}/blog` },
  openGraph: { title: 'Blog · Tokriii', url: `${canonicalOrigin}/blog`, type: 'website' },
}

export default async function BlogPage() {
  const data = await publicGet('/blogs?limit=18&offset=0')
  if (!data || !Array.isArray(data.posts)) throw new Error('Incomplete public blog listing')
  return <BlogListPage initialData={{ posts: data.posts, total: data.total }} />
}
