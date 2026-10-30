import { useEffect, useState } from 'react'
import { Link, useNavigate } from '../lib/navigation'
import { Plus } from 'lucide-react'
import Swal from 'sweetalert2'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useAddress } from '../context/AddressContext'
import { authGet, authPost, API_BASE_URL, fetchJson } from '../lib/api'
import { formatPrice, loadRazorpayScript } from '../lib/checkout'
import {
  formatDeliveryCharge,
  mergeDeliveryConfig,
} from '../lib/delivery'
import { addressLabelIcon } from '../components/account/addressLabelIcon'
import AddressFormModal from '../components/account/AddressFormModal'
import CouponBox from '../components/CouponBox'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { user, isLoggedIn } = useAuth()
  const { selectedAddressId: savedAddressId, refreshAddresses, selectAddress } = useAddress()
  const {
    cartItems,
    itemsTotal,
    taxTotal,
    deliveryCharge,
    handlingCharge,
    discount,
    grandTotal,
    coupon,
    deliveryOption,
    setDeliveryOption,
    deliveryConfig,
    setDeliveryConfig,
    pinDelivery,
    quote,
    quoteLoading,
    quoteError,
    refreshDeliveryQuote,
    refreshFreeDelivery,
  } = useCart()

  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [razorpayEnabled, setRazorpayEnabled] = useState(false)
  const [codEnabled, setCodEnabled] = useState(true)
  const [paymentMode, setPaymentMode] = useState('online')
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)

  useEffect(() => {
    let ignore = false

    async function load() {
      setLoading(true)
      try {
        const [config, addressData] = await Promise.all([
          isLoggedIn && user?.token ? authGet('/checkout/config', user) : fetchJson('/checkout/config'),
          isLoggedIn ? authGet('/account/addresses', user) : Promise.resolve({ addresses: [] }),
        ])
        if (ignore) return
        refreshFreeDelivery?.()
        refreshDeliveryQuote?.().catch(() => {})
        const onlineOn = Boolean(config?.razorpay?.enabled)
        const allowCod = config?.codEnabled !== false
        setRazorpayEnabled(onlineOn)
        setCodEnabled(allowCod)
        if (config?.delivery) setDeliveryConfig?.(mergeDeliveryConfig(config.delivery))
        if (onlineOn) setPaymentMode('online')
        else if (allowCod) setPaymentMode('cod')
        const list = addressData.addresses || []
        setAddresses(list)
        const canDeliver = (item) => item && item.serviceable !== false
        const preferred =
          list.find((item) => item.id === savedAddressId && canDeliver(item)) ||
          list.find(canDeliver)
        const preferredId = preferred?.id || ''
        if (preferredId) {
          setSelectedAddressId(preferredId)
          selectAddress?.(preferredId)
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    load()
    return () => {
      ignore = true
    }
  }, [isLoggedIn, user?.phone, savedAddressId])

  const openAddAddress = () => {
    if (!isLoggedIn) {
      Swal.fire({
        icon: 'info',
        title: 'Login required',
        text: 'Please log in to add a delivery address.',
        confirmButtonColor: '#047857',
      })
      return
    }
    setFormOpen(true)
  }

  const handleSaveAddress = async (payload) => {
    setSavingAddress(true)
    try {
      const data = await authPost('/account/addresses', user, payload)
      const created = data.address
      setAddresses((prev) => [...prev, created])
      if (created?.id) {
        setSelectedAddressId(created.id)
        selectAddress?.(created.id)
      }
      await refreshAddresses?.()
      setFormOpen(false)
    } finally {
      setSavingAddress(false)
    }
  }

  const startOnlinePayment = async (checkout) => {
    const loaded = await loadRazorpayScript()
    if (!loaded || !window.Razorpay) {
      throw new Error('Could not load Razorpay. Please try again.')
    }

    const rzp = checkout.razorpay
    const orderNo = checkout.order.orderNo

    const confirmFromRazorpay = async () => {
      const synced = await authPost('/checkout/sync-payment', user, { orderNo })
      if (synced?.status === 'paid') return orderNo
      throw new Error('Payment is still pending.')
    }

    return new Promise((resolve, reject) => {
      const options = {
        key: rzp.keyId,
        amount: rzp.amount,
        currency: rzp.currency,
        name: rzp.name,
        description: rzp.description,
        order_id: rzp.orderId,
        prefill: rzp.prefill,
        theme: { color: '#064e3b' },
        callback_url: `${API_BASE_URL}/checkout/razorpay-callback?orderNo=${encodeURIComponent(orderNo)}`,
        handler: async (response) => {
          try {
            await authPost('/checkout/verify-payment', user, {
              orderNo,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
            resolve(orderNo)
          } catch (error) {
            try {
              resolve(await confirmFromRazorpay())
            } catch {
              reject(error)
            }
          }
        },
        modal: {
          ondismiss: async () => {
            try {
              await new Promise((wait) => setTimeout(wait, 1200))
              resolve(await confirmFromRazorpay())
            } catch {
              reject(new Error('Payment cancelled.'))
            }
          },
        },
      }

      const instance = new window.Razorpay(options)
      instance.on('payment.failed', () => reject(new Error('Payment failed. Please try again.')))
      instance.open()
    })
  }

  const handleCheckout = async () => {
    if (quoteLoading || !quote || !quote.options?.[deliveryOption]?.minimumMet) return
    if (!isLoggedIn) {
      Swal.fire({
        icon: 'info',
        title: 'Login required',
        text: 'Please log in to place your order.',
        confirmButtonColor: '#047857',
      })
      return
    }

    if (!selectedAddressId) {
      Swal.fire({
        icon: 'warning',
        title: 'Select address',
        text: 'Please add and select a delivery address.',
        confirmButtonColor: '#047857',
      })
      return
    }

    const selected = addresses.find((item) => item.id === selectedAddressId)
    const availability = selected?.delivery || pinDelivery
    if (selected?.serviceable === false || availability?.serviceable === false) {
      Swal.fire({
        icon: 'warning',
        title: 'Not deliverable',
        text: "We don't deliver to this pincode yet.",
        confirmButtonColor: '#047857',
      })
      return
    }

    if (!availability?.[deliveryOption]?.enabled) {
      Swal.fire({
        icon: 'warning',
        title: 'Choose delivery',
        text: 'Please select an available delivery option.',
        confirmButtonColor: '#047857',
      })
      return
    }

    setPaying(true)
    try {
      const currentQuote = await refreshDeliveryQuote()
      const currentOption = currentQuote?.options?.[deliveryOption]
      if (!currentOption?.minimumMet) {
        throw new Error(currentOption?.minimumMessage || 'This delivery option is not available for this order.')
      }
      const checkout = await authPost('/checkout/create-order', user, {
        items: cartItems.map((item) => ({ id: item.id, quantity: item.quantity })),
        addressId: selectedAddressId,
        paymentMode,
        couponCode: coupon?.code || undefined,
        deliveryOption,
      })

      let orderNo = checkout.order.orderNo

      if (checkout.razorpay) {
        orderNo = await startOnlinePayment(checkout)
      } else {
        await authPost('/checkout/confirm-cod', user, { orderNo })
      }

      refreshFreeDelivery?.()
      navigate(`/order/${orderNo}`, {
        replace: true,
        state: {
          paymentMode: checkout.razorpay ? 'online' : 'cod',
          confirmed: true,
          expectedDeliveryDate: checkout.order?.expectedDeliveryDate || null,
        },
      })
    } catch (error) {
      setPaying(false)
      Swal.fire({
        icon: 'error',
        title: 'Checkout failed',
        text: error.message || 'Could not complete checkout.',
        confirmButtonColor: '#047857',
      })
    }
  }

  const selectedQuote = quote?.options?.[deliveryOption]
  const itemSavings = cartItems.reduce((sum, item) => {
    const oldPrice = Number(item.oldPriceValue) || Number(String(item.oldPrice || '').replace(/[^0-9.]/g, ''))
    const price = Number(item.priceValue)
    if (!oldPrice || !price || oldPrice <= price) return sum
    return sum + (oldPrice - price) * Number(item.quantity || 0)
  }, 0)
  const totalSavings = Math.round(
    (itemSavings + Number(discount || 0) + Number(selectedQuote?.deliverySavings || 0)) * 100,
  ) / 100

  if (!cartItems.length && !paying) {
    return (
      <main className="min-h-screen bg-canvas py-16">
        <div className="mx-auto max-w-lg px-4 text-center">
          <h1 className="text-2xl font-bold text-white">Nothing to checkout</h1>
          <p className="mt-3 text-muted">Your cart is empty.</p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-black hover:bg-brand-hover"
          >
            Continue shopping
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="account-detail min-h-screen bg-canvas py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to="/cart" className="text-sm font-medium text-mint hover:underline">
            ← Back to cart
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">Checkout</h1>
        </div>

        {!isLoggedIn && (
          <div className="mb-6 rounded-xl border border-amber-700/40 bg-amber-950/40 px-4 py-3 text-sm text-amber-200">
            Please log in to complete your order.
          </div>
        )}

        {!loading && !razorpayEnabled && !codEnabled && (
          <div className="mb-6 rounded-xl border border-amber-700/40 bg-amber-950/40 px-4 py-3 text-sm text-amber-200">
            Checkout is temporarily unavailable. Enable Razorpay or cash on delivery in admin settings.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
          <section className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-white">Delivery address</h2>
              <Link
                to="/account?section=addresses"
                className="text-sm font-semibold text-mint hover:underline"
              >
                Manage addresses
              </Link>
            </div>

            {loading ? (
              <p className="mt-4 text-sm text-muted">Loading addresses...</p>
            ) : addresses.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-line bg-panel-2 p-5 text-sm text-muted">
                No saved address found. Add a delivery address to continue.
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {addresses.map((address) => {
                  const Icon = addressLabelIcon(address.label)
                  const selected = selectedAddressId === address.id
                  const deliverable = address.serviceable !== false
                  return (
                    <li key={address.id}>
                      <label
                        className={`flex items-start gap-3 rounded-xl border p-4 transition ${
                          !deliverable
                            ? 'cursor-not-allowed border-line opacity-60'
                            : selected
                              ? 'cursor-pointer border-brand bg-brand/10'
                              : 'cursor-pointer border-line hover:border-line/80'
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={selected}
                          disabled={!deliverable}
                          onChange={() => {
                            setSelectedAddressId(address.id)
                            selectAddress?.(address.id)
                          }}
                          className="mt-1"
                        />
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-panel-2 text-emerald-400">
                          <Icon size={18} />
                        </span>
                        <span>
                          <span className="block font-semibold text-white">{address.label}</span>
                          <span className="mt-1 block text-sm leading-6 text-muted">
                            {address.formatted}
                          </span>
                          {!deliverable ? (
                            <span className="mt-1 block text-xs text-amber-300">
                              We don't deliver to this pincode yet
                            </span>
                          ) : null}
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            )}

            <button
              type="button"
              onClick={openAddAddress}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-mint transition hover:text-white"
            >
              <Plus size={16} />
              Add new address
            </button>
          </section>

          {selectedAddressId ? (
            <section className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
              <h2 className="text-lg font-bold text-white">Delivery option</h2>
              <p className="mt-1 text-sm text-muted">Morning is selected when it is available for your PIN.</p>
              <fieldset className="mt-4 space-y-3">
                {['morning', 'express'].map((optionId) => {
                  const copy = quote?.options?.[optionId] || deliveryConfig?.[optionId] || {}
                  const availability =
                    addresses.find((item) => item.id === selectedAddressId)?.delivery || pinDelivery
                  const enabled = Boolean(availability?.[optionId]?.enabled)
                  const comingSoon = !enabled
                  const selected = deliveryOption === optionId && enabled
                  return (
                    <label
                      key={optionId}
                      className={`flex items-start gap-3 rounded-xl border p-4 transition ${
                        comingSoon
                          ? 'cursor-not-allowed border-line opacity-60'
                          : selected
                            ? 'cursor-pointer border-brand bg-brand/10'
                            : 'cursor-pointer border-line hover:border-line/80'
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryOption"
                        className="mt-1"
                        checked={selected}
                        disabled={comingSoon}
                        onChange={() => {
                          if (enabled) setDeliveryOption(optionId)
                        }}
                      />
                      <span>
                        <span className="block font-semibold text-white">
                          {copy.title}
                          {comingSoon ? ' (coming soon)' : quote
                            ? ` — ${formatDeliveryCharge(copy.deliveryFee)}`
                            : ' — Calculating…'}
                        </span>
                        {copy.subtitle ? (
                          <span className="mt-1 block text-sm text-muted">{copy.subtitle}</span>
                        ) : null}
                        {copy.minimumMessage ? (
                          <span className="mt-1 block text-sm text-muted">{copy.minimumMessage}</span>
                        ) : null}
                      </span>
                    </label>
                  )
                })}
              </fieldset>
            </section>
          ) : null}
          </div>

          <aside className="h-fit rounded-2xl border border-line bg-panel p-5 sm:p-6">
            <h2 className="text-lg font-bold text-white">Order summary</h2>
            <div className="mt-4">
              <CouponBox compact />
            </div>
            <ul className="mt-4 space-y-3 border-b border-line pb-4">
              {cartItems.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
                  <span className="text-muted">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium text-white">
                    {formatPrice(item.priceValue * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-2 text-sm text-muted">
              <div className="flex justify-between">
                <span>Item total</span>
                <span>{formatPrice(itemsTotal)}</span>
              </div>
              {taxTotal > 0 && (
                <div className="flex justify-between">
                  <span>Taxes & GST</span>
                  <span>{formatPrice(taxTotal)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Cart handling</span>
                <span>{formatPrice(handlingCharge)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery charges</span>
                <span className={deliveryCharge > 0 ? '' : 'text-mint'}>
                  {quoteLoading ? 'Calculating…' : formatDeliveryCharge(deliveryCharge)}
                </span>
              </div>
              {selectedQuote?.freeDeliveryApplied && selectedQuote.offerMessage ? (
                <p className="text-xs text-mint">
                  {selectedQuote.offerMessage}
                </p>
              ) : selectedQuote?.freeAboveMessage ? (
                <p className="text-xs text-mint">
                  {selectedQuote.freeAboveMessage}
                </p>
              ) : null}
              {discount > 0 && (
                <div className="flex justify-between text-mint">
                  <span>Coupon discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-lg font-bold text-white">
              <span>Total</span>
              <span>{quoteLoading ? 'Calculating…' : formatPrice(grandTotal)}</span>
            </div>
            {totalSavings > 0 && (
              <div className="mt-3 rounded-xl bg-emerald-950/60 px-3 py-2 text-sm font-semibold text-mint">
                You saved {formatPrice(totalSavings)}
              </div>
            )}

            {(razorpayEnabled || codEnabled) && (
              <fieldset className="mt-4 space-y-2">
                <legend className="text-sm font-semibold text-white">Payment</legend>
                {razorpayEnabled && (
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line px-3 py-2 text-sm text-white">
                    <input
                      type="radio"
                      name="paymentMode"
                      checked={paymentMode === 'online'}
                      onChange={() => setPaymentMode('online')}
                    />
                    Pay online
                  </label>
                )}
                {codEnabled && (
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line px-3 py-2 text-sm text-white">
                    <input
                      type="radio"
                      name="paymentMode"
                      checked={paymentMode === 'cod'}
                      onChange={() => setPaymentMode('cod')}
                    />
                    Cash on delivery
                  </label>
                )}
              </fieldset>
            )}

            {/* Contextual guidance if checkout CTA is disabled */}
            {!isLoggedIn ? (
              <p className="mt-3 text-xs text-amber-300 text-center font-medium">
                Please log in to complete your order
              </p>
            ) : !addresses.length ? (
              <p className="mt-3 text-xs text-amber-300 text-center font-medium">
                Add a delivery address to proceed
              </p>
            ) : !selectedQuote?.minimumMet ? (
              <p className="mt-3 text-xs text-amber-300 text-center font-medium">
                Minimum order amount not met
              </p>
            ) : null}

            <button
              type="button"
              onClick={handleCheckout}
              disabled={
                paying ||
                quoteLoading ||
                !quote ||
                !selectedQuote?.minimumMet ||
                loading ||
                !isLoggedIn ||
                !addresses.length ||
                (!razorpayEnabled && !codEnabled) ||
                (addresses.find((item) => item.id === selectedAddressId)?.delivery || pinDelivery)?.serviceable === false ||
                !(addresses.find((item) => item.id === selectedAddressId)?.delivery || pinDelivery)?.[deliveryOption]?.enabled
              }
              className="mt-5 w-full rounded-full bg-brand py-3.5 text-sm font-semibold text-black transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {paying
                ? 'Processing...'
                : paymentMode === 'online'
                  ? `Pay ${quoteLoading ? 'Calculating…' : formatPrice(grandTotal)}`
                  : 'Place order (Cash on delivery)'}
            </button>
            {quoteError ? <p className="mt-2 text-sm text-rose-400">{quoteError}</p> : null}
          </aside>
        </div>
      </div>

      {formOpen ? (
        <AddressFormModal
          defaultPhone={user?.phone || ''}
          defaultName={user?.name || ''}
          saving={savingAddress}
          onClose={() => setFormOpen(false)}
          onSave={handleSaveAddress}
        />
      ) : null}
    </main>
  )
}
