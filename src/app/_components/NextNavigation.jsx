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
  const value = useMemo(() => ({ navigate, location, LinkComponent }), [navigate, location])
  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
}
