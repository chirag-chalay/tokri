'use client'
import { useEffect } from 'react'
import { API_BASE_URL } from '../lib/api'
import { installWebsiteMonitoring, recordWebsiteNavigation } from '../lib/websiteMonitoring'

export default function WebsiteMonitoring({ pathname, locationKey }) {
  useEffect(() => installWebsiteMonitoring(API_BASE_URL), [])
  useEffect(() => {
    // Next can commit during its own popstate listener, before other listeners
    // run. Wait until that dispatch completes so Back/Forward is classified
    // correctly; cancel obsolete commits and StrictMode's discarded effects.
    let current = true
    queueMicrotask(() => { if (current) recordWebsiteNavigation(pathname, locationKey) })
    return () => { current = false }
  }, [pathname, locationKey])
  return null
}
