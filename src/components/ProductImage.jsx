import { PRODUCT_PLACEHOLDER, handleImageError } from '../lib/imageFallback'

export { PRODUCT_PLACEHOLDER, handleImageError }

export default function ProductImage({
  src,
  alt = 'Tokriii fresh fruit',
  className = '',
  loading = 'lazy',
  ...props
}) {
  return (
    <img
      src={src || PRODUCT_PLACEHOLDER}
      alt={alt}
      onError={handleImageError}
      className={className}
      loading={loading}
      {...props}
    />
  )
}
