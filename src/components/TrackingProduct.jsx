'use client'
import { useEffect, useRef } from 'react'
import { trackCommerce } from '../lib/telemetry'
export default function TrackingProduct({ product }) {
  const last = useRef(null)
  useEffect(() => {
    if (!product || last.current === product.id) return
    last.current = product.id
    trackCommerce('view_item', { items: [{ ...product, quantity: 1 }] })
  }, [product])
  return null
}
