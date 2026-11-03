import { useCart } from '../context/CartContext'
const money = (value) =>
  `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
export default function DiscountDetails() {
  const { quote } = useCart()
  const totals = quote?.totals
  return (
    <div className="py-2 text-sm text-mint" aria-live="polite">
      <div className="flex justify-between gap-3">
        <span>Coupon discount</span>
        <span>−{money(totals?.couponDiscount || 0)}</span>
      </div>
      <p
        className="mt-1 h-4 truncate text-xs"
        title={totals?.discountMessage || undefined}
      >
        {totals?.discountMessage || '\u00a0'}
      </p>
    </div>
  )
}
