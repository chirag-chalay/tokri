import { Link } from 'react-router-dom'
import { resolveAssetUrl } from '../lib/api'

export function formatBlogDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function blogByline(post, { authorFirst = false } = {}) {
  const date = formatBlogDate(post?.publishedAt)
  const author = String(post?.author || '').trim()
  const parts = authorFirst ? [author, date] : [date, author]
  return parts.filter(Boolean).join(' · ')
}

export default function BlogCard({ post }) {
  const byline = blogByline(post)

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-line bg-panel shadow-sm shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-brand/50 hover:shadow-brand/10"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-panel-2">
        {post.coverImage ? (
          <img
            src={resolveAssetUrl(post.coverImage)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-deep via-[#163224] to-canvas" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {post.category ? (
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">{post.category}</p>
        ) : null}
        <h2 className="mt-2 text-xl font-semibold leading-snug tracking-tight text-white group-hover:text-mint">
          {post.title}
        </h2>
        {byline ? <p className="mt-2 text-sm text-muted">{byline}</p> : null}
      </div>
    </Link>
  )
}
