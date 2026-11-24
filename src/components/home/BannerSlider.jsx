'use client'

import { useEffect, useState } from 'react'
import { Link } from '../../lib/navigation'
import DiwaliAtmosphere from '../DiwaliAtmosphere'
import { hrefForHomeLink, isExternalHomeLink } from './homeLinks'

export default function BannerSlider({
  slides = [],
  autoplaySeconds = 5,
  isDiwaliActive = false,
  rawUrls = true,
}) {
  const items = (slides || []).filter((slide) => slide.image || slide.mobileImage)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (items.length < 2) return undefined
    const ms = Math.max(Number(autoplaySeconds) || 0, 0) * 1000
    if (!ms) return undefined
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % items.length)
    }, ms)
    return () => clearInterval(timer)
  }, [autoplaySeconds, items.length])

  if (!items.length) return null
  const slide = items[Math.min(index, items.length - 1)]
  const desktopSrc = slide.image
  const mobileSrc = slide.mobileImage || slide.image
  const href = hrefForHomeLink(slide.link)
  const external = isExternalHomeLink(slide.link)

  const image = (
    <>
      {desktopSrc && mobileSrc && desktopSrc !== mobileSrc ? (
        <picture>
          <source media="(min-width: 768px)" srcSet={desktopSrc} />
          <img
            src={mobileSrc}
            alt={slide.alt || 'Home banner'}
            className="block w-full object-cover transition duration-300 group-hover:scale-[1.015] group-hover:brightness-95"
            decoding="async"
          />
        </picture>
      ) : (
        <img
          src={mobileSrc || desktopSrc}
          alt={slide.alt || 'Home banner'}
          className="block w-full object-cover transition duration-300 group-hover:scale-[1.015] group-hover:brightness-95"
          decoding="async"
        />
      )}
    </>
  )

  const framed = (
    <div
      className={`group block overflow-hidden rounded-xl transition duration-300 ${
        isDiwaliActive
          ? 'ring-1 ring-[#E9C77A]/35 shadow-[0_12px_44px_-8px_rgba(242,168,74,0.18)]'
          : ''
      }`}
    >
      {image}
    </div>
  )

  return (
    <section className="relative w-full overflow-hidden pt-4 sm:pt-6 pb-2">
      <DiwaliAtmosphere active={Boolean(isDiwaliActive)} />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        {href ? (
          external ? (
            <a href={href} target="_blank" rel="noreferrer" aria-label={slide.alt || 'Home banner'} className="cursor-pointer">
              {framed}
            </a>
          ) : (
            <Link to={href} aria-label={slide.alt || 'Home banner'} className="cursor-pointer">
              {framed}
            </Link>
          )
        ) : (
          framed
        )}
        {items.length > 1 ? (
          <div className="mt-3 flex justify-center gap-2">
            {items.map((item, dotIndex) => (
              <button
                key={item.id || dotIndex}
                type="button"
                aria-label={`Show banner ${dotIndex + 1}`}
                className={`h-2 w-2 rounded-full ${dotIndex === index ? 'bg-brand' : 'bg-line'}`}
                onClick={() => setIndex(dotIndex)}
              />
            ))}
          </div>
        ) : null}
      </div>
      {rawUrls ? null : null}
    </section>
  )
}
