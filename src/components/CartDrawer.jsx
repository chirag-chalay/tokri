import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAddress } from '../context/AddressContext'
import CouponBox from './CouponBox'
import { formatDeliveryCharge } from '../lib/delivery'
import { useFocusTrap } from '../hooks/useFocusTrap'

const formatPrice = (value) => `₹${value.toLocaleString('en-IN')}`

export default function CartDrawer() {
  const navigate = useNavigate()
  const { hasDeliveryAddress, openPicker } = useAddress()
  const {
    cartItems,
    totalCount,
    itemsTotal,
    taxTotal,
    deliveryCharge,
    handlingCharge,
    discount,
    grandTotal,
    quoteLoading,
    showDrawer,
    closeDrawer,
    updateQuantity,
    removeItem,
  } = useCart()

  const containerRef = useFocusTrap(Boolean(showDrawer), closeDrawer)

  if (!showDrawer) return null

  const handleCheckout = () => {
    closeDrawer()
    navigate('/checkout')
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart Drawer"
      className="fixed inset-0 z-50 flex justify-end bg-black/50"
      onClick={closeDrawer}
    >
      <div
        ref={containerRef}
        tabIndex={-1}
        className="w-full max-w-md overflow-y-auto border-l border-line bg-panel p-6 text-white outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">My Cart</p>
            <h2 className="text-2xl font-bold text-white">{totalCount} item{totalCount !== 1 ? 's' : ''}</h2>
          </div>
          <button className="text-muted transition hover:text-white" onClick={closeDrawer} type="button">
            Close
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="py-20 text-center text-mint">
            <p className="text-lg font-medium text-white">Your cart is empty</p>
            <p className="mt-2 text-muted">Add fresh fruits and vegetables to get started.</p>
          </div>
        ) : (
          <>
            <div className="mb-6 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 rounded-3xl border border-line bg-panel-2 p-4">
                  <img src={item.image} alt={item.name} className="h-20 w-20 rounded-3xl object-cover" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-white">{item.name}</h3>
                        <p className="text-sm text-muted">{item.weight}</p>
                      </div>
                      <p className="font-semibold text-mint">{formatPrice(item.priceValue)}</p>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="h-9 w-9 rounded-full border border-line text-white transition hover:bg-panel"
                      >
                        –
                      </button>
                      <span className="font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="h-9 w-9 rounded-full border border-line text-white transition hover:bg-panel"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="ml-auto text-sm text-muted transition hover:text-white"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 rounded-[2rem] border border-line bg-canvas p-5">
              <CouponBox compact />
              <div className="flex items-center justify-between text-sm text-muted">
                <span>Item total</span>
                <span>{formatPrice(itemsTotal)}</span>
              </div>
              {taxTotal > 0 && (
                <div className="flex items-center justify-between text-sm text-muted">
                  <span>Taxes & GST</span>
                  <span>{formatPrice(taxTotal)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm text-muted">
                <span>Cart handling</span>
                <span>{formatPrice(handlingCharge)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted">
                <span>Delivery charges</span>
                <span className={deliveryCharge > 0 ? '' : 'text-mint'}>{quoteLoading ? 'Calculating…' : formatDeliveryCharge(deliveryCharge)}</span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-sm text-mint">
                  <span>Coupon discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-line pt-4 text-base font-semibold text-white">
                <span>Total</span>
                <span>{quoteLoading ? 'Calculating…' : formatPrice(grandTotal)}</span>
              </div>
            </div>

            {hasDeliveryAddress ? (
              <button
                type="button"
                onClick={handleCheckout}
                className="mt-4 block w-full rounded-full bg-brand py-4 text-center text-sm font-semibold text-black transition hover:bg-brand-hover"
              >
                Proceed to checkout
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  closeDrawer()
                  openPicker()
                }}
                className="mt-4 block w-full rounded-full bg-brand py-4 text-center text-sm font-semibold text-black transition hover:bg-brand-hover"
              >
                Add address to proceed
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
