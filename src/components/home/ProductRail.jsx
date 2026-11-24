'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link, useNavigate } from '../../lib/navigation'
import HomeProductCard from './HomeProductCard'
import { hrefForHomeLink, isExternalHomeLink } from './homeLinks'

export default function ProductRail({
  title = '',
  products = [],
  layout = 'grid',
  seeAll = false,
  seeAllLink = null,
  deferCart = true,
}) {
  const navigate = useNavigate()
  const trackRef = useRef(null)
  if (!products.length) return null

  const seeHref = seeAll ? hrefForHomeLink(seeAllLink) : null
  const seeExternal = isExternalHomeLink(seeAllLink)

  const scrollByCard = (direction) => {
    const track = trackRef.current
    if (!track) return
    track.scrollBy({ left: direction * track.clientWidth * 0.85, behavior: 'smooth' })
  }

  const header = (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      {title ? <h2 className="home-section-title">{title}</h2> : <span />}
      {seeHref ? (
        seeExternal ? (
          <a href={seeHref} target="_blank" rel="noreferrer" className="text-sm font-semibold text-brand">
            See all
          </a>
        ) : (
          <Link to={seeHref} className="text-sm font-semibold text-brand">
            See all
          </Link>
        )
      ) : null}
    </div>
  )

  if (layout === 'carousel') {
    return (
      <section className="my-8 bg-canvas lg:my-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {header}
          <div className="relative">
            {products.length > 3 ? (
              <>
                <button
                  type="button"
                  onClick={() => scrollByCard(-1)}
                  aria-label="Previous products"
                  className="absolute -left-3 top-1/2 z-10 flex -translate-y-1/2 rounded-full border border-line bg-panel p-2.5 text-white shadow-md transition hover:bg-brand hover:text-black"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollByCard(1)}
                  aria-label="Next products"
                  className="absolute -right-3 top-1/2 z-10 flex -translate-y-1/2 rounded-full border border-line bg-panel p-2.5 text-white shadow-md transition hover:bg-brand hover:text-black"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            ) : null}
            <div
              ref={trackRef}
              className="flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth pb-2 scrollbar-hide"
            >
              {products.map((product) => (
                <div
                  key={product.slug || product.id}
                  className="w-[calc((100%-1rem)/3)] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/4)] md:w-[calc((100%-2rem)/5)] lg:w-[calc((100%-3rem)/7)] xl:w-[calc((100%-3.5rem)/8)]"
                >
                  <HomeProductCard product={product} deferCart={deferCart} onNavigate={navigate} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-canvas py-8 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {header}
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8">
          {products.map((product) => (
            <HomeProductCard
              key={product.slug || product.id}
              product={product}
              deferCart={deferCart}
              onNavigate={navigate}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
