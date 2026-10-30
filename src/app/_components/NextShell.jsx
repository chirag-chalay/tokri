'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import NextNavigation from './NextNavigation'
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
  const pathname = usePathname()
  const isCart = pathname === '/cart'
  const isCheckout = pathname === '/checkout'
  const isOrder = pathname.startsWith('/order/')
  const isShop = pathname === '/shop'
  const hideChrome = pathname === '/login' || pathname === '/profile' || isOrder
  const sticky = ready && totalCount > 0 && !hideChrome && !isCart && !isCheckout
  const footerVisibility = isCart ? 'hidden lg:block' : isShop ? 'hidden md:block' : ''
  return (
    <div className={sticky ? 'pb-24 lg:pb-0' : ''}>
      {ready && !hideChrome && <Header className={isCart ? 'hidden lg:block' : ''} onLoginClick={() => setShowLogin(true)} />}
      {children}
      {ready && !hideChrome && <div className={footerVisibility}><Footer /></div>}
      {ready && <CartDrawer />}
      {sticky && <StickyCartBar />}
      {ready && <AddressPickerModal onDesktopLogin={() => setShowLogin(true)} />}
      {ready && showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
    </div>
  )
}

const subscribe = () => () => {}
const clientSnapshot = () => true
const serverSnapshot = () => false

export default function NextShell({ children }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const search = searchParams.toString()
  const ready = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot)


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
    <NextNavigation>
      <AuthProvider><AddressProvider><CartProvider>
        <div className="min-h-screen bg-canvas"><Chrome ready={ready}>{children}</Chrome></div>
      </CartProvider></AddressProvider></AuthProvider>
    </NextNavigation>
  )
}
