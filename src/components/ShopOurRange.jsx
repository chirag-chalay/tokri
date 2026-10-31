import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Exoticfruits from '../assets/exotic-fruits.png'
import importedFruitsImg from '../assets/imported-fruits.png'
import freshFruitsImg from '../assets/fresh-fruits.png'
import mangoImg from '../assets/mango.png'
import { fetchJson, normalizeProducts } from '../lib/api'
import CartControl from './CartControl'

const discountPercent = (product) => {
  const price = Number(product.priceValue)
  const oldPrice = Number(product.oldPriceValue)
  if (!oldPrice || !price || oldPrice <= price) return 0
  return Math.round((1 - price / oldPrice) * 100)
}

const rangeCategories = [
  {
    title: 'Exotic Fruits',
    slug: 'exotic',
    label: 'Premium',
    description: 'Handpicked tropical selections for fresh flavor.',
    buttonText: 'Shop Now',
    textColor: 'text-white',
    glow: 'radial-gradient(circle at top left, rgba(236, 253, 245, 0.55), transparent 35%)',
    image: Exoticfruits,
    imageLabel: 'Exotic Avocado',
  },
  {
    title: 'Imported Fruits',
    slug: 'imported',
    label: 'Flat 20% Off',
    description: 'Seasonal imports with bright aroma and sweetness.',
    buttonText: 'Shop Now',
    textColor: 'text-slate-950',
    glow: 'radial-gradient(circle at top right, rgba(255, 247, 205, 0.9), transparent 40%)',
    image: importedFruitsImg,
    imageLabel: 'Dragon Fruit',
  },
  {
    title: 'Fresh Fruits',
    slug: 'fresh-fruits',
    label: 'Big Season Sale',
    description: 'Locally sourced favorites ready to enjoy today.',
    buttonText: 'Shop Now',
    textColor: 'text-white',
    glow: 'radial-gradient(circle at bottom right, rgba(255, 236, 179, 0.55), transparent 45%)',
    image: freshFruitsImg,
    imageLabel: 'Ripe Mango',
  },
]

const MAX_PRODUCTS = 9

function ProductCard({ product, onNavigate }) {
  const off = discountPercent(product)
  const target = `/product/${product.slug || product.id}`

  return (
    <article
      onClick={() => onNavigate(target)}
      className="group flex h-full cursor-pointer flex-col rounded-lg border border-line bg-panel-2 p-1 transition hover:border-brand/40 sm:p-1.5"
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
      {product.weight && (
        <p className="mt-0.5 text-[10px] text-muted">{product.weight}</p>
      )}
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

export default function ShopOurRange() {
  const navigate = useNavigate()
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(2)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [prevIndex, setPrevIndex] = useState(activeCategoryIndex)
  const trackRef = useRef(null)

  if (prevIndex !== activeCategoryIndex) {
    setPrevIndex(activeCategoryIndex)
    setLoading(true)
  }

  const activeCategory = rangeCategories[activeCategoryIndex]
  const isSlider = products.length > 3

  useEffect(() => {
    let ignore = false

    fetchJson(`/products?category=${encodeURIComponent(activeCategory.slug)}&limit=${MAX_PRODUCTS}`)
      .then((items) => {
        if (!ignore) setProducts(normalizeProducts(items).slice(0, MAX_PRODUCTS))
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
  }, [activeCategory.slug])

  const handleCategoryClick = (index) => {
    setActiveCategoryIndex(index)
  }

  const scrollByCard = (direction) => {
    const track = trackRef.current
    if (!track) return
    const amount = track.clientWidth * 0.85
    track.scrollBy({ left: direction * amount, behavior: 'smooth' })
  }

  return (
    <section className="my-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-[52px] font-bold text-white">
            <span className="font-light">Shop By </span>Range
          </h2>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {rangeCategories.map((card, index) => {
            const isSelected = index === activeCategoryIndex
            return (
              <article
                key={card.title}
                style={{
                  backgroundImage: `url(${card.image})`,
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat',
                }}
                className={`relative h-[460px] overflow-hidden rounded-xl border p-6 shadow-xl transition ${isSelected
                  ? 'border-emerald-400 shadow-[0_28px_60px_rgba(16,185,129,0.18)]'
                  : 'border-white/40'
                  } ${card.textColor}`}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-60"
                  style={{ background: card.glow }}
                />
                <div className="relative flex h-full flex-col">
                  <div>
                    <p className="text-md">{card.label}</p>
                    <h3 className="text-4xl font-bold leading-tight">{card.title}</h3>
                    <p className="mt-3 max-w-xs text-sm opacity-90">{card.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCategoryClick(index)}
                    className="mt-4 inline-flex w-max items-center justify-center rounded-full border border-white/70 bg-white/10 px-5 py-2 text-sm font-semibold transition hover:bg-white/20"
                  >
                    {card.buttonText}
                  </button>
                </div>
              </article>
            )
          })}
        </div>

        <div className="my-20 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
          <div className="mx-auto w-full max-w-[280px] sm:max-w-[320px] lg:mx-0 lg:max-w-none">
            <div className="overflow-hidden rounded-xl shadow-sm">
              <img
                src={mangoImg}
                alt={activeCategory.imageLabel}
                className="aspect-[4/5] w-full max-h-[360px] object-cover sm:max-h-[400px] lg:max-h-[420px]"
              />
            </div>
          </div>

          <div className="w-full min-w-0 space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-[44px]">
                <span className="font-light">{activeCategory.title.split(' ')[0]} </span>
                {activeCategory.title.split(' ').slice(1).join(' ') || 'Fruits'}
              </h2>
              <Link
                to={`/shop?category=${activeCategory.slug}`}
                className="inline-flex items-center justify-center rounded-full border border-line bg-panel px-5 py-2.5 text-sm font-semibold text-mint shadow-sm transition hover:bg-panel-2 hover:text-white"
              >
                View {activeCategory.title}
              </Link>
            </div>

            {loading ? (
              <div className="rounded-xl border border-line bg-panel p-10 text-center text-muted">
                Loading products...
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-xl border border-line bg-panel p-10 text-center text-muted">
                No products in this category yet.
              </div>
            ) : (
              <div className="relative">
                {isSlider && (
                  <button
                    type="button"
                    onClick={() => scrollByCard(-1)}
                    aria-label="Previous products"
                    className="absolute -left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2.5 text-slate-700 shadow-md transition hover:bg-emerald-600 hover:text-white sm:flex"
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}

                <div
                  ref={trackRef}
                  className={
                    isSlider
                      ? 'flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth pb-2 scrollbar-hide'
                      : 'grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8'
                  }
                >
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className={
                        isSlider
                          ? 'w-[calc((100%-1rem)/3)] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/4)] md:w-[calc((100%-2rem)/5)] lg:w-[calc((100%-3rem)/7)] xl:w-[calc((100%-3.5rem)/8)]'
                          : ''
                      }
                    >
                      <ProductCard product={product} onNavigate={navigate} />
                    </div>
                  ))}
                </div>

                {isSlider && (
                  <button
                    type="button"
                    onClick={() => scrollByCard(1)}
                    aria-label="Next products"
                    className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2.5 text-slate-700 shadow-md transition hover:bg-emerald-600 hover:text-white sm:flex"
                  >
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
