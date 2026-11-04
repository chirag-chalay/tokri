import { Minus, Plus } from 'lucide-react'
import { resolveAssetUrl } from '../lib/api'

const formatPrice = (value) =>
  `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

export function CartQtyStepper({ quantity, onDecrease, onIncrease }) {
  return (
    <div className="inline-flex items-center rounded-lg border-2 border-brand bg-brand text-black">
      <button
        type="button"
        onClick={onDecrease}
        className="flex h-8 w-8 items-center justify-center"
        aria-label="Decrease quantity"
      >
        <Minus size={14} strokeWidth={3} />
      </button>
      <span className="min-w-[1.5rem] text-center text-sm font-bold">{quantity}</span>
      <button
        type="button"
        onClick={onIncrease}
        className="flex h-8 w-8 items-center justify-center"
        aria-label="Increase quantity"
      >
        <Plus size={14} strokeWidth={3} />
      </button>
    </div>
  )
}

export default function CartLineItem({ item, onDecrease, onIncrease }) {
  const lineTotal = item.priceValue * item.quantity

  return (
    <article className="flex gap-3 rounded-2xl border border-line bg-panel px-4 py-4">
      <img
        src={resolveAssetUrl(item.image)}
        alt={item.name}
        className="h-[72px] w-[72px] shrink-0 rounded-xl border border-line bg-panel-2 object-cover"
      />

      <div className="min-w-0 flex-1">
        <p className="m-0 line-clamp-2 text-xs font-medium leading-snug text-white">
          {item.name}
        </p>
        {item.weight ? <p className="mt-1 text-xs text-muted">{item.weight}</p> : null}
        <p className="mt-2 text-sm font-bold text-white">{formatPrice(lineTotal)}</p>
      </div>

      <div className="shrink-0 self-center">
        <CartQtyStepper quantity={item.quantity} onDecrease={onDecrease} onIncrease={onIncrease} />
      </div>
    </article>
  )
}
