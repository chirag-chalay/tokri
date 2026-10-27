import { useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { Image } from 'expo-image'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import LoadingView from '../components/LoadingView'
import Icon from '../components/Icon'
import CouponBox from '../components/CouponBox'
import ProductCard from '../components/ProductCard'
import RazorpayCheckout from '../components/RazorpayCheckout'
import PaymentSheet, { PaymentMark, paymentLabel } from '../components/PaymentSheet'
import { useTheme, useThemedStyles } from '../context/ThemeContext'
import { authPost, fetchJson, formatPrice, normalizeProduct, resolveAssetUrl } from '../lib/api'
import { detectInstalledUpiApps, upiAppById } from '../lib/upiApps'
import { useSystemBottomInset } from '../lib/safeArea'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useAddress } from '../context/AddressContext'

const PAY_CHOICE_KEY = 'tokri_pay_choice'
const ONLINE_CHOICES = ['gpay', 'phonepe', 'paytm', 'cred', 'amazon', 'bhim', 'card', 'netbanking', 'wallet']

function moneyValue(value) {
  if (value == null || value === '') return 0
  const amount = typeof value === 'number' ? value : Number(String(value).replace(/[^\d.]/g, ''))
  return Number.isFinite(amount) ? amount : 0
}

function cutoffPrice(item) {
  const price = moneyValue(item.priceValue)
  const oldPrice = moneyValue(item.oldPriceValue) || moneyValue(item.oldPrice)
  return oldPrice > price ? oldPrice : 0
}

export default function CartScreen({ navigation }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const insets = useSafeAreaInsets()
  const bottomInset = useSystemBottomInset()
  const { isLoggedIn, token } = useAuth()
  const { selectedAddress, selectedId, openPicker, refresh } = useAddress()
  const canDeliver = Boolean(selectedAddress && selectedAddress.serviceable !== false)
  const {
    items,
    grandTotal,
    itemsTotal,
    deliveryCharge,
    handlingCharge,
    discount,
    coupon,
    hydrated,
    updateQuantity,
    clearCart,
    refreshCart,
    deliveryOption,
    setDeliveryOption,
    deliveryConfig,
    setDeliveryConfig,
    pinDelivery,
    quote,
    quoteLoading,
    quoteError,
    refreshDeliveryQuote,
  } = useCart()
  const [suggested, setSuggested] = useState([])
  const [onlineEnabled, setOnlineEnabled] = useState(false)
  const [codEnabled, setCodEnabled] = useState(true)
  const [payChoice, setPayChoice] = useState(null)
  const [paySheet, setPaySheet] = useState(false)
  const [paying, setPaying] = useState(false)
  const [notice, setNotice] = useState('')
  const [razorpayConfig, setRazorpayConfig] = useState(null)
  const [installedUpiIds, setInstalledUpiIds] = useState([])
  const paymentWait = useRef(null)

  useEffect(() => navigation.addListener('focus', () => {
    refreshDeliveryQuote?.().catch(() => {})
  }), [navigation, refreshDeliveryQuote])

  useEffect(() => {
    let ignore = false
    Promise.all([
      fetchJson('/checkout/config'),
      AsyncStorage.getItem(PAY_CHOICE_KEY).catch(() => null),
      detectInstalledUpiApps().catch(() => []),
    ])
      .then(([config, saved, upiApps]) => {
        if (ignore) return
        const online = Boolean(config?.razorpay?.enabled)
        const cod = config?.codEnabled !== false
        const upiIds = (upiApps || []).map((app) => app.id)
        setOnlineEnabled(online)
        setCodEnabled(cod)
        setInstalledUpiIds(upiIds)
        if (config?.delivery) setDeliveryConfig?.(config.delivery)
        const savedOk =
          (saved === 'cod' && cod) ||
          (online && ONLINE_CHOICES.includes(saved) && (!upiAppById(saved) || upiIds.includes(saved)))
        const defaultUpi = upiIds[0] || 'gpay'
        setPayChoice(savedOk ? saved : online ? defaultUpi : cod ? 'cod' : null)
      })
      .catch(() => {})
    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    if (isLoggedIn) refresh().catch(() => {})
  }, [isLoggedIn, token, refresh])

  const choosePayment = (choice) => {
    setPayChoice(choice)
    setPaySheet(false)
    setNotice('')
    AsyncStorage.setItem(PAY_CHOICE_KEY, choice).catch(() => {})
  }

  const openRazorpay = (config) => new Promise((resolve, reject) => {
    paymentWait.current = { resolve, reject }
    setRazorpayConfig(config)
  })

  const finishRazorpay = (result) => {
    const wait = paymentWait.current
    paymentWait.current = null
    setRazorpayConfig(null)
    if (!wait) return
    if (result?.ok && result.response) wait.resolve(result.response)
    else if (result?.ok && result.intentStarted) wait.resolve(result)
    else if (result?.cancelled) wait.reject(new Error('Payment cancelled.'))
    else wait.reject(new Error(result?.message || 'Payment failed. Please try again.'))
  }

  const verifyPayment = (orderNo, payment) =>
    authPost('/checkout/verify-payment', token, {
      orderNo,
      razorpayOrderId: payment.razorpay_order_id,
      razorpayPaymentId: payment.razorpay_payment_id,
      razorpaySignature: payment.razorpay_signature,
    })

  const itemSavings = useMemo(
    () =>
      items.reduce((sum, item) => {
        const oldPrice = cutoffPrice(item)
        if (!oldPrice) return sum
        return sum + (oldPrice - moneyValue(item.priceValue)) * (Number(item.quantity) || 0)
      }, 0),
    [items],
  )
  const couponSavings = Number(discount) || 0
  const selectedQuote = quote?.options?.[deliveryOption]
  const deliverySaved = Number(selectedQuote?.deliverySavings || 0)
  const totalSavings = Math.round((itemSavings + couponSavings + deliverySaved) * 100) / 100
  const itemsOriginal = itemsTotal + itemSavings

  const changeQty = async (slug, quantity) => {
    try {
      await updateQuantity(slug, Math.max(0, quantity))
    } catch (error) {
      Alert.alert('Error', error.message)
    }
  }

  const placeOrder = async () => {
    if (paying) return
    if (quoteLoading || !quote) {
      setNotice(quoteError || 'Calculating delivery charges. Please try again.')
      return
    }
    if (!selectedQuote?.minimumMet) {
      setNotice(selectedQuote?.minimumMessage || 'Minimum order value not met.')
      return
    }
    if (!isLoggedIn) {
      navigation.navigate('Login', { next: 'Checkout' })
      return
    }
    if (!canDeliver) {
      if (selectedAddress?.serviceable === false) setNotice("We don't deliver to this pincode yet.")
      openPicker()
      return
    }
    if (!pinDelivery?.[deliveryOption]?.enabled) {
      setNotice('Please select an available delivery option.')
      return
    }
    if (!payChoice) {
      setPaySheet(true)
      return
    }

    setNotice('')
    setPaying(true)
    try {
      const currentQuote = await refreshDeliveryQuote()
      const currentOption = currentQuote?.options?.[deliveryOption]
      if (!currentOption?.minimumMet) {
        throw new Error(currentOption?.minimumMessage || 'This delivery option is not available for this order.')
      }
      const isUpi = Boolean(upiAppById(payChoice))
      const checkout = await authPost('/checkout/create-order', token, {
        addressId: selectedId,
        paymentMode: payChoice === 'cod' ? 'cod' : 'online',
        upiApp: isUpi ? payChoice : undefined,
        items: items.map((item) => ({ slug: item.slug, quantity: item.quantity })),
        couponCode: coupon?.code || undefined,
        deliveryOption,
      })
      const orderNo = checkout.order.orderNo

      if (payChoice === 'cod') {
        await authPost('/checkout/confirm-cod', token, { orderNo })
      } else if (isUpi) {
        let intent = checkout.intent
        let intentError = checkout.intentError || ''
        if (!intent?.intentUrl) {
          try {
            intent = await authPost('/checkout/upi-intent', token, { orderNo })
          } catch (error) {
            intent = null
            intentError = error.message || intentError
          }
        }

        if (intent?.intentUrl) {
          navigation.navigate('UpiPayment', {
            appId: payChoice,
            intentUrl: intent.intentUrl,
            paymentId: intent.paymentId,
            orderNo,
            amount: checkout.order.grandTotal,
          })
          return
        }

        throw new Error(
          intentError ||
            'UPI Intent link was not returned by Razorpay. Ask Razorpay support to enable S2S UPI Intent on this account.',
        )
      } else {
        // Cards / netbanking / wallets: standard Razorpay Checkout (not S2S).
        // S2S intent is UPI-only on this account.
        try {
          const payment = await openRazorpay({
            ...checkout.razorpay,
            onlyMethod: payChoice === 'card' ? 'card' : payChoice,
          })
          await verifyPayment(orderNo, payment)
        } catch (error) {
          const synced = await authPost('/checkout/sync-payment', token, { orderNo }).catch(() => null)
          if (synced?.status !== 'paid') throw error
        }
      }

      await clearCart()
      await refreshCart()
      navigation.navigate('Orders')
    } catch (error) {
      setNotice(error.message || 'Could not complete checkout.')
    } finally {
      setPaying(false)
    }
  }

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack()
    else navigation.navigate('Home')
  }

  const addressTitle = !isLoggedIn
    ? 'Login to continue'
    : selectedAddress
      ? selectedAddress.label || 'Saved address'
      : 'Add a delivery address'
  const addressLine = !isLoggedIn
    ? 'Log in to pick a delivery address'
    : selectedAddress
      ? selectedAddress.serviceable === false
        ? "We don't deliver to this pincode yet"
        : selectedAddress.formatted
      : 'Tap Change to select or add an address'
  const actionLabel = !isLoggedIn ? 'Login to proceed' : !canDeliver ? 'Add address' : 'Place Order'

  useEffect(() => {
    if (!items.length) {
      setSuggested([])
      return undefined
    }
    let ignore = false
    const inCart = new Set(items.map((item) => item.slug))
    fetchJson('/app/bootstrap')
      .then((data) => {
        if (ignore) return
        const list = (data.bestSellers || [])
          .map(normalizeProduct)
          .filter((product) => product.slug && !inCart.has(product.slug))
          .slice(0, 10)
        setSuggested(list)
      })
      .catch(() => {
        if (!ignore) setSuggested([])
      })
    return () => {
      ignore = true
    }
  }, [items])

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={goBack} hitSlop={12} style={styles.topBack}>
          <Icon name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.topTitle}>Checkout</Text>
      </View>
      {!hydrated ? (
        <LoadingView />
      ) : !items.length ? (
        <View style={styles.center}>
          <Icon name="cart-outline" size={42} color={colors.muted} />
          <Text style={styles.empty}>Your cart is empty</Text>
          <Pressable style={styles.button} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.buttonText}>Shop now</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.scroller}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {items.map((item) => (
              <View key={item.slug} style={styles.row}>
                <Image source={{ uri: resolveAssetUrl(item.image) || item.image }} style={styles.image} contentFit="cover" />
                <View style={styles.info}>
                  <Text style={styles.name}>{item.name}</Text>
                  {item.weight ? <Text style={styles.weight}>{item.weight}</Text> : null}
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>{formatPrice(item.priceValue)}</Text>
                    {cutoffPrice(item) ? <Text style={styles.cutPrice}>{formatPrice(cutoffPrice(item))}</Text> : null}
                  </View>
                  <View style={styles.qtyRow}>
                    <Pressable style={styles.qtyBtn} onPress={() => changeQty(item.slug, item.quantity - 1)}>
                      <Text style={styles.qtyBtnText}>-</Text>
                    </Pressable>
                    <Text style={styles.qty}>{item.quantity}</Text>
                    <Pressable style={styles.qtyBtn} onPress={() => changeQty(item.slug, item.quantity + 1)}>
                      <Text style={styles.qtyBtnText}>+</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}

            {suggested.length ? (
              <View style={styles.likeSection}>
                <Text style={styles.likeTitle}>You may also like</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.likeRow}
                >
                  {suggested.map((product) => (
                    <View key={product.slug} style={styles.likeCard}>
                      <ProductCard
                        product={product}
                        compact
                        onPress={(slug, origin) => navigation.navigate('Product', { slug, origin })}
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            <CouponBox />

            {selectedAddress ? (
              <View style={styles.optionCard}>
                <Text style={styles.billTitle}>Delivery option</Text>
                {['morning', 'express'].map((optionId) => {
                  const copy = quote?.options?.[optionId] || deliveryConfig?.[optionId] || {}
                  const enabled = Boolean(pinDelivery?.[optionId]?.enabled)
                  const comingSoon = !enabled
                  const selected = deliveryOption === optionId && enabled
                  return (
                    <Pressable
                      key={optionId}
                      disabled={comingSoon}
                      onPress={() => enabled && setDeliveryOption(optionId)}
                      style={[
                        styles.optionRow,
                        selected && styles.optionRowOn,
                        comingSoon && styles.optionRowSoon,
                      ]}
                    >
                      <View style={[styles.optionDot, selected && styles.optionDotOn]} />
                      <View style={styles.optionCopy}>
                        <Text style={styles.optionTitle}>
                          {copy.title}
                          {comingSoon ? ' (coming soon)' : ''}
                          {!comingSoon ? quoteLoading ? ' — Calculating…' : ` — ${formatPrice(copy.deliveryFee)}` : ''}
                        </Text>
                        {copy.subtitle ? <Text style={styles.optionSub}>{copy.subtitle}</Text> : null}
                        {copy.minimumMessage ? <Text style={styles.optionSub}>{copy.minimumMessage}</Text> : null}
                      </View>
                    </Pressable>
                  )
                })}
              </View>
            ) : null}

            <View style={styles.billCard}>
              <Text style={styles.billTitle}>Bill details</Text>
              <BillRow
                icon="receipt-outline"
                label="Items total"
                value={formatPrice(itemsTotal)}
                oldValue={itemSavings > 0 ? formatPrice(itemsOriginal) : null}
                badge={itemSavings > 0 ? `Saved ${formatPrice(itemSavings)}` : null}
              />
              <BillRow
                icon="bag-handle-outline"
                label="Cart handling"
                value={formatPrice(handlingCharge)}
              />
              <BillRow
                icon="bicycle-outline"
                label="Delivery charges"
                value={quoteLoading ? 'Calculating…' : deliveryCharge > 0 ? formatPrice(deliveryCharge) : 'FREE'}
                free={!quoteLoading && !deliveryCharge}
              />
              {selectedQuote?.freeAboveMessage ? (
                <Text style={styles.freeNudge}>
                  {selectedQuote.freeAboveMessage}
                </Text>
              ) : selectedQuote?.freeDeliveryApplied && selectedQuote.offerMessage ? (
                <Text style={styles.freeNudge}>{selectedQuote.offerMessage}</Text>
              ) : null}
              {couponSavings > 0 ? (
                <BillRow icon="pricetag-outline" label="Coupon" value={`-${formatPrice(couponSavings)}`} free />
              ) : null}

              <View style={styles.grandRow}>
                <Text style={styles.grandLabel}>Grand total</Text>
                <Text style={styles.grandValue}>{quoteLoading ? 'Calculating…' : formatPrice(grandTotal)}</Text>
              </View>

              {totalSavings > 0 ? (
                <View style={styles.savingsWrap}>
                  <Zigzag color={colors.savingsBg} />
                  <View style={styles.savingsBar}>
                    <Text style={styles.savingsLabel}>Your total savings</Text>
                    <Text style={styles.savingsValue}>{formatPrice(totalSavings)}</Text>
                  </View>
                </View>
              ) : null}
            </View>
          </ScrollView>

          <View style={styles.sticky}>
            <View style={styles.deliverBar}>
              <Icon name="location" size={24} color="#eab308" />
              <View style={styles.deliverCopy}>
                <Text style={styles.deliverTitle} numberOfLines={1}>
                  {isLoggedIn && selectedAddress ? 'Delivering to ' : ''}
                  <Text style={styles.deliverStrong}>{addressTitle}</Text>
                </Text>
                <Text
                  style={[styles.deliverLine, selectedAddress?.serviceable === false && styles.deliverBad]}
                  numberOfLines={1}
                >
                  {addressLine}
                </Text>
              </View>
              <Pressable
                hitSlop={10}
                onPress={() => (isLoggedIn ? openPicker() : navigation.navigate('Login', { next: 'Checkout' }))}
              >
                <Text style={styles.changeText}>{isLoggedIn ? 'Change' : 'Login'}</Text>
              </Pressable>
            </View>

            {notice || quoteError ? <Text style={styles.notice}>{notice || quoteError}</Text> : null}

            <View style={[styles.payBar, { paddingBottom: bottomInset + 10 }]}>
              <Pressable style={styles.payUsing} onPress={() => setPaySheet(true)} disabled={paying}>
                <View style={styles.payUsingTop}>
                  {payChoice ? <PaymentMark choice={payChoice} size={20} /> : null}
                  <Text style={styles.payUsingLabel}>PAY USING</Text>
                  <Icon name="caret-up" size={12} color={colors.muted} />
                </View>
                <Text style={styles.payUsingValue} numberOfLines={1}>
                  {payChoice ? paymentLabel(payChoice) : 'Select'}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.placeBtn, paying && styles.placeBtnBusy]}
                onPress={placeOrder}
                disabled={paying || quoteLoading || !quote || !selectedQuote?.minimumMet}
              >
                <View>
                  <Text style={styles.placeAmount}>{quoteLoading ? 'Calculating…' : formatPrice(grandTotal)}</Text>
                  <Text style={styles.placeTotal}>TOTAL</Text>
                </View>
                {paying ? (
                  <ActivityIndicator color={colors.onBrand} />
                ) : (
                  <View style={styles.placeRight}>
                    <Text style={styles.placeText} numberOfLines={1}>{actionLabel}</Text>
                    <Icon name="caret-forward" size={14} color={colors.onBrand} />
                  </View>
                )}
              </Pressable>
            </View>
          </View>

          <PaymentSheet
            visible={paySheet}
            total={grandTotal}
            choice={payChoice}
            onlineEnabled={onlineEnabled}
            codEnabled={codEnabled}
            installedUpiIds={installedUpiIds}
            onSelect={choosePayment}
            onClose={() => setPaySheet(false)}
          />
          <RazorpayCheckout config={razorpayConfig} onResult={finishRazorpay} />
        </>
      )}
    </View>
  )
}

function BillRow({ icon, label, value, oldValue, badge, free }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  return (
    <View style={styles.billRow}>
      <View style={styles.billLeft}>
        <View style={styles.billLabelRow}>
          {icon ? <Icon name={icon} size={16} color={colors.mint} /> : null}
          <Text style={styles.billLabel}>{label}</Text>
          {badge ? (
            <View style={styles.savedBadge}>
              <Text style={styles.savedBadgeText}>{badge}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <View style={styles.billRight}>
        {oldValue ? <Text style={styles.oldValue}>{oldValue}</Text> : null}
        <Text style={[styles.billValue, free && styles.freeValue]}>{value}</Text>
      </View>
    </View>
  )
}

function Zigzag({ color }) {
  return (
    <View style={{ flexDirection: 'row', height: 8, overflow: 'hidden' }}>
      {Array.from({ length: 28 }).map((_, index) => (
        <View
          key={index}
          style={{
            width: 0,
            height: 0,
            marginLeft: index ? -2 : 0,
            borderStyle: 'solid',
            borderLeftWidth: 7,
            borderRightWidth: 7,
            borderBottomWidth: 8,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: color,
          }}
        />
      ))}
    </View>
  )
}

const createStyles = (c) => ({
  screen: { flex: 1, backgroundColor: c.canvas },
  scroller: { flex: 1 },
  content: { padding: 16, paddingBottom: 20, gap: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  empty: { color: c.muted, marginTop: 12, marginBottom: 16 },
  row: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: c.panel,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: c.line,
  },
  image: { width: 72, height: 72, borderRadius: 12, backgroundColor: c.panel2 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: c.text },
  weight: { color: c.muted, fontSize: 12, marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' },
  price: { color: c.text, fontWeight: '800', fontSize: 15 },
  cutPrice: { color: c.muted, textDecorationLine: 'line-through', fontSize: 13, fontWeight: '600' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: c.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { fontSize: 16, fontWeight: '800', color: c.onBrand },
  qty: { fontSize: 16, fontWeight: '800', color: c.text, minWidth: 18, textAlign: 'center' },
  likeSection: { marginTop: 4, marginBottom: 4 },
  likeTitle: { color: c.text, fontSize: 18, fontWeight: '800', marginBottom: 10 },
  likeRow: { paddingRight: 8 },
  likeCard: { width: 148, marginRight: 8 },
  optionCard: {
    backgroundColor: c.panel,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.line,
    padding: 16,
    gap: 10,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 14,
    padding: 12,
  },
  optionRowOn: { borderColor: c.brand, backgroundColor: c.brand + '14' },
  optionRowSoon: { opacity: 0.55 },
  optionDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: c.muted,
    marginTop: 2,
  },
  optionDotOn: { borderColor: c.brand, backgroundColor: c.brand },
  optionCopy: { flex: 1 },
  optionTitle: { color: c.text, fontWeight: '800', fontSize: 15 },
  optionSub: { color: c.muted, fontSize: 13, marginTop: 2 },
  billCard: {
    backgroundColor: c.panel,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.line,
    paddingTop: 16,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  billTitle: { color: c.text, fontSize: 16, fontWeight: '800', marginBottom: 8 },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  billLeft: { flex: 1, minWidth: 0, paddingRight: 10 },
  billLabelRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  billLabel: { color: c.muted, fontSize: 14 },
  billRight: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 },
  billValue: { color: c.text, fontWeight: '700' },
  oldValue: { color: c.muted, textDecorationLine: 'line-through', fontSize: 13, fontWeight: '600' },
  freeValue: { color: c.savingsText, fontWeight: '800' },
  freeNudge: { color: c.savingsText, fontSize: 12, fontWeight: '700', marginTop: -4, marginBottom: 6 },
  savedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: c.savingsBg,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  savedBadgeText: { color: c.savingsText, fontSize: 10, fontWeight: '800' },
  grandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: c.line,
    paddingTop: 12,
    paddingBottom: 14,
    marginTop: 4,
  },
  grandLabel: { color: c.text, fontSize: 16, fontWeight: '800' },
  grandValue: { color: c.text, fontSize: 16, fontWeight: '800' },
  savingsWrap: { marginHorizontal: -16 },
  savingsBar: {
    backgroundColor: c.savingsBg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  savingsLabel: { color: c.savingsText, fontWeight: '700' },
  savingsValue: { color: c.savingsText, fontWeight: '800' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: c.panel,
    borderBottomWidth: 1,
    borderColor: c.line,
  },
  topBack: { padding: 2 },
  topTitle: { color: c.text, fontSize: 18, fontWeight: '800' },
  sticky: {
    backgroundColor: c.panel,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 },
    elevation: 12,
    overflow: 'hidden',
  },
  deliverBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: c.panel2,
  },
  deliverCopy: { flex: 1, minWidth: 0 },
  deliverTitle: { color: c.text, fontSize: 15 },
  deliverStrong: { fontWeight: '800' },
  deliverLine: { color: c.muted, fontSize: 13, marginTop: 2 },
  deliverBad: { color: c.danger, fontWeight: '700' },
  changeText: { color: c.brand, fontWeight: '800', fontSize: 15 },
  notice: {
    color: c.danger,
    fontWeight: '700',
    fontSize: 13,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  payBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  payUsing: { flex: 1, minWidth: 0 },
  payUsingTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  payUsingLabel: { color: c.muted, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  payUsingValue: { color: c.text, fontSize: 15, fontWeight: '700', marginTop: 4 },
  placeBtn: {
    flex: 1.35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: c.brandDeep,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 54,
  },
  placeBtnBusy: { opacity: 0.8 },
  placeAmount: { color: c.onBrand, fontSize: 16, fontWeight: '800' },
  placeTotal: { color: c.onBrand, fontSize: 10, fontWeight: '700', opacity: 0.85, letterSpacing: 0.5 },
  placeRight: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1, marginLeft: 8 },
  placeText: { color: c.onBrand, fontSize: 15, fontWeight: '800' },
  button: {
    backgroundColor: c.brand,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    minWidth: 160,
    alignItems: 'center',
  },
  buttonText: { color: c.onBrand, fontWeight: '800', fontSize: 16 },
})
