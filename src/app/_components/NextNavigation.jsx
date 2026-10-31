'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import NextLink from 'next/link'
import { useParams as useNextParams, usePathname, useRouter, useSearchParams } from 'next/navigation'
import { NavigationContext } from '../../lib/navigation'

function LinkComponent({ to, ...props }) {
  return <NextLink href={to} {...props} />
}

export default function NextNavigation({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const search = params.toString()
  const pending = useRef(null)
  const [routeState, setRouteState] = useState(() => {
    if (typeof window === 'undefined') return null
    return { pathname: window.location.pathname, value: window.history.state?.__tokriNavigation ?? null }
  })

  const navigate = useCallback((to, options = {}) => {
    if (typeof to === 'number') {
      window.history.go(to)
      return
    }
    const target = new URL(to, window.location.href)
    const record = { pathname: target.pathname, value: options.state ?? null }
    pending.current = record
    setRouteState(record)
    if (options.replace) router.replace(to)
    else router.push(to)
  }, [router])

  useEffect(() => {
    const restore = (event) => {
      pending.current = null
      setRouteState({ pathname: window.location.pathname, value: event.state?.__tokriNavigation ?? null })
    }
    window.addEventListener('popstate', restore)
    return () => window.removeEventListener('popstate', restore)
  }, [])

  useEffect(() => {
    if (!pending.current || pending.current.pathname !== pathname) return
    const saved = pending.current
    pending.current = null
    window.history.replaceState({ ...window.history.state, __tokriNavigation: saved.value }, '', window.location.href)
  }, [pathname, search, routeState])

  const clearNavigationState = useCallback(() => {
    pending.current = null
    setRouteState(null)
    window.history.replaceState({ ...window.history.state, __tokriNavigation: null }, '', window.location.href)
  }, [])
  const location = useMemo(() => ({ pathname, search: search ? `?${search}` : '', state: routeState?.pathname === pathname ? routeState.value : null }), [pathname, search, routeState])
  const setSearchParams = useCallback((next, options = {}) => {
    const current = new URLSearchParams(window.location.search)
    const value = typeof next === 'function' ? next(current) : next
    const query = new URLSearchParams(value).toString()
    const url = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
    if (options.replace) router.replace(url, { scroll: false })
    else router.push(url, { scroll: false })
  }, [router])
  const searchParamsState = useMemo(() => [new URLSearchParams(search), setSearchParams], [search, setSearchParams])
  const value = useMemo(() => ({ navigate, location, searchParamsState, LinkComponent, useParamsHook: useNextParams, clearNavigationState }), [navigate, location, searchParamsState, clearNavigationState])
  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
}
