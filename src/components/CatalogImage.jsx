'use client'

import { useState } from 'react'

export default function CatalogImage({ src, alt = '', className = '', loading = 'lazy' }) {
  const [failedSrc, setFailedSrc] = useState('')

  if (!src || failedSrc === src) {
    return (
      <div
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
        className={`${className} bg-panel`}
      />
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailedSrc(src)}
      className={className}
      loading={loading}
    />
  )
}
