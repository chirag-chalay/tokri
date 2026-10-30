import { Link, useNavigate } from '../../lib/navigation'
import {
  LogOut,
  MapPinned,
  Package,
  UserRound,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { key: 'profile', label: 'Profile', icon: UserRound, href: '/account?section=profile' },
  { key: 'orders', label: 'My Orders', icon: Package, href: '/account?section=orders' },
  { key: 'addresses', label: 'Saved Addresses', icon: MapPinned, href: '/account?section=addresses' },
]

export default function AccountSidebar({ activeSection }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const formattedMobile = user?.phone
    ? `+91 ${user.phone.replace(/(\d{5})(\d{5})/, '$1 $2')}`
    : ''

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <aside className="w-full shrink-0 border-b border-line bg-panel-2 lg:w-64 lg:border-b-0 lg:border-r">
      <div className="border-b border-line px-5 py-4">
        {user?.name ? <p className="text-sm font-semibold text-white">{user.name}</p> : null}
        <p className={`text-sm ${user?.name ? 'text-muted' : 'font-semibold text-white'}`}>
          {formattedMobile}
        </p>
      </div>

      <nav className="py-2">
        {navItems.map(({ key, label, icon: Icon, href }) => {
          const active = activeSection === key
          return (
            <Link
              key={key}
              to={href}
              className={`flex items-center gap-3 px-5 py-3 text-sm transition ${
                active
                  ? 'border-l-4 border-brand bg-panel font-semibold text-white'
                  : 'border-l-4 border-transparent text-muted hover:bg-panel hover:text-white'
              }`}
            >
              <Icon size={18} className={active ? 'text-brand' : 'text-muted'} />
              {label}
            </Link>
          )
        })}

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 border-l-4 border-transparent px-5 py-3 text-left text-sm text-muted transition hover:bg-panel hover:text-white"
        >
          <LogOut size={18} className="text-muted" />
          Log Out
        </button>
      </nav>
    </aside>
  )
}

export { addressLabelIcon } from './addressLabelIcon'
