import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { fetchJson, normalizeProducts, resolveAssetUrl } from '../lib/api'
import { useCart } from '../context/CartContext'
import CartControl from '../components/CartControl'
import Footer from '../components/Footer'

const PAGE_SIZE = 24
// A section counts as "current" once its first row passes this far down the panel.
const ACTIVE_OFFSET_PX = 80
// Unified breakpoint token matching Header and Cart (lg: 1024px)
const MOBILE_QUERY = '(max-width: 1023px)'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(MOBILE_QUERY).matches,
  )

  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY)
    const onChange = (event) => setIsMobile(event.matches)

    setIsMobile(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return isMobile
}

function mergeProducts(existing, incoming) {
  const seen = new Set(existing.map((item) => item.id))
  const merged = [...existing]
  for (const item of incoming) {
    if (seen.has(item.id)) continue
    seen.add(item.id)
    merged.push(item)
  }
  return merged
}

const discountPercent = (product) => {
  const price = Number(product.priceValue)
  const oldPrice = Number(product.oldPriceValue)
  if (!oldPrice || !price || oldPrice <= price) return 0
  return Math.round((1 - price / oldPrice) * 100)
}

function ProductCard({ product, onNavigate }) {
  const off = discountPercent(product)
  const target = `/product/${product.slug || product.id}`

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={() => onNavigate(target)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          onNavigate(target)
        }
      }}
      className="flex h-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-lg border border-line bg-panel-2 p-1.5 sm:p-2 focus:outline-none focus:ring-2 focus:ring-brand/60"
    >
      <div className="relative mb-1 aspect-square overflow-hidden rounded-md bg-panel">
        {off > 0 && (
          <span className="absolute left-0 top-1.5 rounded-r bg-[#2563eb] px-1.5 py-0.5 text-[9px] font-bold leading-none text-white sm:text-[10px]">
            {off}% OFF
          </span>
        )}
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      <h3 className="line-clamp-2 text-[12px] font-bold leading-tight text-white sm:text-[13px]">
        {product.name}
      </h3>
      {product.weight && <p className="mt-0.5 truncate text-[11px] text-muted">{product.weight}</p>}

      <div className="mt-auto flex min-w-0 items-end justify-between gap-1 pt-1.5">
        <div className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-[13px] font-bold text-white sm:text-sm">
            {product.price}
          </span>
          {off > 0 && product.oldPrice && (
            <span className="block truncate text-[11px] text-muted line-through">
              {product.oldPrice}
            </span>
          )}
        </div>
        <span className="shrink-0" onClick={(event) => event.stopPropagation()}>
          <CartControl product={product} variant="shop" addLabel="ADD" />
        </span>
      </div>
    </article>
  )
}

export default function ShopAllPage() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { totalCount } = useCart()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedSlug = searchParams.get('category') || ''

  const mainRef = useRef(null)
  const productsScrollRef = useRef(null)
  const loadMoreRef = useRef(null)
  const loadPrevRef = useRef(null)
  const sectionRefs = useRef(new Map())
  const railRefs = useRef(new Map())

  const [categories, setCategories] = useState([])
  // One entry per category pulled into the feed, in catalog order. On desktop this
  // always holds exactly one entry.
  const [sections, setSections] = useState([])
  const [activeSlug, setActiveSlug] = useState('')
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingFeed, setLoadingFeed] = useState(true)
  const [appending, setAppending] = useState(false)
  const [prepending, setPrepending] = useState(false)
  const [reachedEnd, setReachedEnd] = useState(false)
  const [reachedStart, setReachedStart] = useState(false)
  // Upward loading stays off until the shopper actually scrolls, otherwise the top
  // sentinel is already on screen at first paint and would rewind the whole catalog.
  const [canLoadPrev, setCanLoadPrev] = useState(false)
  // Height the page is pinned to on mobile; null keeps the normal desktop flow.
  const [lockedHeight, setLockedHeight] = useState(null)
  // The pinned rail needs an explicit height, since on mobile it sits inside a
  // scroller that is as tall as the whole feed.
  const [railHeight, setRailHeight] = useState(0)

  const categoriesRef = useRef([])
  const sectionsRef = useRef([])
  const activeSlugRef = useRef('')
  const isMobileRef = useRef(isMobile)
  const appendingRef = useRef(false)
  const prependingRef = useRef(false)
  const reachedEndRef = useRef(false)
  const reachedStartRef = useRef(false)
  const canLoadPrevRef = useRef(false)
  // Scroll height/offset captured just before a prepend, so the shopper's position
  // stays put once the new rows are in the DOM.
  const prependAnchor = useRef(null)
  // Bumped whenever the feed is rebuilt, so in-flight responses can be discarded.
  const feedToken = useRef(0)
  // While jumping to a category (tap or deep link), ignore scroll-based selection
  // so the rail does not flash back to whatever section is still on screen.
  const selectingRef = useRef(null)
  const selectingTimer = useRef(null)

  useEffect(() => {
    categoriesRef.current = categories
  }, [categories])

  useEffect(() => {
    sectionsRef.current = sections
  }, [sections])

  useEffect(() => {
    activeSlugRef.current = activeSlug
  }, [activeSlug])

  // Leaving mobile trims the stacked feed back to the category on screen, so
  // desktop shows one category again without refetching anything.
  useEffect(() => {
    isMobileRef.current = isMobile
    if (isMobile) return

    setSections((prev) => {
      if (prev.length <= 1) return prev
      const kept = prev.find((section) => section.slug === activeSlugRef.current) || prev[0]
      return [kept]
    })
  }, [isMobile])

  // On mobile the shop is pinned to whatever space the sticky header leaves, so the
  // category rail stays on screen for the whole session and only products scroll.
  // The sticky cart bar's allowance is read off the shell so the last row clears it.
  useLayoutEffect(() => {
    if (!isMobile) {
      setLockedHeight(null)
      setRailHeight(0)
      return
    }

    const main = mainRef.current
    if (!main) return

    const header = document.querySelector('header')

    const measure = () => {
      const headerHeight = header?.getBoundingClientRect().height || 0
      const shell = main.parentElement
      const bottomInset = shell
        ? Number.parseFloat(window.getComputedStyle(shell).paddingBottom) || 0
        : 0
      const available = Math.max(360, window.innerHeight - headerHeight - bottomInset)
      setLockedHeight(available)

      const scroller = productsScrollRef.current
      const railTop = scroller
        ? scroller.getBoundingClientRect().top - main.getBoundingClientRect().top
        : 0
      setRailHeight(Math.max(240, available - railTop))
    }

    measure()

    const observer = header ? new ResizeObserver(measure) : null
    observer?.observe(header)
    window.addEventListener('resize', measure)
    window.addEventListener('orientationchange', measure)

    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', measure)
      window.removeEventListener('orientationchange', measure)
    }
  }, [isMobile, totalCount, loadingCategories, categories.length])

  useEffect(() => {
    if (!isMobile) return

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previous
    }
  }, [isMobile])

  const fetchCategoryPage = useCallback(async (slug, page) => {
    const data = await fetchJson(
      `/products?category=${encodeURIComponent(slug)}&page=${page}&limit=${PAGE_SIZE}`,
    )
    return {
      products: normalizeProducts(data.products || []),
      hasMore: Boolean(data.hasMore),
      total: Number(data.total) || 0,
    }
  }, [])

  useEffect(() => {
    let ignore = false
    setLoadingCategories(true)

    fetchJson('/categories')
      .then((items) => {
        if (ignore || !Array.isArray(items)) return
        const list = items.map((item) => ({
          ...item,
          id: item.slug || item.id,
          image: resolveAssetUrl(item.image),
        }))
        setCategories(list)
      })
      .catch(() => {
        if (!ignore) setCategories([])
      })
      .finally(() => {
        if (!ignore) setLoadingCategories(false)
      })

    return () => {
      ignore = true
    }
  }, [])

  // Builds the feed starting at the requested category. Scroll-driven URL updates
  // land on an already loaded section, so they never trigger a rebuild.
  useEffect(() => {
    if (!categories.length) return

    const start = categories.find((item) => item.slug === requestedSlug) || categories[0]
    if (!start || sectionsRef.current.some((section) => section.slug === start.slug)) return
    // Mobile category tap already loads this slug via jumpToCategory.
    if (selectingRef.current === start.slug) return

    const token = feedToken.current + 1
    feedToken.current = token

    reachedEndRef.current = false
    setReachedEnd(false)
    reachedStartRef.current = false
    setReachedStart(false)
    canLoadPrevRef.current = false
    setCanLoadPrev(false)
    prependAnchor.current = null
    setLoadingFeed(true)
    setSections([])
    sectionRefs.current.clear()
    if (productsScrollRef.current) productsScrollRef.current.scrollTop = 0

    fetchCategoryPage(start.slug, 1)
      .then((page) => {
        if (token !== feedToken.current) return
        setSections([
          {
            slug: start.slug,
            label: start.label,
            products: page.products,
            firstPage: 1,
            lastPage: 1,
            hasMore: page.hasMore,
          },
        ])
        setActiveSlug(start.slug)
      })
      .catch(() => {
        if (token !== feedToken.current) return
        setSections([
          {
            slug: start.slug,
            label: start.label,
            products: [],
            firstPage: 1,
            lastPage: 1,
            hasMore: false,
          },
        ])
        reachedEndRef.current = true
        setReachedEnd(true)
      })
      .finally(() => {
        if (token === feedToken.current) setLoadingFeed(false)
      })
  }, [categories, requestedSlug, fetchCategoryPage])

  // Pulls the next page of the current category. On mobile it then rolls over into
  // the following categories, skipping any that have no products.
  const loadNext = useCallback(async () => {
    if (appendingRef.current || reachedEndRef.current) return

    const token = feedToken.current
    const last = sectionsRef.current[sectionsRef.current.length - 1]
    if (!last) return

    appendingRef.current = true
    setAppending(true)

    try {
      if (last.hasMore) {
        const next = await fetchCategoryPage(last.slug, last.lastPage + 1)
        if (token !== feedToken.current) return
        setSections((prev) =>
          prev.map((section, index) =>
            index === prev.length - 1
              ? {
                  ...section,
                  products: mergeProducts(section.products, next.products),
                  lastPage: section.lastPage + 1,
                  hasMore: next.hasMore,
                }
              : section,
          ),
        )
        return
      }

      if (!isMobileRef.current) {
        reachedEndRef.current = true
        setReachedEnd(true)
        return
      }

      const list = categoriesRef.current
      const lastIndex = list.findIndex((item) => item.slug === last.slug)

      for (let index = lastIndex + 1; index < list.length; index += 1) {
        const category = list[index]
        const page = await fetchCategoryPage(category.slug, 1)
        if (token !== feedToken.current) return
        if (!page.products.length) continue

        setSections((prev) => [
          ...prev,
          {
            slug: category.slug,
            label: category.label,
            products: page.products,
            firstPage: 1,
            lastPage: 1,
            hasMore: page.hasMore,
          },
        ])
        return
      }

      reachedEndRef.current = true
      setReachedEnd(true)
    } catch {
      reachedEndRef.current = true
      setReachedEnd(true)
    } finally {
      appendingRef.current = false
      setAppending(false)
    }
  }, [fetchCategoryPage])

  // Mirror of loadNext for upward scrolling: walks back through the pages of the
  // first section, then into earlier categories, landing on their last page so the
  // catalog reads continuously in both directions.
  const loadPrev = useCallback(async () => {
    if (prependingRef.current || reachedStartRef.current) return

    const token = feedToken.current
    const first = sectionsRef.current[0]
    if (!first) return

    prependingRef.current = true
    setPrepending(true)

    const captureAnchor = () => {
      const root = productsScrollRef.current
      if (!root) return
      prependAnchor.current = { height: root.scrollHeight, top: root.scrollTop }
    }

    try {
      if (first.firstPage > 1) {
        const previousPage = first.firstPage - 1
        const page = await fetchCategoryPage(first.slug, previousPage)
        if (token !== feedToken.current) return

        captureAnchor()
        setSections((prev) =>
          prev.map((section, index) =>
            index === 0
              ? {
                  ...section,
                  products: mergeProducts(page.products, section.products),
                  firstPage: previousPage,
                }
              : section,
          ),
        )
        return
      }

      const list = categoriesRef.current
      const firstIndex = list.findIndex((item) => item.slug === first.slug)

      for (let index = firstIndex - 1; index >= 0; index -= 1) {
        const category = list[index]
        const head = await fetchCategoryPage(category.slug, 1)
        if (token !== feedToken.current) return
        if (!head.products.length) continue

        const pageCount = Math.max(1, Math.ceil(head.total / PAGE_SIZE))
        let tail = head
        if (pageCount > 1) {
          tail = await fetchCategoryPage(category.slug, pageCount)
          if (token !== feedToken.current) return
        }

        captureAnchor()
        setSections((prev) => [
          {
            slug: category.slug,
            label: category.label,
            products: tail.products,
            firstPage: pageCount,
            lastPage: pageCount,
            hasMore: false,
          },
          ...prev,
        ])
        return
      }

      reachedStartRef.current = true
      setReachedStart(true)
    } catch {
      reachedStartRef.current = true
      setReachedStart(true)
    } finally {
      prependingRef.current = false
      setPrepending(false)
    }
  }, [fetchCategoryPage])

  // Runs before paint, so newly prepended rows never shift what the shopper sees.
  useLayoutEffect(() => {
    const anchor = prependAnchor.current
    if (!anchor) return
    prependAnchor.current = null

    const root = productsScrollRef.current
    if (!root) return

    const delta = root.scrollHeight - anchor.height
    if (delta !== 0) root.scrollTop = anchor.top + delta
  }, [sections])

  // Rebuilt after every append so the sentinel keeps firing while it stays in view.
  useEffect(() => {
    if (loadingFeed || reachedEnd || !sections.length) return

    const node = loadMoreRef.current
    const root = productsScrollRef.current
    if (!node || !root) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadNext()
      },
      { root, rootMargin: '300px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [isMobile, loadingFeed, reachedEnd, sections, appending, loadNext])

  useEffect(() => {
    if (!isMobile || loadingFeed || reachedStart || !canLoadPrev || !sections.length) return

    const node = loadPrevRef.current
    const root = productsScrollRef.current
    if (!node || !root) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadPrev()
      },
      { root, rootMargin: '300px 0px 0px 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [isMobile, loadingFeed, reachedStart, canLoadPrev, sections, prepending, loadPrev])

  // Highlights whichever category section is currently at the top of the panel.
  useEffect(() => {
    const root = productsScrollRef.current
    if (!root || !sections.length) return

    let frame = 0

    const update = () => {
      frame = 0
      if (selectingRef.current) return

      if (!canLoadPrevRef.current && root.scrollTop > 24) {
        canLoadPrevRef.current = true
        setCanLoadPrev(true)
      }

      const rootTop = root.getBoundingClientRect().top
      let current = sections[0].slug

      for (const section of sections) {
        const node = sectionRefs.current.get(section.slug)
        if (!node) continue
        if (node.getBoundingClientRect().top - rootTop <= ACTIVE_OFFSET_PX) {
          current = section.slug
        }
      }

      setActiveSlug((prev) => (prev === current ? prev : current))
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(update)
    }

    update()
    root.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      root.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [isMobile, sections])

  useEffect(() => {
    if (!activeSlug) return
    // Do not overwrite a category the shopper just tapped before its feed lands.
    if (selectingRef.current && selectingRef.current !== activeSlug) return

    if (searchParams.get('category') !== activeSlug) {
      setSearchParams({ category: activeSlug }, { replace: true })
    }

    // Scrolled by hand rather than with scrollIntoView, which would also move the
    // feed scroller and could yank the shopper back out of the footer.
    const button = railRefs.current.get(activeSlug)
    const nav = button?.closest('nav')
    if (!button || !nav) return

    const buttonBox = button.getBoundingClientRect()
    const navBox = nav.getBoundingClientRect()
    if (buttonBox.top < navBox.top) {
      nav.scrollTop += buttonBox.top - navBox.top
    } else if (buttonBox.bottom > navBox.bottom) {
      nav.scrollTop += buttonBox.bottom - navBox.bottom
    }
  }, [activeSlug, searchParams, setSearchParams])

  const jumpToCategory = useCallback(
    async (slug) => {
      const category = categoriesRef.current.find((item) => item.slug === slug)
      if (!category) return

      const token = feedToken.current + 1
      feedToken.current = token

      reachedEndRef.current = false
      setReachedEnd(false)
      reachedStartRef.current = false
      setReachedStart(false)
      canLoadPrevRef.current = false
      setCanLoadPrev(false)
      prependAnchor.current = null

      try {
        const page = await fetchCategoryPage(slug, 1)
        if (token !== feedToken.current) return

        sectionRefs.current.clear()
        setSections([
          {
            slug: category.slug,
            label: category.label,
            products: page.products,
            firstPage: 1,
            lastPage: 1,
            hasMore: page.hasMore,
          },
        ])
        setActiveSlug(category.slug)
        if (productsScrollRef.current) productsScrollRef.current.scrollTop = 0
      } catch {
        if (token !== feedToken.current) return
        setSections([
          {
            slug: category.slug,
            label: category.label,
            products: [],
            firstPage: 1,
            lastPage: 1,
            hasMore: false,
          },
        ])
        setActiveSlug(category.slug)
        reachedEndRef.current = true
        setReachedEnd(true)
      }
    },
    [fetchCategoryPage],
  )

  const selectCategory = (slug) => {
    if (!slug || slug === activeSlugRef.current) {
      const node = sectionRefs.current.get(slug)
      const root = productsScrollRef.current
      if (node && root) {
        const top =
          node.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop
        root.scrollTo({ top: Math.max(0, top - 4), behavior: 'auto' })
      }
      return
    }

    selectingRef.current = slug
    setActiveSlug(slug)
    setSearchParams({ category: slug }, { replace: true })

    const node = sectionRefs.current.get(slug)
    const root = productsScrollRef.current

    // Already in the stacked feed — jump without smooth scroll (avoids rail blink).
    if (node && root) {
      const top =
        node.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop
      root.scrollTo({ top: Math.max(0, top - 4), behavior: 'auto' })
      clearTimeout(selectingTimer.current)
      selectingTimer.current = setTimeout(() => {
        if (selectingRef.current === slug) selectingRef.current = null
      }, 400)
      return
    }

    // Not loaded yet (common on mobile before any scroll) — rebuild feed here.
    clearTimeout(selectingTimer.current)
    jumpToCategory(slug).finally(() => {
      if (selectingRef.current === slug) selectingRef.current = null
    })
  }

  if (loadingCategories && !categories.length) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center bg-canvas">
        <p className="text-muted">Loading shop...</p>
      </main>
    )
  }

  if (!categories.length) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center bg-canvas">
        <div className="px-4 text-center">
          <h1 className="text-2xl font-bold text-white">No categories found</h1>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-black hover:bg-brand-hover"
          >
            Back to home
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main
      ref={mainRef}
      className={`flex flex-col bg-canvas ${isMobile ? 'overflow-hidden' : 'overflow-x-clip'}`}
      style={lockedHeight ? { height: `${lockedHeight}px` } : undefined}
    >
      <div className="mx-auto flex w-full min-h-0 max-w-7xl flex-1 flex-col overflow-x-clip px-2 pt-5 sm:px-3 sm:pt-6 lg:px-4 lg:pt-8">
        <p className="mx-2.5 mb-5 shrink-0 text-xl capitalize text-white">Shop all</p>

        {/* Mobile scrolls this whole block — the shop box, then the footer — so the
            rail can pin itself while products last and slide away at the very end.
            overflow-clip (not hidden) keeps the box from becoming the scrollport. */}
        <div
          ref={isMobile ? productsScrollRef : null}
          className={isMobile ? 'min-h-0 flex-1 overflow-x-clip overflow-y-auto' : ''}
        >
          <div
            className={`mb-5 flex max-w-full rounded-lg border border-line bg-panel ${
              isMobile
                ? 'overflow-clip'
                : 'min-h-[calc(100dvh-14rem)] overflow-hidden lg:min-h-[calc(100dvh-12rem)]'
            }`}
          >
            {/* Category rail — aligned with product cards inside the box */}
            <aside
              className={`flex w-[76px] shrink-0 flex-col border-r border-line bg-panel sm:w-[92px] lg:w-[108px] ${
                isMobile ? 'sticky top-0 self-start' : ''
              }`}
              style={isMobile && railHeight ? { height: `${railHeight}px` } : undefined}
            >
              <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-hide">
                {categories.map((category) => {
                  const isActive = category.slug === activeSlug
                  return (
                    <button
                      key={category.id}
                      type="button"
                      ref={(node) => {
                        if (node) railRefs.current.set(category.slug, node)
                        else railRefs.current.delete(category.slug)
                      }}
                      onClick={() => selectCategory(category.slug)}
                      className={`relative flex w-full flex-col items-center gap-0.5 px-1 py-2 text-center transition sm:px-1.5 sm:py-2.5 ${
                        isActive ? 'bg-panel-2' : 'hover:bg-panel-2/60'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute inset-y-2 right-0 w-[3px] rounded-l-full bg-brand" />
                      )}
                      <span
                        className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border bg-white sm:h-11 sm:w-11 ${
                          isActive ? 'border-emerald-400' : 'border-line'
                        }`}
                      >
                        <img
                          src={category.image}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </span>
                      <span
                        className={`line-clamp-2 px-0.5 text-[9px] leading-tight sm:text-[10px] ${
                          isActive ? 'font-bold text-mint' : 'font-medium text-muted'
                        }`}
                      >
                        {category.label}
                      </span>
                    </button>
                  )
                })}
              </nav>
            </aside>

            {/* Products — the scrolling part of the box on desktop */}
            <section
              ref={isMobile ? null : productsScrollRef}
              className={`min-w-0 flex-1 bg-canvas ${
                isMobile ? '' : 'min-h-0 overflow-y-auto overscroll-contain'
              }`}
            >
              <div className="min-w-0 px-1.5 pb-3 pt-1 sm:px-2 sm:pb-4">
                {loadingFeed || !sections.length ? (
                  <div className="shop-product-grid grid grid-cols-2 gap-2 sm:gap-2.5 md:grid-cols-4 lg:grid-cols-7 xl:grid-cols-8">
                    {Array.from({ length: 12 }).map((_, index) => (
                      <div
                        key={index}
                        className="aspect-[3/4] min-w-0 animate-pulse rounded-lg border border-line bg-panel-2"
                      />
                    ))}
                  </div>
                ) : sections.every((section) => section.products.length === 0) ? (
                  <div className="rounded-lg border border-dashed border-line bg-panel-2 p-10 text-center">
                    <p className="text-base font-semibold text-white">No products yet</p>
                    <p className="mt-2 text-sm text-muted">
                      We&apos;re adding fresh picks to this category soon.
                    </p>
                  </div>
                ) : (
                  <>
                    {isMobile && (
                      <>
                        <div ref={loadPrevRef} className="h-0 w-full overflow-hidden" aria-hidden />
                        {prepending ? (
                          <p className="py-1 text-center text-sm font-medium text-muted">Loading…</p>
                        ) : null}
                      </>
                    )}

                    {sections.map((section) => (
                      <div
                        key={section.slug}
                        ref={(node) => {
                          if (node) sectionRefs.current.set(section.slug, node)
                          else sectionRefs.current.delete(section.slug)
                        }}
                        className="min-w-0 pt-2 first:pt-0"
                      >
                        <div className="shop-product-grid grid grid-cols-2 gap-2 sm:gap-2.5 md:grid-cols-4 lg:grid-cols-7 xl:grid-cols-8">
                          {section.products.map((product) => (
                            <ProductCard
                              key={`${section.slug}-${product.id}`}
                              product={product}
                              onNavigate={(target) => navigate(target)}
                            />
                          ))}
                        </div>
                      </div>
                    ))}

                    <div ref={loadMoreRef} className="h-0 w-full overflow-hidden" aria-hidden />
                    {appending ? (
                      <p className="py-1 text-center text-sm font-medium text-muted">Loading more…</p>
                    ) : null}
                  </>
                )}
              </div>
            </section>
          </div>

          {isMobile && (
            <div className="max-w-full overflow-x-clip">
              <Footer />
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
