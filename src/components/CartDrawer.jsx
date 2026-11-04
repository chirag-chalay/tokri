import { useNavigate } from '../lib/navigation'
import { useCart } from '../context/CartContext'
import { useAddress } from '../context/AddressContext'
import CouponBox from './CouponBox'
import CartLineItem from './CartLineItem'
import BillDetails from './BillDetails'
import { useFocusTrap } from '../hooks/useFocusTrap'

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
    quote,
    showDrawer,
    closeDrawer,
    updateQuantity,
    removeItem,
    deliveryOption,
    deliveryConfig,
  } = useCart()

  const containerRef = useFocusTrap(Boolean(showDrawer), closeDrawer)
  const hasPublicCoupons = (quote?.availableCoupons || []).length > 0

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
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">My Cart</p>
            <h2 className="text-2xl font-bold text-white">
              {totalCount} item{totalCount !== 1 ? 's' : ''}
            </h2>
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
            {hasPublicCoupons ? (
              <div className="mb-4 rounded-2xl border border-line bg-panel-2 p-4">
                <CouponBox compact />
              </div>
            ) : null}

            <div className="mb-5 space-y-3">
              {cartItems.map((item) => (
                <CartLineItem
                  key={item.id}
                  item={item}
                  onDecrease={() => {
                    if (item.quantity <= 1) removeItem(item.id)
                    else updateQuantity(item.id, -1)
                  }}
                  onIncrease={() => updateQuantity(item.id, 1)}
                />
              ))}
            </div>

            <div className="mb-4 rounded-2xl border border-line bg-panel-2 p-4">
              <BillDetails
                cartItems={cartItems}
                itemsTotal={itemsTotal}
                taxTotal={taxTotal}
                deliveryCharge={deliveryCharge}
                handlingCharge={handlingCharge}
                discount={discount}
                grandTotal={grandTotal}
                deliveryOption={deliveryOption}
                deliveryConfig={deliveryConfig}
              />
            </div>

            <section className="mb-4 rounded-2xl border border-line bg-panel-2 p-4">
              <h2 className="text-base font-bold text-white">Cancellation Policy</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                Orders cannot be cancelled once packed for delivery. In case of unexpected delays, a
                refund will be provided where applicable.
              </p>
            </section>

            {hasDeliveryAddress ? (
              <button
                type="button"
                onClick={handleCheckout}
                className="mt-4 block w-full rounded-xl bg-brand py-4 text-center text-sm font-semibold text-black transition hover:bg-brand-hover"
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
                className="mt-4 block w-full rounded-xl bg-brand py-4 text-center text-sm font-semibold text-black transition hover:bg-brand-hover"
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
