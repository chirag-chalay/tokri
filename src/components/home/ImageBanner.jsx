'use client'

import { Link } from '../../lib/navigation'
import { hrefForHomeLink, isExternalHomeLink } from './homeLinks'

export default function ImageBanner({ image, mobileImage, alt = '', link = null }) {
  const src = mobileImage || image
  if (!src) return null
  const href = hrefForHomeLink(link)
  const external = isExternalHomeLink(link)

  const picture = image && mobileImage && image !== mobileImage ? (
    <picture>
      <source media="(min-width: 768px)" srcSet={image} />
      <img
        src={mobileImage}
        alt={alt || 'Home banner'}
        className="block w-full object-cover transition duration-300 group-hover:scale-[1.015] group-hover:brightness-95"
        decoding="async"
      />
    </picture>
  ) : (
    <img
      src={src}
      alt={alt || 'Home banner'}
      className="block w-full object-cover transition duration-300 group-hover:scale-[1.015] group-hover:brightness-95"
      decoding="async"
    />
  )

  const body = (
    <div className="group block cursor-pointer overflow-hidden rounded-xl">{picture}</div>
  )

  return (
    <section className="mt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {href ? (
          external ? (
            <a href={href} target="_blank" rel="noreferrer" aria-label={alt || 'Home banner'}>
              {body}
            </a>
          ) : (
            <Link to={href} aria-label={alt || 'Home banner'}>
              {body}
            </Link>
          )
        ) : (
          body
        )}
      </div>
    </section>
  )
}
