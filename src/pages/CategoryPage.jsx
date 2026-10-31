import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { categoryDetails } from '../data/categories'
import { fetchJson, normalizeProducts, resolveAssetUrl } from '../lib/api'
import CartControl from '../components/CartControl'

const discountPercent = (product) => {
  const price = Number(product.priceValue)
  const oldPrice = Number(product.oldPriceValue)
  if (!oldPrice || !price || oldPrice <= price) return 0
  return Math.round((1 - price / oldPrice) * 100)
}

export default function CategoryPage() {
  const navigate = useNavigate()
  const { categoryId } = useParams()
  const fallbackCategory = categoryDetails[categoryId]
  const [category, setCategory] = useState(fallbackCategory)
  const [loading, setLoading] = useState(!fallbackCategory)
  const [prevId, setPrevId] = useState(categoryId)

  if (prevId !== categoryId) {
    setPrevId(categoryId)
    setLoading(!fallbackCategory)
  }

  useEffect(() => {
    let ignore = false

    fetchJson(`/categories/${categoryId}`)
      .then((item) => {
        if (!ignore) {
          setCategory({
            ...item,
            products: normalizeProducts(item.products || []),
          })
        }
      })
      .catch(() => {
        if (!ignore) setCategory(fallbackCategory)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [categoryId, fallbackCategory])

  if (loading) {
    return (
      <main className="min-h-screen bg-canvas py-20">
        <div className="mx-auto max-w-3xl rounded-3xl border border-line bg-panel p-10">
          <h1 className="text-3xl font-bold text-white">Loading category...</h1>
        </div>
      </main>
    )
  }

  if (!category) {
    return (
      <main className="min-h-screen bg-canvas py-20">
        <div className="mx-auto max-w-3xl rounded-3xl border border-line bg-panel p-10">
          <h1 className="text-3xl font-bold text-white">Category not found</h1>
          <p className="mt-4 text-muted">The category you are looking for does not exist.</p>
          <Link
            to="/"
            className="mt-8 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-black hover:bg-brand-hover"
          >
            Back to home
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-canvas pb-16 pt-6 sm:pt-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="mb-4 text-xs text-muted sm:mb-6 sm:text-sm">
          <Link to="/" className="font-medium text-mint hover:underline">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-white">{category.title}</span>
        </nav>

        {category.bannerImage ? (
          <div className="mb-6 overflow-hidden rounded-xl shadow-sm sm:mb-10 sm:rounded-[2rem]">
            <img
              src={resolveAssetUrl(category.bannerImage)}
              alt={category.title || category.label}
              className="h-32 w-full object-cover sm:h-64 lg:h-72"
            />
          </div>
        ) : (
          <div className="mb-4 overflow-hidden rounded-lg border border-line bg-panel p-2.5 sm:mb-10 sm:rounded-[2rem] sm:p-10">
            <div className="flex flex-row items-center gap-3 sm:gap-8">
              <div className="shrink-0">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-panel-2 shadow-inner sm:h-40 sm:w-40">
                  <img
                    src={resolveAssetUrl(category.image)}
                    alt={category.title || category.label}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="hidden text-xs font-semibold uppercase tracking-[0.32em] text-emerald-400 sm:block">
                  Category
                </p>
                {/* Global h1 is 56px — force mobile size with ! so utilities win */}
                <h1 className="!m-0 line-clamp-1 !text-[15px] !font-semibold !leading-snug !tracking-normal text-white sm:!mt-3 sm:line-clamp-none sm:!text-4xl sm:!font-bold sm:!tracking-tight">
                  {category.title}
                </h1>
                {category.subtitle && (
                  <p className="mt-1 hidden max-w-xl text-base leading-7 text-muted sm:mt-3 sm:block">
                    {category.subtitle}
                  </p>
                )}
                <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-medium leading-none text-mint sm:mt-4 sm:gap-2 sm:px-4 sm:py-1.5 sm:text-sm">
                  <span className="font-bold">{category.products.length}</span> products available
                </p>
              </div>
            </div>
          </div>
        )}

        {category.products.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-line bg-panel p-12 text-center">
            <p className="text-lg font-semibold text-white">No products yet</p>
            <p className="mt-2 text-sm text-muted">
              We&apos;re adding fresh picks to this category soon. Check back shortly.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-black transition hover:bg-brand-hover"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8">
            {category.products.map((product) => {
              const off = discountPercent(product)
              const target = `/product/${product.slug || product.id}`

              return (
                <article
                  key={product.id}
                  onClick={() => navigate(target)}
                  className="group relative flex h-full cursor-pointer flex-col rounded-lg border border-line bg-panel-2 p-1 transition hover:-translate-y-0.5 hover:border-brand/40 sm:p-1.5"
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
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="line-clamp-2 min-h-[2rem] text-xs font-semibold leading-tight text-white">
                    {product.name}
                  </h3>
                  {product.weight && (
                    <p className="mt-0.5 text-[10px] text-muted">{product.weight}</p>
                  )}
                  <div className="mt-auto flex items-end justify-between gap-1 pt-1">
                    <div className="min-w-0 flex-1 overflow-hidden leading-tight">
                      <span className="block truncate text-[11px] font-bold text-white">
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
            })}
          </div>
        )}
      </div>
    </main>
  )
}
