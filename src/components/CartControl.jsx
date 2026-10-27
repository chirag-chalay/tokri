import { Minus, Plus } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function CartControl({
  product,
  variant = 'compact',
  addLabel = 'ADD',
  onAdd,
}) {
  const { addItem, updateQuantity, removeItem, getItemQuantity } = useCart()
  const quantity = getItemQuantity(product.id)

  const stop = (event) => {
    event.stopPropagation()
  }

  const handleKeyDown = (event) => {
    event.stopPropagation()
  }

  const handleAdd = (event) => {
    stop(event)
    addItem(product)
    onAdd?.()
  }

  const handleIncrease = (event) => {
    stop(event)
    addItem(product)
  }

  const handleDecrease = (event) => {
    stop(event)
    if (quantity <= 1) {
      removeItem(product.id)
    } else {
      updateQuantity(product.id, -1)
    }
  }

  if (variant === 'block') {
    if (quantity <= 0) {
      return (
        <button
          type="button"
          onClick={handleAdd}
          className="w-full rounded-3xl bg-brand px-6 py-4 text-sm font-semibold text-black transition hover:bg-brand-hover cursor-pointer"
        >
          Add to cart
        </button>
      )
    }

    return (
      <div
        className="flex w-full items-center justify-between rounded-3xl bg-brand px-3 py-2 text-black"
        onClick={stop}
        onPointerDown={stop}
      >
        <button
          type="button"
          onClick={handleDecrease}
          className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-brand-hover cursor-pointer text-black"
          aria-label="Decrease quantity"
        >
          <Minus size={18} />
        </button>
        <span className="text-base font-semibold text-black">{quantity}</span>
        <button
          type="button"
          onClick={handleIncrease}
          className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-brand-hover cursor-pointer text-black"
          aria-label="Increase quantity"
        >
          <Plus size={18} />
        </button>
      </div>
    )
  }

  if (variant === 'shop') {
    if (quantity <= 0) {
      return (
        <button
          type="button"
          onClick={handleAdd}
          onKeyDown={handleKeyDown}
          className="inline-flex min-h-[32px] sm:min-h-[34px] min-w-[54px] sm:min-w-[58px] items-center justify-center rounded-md border-2 border-brand bg-[#163322] px-2.5 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wide text-brand transition hover:bg-brand hover:text-black cursor-pointer"
        >
          {addLabel}
        </button>
      )
    }

    return (
      <div
        className="inline-flex min-h-[32px] sm:min-h-[34px] items-center rounded-md bg-brand text-black sm:min-w-[58px]"
        onClick={stop}
        onPointerDown={stop}
        onKeyDown={handleKeyDown}
      >
        <button
          type="button"
          onClick={handleDecrease}
          onKeyDown={handleKeyDown}
          className="flex h-8 w-7 items-center justify-center transition hover:bg-brand-hover text-black cursor-pointer"
          aria-label="Decrease quantity"
        >
          <Minus size={13} strokeWidth={2.5} />
        </button>
        <span className="min-w-[1.1rem] text-center text-[12px] font-bold text-black">{quantity}</span>
        <button
          type="button"
          onClick={handleIncrease}
          onKeyDown={handleKeyDown}
          className="flex h-8 w-7 items-center justify-center transition hover:bg-brand-hover text-black cursor-pointer"
          aria-label="Increase quantity"
        >
          <Plus size={13} strokeWidth={2.5} />
        </button>
      </div>
    )
  }

  if (quantity <= 0) {
    return (
      <button
        type="button"
        onClick={handleAdd}
        onKeyDown={handleKeyDown}
        className="inline-flex min-h-[28px] sm:min-h-[30px] min-w-[48px] sm:min-w-[52px] items-center justify-center rounded-md border border-brand bg-[#163322] px-2 py-1 text-[11px] font-bold leading-none text-brand transition hover:bg-brand hover:text-black cursor-pointer"
      >
        {addLabel}
      </button>
    )
  }

  return (
    <div
      className="inline-flex min-h-[28px] sm:min-h-[30px] items-center rounded-md bg-brand text-black"
      onClick={stop}
      onPointerDown={stop}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        onClick={handleDecrease}
        onKeyDown={handleKeyDown}
        className="flex h-7 w-6.5 sm:w-7 items-center justify-center rounded-l transition hover:bg-brand-hover text-black cursor-pointer"
        aria-label="Decrease quantity"
      >
        <Minus size={12} strokeWidth={2.5} />
      </button>
      <span className="min-w-[1rem] text-center text-[11px] font-bold leading-none text-black">
        {quantity}
      </span>
      <button
        type="button"
        onClick={handleIncrease}
        onKeyDown={handleKeyDown}
        className="flex h-7 w-6.5 sm:w-7 items-center justify-center rounded-r transition hover:bg-brand-hover text-black cursor-pointer"
        aria-label="Increase quantity"
      >
        <Plus size={12} strokeWidth={2.5} />
      </button>
    </div>
  )
}
