import { notFound } from 'next/navigation'
import ArticleView from '../../../_components/ArticleView'
import { publicGet } from '../../../../lib/server/public-api'
import { getBlog, articleBody, detailMetadata, jsonLd } from '../../../../lib/server/content'
import { canonicalOrigin } from '../../../../lib/server/indexing'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const post = await getBlog(slug)
  return post ? detailMetadata('blog', post) : {}
}

export default async function BlogPage({ params }) {
  const { slug } = await params
  const post = await getBlog(slug)
  if (!post) notFound()
  const list = await publicGet('/blogs?limit=4').catch(() => null)
  const others = (Array.isArray(list?.posts) ? list.posts : []).filter((item) => item.slug !== post.slug).slice(0, 3)
  const { html: body, headings } = articleBody(post.body)
  const canonical = `${canonicalOrigin}/blog/${encodeURIComponent(post.slug)}`
  const json = {
    '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, mainEntityOfPage: canonical,
    ...(post.excerpt ? { description: post.excerpt } : {}),
    ...(post.coverImage && /^https?:\/\//i.test(post.coverImage) ? { image: post.coverImage } : {}),
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
    ...(post.author ? { author: { name: post.author } } : {}),
  }
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(json) }} /><ArticleView post={post} others={others} headings={headings} body={body} canonical={canonical} /></>
}
