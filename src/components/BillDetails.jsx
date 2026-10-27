import { Bike, Receipt, ShoppingBag, Tag } from 'lucide-react'
import { formatDeliveryCharge } from '../lib/delivery'
import { useCart } from '../context/CartContext'

const formatPrice = (value) =>
  `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

function itemCutoff(item) {
  const oldPrice = Number(item.oldPriceValue) || Number(String(item.oldPrice || '').replace(/[^0-9.]/g, ''))
  const price = Number(item.priceValue)
  if (!oldPrice || !price || oldPrice <= price) return 0
  return (oldPrice - price) * Number(item.quantity || 0)
}

function BillRow({ icon: Icon, label, value, oldValue, badge, free }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        {Icon ? <Icon size={16} className="shrink-0 text-mint" strokeWidth={2.2} /> : null}
        <span className="text-sm text-muted">{label}</span>
        {badge ? (
          <span className="rounded-full bg-emerald-50/15 px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-mint">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {oldValue ? <span className="text-xs font-semibold text-muted line-through">{oldValue}</span> : null}
        <span className={`text-sm font-bold ${free ? 'text-mint' : 'text-white'}`}>{value}</span>
      </div>
    </div>
  )
}

export default function BillDetails({
  cartItems = [],
  itemsTotal,
  taxTotal = 0,
  deliveryCharge,
  handlingCharge,
  discount,
  grandTotal,
  deliveryOption,
  title = 'Bill details',
}) {
  const { quote, quoteLoading } = useCart()
  const selectedQuote = quote?.options?.[deliveryOption]
  const itemSavings = cartItems.reduce((sum, item) => sum + itemCutoff(item), 0)
  const deliverySaved = Number(selectedQuote?.deliverySavings || 0)
  const totalSavings = Math.round((itemSavings + Number(discount || 0) + deliverySaved) * 100) / 100
  const itemsOriginal = itemsTotal + itemSavings

  return (
    <div>
      <h2 className="text-base font-extrabold text-white">{title}</h2>

      <div className="mt-1">
        <BillRow
          icon={Receipt}
          label="Items total"
          value={formatPrice(itemsTotal)}
          oldValue={itemSavings > 0 ? formatPrice(itemsOriginal) : null}
          badge={itemSavings > 0 ? `Saved ${formatPrice(itemSavings)}` : null}
        />
        {Number(taxTotal) > 0 ? (
          <BillRow icon={Receipt} label="Taxes & GST" value={formatPrice(taxTotal)} />
        ) : null}
        <BillRow icon={ShoppingBag} label="Cart handling" value={formatPrice(handlingCharge)} />
        <BillRow
          icon={Bike}
          label="Delivery charges"
          value={quoteLoading ? 'Calculating…' : formatDeliveryCharge(deliveryCharge)}
          free={!quoteLoading && !(deliveryCharge > 0)}
        />
        {selectedQuote?.freeAboveMessage ? (
          <p className="-mt-1 mb-1 text-xs font-semibold text-mint">
            {selectedQuote.freeAboveMessage}
          </p>
        ) : selectedQuote?.deliveryMessage ? (
          <p className="-mt-1 mb-1 text-xs font-semibold text-mint">
            {selectedQuote.deliveryMessage}
          </p>
        ) : null}
        {discount > 0 ? (
          <BillRow icon={Tag} label="Coupon" value={`-${formatPrice(discount)}`} free />
        ) : null}
      </div>

      <div className="mt-1 flex items-center justify-between border-t border-dashed border-line pt-3">
        <span className="text-base font-extrabold text-white">Grand total</span>
        <span className="text-base font-extrabold text-white">{quoteLoading ? 'Calculating…' : formatPrice(grandTotal)}</span>
      </div>

      {totalSavings > 0 ? (
        <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2.5">
          <span className="text-sm font-extrabold text-emerald-900">Your total savings</span>
          <span className="text-sm font-extrabold text-emerald-900">{formatPrice(totalSavings)}</span>
        </div>
      ) : null}
    </div>
  )
}
