'use client'

import { useCallback, useMemo } from 'react'
import NextLink from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { NavigationContext } from '../../lib/navigation'

function LinkComponent({ to, ...props }) {
  return <NextLink href={to} {...props} />
}

export default function NextNavigation({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const search = params.toString()
  const navigate = useCallback((to, options = {}) => {
    if (typeof to === 'number') {
      window.history.go(to)
    } else if (options.replace) {
      router.replace(to)
    } else {
      router.push(to)
    }
  }, [router])
  const location = useMemo(() => ({ pathname, search: search ? `?${search}` : '' }), [pathname, search])
  const setSearchParams = useCallback((next, options = {}) => {
    const current = new URLSearchParams(window.location.search)
    const value = typeof next === 'function' ? next(current) : next
    const query = new URLSearchParams(value).toString()
    const url = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
    if (options.replace) router.replace(url, { scroll: false })
    else router.push(url, { scroll: false })
  }, [router])
  const searchParamsState = useMemo(() => [new URLSearchParams(search), setSearchParams], [search, setSearchParams])
  const value = useMemo(() => ({ navigate, location, searchParamsState, LinkComponent }), [navigate, location, searchParamsState])
  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
}
