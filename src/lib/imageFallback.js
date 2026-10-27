import { PLACEHOLDER_IMAGE } from './api'
import placeholderSvg from '../assets/product-placeholder.svg'

export const PRODUCT_PLACEHOLDER = placeholderSvg || PLACEHOLDER_IMAGE

export function handleImageError(event) {
  if (!event || !event.currentTarget) return
  const el = event.currentTarget

  const src = el.currentSrc || el.getAttribute('src') || el.src || ''
  if (src.includes('://server.tokriii.com/uploads/') && el.dataset.uploadFallbackTried !== '1') {
    el.dataset.uploadFallbackTried = '1'
    el.src = src.replace('://server.tokriii.com/', '://tokriii.com/')
    return
  }

  if (el.dataset.fallbackApplied === 'true' || el.dataset.fallbackApplied === '1') return
  el.dataset.fallbackApplied = 'true'
  el.src = PRODUCT_PLACEHOLDER
}
