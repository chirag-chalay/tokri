import { createContext, useContext, useEffect, useMemo, useRef } from 'react'
import { AppState, View } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import { getAnalyticsConsentId, trackCommerce } from '../lib/analytics'

const Context = createContext(null)
export function useProductImpression(ref, product, listId) {
  const registry = useContext(Context)
  useEffect(() => {
    if (!registry) return undefined
    const entry = { ref, product, listId }
    registry.add(entry)
    return () => registry.delete(entry)
  }, [registry, ref, product, listId])
}

export default function ProductImpressions({ children, scrollRef }) {
  const viewport = useRef(null)
  const registry = useMemo(() => new Set(), [])
  const seen = useRef(new Set())
  const offset = useRef(0)
  const focused = useIsFocused()
  useEffect(() => {
    if (!focused) return undefined
    let active = true
    const sample = () => {
      const consent = getAnalyticsConsentId()
      if (!active || !consent || AppState.currentState !== 'active') return
      const bounds = scrollRef?.current?.getNativeScrollRef?.() || scrollRef?.current || viewport.current
      bounds?.measureInWindow((vx, vy, vw, vh) => {
        const pending = [...registry].filter((entry) => !seen.current.has(`${consent}:${entry.listId}:${entry.product?.slug}`))
        if (!pending.length || !vw || !vh) return
        const batch = Array.from({ length: Math.min(40, pending.length) }, (_, i) => pending[(offset.current + i) % pending.length])
        offset.current = (offset.current + batch.length) % pending.length
        for (const entry of batch) entry.ref.current?.measureInWindow((x, y, w, h) => {
          if (!active || getAnalyticsConsentId() !== consent || AppState.currentState !== 'active') return
          const area = Math.max(0, Math.min(x + w, vx + vw) - Math.max(x, vx)) * Math.max(0, Math.min(y + h, vy + vh) - Math.max(y, vy))
          const key = `${consent}:${entry.listId}:${entry.product?.slug}`
          if (!w || !h || area < w * h / 2 || seen.current.has(key)) return
          seen.current.add(key)
          if (seen.current.size > 2000) seen.current.delete(seen.current.values().next().value)
          trackCommerce('view_item_list', [{ ...entry.product, quantity: 1 }], undefined, entry.listId)
        })
      })
    }
    const timer = setInterval(sample, 1000)
    sample()
    return () => { active = false; clearInterval(timer) }
  }, [focused, registry, scrollRef])
  return <Context.Provider value={registry}><View ref={viewport} collapsable={false} style={{ flex: 1 }}>{children}</View></Context.Provider>
}
