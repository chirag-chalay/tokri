import { ChevronDown, MapPin } from 'lucide-react'
import { useAddress } from '../context/AddressContext'
import { useAuth } from '../context/AuthContext'

function shortAddress(address) {
  if (!address) return ''
  const line = [address.line1, address.line2, address.city].filter(Boolean).join(', ')
  return line.length > 42 ? `${line.slice(0, 42)}...` : line
}

export default function DeliveryAddressBar({ className = '', variant = 'mobile' }) {
  const { isLoggedIn } = useAuth()
  const { selectedAddress, addresses, openPicker, detectedLabel, locating } = useAddress()

  const label = selectedAddress
    ? shortAddress(selectedAddress)
    : locating
      ? 'Detecting location…'
      : detectedLabel || 'Select address'
  const canChangeAddress = isLoggedIn && addresses.length > 1 && selectedAddress
  const needsAddress = !selectedAddress

  if (variant === 'desktop') {
    return (
      <button
        type="button"
        onClick={openPicker}
        className={`cursor-pointer text-left text-sm text-mint sm:flex sm:items-center sm:gap-2 ${className}`}
      >
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-panel-2 text-brand">
          <MapPin size={18} />
        </span>
        <span className="min-w-0">
          <span className="block text-[16px] font-medium leading-tight text-white">Deliver To</span>
          <span className="flex items-center gap-1.5">
            <span
              className={`block truncate text-sm font-medium ${
                needsAddress && !detectedLabel && !locating ? 'text-brand' : 'text-mint'
              }`}
            >
              {label}
            </span>
            {canChangeAddress && (
              <ChevronDown size={14} className="shrink-0 text-muted" aria-hidden="true" />
            )}
          </span>
        </span>
      </button>
    )
  }

  return (
    <div className={`min-w-0 flex flex-col justify-center ${className}`}>
      <p className="text-[12px] sm:text-[13px] font-semibold leading-tight text-white/90 whitespace-nowrap tracking-tight">
        Delivery To
      </p>
      <button
        type="button"
        onClick={openPicker}
        className="mt-0.5 flex max-w-full cursor-pointer items-center gap-1 text-left text-[11px] sm:text-xs leading-tight text-mint transition hover:text-white"
      >
        <span
          className={`truncate ${
            needsAddress && !detectedLabel && !locating
              ? 'font-semibold text-brand'
              : 'font-medium text-mint'
          }`}
        >
          {label}
        </span>
        {canChangeAddress ? (
          <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-panel-2 px-1.5 py-0.5 text-[10px] font-semibold text-mint">
            Change
            <ChevronDown size={11} />
          </span>
        ) : (
          <ChevronDown size={13} className="shrink-0 text-mint/70" />
        )}
      </button>
    </div>
  )
}
