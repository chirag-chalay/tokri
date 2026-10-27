import { useState } from 'react'
import { Tag, X } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function CouponBox({ compact = false }) {
  const { coupon, couponError, couponLoading, applyCoupon, removeCoupon } = useCart()
  const [code, setCode] = useState('')
  const [localError, setLocalError] = useState('')
  const [clearedCouponError, setClearedCouponError] = useState(false)

  const handleInputChange = (event) => {
    setCode(event.target.value.toUpperCase())
    if (localError) setLocalError('')
    if (couponError) setClearedCouponError(true)
  }

  const handleApply = async (event) => {
    event.preventDefault()
    setLocalError('')
    setClearedCouponError(false)
    try {
      await applyCoupon(code)
      setCode('')
    } catch (error) {
      setLocalError(error.message || 'Could not apply coupon')
    }
  }

  if (coupon?.code) {
    return (
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-mint">Coupon applied</p>
            <p className="mt-1 text-lg font-bold text-white">{coupon.code}</p>
            <p className="mt-1 text-sm text-mint">{coupon.message || `₹${coupon.discount} off`}</p>
          </div>
          <button
            type="button"
            onClick={removeCoupon}
            className="rounded-full p-1 text-muted transition hover:bg-white/10 hover:text-white"
            aria-label="Remove coupon"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleApply} className={`rounded-2xl border border-line bg-panel-2 ${compact ? 'p-3' : 'p-4'}`}>
      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
        <Tag size={16} className="text-brand" />
        Have a coupon?
      </label>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={handleInputChange}
          placeholder="Enter code"
          className="min-w-0 flex-1 rounded-xl border border-line bg-canvas px-3 py-2.5 text-sm font-semibold uppercase tracking-wide text-white outline-none placeholder:text-muted focus:border-brand"
        />
        <button
          type="submit"
          disabled={couponLoading || !code.trim()}
          className="rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-black transition hover:bg-brand-hover disabled:opacity-60"
        >
          {couponLoading ? '…' : 'Apply'}
        </button>
      </div>
      {(localError || (!clearedCouponError ? couponError : '')) && (
        <p className="mt-2 text-sm text-rose-400">{localError || (!clearedCouponError ? couponError : '')}</p>
      )}
    </form>
  )
}
