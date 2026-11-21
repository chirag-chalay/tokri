import { useEffect, useRef, useState } from 'react'
import { LocateFixed, X } from 'lucide-react'
import { fetchAddressFromBrowser } from '../../lib/geolocation'
import { recordWebsiteDebug } from '../../lib/websiteMonitoring'
import { scrollFieldAboveKeyboard, useMobileKeyboardPad } from '../../lib/useMobileKeyboardPad'

import { ADDRESS_DETAIL_FIELDS, applyAddressSuggestion, composeAddressLines, editableAddress } from '../../../shared/addressFields.js'
import { fetchJson } from '../../lib/api'
import AddressAutocomplete from './AddressAutocomplete'
import PincodeAutocomplete from './PincodeAutocomplete'

const LABELS = ['Home', 'Work', 'Other']
const ADDRESS_FIELDS = new Set(['line1', 'line2', 'city', 'state', 'pincode', 'landmark', ...ADDRESS_DETAIL_FIELDS])

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
  houseNumber: '',
  floor: '',
  building: '',
  street: '',
  locality: '',
  addressDetailsVersion: 1,
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
      ? { ...emptyForm(defaultPhone, defaultName), ...editableAddress(initial) }
      : emptyForm(defaultPhone, defaultName),
  )
  const [error, setError] = useState('')
  const [locating, setLocating] = useState(false)
  const autoTried = useRef(false)
  const autoFields = useRef({})
  const [availability, setAvailability] = useState(null)
  const keyboardPad = useMobileKeyboardPad()

  const update = (field, value) => {
    delete autoFields.current[field]
    setForm((prev) => {
      const next = { ...prev, [field]: value,
        ...(ADDRESS_FIELDS.has(field) ? { latitude: null, longitude: null } : {}) }
      return ADDRESS_DETAIL_FIELDS.includes(field) ? { ...next, ...composeAddressLines(next) } : next
    })
  }

  const selectSuggestion = (suggestion, query) => {
    const prepared = { ...form }
    // Clear only fields filled by a previous suggestion; customer edits win.
    for (const [field, value] of Object.entries(autoFields.current)) {
      if (prepared[field] === value) prepared[field] = ''
    }
    const next = applyAddressSuggestion(prepared, suggestion, query)
    autoFields.current = Object.fromEntries(['building', 'street', 'locality', 'landmark']
      .filter(field => !prepared[field] && next[field]).map(field => [field, next[field]]))
    setForm(next)
  }

  useEffect(() => {
    const pincode = form.pincode
    if (!/^[1-9][0-9]{5}$/.test(pincode)) return undefined
    let cancelled = false
    const timer = window.setTimeout(() => {
      fetchJson(`/delivery/availability?pincode=${pincode}`).then(data => {
        if (!cancelled) setAvailability({ pincode, delivery: data.delivery })
      }).catch(() => { if (!cancelled) setAvailability({ pincode, error: true }) })
    }, 200)
    return () => { cancelled = true; window.clearTimeout(timer) }
  }, [form.pincode])

  const fillFromLocation = async ({ silent = false } = {}) => {
    setLocating(true)
    setError('')
    try {
      const found = await fetchAddressFromBrowser()
      setForm((current) => ({
        ...current,
        houseNumber: current.houseNumber || found.line1 || '',
        street: current.street || found.line2 || '',
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
    recordWebsiteDebug('delivery.pin.checked', { deliveryPin: form.pincode, pinSource: 'address_form' })
    try {
      await onSave({ ...form, ...composeAddressLines(form), addressDetailsVersion: 1 })
    } catch (err) {
      setError(err.message || 'Could not save address.')
    }
  }

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 md:flex md:items-center md:justify-center md:p-4">
      <div className="flex h-dvh w-full flex-col bg-panel md:h-auto md:max-h-[90vh] md:max-w-lg md:rounded-2xl md:border md:border-line md:shadow-2xl">
        <div data-address-header className="flex items-center justify-between border-b border-line px-5 py-4">
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
          data-address-scroll
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-4 pb-4"
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

        <form id="address-form" onSubmit={handleSubmit} className="mt-4 space-y-3">
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
            <label className="mb-1.5 block text-sm font-medium text-white">Search address (optional)</label>
            <AddressAutocomplete onSelect={selectSuggestion} />
          </div>

          {[
            ['houseNumber', 'House / Flat / Plot Number', 'House 42 / Flat 304 / Plot 25'],
            ['floor', 'Floor / Tower / Portion', '2nd floor, Tower B, rear portion'],
            ['building', 'Building / Society', 'Building or society name'],
            ['street', 'Street / Block', 'Street, road or block'],
            ['locality', 'Sector / Locality', 'Sector or locality'],
          ].map(([field, label, placeholder]) => <div key={field}>
            <label htmlFor={`address-${field}`} className="mb-1.5 block text-sm font-medium text-white">{label}</label>
            <input
              id={`address-${field}`}
              value={form[field] || ''}
              onChange={event => update(field, event.target.value)}
              className="w-full rounded-xl border border-line bg-panel-2 px-3 py-2.5 text-sm text-white outline-none focus:border-brand"
              placeholder={placeholder}
              onFocus={scrollFieldAboveKeyboard}
              maxLength={300}
              required={field === 'houseNumber' ? !form.building : field === 'locality' ? !form.street : false}
            />
          </div>)}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="address-city" className="mb-1.5 block text-sm font-medium text-white">City</label>
              <input
                id="address-city"
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                className="w-full rounded-xl border border-line bg-panel-2 px-3 py-2.5 text-sm text-white outline-none focus:border-brand"
                onFocus={scrollFieldAboveKeyboard}
                required
              />
            </div>
            <div>
              <label htmlFor="address-state" className="mb-1.5 block text-sm font-medium text-white">State</label>
              <input
                id="address-state"
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
              <PincodeAutocomplete
                value={form.pincode}
                onChange={(value) => update('pincode', value)}
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

          {/^[1-9][0-9]{5}$/.test(form.pincode) && <div role="status" className="rounded-xl border border-line bg-panel-2 px-3 py-2 text-sm text-muted">
            {availability?.pincode !== form.pincode ? 'Checking delivery availability…'
              : availability.error ? 'Could not check delivery. Availability will be checked again when you save.'
              : !availability.delivery?.serviceable ? "We don't deliver to this pincode yet. You can edit your address."
              : <><span className="block text-white">Available delivery options</span>
                {availability.delivery.morning?.enabled && <span className="mr-3">Morning Delivery</span>}
                {availability.delivery.express?.enabled && <span>Same Day Delivery</span>}</>}
          </div>}

          {error && (
            <div className="rounded-xl border border-red-800/50 bg-red-950/40 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}
        </form>
        </div>
        <div
          data-address-footer
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
