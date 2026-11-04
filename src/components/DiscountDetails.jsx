import { useCart } from '../context/CartContext'

const money = (value) =>
  `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function DiscountDetails() {
  const { quote, coupon } = useCart()
  const totals = quote?.totals
  const discount = Number(totals?.couponDiscount || 0)
  if (!(discount > 0)) return null

  const code =
    (quote?.couponStatus?.status === 'applied' && quote.couponStatus.code) ||
    coupon?.code ||
    null
  const label = code ? `${code} Coupon Applied` : 'Coupon Applied'

  return (
    <div className="py-2 text-sm text-mint" aria-live="polite">
      <div className="flex justify-between gap-3">
        <span className="min-w-0 truncate" title={label}>
          {label}
        </span>
        <span className="shrink-0">−{money(discount)}</span>
      </div>
    </div>
  )
}
