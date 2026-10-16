import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import Header from './components/Header'
import LoginPopup from './components/LoginPopup'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import CmsPage from './pages/CmsPage'
import MyAccount from './pages/MyAccount'
import MobileLoginPage from './pages/MobileLoginPage'
import MobileProfilePage from './pages/MobileProfilePage'
import ShopAllPage from './pages/ShopAllPage'
import BlogListPage from './pages/BlogListPage'
import BlogDetailPage from './pages/BlogDetailPage'
import CartDrawer from './components/CartDrawer'
import StickyCartBar from './components/StickyCartBar'
import AddressPickerModal from './components/AddressPickerModal'
import { CartProvider, useCart } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { AddressProvider } from './context/AddressContext'
import Footer from './components/Footer'
import { trackPageView } from './lib/analytics'

const CMS_PAGE_PATHS = [
  '/about',
  '/careers',
  '/privacy-policy',
  '/terms-and-conditions',
  '/help-faqs',
  '/returns-policy',
  '/support-center',
]

const FULLSCREEN_ROUTES = ['/login', '/profile']

function CategoryToShopRedirect() {
  const { categoryId } = useParams()
  return <Navigate to={`/shop?category=${categoryId}`} replace />
}

function ScrollToTop() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location])

  useEffect(() => {
    trackPageView(`${location.pathname}${location.search}`)
  }, [location.pathname, location.search])

  return null
}

function AppShell() {
  const [showLogin, setShowLogin] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { totalCount } = useCart()
  const isCartPage = location.pathname === '/cart'
  const isCheckoutPage = location.pathname === '/checkout'
  const isOrderSuccess = location.pathname.startsWith('/order/')
  const isShopPage = location.pathname === '/shop'
  const hideChrome = FULLSCREEN_ROUTES.includes(location.pathname) || isOrderSuccess
  const showStickyCart = totalCount > 0 && !hideChrome && !isCartPage && !isCheckoutPage && !isOrderSuccess
  // Shop all pins itself to the viewport on mobile, so the footer would sit in
  // unreachable space below it. It comes back from md up, where the page scrolls.
  const footerVisibility = isOrderSuccess
    ? 'hidden'
    : isCartPage
      ? 'hidden lg:block'
      : isShopPage
        ? 'hidden md:block'
        : ''

  useEffect(() => {
    if (location.state?.openLogin) {
      setShowLogin(true)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location, navigate])

  return (
    <div className={showStickyCart ? 'pb-24 lg:pb-0' : ''}>
      <ScrollToTop />
      {!hideChrome && (
        <Header
          className={isCartPage ? 'hidden lg:block' : ''}
          onLoginClick={() => setShowLogin(true)}
        />
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:productId" element={<ProductDetail />} />
        <Route path="/category/:categoryId" element={<CategoryToShopRedirect />} />
        <Route path="/shop" element={<ShopAllPage />} />
        <Route path="/blog" element={<BlogListPage />} />
        <Route path="/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order/:orderNo" element={<OrderSuccessPage />} />
        <Route path="/account" element={<MyAccount />} />
        <Route path="/login" element={<MobileLoginPage />} />
        <Route path="/profile" element={<MobileProfilePage />} />
        <Route path="/p/:slug" element={<CmsPage />} />
        {CMS_PAGE_PATHS.map((path) => (
          <Route key={path} path={path} element={<CmsPage />} />
        ))}
      </Routes>
      {!hideChrome && (
        <div className={footerVisibility}>
          <Footer />
        </div>
      )}
      <CartDrawer />
      {showStickyCart && <StickyCartBar />}
      <AddressPickerModal onDesktopLogin={() => setShowLogin(true)} />
      {showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AddressProvider>
        <CartProvider>
          <div className="min-h-screen bg-canvas">
            <AppShell />
          </div>
        </CartProvider>
      </AddressProvider>
    </AuthProvider>
  )
}

export default App
