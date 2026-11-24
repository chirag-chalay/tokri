'use client'

import { useNavigate } from '../../lib/navigation'
import DeferredCartControl from '../DeferredCartControl'
import CatalogImage from '../CatalogImage'

const discountPercent = (product) => {
  const price = Number(product.priceValue)
  const oldPrice = Number(product.oldPriceValue)
  if (!oldPrice || !price || oldPrice <= price) return 0
  return Math.round((1 - price / oldPrice) * 100)
}

export default function HomeProductCard({ product, deferCart = false, onNavigate }) {
  const navigate = useNavigate()
  const go = onNavigate || navigate
  const off = discountPercent(product)
  const target = `/product/${product.slug || product.id}`

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={() => go(target)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          go(target)
        }
      }}
      className="group relative flex h-full cursor-pointer flex-col rounded-lg border border-line bg-panel-2 p-1 transition hover:border-brand/40 sm:p-1.5 focus:outline-none focus:ring-2 focus:ring-brand/60"
    >
      <div className="relative mb-1 h-24 overflow-hidden rounded-md bg-panel sm:h-28">
        {off > 0 && (
          <span className="absolute left-1 top-1 z-10 rounded bg-emerald-600 px-1 py-0.5 text-[9px] font-bold leading-none text-white shadow">
            {off}% OFF
          </span>
        )}
        <CatalogImage
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
      </div>
      <h3 className="line-clamp-2 min-h-[2rem] text-xs font-medium leading-tight text-white">
        {product.name}
      </h3>
      {product.weight ? <p className="mt-0.5 text-[10px] text-muted">{product.weight}</p> : null}
      <div className="mt-auto flex items-end justify-between gap-1 pt-1">
        <div className="min-w-0 flex-1 overflow-hidden leading-tight">
          <span className="block truncate text-[11px] font-semibold text-white">{product.price}</span>
          {off > 0 && product.oldPrice ? (
            <span className="block truncate text-[10px] text-muted line-through">{product.oldPrice}</span>
          ) : null}
        </div>
        <span className="shrink-0" onClick={(event) => event.stopPropagation()}>
          <DeferredCartControl product={product} defer={deferCart} />
        </span>
      </div>
    </article>
  )
}
