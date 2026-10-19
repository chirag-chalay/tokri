import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchJson, resolveAssetUrl } from '../lib/api'
import BlogCard, { blogByline } from '../components/BlogCard'

export default function BlogDetailPage() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [others, setOthers] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let ignore = false
    setLoading(true)
    setNotFound(false)
    setPost(null)

    Promise.all([
      fetchJson(`/blogs/${encodeURIComponent(slug)}`),
      fetchJson('/blogs?limit=4').catch(() => ({ posts: [] })),
    ])
      .then(([story, list]) => {
        if (ignore) return
        setPost(story)
        document.title = `${story.title} · Tokriii`
        const posts = Array.isArray(list?.posts) ? list.posts : []
        setOthers(posts.filter((item) => item.slug !== story.slug).slice(0, 3))
      })
      .catch(() => {
        if (!ignore) {
          setNotFound(true)
          document.title = 'Story not found · Tokriii'
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [slug])

  if (loading) {
    return (
      <main className="min-h-screen bg-canvas">
        <div className="container mx-auto max-w-[900px] px-4 py-10 sm:px-6">
          <div className="h-4 w-28 animate-pulse rounded bg-panel-2" />
          <div className="-mx-4 mt-6 aspect-[900/260] animate-pulse bg-panel-2 sm:-mx-6 sm:rounded-3xl" />
          <div className="mt-6 h-10 w-4/5 animate-pulse rounded bg-panel-2" />
        </div>
      </main>
    )
  }

  if (notFound || !post) {
    return (
      <main className="min-h-screen bg-canvas">
        <div className="container mx-auto max-w-[900px] px-4 py-16 sm:px-6">
          <div className="rounded-3xl border border-line bg-panel px-6 py-12 text-center">
            <h1 className="text-3xl font-semibold text-white">This story is not available</h1>
            <p className="mt-3 text-sm text-muted">It may be unpublished or the link is no longer valid.</p>
            <Link
              to="/blog"
              className="mt-6 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-black hover:bg-brand-hover"
            >
              Back to the journal
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const byline = blogByline(post, { authorFirst: true })

  return (
    <main className="min-h-screen bg-canvas">
      <article className="container mx-auto max-w-[900px] px-4 py-8 sm:px-6 sm:py-12">
        <Link to="/blog" className="text-sm font-semibold text-mint transition hover:text-white">
          ← All stories
        </Link>

        <header className="mt-6">
          {post.category ? (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">{post.category}</p>
          ) : null}
          <h1 className="blog-detail-title">{post.title}</h1>
          {byline ? <p className="mt-3 text-sm text-muted">{byline}</p> : null}
        </header>

        {post.coverImage ? (
          <div className="relative -mx-4 mt-8 aspect-[900/260] overflow-hidden border border-line sm:-mx-6 sm:rounded-3xl">
            <img
              src={resolveAssetUrl(post.coverImage)}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          </div>
        ) : null}

        {post.body ? (
          <div className="cms-page-content mt-8" dangerouslySetInnerHTML={{ __html: post.body }} />
        ) : null}
      </article>

      {others.length > 0 ? (
        <section className="border-t border-line">
          <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-semibold text-white">More from the journal</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {others.map((item) => (
                <BlogCard key={item.slug} post={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  )
}
