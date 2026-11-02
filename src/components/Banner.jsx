'use client'

import { Link } from '../lib/navigation'
import { resolveAssetUrl } from '../lib/api'
import defaultBanner from '../assets/hero-banner.png'

export default function Banner({ image, mobileImage, rawUrls = false }) {
  const desktopSrc = image ? (rawUrls ? image : resolveAssetUrl(image)) : defaultBanner
  const mobileSrc = mobileImage ? (rawUrls ? mobileImage : resolveAssetUrl(mobileImage)) : null
  const src = mobileSrc || desktopSrc || defaultBanner

  if (!src) return null

  return (
    <section className="mt-4 sm:mt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Link
          to="/shop"
          aria-label="Shop all"
          className="group block cursor-pointer overflow-hidden rounded-xl transition duration-300"
        >
          {desktopSrc && mobileSrc ? (
            <picture>
              <source media="(min-width: 768px)" srcSet={desktopSrc} />
              <img
                src={mobileSrc}
                alt="Home banner"
                className="block w-full object-cover transition duration-300 group-hover:scale-[1.015] group-hover:brightness-95"
                decoding="async"
              />
            </picture>
          ) : (
            <img
              src={src}
              alt="Home banner"
              className="block w-full object-cover transition duration-300 group-hover:scale-[1.015] group-hover:brightness-95"
              decoding="async"
            />
          )}
        </Link>
      </div>
    </section>
  )
}
