import { useEffect, useRef, useState } from 'react'
import { LocateFixed, X } from 'lucide-react'
import { fetchAddressFromBrowser } from '../../lib/geolocation'
import { scrollFieldAboveKeyboard, useMobileKeyboardPad } from '../../lib/useMobileKeyboardPad'

const LABELS = ['Home', 'Work', 'Other']
const ADDRESS_FIELDS = new Set(['line1', 'line2', 'city', 'state', 'pincode', 'landmark'])

function mapPin(found) {
  const latitude = Number(found?.latitude)
  const longitude = Number(found?.longitude)
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) return { latitude: null, longitude: null }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) return { latitude: null, longitude: null }
  return { latitude, longitude }
}

const emptyForm = (defaultPhone = '', defaultName = '') => ({
  label: 'Home',
  name: defaultName || '',
  phone: defaultPhone,
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
  landmark: '',
})

export default function AddressFormModal({
  initial,
  defaultPhone,
  defaultName,
  saving,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(
    initial
      ? { ...emptyForm(defaultPhone, defaultName), ...initial }
      : emptyForm(defaultPhone, defaultName),
  )
  const [error, setError] = useState('')
  const [locating, setLocating] = useState(false)
  const autoTried = useRef(false)
  const keyboardPad = useMobileKeyboardPad()

  const update = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(ADDRESS_FIELDS.has(field) ? { latitude: null, longitude: null } : {}),
    }))
  }

  const fillFromLocation = async ({ silent = false } = {}) => {
    setLocating(true)
    setError('')
    try {
      const found = await fetchAddressFromBrowser()
      setForm((current) => ({
        ...current,
        line1: current.line1 || found.line1 || '',
        line2: current.line2 || found.line2 || '',
        city: current.city || found.city || '',
        state: current.state || found.state || '',
        pincode: current.pincode || found.pincode || '',
        landmark: current.landmark || found.landmark || '',
        ...mapPin(found),
      }))
    } catch (err) {
      if (!silent) setError(err.message || 'Could not detect your location.')
    } finally {
      setLocating(false)
    }
  }

  useEffect(() => {
    if (initial || autoTried.current) return
    autoTried.current = true
    fillFromLocation({ silent: true })
  }, [initial])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      await onSave(form)
    } catch (err) {
      setError(err.message || 'Could not save address.')
    }
  }

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 md:flex md:items-center md:justify-center md:p-4">
      <div className="flex h-dvh w-full flex-col bg-panel md:h-auto md:max-h-[90vh] md:max-w-lg md:rounded-2xl md:border md:border-line md:shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="pr-8 text-xl font-bold text-white">
            {initial ? 'Edit address' : 'Add new address'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-white"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div
          className="min-h-0 flex-1 overflow-y-auto px-5 pt-4 pb-6"
        >
        <p className="text-sm text-muted">Where should we deliver your fresh fruits?</p>

        <button
          type="button"
          onClick={() => fillFromLocation()}
          disabled={locating}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand bg-panel-2 px-4 py-3 text-sm font-semibold text-brand transition hover:bg-brand/10 disabled:opacity-60"
        >
          <LocateFixed size={16} />
          {locating ? 'Detecting your location…' : 'Use current location'}
        </button>

        <form id="address-form" onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-white">Save as</label>
            <div className="flex flex-wrap gap-2">
              {LABELS.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => update('label', label)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    form.label === label
                      ? 'bg-brand text-black'
                      : 'border border-line bg-panel-2 text-white hover:bg-panel'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-white">Full name</label>
            <input
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="w-full rounded-xl border border-line bg-panel-2 px-3 py-2.5 text-sm text-white outline-none focus:border-brand"
              placeholder="Receiver name"
              onFocus={scrollFieldAboveKeyboard}
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-white">Mobile number</label>
            <div className="flex items-center rounded-xl border border-line bg-panel-2 px-3 py-2.5">
              <span className="text-sm text-muted">+91</span>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="ml-2 w-full bg-transparent text-sm text-white outline-none"
                placeholder="10-digit mobile"
                onFocus={scrollFieldAboveKeyboard}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-white">House / flat / building</label>
            <input
              value={form.line1}
              onChange={(e) => update('line1', e.target.value)}
              className="w-full rounded-xl border border-line bg-panel-2 px-3 py-2.5 text-sm text-white outline-none focus:border-brand"
              placeholder="Flat 402, Green Valley Apartments"
              onFocus={scrollFieldAboveKeyboard}
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-white">Street / area</label>
            <input
              value={form.line2}
              onChange={(e) => update('line2', e.target.value)}
              className="w-full rounded-xl border border-line bg-panel-2 px-3 py-2.5 text-sm text-white outline-none focus:border-brand"
              placeholder="Sector 18, Noida"
              onFocus={scrollFieldAboveKeyboard}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">City</label>
              <input
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                className="w-full rounded-xl border border-line bg-panel-2 px-3 py-2.5 text-sm text-white outline-none focus:border-brand"
                onFocus={scrollFieldAboveKeyboard}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">State</label>
              <input
                value={form.state}
                onChange={(e) => update('state', e.target.value)}
                className="w-full rounded-xl border border-line bg-panel-2 px-3 py-2.5 text-sm text-white outline-none focus:border-brand"
                onFocus={scrollFieldAboveKeyboard}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">Pincode</label>
              <input
                value={form.pincode}
                onChange={(e) => update('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full rounded-xl border border-line bg-panel-2 px-3 py-2.5 text-sm text-white outline-none focus:border-brand"
                placeholder="6-digit pincode"
                onFocus={scrollFieldAboveKeyboard}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">Landmark (optional)</label>
              <input
                value={form.landmark}
                onChange={(e) => update('landmark', e.target.value)}
                className="w-full rounded-xl border border-line bg-panel-2 px-3 py-2.5 text-sm text-white outline-none focus:border-brand"
                placeholder="Near metro gate"
                onFocus={scrollFieldAboveKeyboard}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-800/50 bg-red-950/40 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}
        </form>
        </div>
        <div
          className="border-t border-line bg-panel px-5 pt-3"
          style={{ paddingBottom: Math.max(16, keyboardPad + 12) }}
        >
          <button
            type="submit"
            form="address-form"
            disabled={saving}
            className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-black transition hover:bg-brand-hover disabled:opacity-60"
          >
            {saving ? 'Saving...' : initial ? 'Save changes' : 'Save address'}
          </button>
        </div>
      </div>
    </div>
  )
}
