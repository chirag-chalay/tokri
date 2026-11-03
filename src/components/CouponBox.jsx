import { useState } from 'react'
import { Tag, X } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function CouponBox({ compact = false }) {
  const {
    coupon,
    couponError,
    couponLoading,
    applyCoupon,
    removeCoupon,
    quote,
    quoteLoading,
  } = useCart()
  const [code, setCode] = useState('')
  const [localError, setLocalError] = useState('')

  const handleInputChange = (event) => {
    setCode(event.target.value.toUpperCase())
    if (localError) setLocalError('')
  }

  const handleApply = async (event) => {
    event.preventDefault()
    setLocalError('')
    try {
      await applyCoupon(code)
      setCode('')
    } catch (error) {
      setLocalError(error.message || 'Could not apply coupon')
    }
  }

  return (
    <div className="space-y-3">
      <section aria-label="Available Coupons" className="space-y-2">
        <h3 className="text-sm font-bold text-white">Available Coupons</h3>
        {(quote?.availableCoupons || []).map((offer) => (
          <article
            key={offer.id}
            className={`rounded-2xl border p-3 ${offer.applied ? 'border-brand bg-brand/10' : 'border-line bg-panel-2'} ${!offer.eligible ? 'text-muted' : 'text-white'}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold">{offer.label}</p>
                <p className="mt-1 text-xs text-muted">
                  On orders of ₹
                  {Number(offer.minimumSubtotal).toLocaleString('en-IN')} or
                  more
                </p>
                {offer.eligible && (
                  <p className="mt-1 text-xs text-mint">
                    {offer.applied ? 'You save' : 'Save'} ₹
                    {Number(offer.estimatedSavings).toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                    })}
                  </p>
                )}
              </div>
              {offer.applied ? (
                <div className="shrink-0 text-right">
                  <span className="text-xs font-semibold text-mint">
                    Applied
                  </span>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="mt-1 block text-xs underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={!offer.eligible || couponLoading || quoteLoading}
                  onClick={() => {
                    setLocalError('')
                    applyCoupon(offer.code).catch((error) =>
                      setLocalError(error.message),
                    )
                  }}
                  className="shrink-0 rounded-xl bg-brand px-3 py-2 text-xs font-bold text-black disabled:bg-white/5 disabled:text-muted"
                >
                  {offer.eligible ? 'Apply' : 'Locked'}
                </button>
              )}
            </div>
            {!offer.eligible && (
              <p className="mt-2 text-xs">
                {offer.amountToUnlock > 0
                  ? `Locked — Add ₹${Number(offer.amountToUnlock).toLocaleString('en-IN', { maximumFractionDigits: 2 })} more`
                  : offer.reason}
              </p>
            )}
          </article>
        ))}
        {quoteLoading && (
          <p className="text-xs text-muted">Checking available coupons…</p>
        )}
      </section>
      {coupon?.code && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-brand/40 p-3 text-sm text-mint">
          <span className="min-w-0 break-all">Selected: {coupon.code}</span>
          <button
            type="button"
            onClick={removeCoupon}
            aria-label="Remove coupon"
          >
            <X size={16} />
          </button>
        </div>
      )}
      <form
        onSubmit={handleApply}
        className={`rounded-2xl border border-line bg-panel-2 ${compact ? 'p-3' : 'p-4'}`}
      >
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
        {(localError || couponError) && (
          <p role="status" className="mt-2 text-sm text-rose-400">
            {localError || couponError}
          </p>
        )}
      </form>
    </div>
  )
}
