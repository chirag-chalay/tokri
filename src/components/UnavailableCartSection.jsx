import { useCallback, useRef } from 'react'
import { X } from 'lucide-react'
import CatalogImage from './CatalogImage'
import CartControl from './CartControl'

const formatPrice = (value) =>
  `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

function discountPercent(product) {
  const price = Number(product.priceValue)
  const oldPrice = Number(product.oldPriceValue)
  if (!oldPrice || !price || oldPrice <= price) return 0
  return Math.round((1 - price / oldPrice) * 100)
}

export default function UnavailableCartSection({ items = [], suggestions = [], onDismiss }) {
  const trackRef = useRef(null)
  const dragRef = useRef({ active: false, startX: 0, startScroll: 0, moved: false })

  const onPointerDown = useCallback((event) => {
    // Touch/pen use native overflow scroll; mouse needs click-drag.
    if (event.pointerType !== 'mouse' || event.button !== 0) return
    const el = trackRef.current
    if (!el) return
    dragRef.current = {
      active: true,
      startX: event.clientX,
      startScroll: el.scrollLeft,
      moved: false,
      pointerId: event.pointerId,
    }
    el.setPointerCapture?.(event.pointerId)
  }, [])

  const onPointerMove = useCallback((event) => {
    const drag = dragRef.current
    const el = trackRef.current
    if (!drag.active || !el) return
    const dx = event.clientX - drag.startX
    if (Math.abs(dx) > 4) drag.moved = true
    el.scrollLeft = drag.startScroll - dx
  }, [])

  const endDrag = useCallback((event) => {
    const drag = dragRef.current
    const el = trackRef.current
    if (!drag.active) return
    drag.active = false
    if (el && event?.pointerId != null) el.releasePointerCapture?.(event.pointerId)
  }, [])

  const onClickCapture = useCallback((event) => {
    // After a drag, suppress the click so ADD / links don't fire accidentally.
    if (dragRef.current.moved) {
      event.preventDefault()
      event.stopPropagation()
      dragRef.current.moved = false
    }
  }, [])

  if (!items.length) return null
  const count = items.length
  const heading = count === 1 ? '1 item is not in stock' : `${count} items are not in stock`

  return (
    <section className="mb-5 min-w-0 rounded-2xl border border-rose-400/40 bg-panel">
      <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
        <h3 className="m-0 text-sm font-bold text-rose-400">{heading}</h3>
        <button
          type="button"
          onClick={onDismiss}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white transition hover:bg-rose-400"
          aria-label="Dismiss unavailable items"
        >
          <X size={14} strokeWidth={3} />
        </button>
      </div>

      <ul className="m-0 list-none space-y-3 px-4 py-3">
        {items.map((item) => (
          <li key={item.slug || item.id} className="flex items-center gap-3">
            <CatalogImage
              src={item.image}
              alt={item.name}
              className="h-12 w-12 shrink-0 rounded-lg border border-line bg-panel-2 object-cover"
            />
            <div className="min-w-0">
              <p className="m-0 line-clamp-2 text-xs font-medium text-white">{item.name}</p>
              {item.weight ? <p className="mt-0.5 text-xs text-muted">{item.weight}</p> : null}
            </div>
          </li>
        ))}
      </ul>

      {suggestions.length ? (
        <div className="min-w-0 border-t border-line px-4 py-3">
          <p className="m-0 text-sm font-semibold text-white" style={{ marginBottom: 20 }}>
            Add these items instead
          </p>
          <div
            ref={trackRef}
            role="list"
            aria-label="Suggested products"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onClickCapture={onClickCapture}
            className="flex min-w-0 w-full max-w-full cursor-grab snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-1 active:cursor-grabbing touch-pan-x scrollbar-hide"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {suggestions.map((product) => {
              const off = discountPercent(product)
              return (
                <article
                  key={product.id || product.slug}
                  role="listitem"
                  className="w-[80%] shrink-0 grow-0 basis-[80%] snap-start rounded-xl border border-line bg-panel-2 p-3 select-none"
                >
                  <div className="flex gap-2">
                    <div className="relative shrink-0">
                      {off > 0 ? (
                        <span className="absolute left-0 top-0 z-10 rounded-br-md bg-sky-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {off}% OFF
                        </span>
                      ) : null}
                      <CatalogImage
                        src={product.image}
                        alt={product.name}
                        className="pointer-events-none h-16 w-16 rounded-lg border border-line bg-panel object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="m-0 line-clamp-2 text-xs font-medium text-white">{product.name}</p>
                      {product.weight ? <p className="mt-1 text-[11px] text-muted">{product.weight}</p> : null}
                      <div className="mt-2 flex items-end justify-between gap-2">
                        <div className="min-w-0">
                          <p className="m-0 text-sm font-bold text-white">
                            {product.price || formatPrice(product.priceValue)}
                          </p>
                          {off > 0 && (product.oldPrice || product.oldPriceValue) ? (
                            <p className="m-0 text-[11px] text-muted line-through">
                              {product.oldPrice || formatPrice(product.oldPriceValue)}
                            </p>
                          ) : null}
                        </div>
                        <CartControl product={product} />
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      ) : null}
    </section>
  )
}
