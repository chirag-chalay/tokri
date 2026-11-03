import { useState } from 'react'
import { Tag, X } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function CouponBox({ compact = false }) {
  const {
    coupon,
    couponError,
    couponLoading,
    couponAction,
    applyCoupon,
    removeCoupon,
    quote,
    quoteLoading,
    quoteError,
    refreshDeliveryQuote,
  } = useCart()
  const [code, setCode] = useState('')
  const [localError, setLocalError] = useState('')
  const updating = couponLoading || quoteLoading
  const offers = quote?.availableCoupons || []
  const selectedCode =
    quote?.couponStatus?.status === 'applied'
      ? quote.couponStatus.code
      : quote?.totals?.couponDiscount > 0
        ? coupon?.code
        : null
  const manualUpdating =
    updating &&
    couponAction &&
    !offers.some((offer) => offer.code === couponAction)
  const message = localError || couponError || quoteError || ''

  const handleApply = async (event) => {
    event.preventDefault()
    if (updating || !code.trim()) return
    setLocalError('')
    try {
      const applied = await applyCoupon(code)
      if (applied) setCode((current) => (current === code ? '' : current))
    } catch (error) {
      setLocalError(error.message || 'Could not apply coupon')
    }
  }

  return (
    <div className="space-y-3" aria-busy={Boolean(updating)}>
      <section aria-label="Available Coupons" className="space-y-2">
        <div className="flex h-5 items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-white">Available Coupons</h3>
          <span className="text-xs text-muted" role="status" aria-live="polite">
            {quoteError ? (
              <button
                type="button"
                onClick={() => refreshDeliveryQuote().catch(() => {})}
                className="text-mint underline"
              >
                Retry update
              </button>
            ) : updating && !couponAction ? (
              'Updating…'
            ) : (
              ''
            )}
          </span>
        </div>
        {offers.map((offer) => {
          const actionUpdating =
            updating && couponAction === offer.code && !quoteError
          return (
            <article
              key={offer.id}
              className={`rounded-2xl border p-3 ${offer.applied ? 'border-brand bg-brand/10' : 'border-line bg-panel-2'} ${!offer.eligible ? 'text-muted' : 'text-white'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{offer.label}</p>
                  <p className="mt-1 text-xs text-muted">
                    On orders of ₹
                    {Number(offer.minimumSubtotal).toLocaleString('en-IN')} or
                    more
                  </p>
                  <p
                    className={`mt-1 h-8 overflow-hidden text-xs leading-4 ${offer.eligible ? 'text-mint' : 'text-muted'}`}
                    title={offer.reason || undefined}
                  >
                    {offer.eligible ? (
                      <>
                        {offer.applied ? 'You save' : 'Save'} ₹
                        {Number(offer.estimatedSavings).toLocaleString(
                          'en-IN',
                          { maximumFractionDigits: 2 },
                        )}
                      </>
                    ) : offer.amountToUnlock > 0 ? (
                      `Locked — Add ₹${Number(offer.amountToUnlock).toLocaleString('en-IN', { maximumFractionDigits: 2 })} more`
                    ) : (
                      offer.reason
                    )}
                  </p>
                </div>
                <div className="flex h-14 w-20 shrink-0 flex-col items-end justify-end">
                  <span
                    className={`mb-1 text-xs font-semibold text-mint ${!offer.applied ? 'invisible' : ''}`}
                  >
                    {offer.applied ? 'Applied' : '\u00a0'}
                  </span>
                  <button
                    type="button"
                    disabled={!offer.eligible}
                    aria-disabled={updating || !offer.eligible}
                    aria-busy={Boolean(actionUpdating)}
                    onClick={() => {
                      if (updating || !offer.eligible) return
                      setLocalError('')
                      if (offer.applied) removeCoupon()
                      else
                        applyCoupon(offer.code).catch((error) =>
                          setLocalError(error.message),
                        )
                    }}
                    className="h-8 w-20 rounded-xl bg-brand text-xs font-bold text-black aria-disabled:opacity-60"
                  >
                    {actionUpdating
                      ? 'Updating…'
                      : offer.applied
                        ? 'Remove'
                        : offer.eligible
                          ? 'Apply'
                          : 'Locked'}
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </section>
      <div className="flex h-11 items-center justify-between gap-2 rounded-xl border border-brand/40 px-3 text-sm text-mint">
        <span className="min-w-0 truncate" title={selectedCode || undefined}>
          {selectedCode ? `Selected: ${selectedCode}` : 'No coupon selected'}
        </span>
        <button
          type="button"
          onClick={() => {
            if (selectedCode && !updating) removeCoupon()
          }}
          aria-label="Remove coupon"
          aria-disabled={!selectedCode || updating}
          className="shrink-0 aria-disabled:opacity-30"
        >
          <X size={16} />
        </button>
      </div>
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
            onChange={(event) => {
              setCode(event.target.value.toUpperCase())
              setLocalError('')
            }}
            placeholder="Enter code"
            className="min-w-0 flex-1 rounded-xl border border-line bg-canvas px-3 py-2.5 text-sm font-semibold uppercase tracking-wide text-white outline-none placeholder:text-muted focus:border-brand"
          />
          <button
            type="submit"
            aria-disabled={updating || !code.trim()}
            className="w-20 shrink-0 rounded-xl bg-brand py-2.5 text-xs font-bold text-black aria-disabled:opacity-60"
          >
            {manualUpdating ? 'Updating…' : 'Apply'}
          </button>
        </div>
        <p
          role="status"
          aria-live="polite"
          className="mt-2 h-12 overflow-hidden text-xs leading-4 text-rose-400"
          title={message || undefined}
        >
          {message}
        </p>
      </form>
    </div>
  )
}
