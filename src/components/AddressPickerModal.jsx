import { useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { useNavigate } from '../lib/navigation'
import { useAuth } from '../context/AuthContext'
import { useAddress } from '../context/AddressContext'
import { authDelete, authPost, postJson } from '../lib/api'
import { setVisitPincode } from '../lib/logVisit'
import { recordWebsiteDebug } from '../lib/websiteMonitoring'
import AddressFormModal from './account/AddressFormModal'
import { addressLabelIcon } from './account/addressLabelIcon'

export default function AddressPickerModal({ onDesktopLogin }) {
  const navigate = useNavigate()
  const { user, isLoggedIn } = useAuth()
  const {
    pickerOpen,
    closePicker,
    addresses,
    selectedAddressId,
    selectAddress,
    refreshAddresses,
    loading,
    detectedLocation,
    detectLocation,
    locating,
    locationError,
  } = useAddress()

  const [formOpen, setFormOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [guestPin, setGuestPin] = useState('')
  const [pinMessage, setPinMessage] = useState('')
  const [checkingPin, setCheckingPin] = useState(false)

  async function checkGuestPin(event) {
    event.preventDefault()
    if (checkingPin) return
    setCheckingPin(true)
    setPinMessage('')
    setVisitPincode(guestPin)
    try {
      await postJson('/geo/pincode', { pincode: guestPin })
      setPinMessage('We deliver to this pincode.')
    } catch (error) { setPinMessage(error.message || 'Could not check delivery. Please try again.') }
    finally { setCheckingPin(false) }
  }

  if (!pickerOpen) return null

  const handleLogin = () => {
    closePicker()
    if (window.innerWidth >= 1024) {
      onDesktopLogin?.()
      return
    }
    navigate('/login')
  }

  const handleDelete = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return
    try {
      await authDelete(`/account/addresses/${addressId}`, user)
      await refreshAddresses()
    } catch (err) {
      window.alert(err.message || 'Could not delete address.')
    }
  }

  const handleSave = async (payload) => {
    setSaving(true)
    try {
      const data = await authPost('/account/addresses', user, payload)
      await refreshAddresses()
      selectAddress(data.address.id)
      setFormOpen(false)
    } finally {
      setSaving(false)
    }
  }

  const showForm = formOpen || (isLoggedIn && !loading && addresses.length === 0)

  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-4 sm:items-center">
        <div className="relative w-full max-w-md rounded-2xl border border-line bg-panel p-6 shadow-2xl shadow-black/40">
          <button
            type="button"
            onClick={closePicker}
            className="absolute right-6 top-6 text-muted transition hover:text-white sm:right-8 sm:top-8"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <h2 className="pr-8 text-lg font-bold text-white">Delivery location</h2>
          <div aria-live="polite" className="mt-2 text-sm text-muted">
            {detectedLocation?.label && <p>{detectedLocation.label}</p>}
            {detectedLocation?.pincode && <p>Detected delivery PIN {detectedLocation.pincode}</p>}
            {locationError && <p>{locationError}</p>}
          </div>
          <button
            type="button"
            onClick={async () => {
              const deliveryPin = await detectLocation()
              if (deliveryPin) recordWebsiteDebug('delivery.pin.checked', { deliveryPin, pinSource: 'location' })
            }}
            disabled={locating}
            className="mt-4 w-full rounded-xl border border-brand px-3 py-2 text-sm font-semibold text-brand disabled:opacity-60"
          >
            {locating ? 'Detecting location…' : 'Use current location'}
          </button>
          <form className="mt-4" onSubmit={checkGuestPin}>
            <label htmlFor="guest-delivery-pincode" className="text-sm text-white">Delivery pincode</label>
            <div className="mt-1 flex gap-2">
              <input id="guest-delivery-pincode" inputMode="numeric" maxLength={6} value={guestPin} onChange={(event) => setGuestPin(event.target.value.replace(/\D/g, '').slice(0, 6))} className="min-w-0 flex-1 rounded border border-line bg-panel px-2 py-2 text-white" />
              <button type="submit" disabled={checkingPin} className="rounded border border-brand px-3 text-sm text-brand">{checkingPin ? 'Checking…' : 'Check'}</button>
            </div>
            {pinMessage && <p role="status" className="mt-1 text-sm text-white">{pinMessage}</p>}
          </form>
          <p className="mt-2 text-sm text-muted">
            Log in to save a delivery address and place your order.
          </p>
          <button
            type="button"
            onClick={handleLogin}
            className="mt-6 w-full rounded-xl bg-brand py-3 text-sm font-semibold text-black transition hover:bg-brand-hover"
          >
            Log in to continue
          </button>
        </div>
      </div>
    )
  }

  if (loading && addresses.length === 0) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
        <div className="rounded-2xl border border-line bg-panel p-6 text-center text-sm text-muted">
          Loading addresses...
        </div>
      </div>
    )
  }

  if (showForm) {
    return (
      <AddressFormModal
        defaultPhone={user?.phone || ''}
        defaultName={user?.name || ''}
        saving={saving}
        onClose={() => {
          if (addresses.length === 0) closePicker()
          setFormOpen(false)
        }}
        onSave={handleSave}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onClick={closePicker}>
      <div
        className="relative max-h-[85vh] w-full overflow-y-auto rounded-t-3xl border border-line bg-panel p-5 shadow-2xl shadow-black/40 sm:max-w-lg sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={closePicker}
          className="absolute right-4 top-4 text-muted transition hover:text-white"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2 className="pr-8 text-lg font-bold text-white">Select delivery address</h2>
        <p className="mt-1 text-sm text-muted">Choose where we should deliver your order.</p>

        <ul className="mt-5 divide-y divide-line rounded-2xl border border-line">
          {addresses.map((address) => {
            const Icon = addressLabelIcon(address.label)
            const active = address.id === selectedAddressId

            return (
              <li key={address.id}>
                <div
                  className={`flex w-full items-start gap-3 px-4 py-4 text-left transition ${
                    active ? 'bg-brand/10' : 'hover:bg-panel-2'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (address.serviceable === false) return
                      selectAddress(address.id)
                      recordWebsiteDebug('delivery.pin.checked', { deliveryPin: address.pincode, pinSource: 'saved_address' })
                    }}
                    className="flex min-w-0 flex-1 items-start gap-3 text-left"
                  >
                  <span
                    className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      active ? 'border-brand' : 'border-line'
                    }`}
                  >
                    {active && <span className="h-2.5 w-2.5 rounded-full bg-brand" />}
                  </span>
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-panel-2 text-brand">
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-white">{address.label}</span>
                    <span className="mt-1 block text-sm leading-5 text-muted">{address.formatted}</span>
                    {address.serviceable === false && (
                      <span className="mt-1 block text-sm font-semibold text-red-400">
                        We don't deliver to this pincode yet.
                      </span>
                    )}
                  </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(address.id)}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-400 hover:bg-red-950/40"
                    aria-label="Delete address"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>

        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition hover:text-mint"
        >
          <Plus size={16} />
          Add new address
        </button>
      </div>
    </div>
  )
}
