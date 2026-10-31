import Link from 'next/link'
import { Clock, Leaf, ShieldCheck } from 'lucide-react'
import ProductDetailsBlock from '../../components/ProductDetailsBlock'
import SafeCartControl from './SafeCartControl'
import RelatedProductCard from './RelatedProductCard'

const discountPercent = (product) => {
  const price = Number(product.priceValue)
  const oldPrice = Number(product.oldPriceValue)
  if (!oldPrice || !price || oldPrice <= price) return 0
  return Math.round((1 - price / oldPrice) * 100)
}


export default function ProductView({ product, relatedProducts }) {
  const off = discountPercent(product)
  const categorySlug = product.category?.slug || product.categoryId

  return (
    <main className="product-detail bg-canvas pb-16 pt-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <nav className="mb-6 text-sm text-muted">
          <Link href="/" className="text-mint hover:underline">
            Home
          </Link>
          {categorySlug && product.category?.label && (
            <>
              <span className="mx-2">/</span>
              <Link href={`/shop?category=${categorySlug}`} className="text-mint hover:underline">
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
              <SafeCartControl product={product} variant="block" />
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
                  href={`/shop?category=${categorySlug}`}
                  className="shrink-0 text-sm font-semibold text-mint hover:underline"
                >
                  View all
                </Link>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8">
              {relatedProducts.map((item) => (
                <RelatedProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
