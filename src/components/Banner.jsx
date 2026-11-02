'use client'

import { useSyncExternalStore } from 'react'
import { Link } from '../lib/navigation'
import { resolveAssetUrl } from '../lib/api'
import DiwaliAtmosphere from './DiwaliAtmosphere'
import { getDiwaliStatus } from '../lib/diwaliConfig'
import defaultBanner from '../assets/hero-banner.png'

const emptySubscribe = () => () => {}
const getClientSearch = () => (typeof window !== 'undefined' ? window.location.search || '' : '')

export default function Banner({ image, mobileImage, rawUrls = false, isDiwaliActive = null }) {
  const desktopSrc = image ? (rawUrls ? image : resolveAssetUrl(image)) : defaultBanner
  const mobileSrc = mobileImage ? (rawUrls ? mobileImage : resolveAssetUrl(mobileImage)) : null
  const src = mobileSrc || desktopSrc || defaultBanner

  const search = useSyncExternalStore(emptySubscribe, getClientSearch, () => '')

  let festiveActive = false
  if (typeof window !== 'undefined' && search) {
    const clientStatus = getDiwaliStatus({ searchParams: search })
    if (clientStatus.isOverride) {
      festiveActive = clientStatus.isActive
    } else if (typeof isDiwaliActive === 'boolean') {
      festiveActive = isDiwaliActive
    } else {
      festiveActive = clientStatus.isActive
    }
  } else if (typeof isDiwaliActive === 'boolean') {
    festiveActive = isDiwaliActive
  } else {
    festiveActive = getDiwaliStatus().isActive
  }

  if (!src && !festiveActive) return null

  return (
    <section className="mt-4 sm:mt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <DiwaliAtmosphere active={festiveActive} />
        {src && (
          <Link
            to="/shop"
            aria-label="Shop all"
            className={`group block cursor-pointer overflow-hidden rounded-xl transition duration-300 ${
              festiveActive
                ? 'ring-1 ring-[#E9C77A]/25 shadow-[0_8px_32px_-8px_rgba(242,168,74,0.14)]'
                : ''
            }`}
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
        )}
      </div>
    </section>
  )
}
