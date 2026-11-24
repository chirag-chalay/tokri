'use client'

import { Link } from '../../lib/navigation'
import CatalogImage from '../CatalogImage'

export default function CategoryStrip({ title = '', categories = [] }) {
  if (!categories.length) return null

  return (
    <section className="mb-0 mt-8 bg-canvas lg:mb-0 lg:mt-14">
      <div className="mx-auto max-w-7xl">
        {title ? (
          <h2 className="home-section-title px-4 sm:px-6">{title}</h2>
        ) : null}
        <div className="group relative mt-5">
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 scroll-pl-4 scroll-pr-4 scrollbar-hide sm:gap-4 sm:px-6 sm:scroll-pl-6 sm:scroll-pr-6">
            {categories.map((category) => (
              <Link
                key={category.slug || category.id}
                to={`/shop?category=${category.slug || category.id}`}
                className="w-[22%] min-w-[78px] shrink-0 snap-start sm:w-[100px] sm:min-w-[100px] lg:min-w-[120px]"
              >
                <article className="text-center">
                  <div className="mx-auto aspect-square overflow-hidden rounded-xl bg-transparent">
                    <CatalogImage
                      src={category.image}
                      alt={category.label}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h3 className="mt-2 line-clamp-2 px-0.5 text-[11px] font-semibold leading-tight text-zinc-400 sm:text-xs lg:mt-3 lg:text-sm">
                    {category.label}
                  </h3>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
