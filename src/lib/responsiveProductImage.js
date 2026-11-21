const WIDTHS = [128, 256, 384, 640, 828, 1080, 1200]
const FIRST_PARTY_HOSTS = new Set(['tokriii.com', 'www.tokriii.com', 'server.tokriii.com'])

export function retryOriginalImage(image) {
  const original = image?.dataset.originalSrc
  if (!original || image.dataset.originalRetried === original) return false
  image.dataset.originalRetried = original
  delete image.dataset.uploadFallbackTried
  delete image.dataset.fallbackApplied
  image.removeAttribute('srcset')
  image.removeAttribute('sizes')
  image.src = original
  return true
}

// Only public first-party raster uploads go through the existing Next optimizer.
// Product detail originals, external images and placeholders remain unchanged.
export function responsiveProductImage(src, sizes = '(min-width: 1024px) 180px, (min-width: 640px) 170px, 34vw') {
  if (typeof src !== 'string' || !src) return {}
  let url
  try {
    url = new URL(src, 'https://tokriii.com')
  } catch {
    return {}
  }
  const localUpload = src.startsWith('/uploads/') ||
    (typeof window !== 'undefined' && url.origin === window.location.origin)
  if ((!localUpload && !FIRST_PARTY_HOSTS.has(url.hostname)) ||
      !url.pathname.startsWith('/uploads/') ||
      !/\.(?:jpe?g|png|webp|avif)$/i.test(url.pathname)) return {}

  const original = `${url.pathname}${url.search}`
  const optimize = (width) => `/_next/image?url=${encodeURIComponent(original)}&w=${width}&q=75`
  return {
    src: optimize(640),
    srcSet: WIDTHS.map((width) => `${optimize(width)} ${width}w`).join(', '),
    sizes,
    decoding: 'async',
    'data-original-src': src,
    onError: (event) => { retryOriginalImage(event.currentTarget) },
    // A fast image failure can precede hydration/global fallback installation.
    ref: (image) => {
      if (image?.complete && image.naturalWidth === 0) retryOriginalImage(image)
    },
  }
}
