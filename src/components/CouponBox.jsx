import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Info, X } from 'lucide-react'
import { useCart, pickBestEligibleCoupon } from '../context/CartContext'
import { useFocusTrap } from '../hooks/useFocusTrap'

function formatInr(value, digits = 0) {
  return Number(value || 0).toLocaleString('en-IN', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits > 0 ? undefined : 0,
  })
}

function offerTitle(offer) {
  if (offer?.percentage != null) return `${offer.percentage}% OFF`
  const match = String(offer?.label || '').match(/₹\s*([\d,.]+)/)
  if (match) return `Flat ₹${match[1]} Off`
  return offer?.label || offer?.code || 'Offer'
}

function unlockText(offer) {
  if (offer?.eligible) {
    return `${offer.applied ? 'You save' : 'Save'} ₹${formatInr(offer.estimatedSavings, 0)}`
  }
  if (offer?.amountToUnlock > 0) {
    return `Shop for ₹${formatInr(offer.amountToUnlock, 0)} more to unlock`
  }
  return offer?.reason || 'Not available on this cart'
}

function featuredOffer(offers, selectedCode) {
  if (!offers.length) return null
  const applied = offers.find((offer) => offer.applied || offer.code === selectedCode)
  if (applied) return applied
  const best = pickBestEligibleCoupon(offers)
  if (best) return best
  return [...offers].sort(
    (a, b) => Number(a.amountToUnlock || 0) - Number(b.amountToUnlock || 0),
  )[0]
}

function hasKnowMoreHtml(html) {
  const text = String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return Boolean(text)
}

function CouponBadge() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-dashed border-line bg-canvas font-mono text-sm font-bold text-muted"
    >
      %
    </span>
  )
}

function OfferActionButton({ offer, updating, actionUpdating, onApply, onRemove }) {
  const label = actionUpdating
    ? 'Updating…'
    : offer.applied
      ? 'Remove'
      : offer.eligible
        ? 'Apply'
        : 'Locked'
  return (
    <button
      type="button"
      disabled={!offer.eligible && !offer.applied}
      aria-disabled={updating || (!offer.eligible && !offer.applied)}
      aria-busy={Boolean(actionUpdating)}
      onClick={() => {
        if (updating) return
        if (offer.applied) onRemove()
        else if (offer.eligible) onApply(offer.code)
      }}
      className={`h-8 min-w-[4.5rem] rounded-xl border px-3 text-xs font-bold transition ${
        offer.applied
          ? 'border-brand bg-brand text-black'
          : offer.eligible
            ? 'border-brand bg-transparent text-mint hover:bg-brand/10'
            : 'border-line bg-panel-2 text-muted'
      } aria-disabled:opacity-60`}
    >
      {label}
    </button>
  )
}

function CouponsPanel({ open, onClose, offers, updating, couponAction, onApply, onRemove, message }) {
  const trapRef = useFocusTrap(open, onClose)
  const [expanded, setExpanded] = useState(() => new Set())

  if (!open) return null

  const toggleKnowMore = (id) => {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-black/50" onClick={onClose}>
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label="Coupons and offers"
        tabIndex={-1}
        className="flex h-full w-full max-w-md flex-col border-l border-line bg-panel text-white outline-none shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-lg font-bold">Coupons & offers</h2>
          <button type="button" onClick={onClose} className="text-muted hover:text-white" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
          <p className="m-0 text-xs font-bold tracking-wide text-muted">FEATURED COUPONS</p>
          {!offers.length ? (
            <p className="rounded-2xl border border-dashed border-line bg-panel-2 px-4 py-8 text-center text-sm text-muted">
              No public coupons right now.
            </p>
          ) : (
            <ul className="m-0 space-y-3 p-0">
              {offers.map((offer) => {
                const actionUpdating = updating && couponAction === offer.code
                const knowMore = hasKnowMoreHtml(offer.knowMoreHtml)
                const openDetails = expanded.has(offer.id)
                return (
                  <li
                    key={offer.id}
                    className={`rounded-2xl border bg-panel-2 p-4 ${
                      offer.applied ? 'border-brand' : 'border-line'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <CouponBadge />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 pl-0.5">
                            <p className="text-base font-bold tracking-normal text-white">{offerTitle(offer)}</p>
                            <p
                              className={`mt-1 flex items-start gap-1 text-xs tracking-normal ${
                                offer.eligible ? 'text-mint' : 'text-amber-400'
                              }`}
                            >
                              <span className="min-w-0">{unlockText(offer)}</span>
                              {!offer.eligible ? <Info size={12} className="mt-0.5 shrink-0" /> : null}
                            </p>
                          </div>
                          <OfferActionButton
                            offer={offer}
                            updating={updating}
                            actionUpdating={actionUpdating}
                            onApply={onApply}
                            onRemove={onRemove}
                          />
                        </div>

                        <div className="mt-3 border-t border-dashed border-line pt-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="rounded-lg border border-line bg-canvas px-2.5 py-1 font-mono text-xs font-semibold tracking-wide text-muted">
                              {offer.code}
                            </span>
                            {knowMore ? (
                              <button
                                type="button"
                                onClick={() => toggleKnowMore(offer.id)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-white"
                                aria-expanded={openDetails}
                              >
                                Know more
                                <ChevronDown
                                  size={14}
                                  className={`transition ${openDetails ? 'rotate-180' : ''}`}
                                />
                              </button>
                            ) : null}
                          </div>
                          {knowMore && openDetails ? (
                            <div
                              className="cms-page-content mt-2 text-xs leading-5 text-muted"
                              dangerouslySetInnerHTML={{ __html: offer.knowMoreHtml }}
                            />
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
          {message ? (
            <p role="status" aria-live="polite" className="mt-3 text-xs text-rose-400">
              {message}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

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
  const [panelOpen, setPanelOpen] = useState(false)
  const [localError, setLocalError] = useState('')
  const updating = couponLoading || quoteLoading
  const offers = quote?.availableCoupons || []
  const selectedCode =
    quote?.couponStatus?.status === 'applied'
      ? quote.couponStatus.code
      : quote?.totals?.couponDiscount > 0
        ? coupon?.code
        : null
  const featured = useMemo(() => featuredOffer(offers, selectedCode), [offers, selectedCode])
  const message = localError || couponError || quoteError || ''

  const handleApply = (code) => {
    setLocalError('')
    applyCoupon(code).catch((error) => setLocalError(error.message || 'Could not apply coupon'))
  }

  const handleRemove = () => {
    setLocalError('')
    removeCoupon()
  }

  if (!offers.length) return null

  return (
    <div className={`space-y-2 ${compact ? '' : ''}`} aria-busy={Boolean(updating)}>
      <div className="flex h-5 items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-white">Coupons & offers</h3>
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

      {featured ? (
        <article
          className={`overflow-visible rounded-2xl border p-3 ${
            featured.applied ? 'border-brand bg-brand/10' : 'border-line bg-panel-2'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <CouponBadge />
            <div className="min-w-0 flex-1 overflow-visible">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1 overflow-visible pl-0.5 pr-1">
                  <p className="break-words text-sm font-bold leading-snug tracking-normal text-white">
                    {featured.eligible
                      ? `Save ₹${formatInr(featured.estimatedSavings, 0)} with ${featured.code}`
                      : offerTitle(featured)}
                  </p>
                  <p
                    className={`mt-1 text-xs tracking-normal ${featured.eligible ? 'text-mint' : 'text-amber-400'}`}
                  >
                    {unlockText(featured)}
                  </p>
                  <button
                    type="button"
                    onClick={() => setPanelOpen(true)}
                    className="mt-2 inline-flex items-center gap-0.5 text-xs font-semibold text-mint hover:text-white"
                  >
                    View all coupons
                    <ChevronRight size={14} />
                  </button>
                </div>
                <OfferActionButton
                  offer={featured}
                  updating={updating}
                  actionUpdating={updating && couponAction === featured.code}
                  onApply={handleApply}
                  onRemove={handleRemove}
                />
              </div>
            </div>
          </div>
        </article>
      ) : null}

      {message ? (
        <p role="status" aria-live="polite" className="text-xs leading-4 text-rose-400">
          {message}
        </p>
      ) : null}

      <CouponsPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        offers={offers}
        updating={updating}
        couponAction={couponAction}
        onApply={handleApply}
        onRemove={handleRemove}
        message={message}
      />
    </div>
  )
}
