import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronDown, Clock, Leaf, ShieldCheck } from 'lucide-react'
import { fetchJson, normalizeProduct, normalizeProducts } from '../lib/api'
import CartControl from '../components/CartControl'

const discountPercent = (product) => {
  const price = Number(product.priceValue)
  const oldPrice = Number(product.oldPriceValue)
  if (!oldPrice || !price || oldPrice <= price) return 0
  return Math.round((1 - price / oldPrice) * 100)
}

function hasStructuredDetails(html) {
  const text = String(html || '')
  if (/class=["'][^"']*\bproduct-(details|info-item)\b/.test(text)) return true
  return /<h3[\s>]/i.test(text) && /<div[\s>]/i.test(text)
}

function ProductDetailsBlock({ html, fallback }) {
  const [open, setOpen] = useState(false)
  const [canToggle, setCanToggle] = useState(false)
  const bodyRef = useRef(null)
  const structured = hasStructuredDetails(html)

  useEffect(() => {
    setOpen(false)
  }, [html])

  useLayoutEffect(() => {
    const root = bodyRef.current
    if (!root) {
      setCanToggle(false)
      return
    }
    const items = root.querySelectorAll('.product-info-item')
    const extras = root.querySelectorAll('.product-disclaimer, .customer-care')
    const groups = [...root.children].filter((node) => node.tagName === 'DIV')
    if (items.length > 1 || extras.length > 0 || groups.length > 1) {
      setCanToggle(true)
      return
    }
    const blocks = [...root.children].filter((node) => !/^H[1-4]$/.test(node.tagName))
    const nested = blocks.length === 1 ? [...blocks[0].children] : blocks
    setCanToggle(nested.length > 1)
  }, [html, fallback])

  return (
    <section className="mt-12 border-t border-line pt-10">
      {!structured ? <h2 className="text-lg font-bold text-white">Product Details</h2> : null}
      {html ? (
        <div
          ref={bodyRef}
          className={`product-details${structured ? '' : ' is-plain'}${open ? '' : ' is-collapsed'}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <div
          ref={bodyRef}
          className={`product-details is-plain${open ? '' : ' is-collapsed'}`}
        >
          <p>{fallback}</p>
        </div>
      )}
      {canToggle ? (
        <button
          type="button"
          className="product-details-toggle"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? 'View less details' : 'View more details'}
          <ChevronDown size={16} className={open ? 'rotate-180' : ''} aria-hidden="true" />
        </button>
      ) : null}
    </section>
  )
}

function RelatedProductCard({ product, onNavigate }) {
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
      className="group flex h-full cursor-pointer flex-col rounded-lg border border-line bg-panel-2 p-1 transition hover:border-brand/40 sm:p-1.5 focus:outline-none focus:ring-2 focus:ring-brand/60"
    >
      <div className="relative mb-1 h-24 overflow-hidden rounded-md bg-panel sm:h-28">
        {off > 0 && (
          <span className="absolute left-1 top-1 z-10 rounded bg-emerald-600 px-1 py-0.5 text-[9px] font-bold leading-none text-white shadow">
            {off}% OFF
          </span>
        )}
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <h3 className="line-clamp-2 min-h-[2rem] text-xs font-medium leading-tight text-white">
        {product.name}
      </h3>
      {product.weight && <p className="mt-0.5 text-[10px] text-muted">{product.weight}</p>}
      <div className="mt-auto flex items-end justify-between gap-1 pt-1">
        <div className="min-w-0 flex-1 overflow-hidden leading-tight">
          <span className="block truncate text-[11px] font-semibold text-white">
            {product.price}
          </span>
          {off > 0 && product.oldPrice && (
            <span className="block truncate text-[10px] text-muted line-through">
              {product.oldPrice}
            </span>
          )}
        </div>
        <span className="shrink-0" onClick={(event) => event.stopPropagation()}>
          <CartControl product={product} />
        </span>
      </div>
    </article>
  )
}

export default function ProductDetail() {
  const navigate = useNavigate()
  const { productId } = useParams()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    setLoading(true)
    fetchJson(`/products/${productId}`)
      .then(async (item) => {
        if (ignore) return
        const normalized = normalizeProduct(item)
        setProduct(normalized)

        try {
          const categoryQuery = normalized.categoryId ? `&category=${normalized.categoryId}` : ''
          const items = await fetchJson(`/products?limit=12${categoryQuery}`)
          const seen = new Set([productId])
          const merged = []
          for (const related of normalizeProducts(items)) {
            if (seen.has(related.id)) continue
            seen.add(related.id)
            merged.push(related)
            if (merged.length >= 10) break
          }
          if (!ignore) setRelatedProducts(merged)
        } catch {
          if (!ignore) setRelatedProducts([])
        }
      })
      .catch(() => {
        if (!ignore) setProduct(null)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [productId])

  if (loading) {
    return (
      <main className="product-detail min-h-screen bg-canvas pb-16 pt-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-6 h-4 w-40 animate-pulse rounded bg-panel-2" />
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="aspect-square w-full animate-pulse rounded-2xl bg-panel-2 md:w-[360px]" />
            <div className="flex-1 space-y-4 py-2">
              <div className="h-4 w-20 animate-pulse rounded bg-panel-2" />
              <div className="h-8 w-2/3 animate-pulse rounded bg-panel-2" />
              <div className="h-6 w-24 animate-pulse rounded bg-panel-2" />
              <div className="h-12 w-full max-w-xs animate-pulse rounded-xl bg-panel-2" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="product-detail min-h-screen bg-canvas py-20">
        <div className="mx-auto max-w-lg px-4 text-center">
          <h1 className="text-2xl font-bold text-white">Product not found</h1>
          <p className="mt-3 text-muted">We could not find the product you were looking for.</p>
          <Link
            to="/"
            className="mt-8 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-black hover:bg-brand-hover"
          >
            Back to shop
          </Link>
        </div>
      </main>
    )
  }

  const off = discountPercent(product)
  const categorySlug = product.category?.slug || product.categoryId

  return (
    <main className="product-detail bg-canvas pb-16 pt-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <nav className="mb-6 text-sm text-muted">
          <Link to="/" className="text-mint hover:underline">
            Home
          </Link>
          {categorySlug && product.category?.label && (
            <>
              <span className="mx-2">/</span>
              <Link to={`/shop?category=${categorySlug}`} className="text-mint hover:underline">
                {product.category.label}
              </Link>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="text-white/80">{product.name}</span>
        </nav>

        <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-12">
          <div className="relative mx-auto w-full max-w-[360px] shrink-0 md:mx-0">
            {off > 0 && (
              <span className="absolute left-3 top-3 z-10 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow">
                {off}% OFF
              </span>
            )}
            <div className="overflow-hidden rounded-2xl bg-slate-50">
              <img
                src={product.image}
                alt={product.name}
                className="aspect-square w-full object-cover"
              />
            </div>
          </div>

          <div className="flex-1 md:pt-2">
            {product.category?.label && (
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
                {product.category.label}
              </p>
            )}

            <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">{product.name}</h1>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
              {product.weight && <span>{product.weight}</span>}
              {product.weight && product.badge && <span>·</span>}
              {product.badge && <span>{product.badge}</span>}
            </div>

            <div className="mt-5 flex flex-wrap items-baseline gap-3">
              <span className="text-2xl font-bold text-white">{product.price}</span>
              {off > 0 && product.oldPrice && (
                <span className="text-base text-muted line-through">{product.oldPrice}</span>
              )}
            </div>

            <div className="mt-6 max-w-sm">
              <CartControl product={product} variant="block" />
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-2.5 rounded-xl border border-line bg-panel px-3 py-2.5">
                <Clock size={16} className="shrink-0 text-emerald-400" />
                <span className="text-xs leading-snug text-muted">Delivery before 7 AM</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-line bg-panel px-3 py-2.5">
                <Leaf size={16} className="shrink-0 text-emerald-400" />
                <span className="text-xs leading-snug text-muted">Premium handpicked</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-line bg-panel px-3 py-2.5">
                <ShieldCheck size={16} className="shrink-0 text-emerald-400" />
                <span className="text-xs leading-snug text-muted">Secure checkout</span>
              </div>
            </div>
          </div>
        </div>

        <ProductDetailsBlock
          html={product.description}
          fallback="Enjoy premium quality and fresh flavour with this handpicked fruit. Sourced with care and delivered early, so every bite stays naturally sweet and ripe."
        />

        {relatedProducts.length > 0 && (
          <section className="mt-14">
            <div className="mb-5 flex items-end justify-between gap-4">
              <h2 className="text-xl font-bold text-white sm:text-2xl">
                More from {product.category?.label || 'this category'}
              </h2>
              {categorySlug && (
                <Link
                  to={`/shop?category=${categorySlug}`}
                  className="shrink-0 text-sm font-semibold text-mint hover:underline"
                >
                  View all
                </Link>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8">
              {relatedProducts.map((item) => (
                <RelatedProductCard key={item.id} product={item} onNavigate={navigate} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
