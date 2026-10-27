import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { fetchJson, normalizeProducts } from '../lib/api'
import CartControl from './CartControl'

const getSlidesPerView = (width) => {
  if (width >= 1280) return 8
  if (width >= 1024) return 7
  if (width >= 768) return 5
  if (width >= 640) return 4
  return 3
}

function useSlidesPerView() {
  const [slidesPerView, setSlidesPerView] = useState(() =>
    typeof window !== 'undefined' ? getSlidesPerView(window.innerWidth) : 8,
  )

  useEffect(() => {
    const update = () => setSlidesPerView(getSlidesPerView(window.innerWidth))
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return slidesPerView
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
      className="group flex h-full cursor-pointer flex-col rounded-lg border border-line bg-panel-2 p-1 transition hover:border-brand/40 sm:p-1.5 focus:outline-none focus:ring-2 focus:ring-brand/60"
    >
      <div className="relative mb-1 h-24 overflow-hidden rounded-md bg-panel sm:h-28">
        {off > 0 && (
          <span className="absolute left-1 top-1 rounded bg-emerald-600 px-1 py-0.5 text-[9px] font-bold leading-none text-white shadow">
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

export default function ImportedFruits() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const trackRef = useRef(null)
  const slidesPerView = useSlidesPerView()

  const showArrows = products.length > slidesPerView

  useEffect(() => {
    let ignore = false
    setLoading(true)

    fetchJson('/products?flag=imported&limit=100')
      .then((items) => {
        if (!ignore) setProducts(normalizeProducts(items))
      })
      .catch(() => {
        if (!ignore) setProducts([])
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [])

  const scrollByCard = (direction) => {
    const track = trackRef.current
    if (!track) return
    const amount = track.clientWidth * 0.85
    track.scrollBy({ left: direction * amount, behavior: 'smooth' })
  }

  if (!loading && products.length === 0) {
    return null
  }

  return (
    <section className="my-8 bg-canvas lg:my-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="home-section-title">
            <span className="font-light">Imported </span>Fruits
          </h2>
        </div>

        {loading ? (
          <div className="rounded-xl border border-line bg-panel p-10 text-center text-muted">
            Loading products...
          </div>
        ) : (
          <div className="relative">
            {showArrows && (
              <button
                type="button"
                onClick={() => scrollByCard(-1)}
                aria-label="Previous products"
                className="absolute -left-3 top-1/2 z-10 flex -translate-y-1/2 rounded-full border border-line bg-panel p-2.5 text-white shadow-md transition hover:bg-brand hover:text-black"
              >
                <ChevronLeft size={20} />
              </button>
            )}

            <div
              ref={trackRef}
              className="flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth pb-2 scrollbar-hide"
            >
              {products.map((product) => (
                <div
                  key={product.id}
                  className="w-[calc((100%-1rem)/3)] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/4)] md:w-[calc((100%-2rem)/5)] lg:w-[calc((100%-3rem)/7)] xl:w-[calc((100%-3.5rem)/8)]"
                >
                  <ProductCard product={product} onNavigate={navigate} />
                </div>
              ))}
            </div>

            {showArrows && (
              <button
                type="button"
                onClick={() => scrollByCard(1)}
                aria-label="Next products"
                className="absolute -right-3 top-1/2 z-10 flex -translate-y-1/2 rounded-full border border-line bg-panel p-2.5 text-white shadow-md transition hover:bg-brand hover:text-black"
              >
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
