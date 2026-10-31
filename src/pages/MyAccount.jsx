import { useNavigate, useSearchParams } from '../lib/navigation'
import { useAuth } from '../context/AuthContext'
import AccountSidebar from '../components/account/AccountSidebar'
import SavedAddresses from '../components/account/SavedAddresses'
import MyOrders from '../components/account/MyOrders'
import ProfileForm from '../components/account/ProfileForm'

export default function MyAccount() {
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const section = searchParams.get('section') || 'profile'

  if (!isLoggedIn) {
    return (
      <main className="account-detail min-h-screen bg-canvas py-10">
        <div className="mx-auto max-w-lg px-4">
          <div className="rounded-2xl border border-line bg-panel p-8 text-center">
            <h1 className="text-2xl font-bold text-white">My Account</h1>
            <div className="mt-4 text-sm text-muted">
              Sign in to manage your orders and saved delivery addresses.
            </div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-6 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-black hover:bg-brand-hover"
            >
              Back to Home
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="account-detail min-h-screen bg-canvas py-8 sm:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-2xl border border-line bg-panel">
          <div className="flex flex-col lg:flex-row">
            <AccountSidebar activeSection={section} />

            <div className="min-w-0 flex-1 p-5 sm:p-8">
              {section === 'profile' && <ProfileForm />}
              {section === 'orders' && <MyOrders />}
              {section === 'addresses' && <SavedAddresses />}
              {!['profile', 'orders', 'addresses'].includes(section) && <ProfileForm />}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
