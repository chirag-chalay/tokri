'use client'

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Router, createPath } from 'react-router-dom'
import { AuthProvider } from '../../context/AuthContext'
import { AddressProvider } from '../../context/AddressContext'
import { CartProvider, useCart } from '../../context/CartContext'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import CartDrawer from '../../components/CartDrawer'
import StickyCartBar from '../../components/StickyCartBar'
import AddressPickerModal from '../../components/AddressPickerModal'
import LoginPopup from '../../components/LoginPopup'
import { installUploadFallback } from '../../lib/api'
import { installAnalytics, trackPageView } from '../../lib/telemetry'

function Chrome({ children, ready }) {
  const [showLogin, setShowLogin] = useState(false)
  const { totalCount } = useCart()
  const sticky = ready && totalCount > 0
  return (
    <div className={sticky ? 'pb-24 lg:pb-0' : ''}>
      {ready && <Header onLoginClick={() => setShowLogin(true)} />}
      {children}
      {ready && <div><Footer /></div>}
      {ready && <CartDrawer />}
      {sticky && <StickyCartBar />}
      {ready && <AddressPickerModal onDesktopLogin={() => setShowLogin(true)} />}
      {ready && showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
    </div>
  )
}

// The shared chrome still uses React Router hooks. This adapter forwards its
// navigation to Next; it never mounts the legacy Routes tree on migrated pages.
const subscribe = () => () => {}
const clientSnapshot = () => true
const serverSnapshot = () => false

export default function NextShell({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const search = searchParams.toString()
  const ready = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot)
  const navigator = useMemo(() => ({
    createHref: (to) => typeof to === 'string' ? to : createPath(to),
    encodeLocation: (to) => typeof to === 'string' ? { pathname: to } : to,
    go: (delta) => window.history.go(delta),
    push: (to) => router.push(typeof to === 'string' ? to : createPath(to)),
    replace: (to) => router.replace(typeof to === 'string' ? to : createPath(to)),
  }), [router])

  useEffect(() => {
    installUploadFallback()
    // SSR images may fail before the client listener has been installed.
    document.querySelectorAll('img').forEach((image) => {
      if (image.complete && !image.naturalWidth && image.getAttribute('src')) {
        image.dispatchEvent(new Event('error'))
      }
    })
    installAnalytics()
  }, [])
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    trackPageView(`${pathname}${search ? `?${search}` : ''}`)
  }, [pathname, search])

  return (
    <Router location={{ pathname, search: search ? `?${search}` : '' }} navigator={navigator}>
      <AuthProvider><AddressProvider><CartProvider>
        <div className="min-h-screen bg-canvas"><Chrome ready={ready}>{children}</Chrome></div>
      </CartProvider></AddressProvider></AuthProvider>
    </Router>
  )
}
