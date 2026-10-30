import { useEffect } from 'react'
import { Link, useNavigate } from '../lib/navigation'
import { ArrowLeft, FileClock, LogOut, MapPinned, Search, UserRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import DeliveryAddressBar from '../components/DeliveryAddressBar'

const menuItems = [
  {
    key: 'profile',
    label: 'Profile',
    icon: UserRound,
    href: '/account?section=profile',
  },
  {
    key: 'orders',
    label: 'Order History',
    icon: FileClock,
    href: '/account?section=orders',
  },
  {
    key: 'addresses',
    label: 'Address Book',
    icon: MapPinned,
    href: '/account?section=addresses',
  },
]

export default function MobileProfilePage() {
  const navigate = useNavigate()
  const { user, isLoggedIn, logout } = useAuth()

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true })
    }
  }, [isLoggedIn, navigate])

  if (!isLoggedIn) return null

  const formattedPhone = user?.phone
    ? user.phone.replace(/(\d{5})(\d{5})/, '$1 $2')
    : ''

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <main className="min-h-screen bg-canvas lg:mx-auto lg:max-w-md lg:border-x lg:border-line">
      <div className="border-b border-line px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
            aria-label="Go back"
          >
            <ArrowLeft size={22} />
          </button>

          <div className="min-w-0 flex-1">
            <DeliveryAddressBar />
          </div>

          <Link
            to="/?focus=search"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
            aria-label="Search"
          >
            <Search size={22} />
          </Link>
        </div>
      </div>

      <div className="px-5 py-6">
        <p className="text-2xl font-bold tracking-tight text-white">{formattedPhone}</p>

        <p className="mt-6 text-sm font-semibold text-muted">Your information</p>

        <div className="mt-3 divide-y divide-line">
          {menuItems.map(({ key, label, icon: Icon, href }) => (
            <Link
              key={key}
              to={href}
              className="flex items-center gap-4 py-4 transition active:bg-panel"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-panel text-mint">
                <Icon size={22} />
              </span>
              <span className="text-base font-medium text-white">{label}</span>
            </Link>
          ))}

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-4 py-4 text-left transition active:bg-panel"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-panel text-mint">
              <LogOut size={22} />
            </span>
            <span className="text-base font-medium text-white">Logout</span>
          </button>
        </div>
      </div>
    </main>
  )
}
