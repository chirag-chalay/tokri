import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchJson, resolveAssetUrl } from '../lib/api'
import { blogByline, formatBlogDate } from '../components/BlogCard'
import './BlogDetailPage.css'

function ArticleContents({ headings, mobile = false }) {
  if (!headings.length) return null

  const links = (
    <nav aria-label="Article sections" className="blog-article-toc-links">
      {headings.map((heading) => (
        <a
          key={heading.id}
          href={`#${heading.id}`}
          className={heading.level === 3 ? 'blog-article-toc-subitem' : undefined}
          onClick={(event) => {
            event.preventDefault()
            document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' })
            window.history.replaceState(null, '', `#${heading.id}`)
          }}
        >
          {heading.text}
        </a>
      ))}
    </nav>
  )

  if (mobile) {
    return (
      <details className="blog-article-mobile-toc">
        <summary>In this article</summary>
        {links}
      </details>
    )
  }

  return (
    <section className="blog-article-toc" aria-label="Table of contents">
      <p className="blog-article-side-title">In this article</p>
      {links}
    </section>
  )
}

function ArticleShare({ post }) {
  const [copied, setCopied] = useState(false)
  const url = window.location.href
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(post.title)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="blog-article-share" aria-label="Share this article">
      <span className="blog-article-share-label">Share</span>
      <a href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp">WA</a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">f</a>
      <a href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Share on X">𝕏</a>
      <button type="button" onClick={copyLink} aria-label="Copy article link">{copied ? '✓' : '↗'}</button>
      <span className="sr-only" role="status">{copied ? 'Link copied' : ''}</span>
    </div>
  )
}

function ArticleSidebar({ headings, others }) {
  return (
    <div className="blog-article-sidebar-content">
      <ArticleContents headings={headings} />
      {others.length > 0 ? (
        <section className="blog-article-related" aria-label="Related articles">
          <p className="blog-article-side-title">More from the journal</p>
          <div className="blog-article-related-list">
            {others.map((item) => (
              <Link key={item.slug} to={`/blog/${item.slug}`} className={`blog-article-related-link${item.coverImage ? '' : ' blog-article-related-link--text'}`}>
                {item.coverImage ? <img src={resolveAssetUrl(item.coverImage)} alt="" loading="lazy" /> : null}
                <span>
                  <span className="blog-article-related-title">{item.title}</span>
                  <span className="blog-article-related-meta">{[item.category, formatBlogDate(item.publishedAt)].filter(Boolean).join(' · ')}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      <Link to="/shop" className="blog-article-shop">
        <span>Fresh fruits delivered to your doorstep</span>
        <strong>Shop fresh fruits <span aria-hidden="true">→</span></strong>
      </Link>
    </div>
  )
}

export default function BlogDetailPage() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [others, setOthers] = useState([])
  const [headings, setHeadings] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const bodyRef = useRef(null)

  useEffect(() => {
    let ignore = false
    // Reset the previous article immediately when the route slug changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setNotFound(false)
    setPost(null)
    setHeadings([])

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

  useEffect(() => {
    if (loading || !post || !bodyRef.current) return
    const used = new Set()
    const sections = [...bodyRef.current.querySelectorAll('h2, h3')].map((heading, index) => {
      const base = heading.id || `blog-section-${index + 1}`
      let id = base
      let suffix = 2
      while (used.has(id)) id = `${base}-${suffix++}`
      heading.id = id
      used.add(id)
      return { id, text: heading.textContent.trim(), level: Number(heading.tagName.slice(1)) }
    }).filter((heading) => heading.text)
    setHeadings(sections)
  }, [loading, post])

  if (loading) {
    return (
      <main className="min-h-screen bg-canvas">
        <div className="blog-article-shell py-10">
          <div className="h-4 w-28 animate-pulse rounded bg-panel-2" />
          <div className="mt-6 h-10 w-4/5 animate-pulse rounded bg-panel-2" />
          <div className="mt-8 aspect-[16/9] max-w-[800px] animate-pulse rounded-2xl bg-panel-2" />
        </div>
      </main>
    )
  }

  if (notFound || !post) {
    return (
      <main className="min-h-screen bg-canvas">
        <div className="blog-article-shell py-16">
          <div className="rounded-3xl border border-line bg-panel px-6 py-12 text-center">
            <h1 className="text-3xl font-semibold text-white">This story is not available</h1>
            <p className="mt-3 text-sm text-muted">It may be unpublished or the link is no longer valid.</p>
            <Link to="/blog" className="mt-6 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-black hover:bg-brand-hover">Back to the journal</Link>
          </div>
        </div>
      </main>
    )
  }

  const byline = blogByline(post, { authorFirst: true })

  return (
    <main className="min-h-screen bg-canvas">
      <div className="blog-article-shell">
        <div className="blog-article-grid">
          <aside className="blog-article-share-column"><ArticleShare post={post} /></aside>

          <article className="blog-article-main">
            <Link to="/blog" className="blog-article-back">← All stories</Link>
            <header className="blog-article-header">
              {post.category ? <p className="blog-article-category">{post.category}</p> : null}
              <h1 className="blog-detail-title">{post.title}</h1>
              {byline ? <p className="blog-article-byline">{byline}</p> : null}
            </header>

            {post.coverImage ? (
              <div className="blog-article-cover">
                <img src={resolveAssetUrl(post.coverImage)} alt="" />
              </div>
            ) : null}

            <div className="blog-article-mobile-share"><ArticleShare post={post} /></div>
            <ArticleContents headings={headings} mobile />

            {post.body ? <div ref={bodyRef} className="cms-page-content blog-article-body" dangerouslySetInnerHTML={{ __html: post.body }} /> : null}

            <div className="blog-article-mobile-related">
              <ArticleSidebar headings={[]} others={others} />
            </div>
          </article>

          <aside className="blog-article-sidebar"><ArticleSidebar headings={headings} others={others} /></aside>
        </div>
      </div>
    </main>
  )
}
