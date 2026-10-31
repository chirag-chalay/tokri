import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from '../lib/navigation'
import { ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AccountMenu({ variant = 'desktop', onNavigate }) {
  const { user, isLoggedIn, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    const onClick = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const closeMenu = () => {
    setOpen(false)
    onNavigate?.()
  }

  const handleLogout = () => {
    logout()
    closeMenu()
    navigate('/')
  }

  if (!isLoggedIn) return null

  const formattedMobile = user?.phone
    ? `+91 ${user.phone.replace(/(\d{5})(\d{5})/, '$1 $2')}`
    : ''

  if (variant === 'mobile') {
    return (
      <div ref={rootRef} className="w-full">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center justify-between rounded-full border border-line bg-panel-2 px-5 py-3 text-sm font-semibold text-white"
        >
          <span>Account</span>
          <ChevronDown size={16} className={`transition ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="mt-2 overflow-hidden rounded-2xl border border-line bg-panel shadow-sm shadow-black/20">
            <div className="border-b border-line px-4 py-3">
              <p className="text-sm font-bold text-white">My Account</p>
              <p className="text-sm text-muted">{formattedMobile}</p>
            </div>
            <nav className="py-1">
              <Link
                to="/account?section=profile"
                onClick={closeMenu}
                className="block px-4 py-2.5 text-sm text-mint transition hover:bg-panel-2"
              >
                Profile
              </Link>
              <Link
                to="/account?section=orders"
                onClick={closeMenu}
                className="block px-4 py-2.5 text-sm text-mint transition hover:bg-panel-2"
              >
                My Orders
              </Link>
              <Link
                to="/account?section=addresses"
                onClick={closeMenu}
                className="block px-4 py-2.5 text-sm text-mint transition hover:bg-panel-2"
              >
                Saved Addresses
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="block w-full px-4 py-2.5 text-left text-sm text-mint transition hover:bg-panel-2"
              >
                Log Out
              </button>
            </nav>
          </div>
        )}
      </div>
    )
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-full border border-line bg-panel-2 px-5 text-sm font-semibold text-white transition hover:bg-canvas"
      >
        Account
        <ChevronDown size={16} className={`transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-line bg-panel shadow-xl shadow-black/30">
          <div className="border-b border-line px-4 py-3">
            <p className="text-sm font-bold text-white">My Account</p>
            <p className="text-sm text-muted">{formattedMobile}</p>
          </div>
          <nav className="py-1">
            <Link
              to="/account?section=profile"
              onClick={closeMenu}
              className="block px-4 py-2.5 text-sm text-mint transition hover:bg-panel-2"
            >
              Profile
            </Link>
            <Link
              to="/account?section=orders"
              onClick={closeMenu}
              className="block px-4 py-2.5 text-sm text-mint transition hover:bg-panel-2"
            >
              My Orders
            </Link>
            <Link
              to="/account?section=addresses"
              onClick={closeMenu}
              className="block px-4 py-2.5 text-sm text-mint transition hover:bg-panel-2"
            >
              Saved Addresses
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="block w-full px-4 py-2.5 text-left text-sm text-mint transition hover:bg-panel-2"
            >
              Log Out
            </button>
          </nav>
        </div>
      )}
    </div>
  )
}
