'use client'

import { useSyncExternalStore } from 'react'
import { Link } from '../lib/navigation'
import { resolveAssetUrl } from '../lib/api'
import DiwaliAtmosphere from './DiwaliAtmosphere'
import { getDiwaliStatus } from '../lib/diwaliConfig'

const emptySubscribe = () => () => {}
const getClientSearch = () => (typeof window !== 'undefined' ? window.location.search || '' : '')

export default function Banner({ image, mobileImage, rawUrls = false, isDiwaliActive = null }) {
  const desktopSrc = image ? (rawUrls ? image : resolveAssetUrl(image)) : null
  const mobileSrc = mobileImage ? (rawUrls ? mobileImage : resolveAssetUrl(mobileImage)) : null
  const src = mobileSrc || desktopSrc

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

  return (
    <section className="relative w-full overflow-hidden pt-4 sm:pt-6 pb-2">
      <DiwaliAtmosphere active={festiveActive} />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        {src && (
          <Link
            to="/shop"
            aria-label="Shop all"
            className={`group block cursor-pointer overflow-hidden rounded-xl transition duration-300 ${
              festiveActive
                ? 'ring-1 ring-[#E9C77A]/35 shadow-[0_12px_44px_-8px_rgba(242,168,74,0.18)]'
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
        {!src && (
          <div
            aria-hidden="true"
            className="aspect-[2/1] min-h-24 rounded-xl bg-gradient-to-r from-panel via-panel-2 to-panel sm:aspect-[4/1] sm:min-h-32"
          />
        )}
      </div>
    </section>
  )
}
