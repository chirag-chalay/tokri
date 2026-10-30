import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { fetchJson } from '../lib/api'

export default function CmsPage() {
  const location = useLocation()
  const { slug: routeSlug } = useParams()

  const slug = useMemo(() => {
    if (routeSlug) return routeSlug
    return location.pathname.replace(/^\//, '').replace(/\/$/, '')
  }, [routeSlug, location.pathname])

  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(Boolean(slug))
  const [notFound, setNotFound] = useState(!slug)
  const [prevSlug, setPrevSlug] = useState(slug)

  if (prevSlug !== slug) {
    setPrevSlug(slug)
    setLoading(Boolean(slug))
    setNotFound(!slug)
  }

  useEffect(() => {
    if (!slug) {
      return undefined
    }

    let ignore = false

    fetchJson(`/pages/${encodeURIComponent(slug)}`)
      .then((data) => {
        if (!ignore) setPage(data)
      })
      .catch(() => {
        if (!ignore) {
          setPage(null)
          setNotFound(true)
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
      <main className="cms-static-page min-h-screen bg-canvas py-4 sm:py-6 md:py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-line bg-panel px-4 pb-4 pt-3 sm:p-6 md:p-8">
            <h1 className="cms-static-page__title">Loading page...</h1>
          </div>
        </div>
      </main>
    )
  }

  if (notFound || !page) {
    return (
      <main className="cms-static-page min-h-screen bg-canvas py-4 sm:py-6 md:py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-line bg-panel px-4 pb-4 pt-3 sm:p-6 md:p-8">
            <h1 className="cms-static-page__title">Page not found</h1>
            <p className="mt-2 text-sm text-muted sm:mt-3 sm:text-base">
              This page does not exist or is not published yet.
            </p>
            <Link
              to="/"
              className="mt-5 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-black hover:bg-brand-hover"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="cms-static-page min-h-screen bg-canvas py-4 sm:py-6 md:py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-line bg-panel px-4 pb-4 pt-3 sm:p-6 md:p-8">
          <h1 className="cms-static-page__title">{page.title}</h1>

          {page.body ? (
            <div className="cms-page-content mt-3 sm:mt-4" dangerouslySetInnerHTML={{ __html: page.body }} />
          ) : (
            <p className="mt-3 text-sm leading-6 text-muted sm:mt-4 sm:text-base sm:leading-7">
              Content for this page has not been added yet. Edit it in the admin under Content → Pages.
            </p>
          )}

          <Link
            to="/"
            className="mt-5 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-black hover:bg-brand-hover sm:mt-6"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
