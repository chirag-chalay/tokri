'use client'

import { useEffect, useRef, useState } from 'react'
import { fetchJson } from '../lib/api'
import BlogCard from '../components/BlogCard'

const FIRST_PAGE = 18
const NEXT_PAGE = 6

export default function BlogListPage({ initialData }) {
  const [posts, setPosts] = useState(initialData?.posts || [])
  const [total, setTotal] = useState(Number(initialData?.total) || 0)
  const [loading, setLoading] = useState(!initialData)
  const [loadingMore, setLoadingMore] = useState(false)
  const [failed, setFailed] = useState(false)
  const sentinelRef = useRef(null)
  const loadingMoreRef = useRef(false)

  useEffect(() => {
    document.title = 'Blog · Tokriii'
    let ignore = false
    fetchJson(`/blogs?limit=${FIRST_PAGE}&offset=0`)
      .then((data) => {
        if (ignore) return
        setPosts(Array.isArray(data?.posts) ? data.posts : [])
        setTotal(Number(data?.total) || 0)
      })
      .catch(() => {
        if (!ignore) setFailed(true)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [])

  const hasMore = posts.length < total

  useEffect(() => {
    const node = sentinelRef.current
    if (!node || loading || failed || !hasMore) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || loadingMoreRef.current) return
        loadingMoreRef.current = true
        setLoadingMore(true)
        const offset = posts.length
        fetchJson(`/blogs?limit=${NEXT_PAGE}&offset=${offset}`)
          .then((data) => {
            const next = Array.isArray(data?.posts) ? data.posts : []
            setPosts((current) => {
              const seen = new Set(current.map((item) => item.slug))
              return [...current, ...next.filter((item) => !seen.has(item.slug))]
            })
            if (Number.isFinite(Number(data?.total))) setTotal(Number(data.total))
          })
          .catch(() => {})
          .finally(() => {
            loadingMoreRef.current = false
            setLoadingMore(false)
          })
      },
      { rootMargin: '240px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [failed, hasMore, loading, posts.length])

  return (
    <main className="cms-static-page min-h-screen bg-canvas py-4 sm:py-6 md:py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="cms-static-page__title">Blog</h1>

        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="overflow-hidden rounded-3xl border border-line bg-panel">
                <div className="aspect-[16/10] animate-pulse bg-panel-2" />
                <div className="space-y-3 p-6">
                  <div className="h-3 w-24 animate-pulse rounded bg-panel-2" />
                  <div className="h-6 w-4/5 animate-pulse rounded bg-panel-2" />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!loading && failed ? (
          <div className="mt-6 rounded-2xl border border-line bg-panel px-6 py-12 text-center">
            <h2 className="text-2xl font-semibold text-white">The blog could not be loaded</h2>
            <p className="mt-2 text-sm text-muted">Refresh the page and try again.</p>
          </div>
        ) : null}

        {!loading && !failed && posts.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-line bg-panel px-6 py-16 text-center">
            <h2 className="text-2xl font-semibold text-white">No posts yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
              Stories on fruit, season, and how to pick them will appear here.
            </p>
          </div>
        ) : null}

        {!loading && !failed && posts.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} rawUrls={Boolean(initialData)} />
            ))}
          </div>
        ) : null}

        {hasMore ? <div ref={sentinelRef} className="h-8" /> : null}
        {loadingMore ? <p className="py-6 text-center text-sm text-muted">Loading more posts…</p> : null}
      </div>
    </main>
  )
}
