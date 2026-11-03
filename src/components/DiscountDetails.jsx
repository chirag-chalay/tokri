import { useCart } from '../context/CartContext'
const money = (value) => `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
export default function DiscountDetails() {
  const { quote } = useCart()
  const totals = quote?.totals
  if (!totals?.discount) return null
  return <div className="py-2 text-sm text-mint" aria-live="polite">
    {totals.couponDiscount > 0 && <div className="flex justify-between gap-3"><span>Coupon discount</span><span>−{money(totals.couponDiscount)}</span></div>}
    {totals.discountMessage && <p className="mt-1 text-xs">{totals.discountMessage}</p>}
  </div>
}
