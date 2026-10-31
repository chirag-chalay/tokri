import { useSyncExternalStore } from 'react'
import { useNavigate, useLocation, Link } from '../lib/navigation'
import { ArrowLeft, UserRound, ShoppingBag as ShoppingBagIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import SearchBox from './SearchBox'
import AccountMenu from './AccountMenu'
import DeliveryAddressBar from './DeliveryAddressBar'
import tokriLogo from '../assets/tokri-logo.png'
import tokriMark from '../assets/tokri-mark.png'

const subscribe = () => () => {}
const clientSnapshot = () => true
const serverSnapshot = () => false

export default function Header({ onLoginClick, className = '' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { totalCount, openDrawer } = useCart()
  const { isLoggedIn } = useAuth()
  const ready = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot)
  const activeLoggedIn = ready && isLoggedIn
  const activeCount = ready ? totalCount : 0
  const showMobileBack = location.pathname !== '/'

  const handleProfileClick = () => {
    if (isLoggedIn) {
      navigate('/profile')
      return
    }
    navigate('/login')
  }

  const handleDesktopLogin = () => {
    onLoginClick()
  }

  const handleMobileBack = () => {
    // Shop is a primary browse surface; back should return home, not prior category query.
    if (location.pathname === '/shop') {
      navigate('/')
      return
    }
    if (window.history.length > 1) {
      navigate(-1)
      return
    }
    navigate('/')
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-line bg-panel shadow-sm shadow-black/20 ${className}`}
    >
      {/* Mobile header */}
      <div className="lg:hidden">
        <div className="px-3 py-2.5 sm:px-4 sm:py-3">
          <div
            className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center ${
              showMobileBack
                ? 'mobile-header-inner gap-2 sm:gap-2.5'
                : 'mobile-header-home gap-2.5 sm:gap-3.5'
            }`}
          >
            {/* Zone 1 (Left): Tokriii Logo or Back + Logo */}
            <div className="flex shrink-0 items-center gap-1">
              {showMobileBack && (
                <button
                  type="button"
                  onClick={handleMobileBack}
                  className="inline-flex h-10 w-9 shrink-0 -ml-1 cursor-pointer items-center justify-center text-white transition hover:text-brand"
                  aria-label="Go back"
                >
                  <ArrowLeft size={22} strokeWidth={2.25} />
                </button>
              )}
              <Link
                to="/"
                className="inline-flex shrink-0 items-center focus:outline-none"
                aria-label="Tokriii Home"
              >
                <img
                  src={tokriLogo}
                  alt="tokriii"
                  className="mobile-header-logo-wordmark"
                />
                <img
                  src={tokriMark}
                  alt="tokriii"
                  className="mobile-header-logo-symbol"
                />
              </Link>
            </div>

            {/* Zone 2 (Center): Delivery Address Block */}
            <DeliveryAddressBar className="min-w-0" />

            {/* Zone 3 (Right): Profile / Account Button */}
            <button
              type="button"
              onClick={handleProfileClick}
              className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line bg-panel-2/50 text-white transition hover:border-brand/40 hover:bg-panel-2"
              aria-label={activeLoggedIn ? 'Open profile' : 'Log in'}
            >
              <UserRound size={20} />
            </button>
          </div>

          {/* Search Row */}
          <div className="mt-2.5">
            <SearchBox variant="mobile" />
          </div>
        </div>
      </div>

      {/* Desktop header */}
      <div className="hidden bg-panel lg:block">
        <div className="mx-auto flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center justify-between lg:flex-col lg:items-start lg:gap-4">
            <Link to="/" className="block shrink-0">
              <img
                src={tokriLogo}
                alt="tokriii - Selling Premium / Exotic Fruits"
                className="h-12 w-auto object-contain sm:h-14"
              />
            </Link>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <DeliveryAddressBar variant="desktop" />
          </div>

          <div className="flex flex-1 flex-col gap-4 lg:max-w-3xl">
            <SearchBox variant="desktop" />
          </div>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:self-auto">
            {activeLoggedIn ? (
              <AccountMenu />
            ) : (
              <button
                onClick={handleDesktopLogin}
                className="h-12 w-full cursor-pointer rounded-full bg-brand px-10 py-3 text-[16px] font-semibold text-black shadow-sm transition hover:bg-brand-hover sm:w-auto"
              >
                Login
              </button>
            )}
            <button
              onClick={openDrawer}
              className="relative cursor-pointer text-white"
              type="button"
              aria-label={`View shopping cart (${activeCount} items)`}
            >
              <ShoppingBagIcon size={30} />
              <span className="absolute -right-2 -top-1 inline-flex h-[20px] w-[20px] items-center justify-center rounded-full bg-brand text-[13px] font-semibold leading-none text-black text-center">
                {activeCount}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
