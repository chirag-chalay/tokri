'use client'
import { usePathname, useSearchParams } from 'next/navigation'
import WebsiteMonitoring from '../../components/WebsiteMonitoring'

export default function NextWebsiteMonitoring() {
  const pathname = usePathname(), search = useSearchParams()
  return <WebsiteMonitoring pathname={pathname} locationKey={`${pathname}?${search.toString()}`} />
}
