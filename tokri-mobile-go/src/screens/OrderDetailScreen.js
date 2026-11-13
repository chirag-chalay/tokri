import { useCallback, useEffect, useState } from 'react'
import { Alert, Clipboard, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icon from '../components/Icon'
import LoadingView from '../components/LoadingView'
import RemoteImage from '../components/RemoteImage'
import { useTheme, useThemedStyles } from '../context/ThemeContext'
import { authGet, formatPrice, normalizeOrder } from '../lib/api'
import { formatOrderWhen, paymentLabel, statusLabel } from '../lib/orders'
import { formatExpectedDeliveryDate } from '../lib/delivery'
import { downloadOrderInvoice } from '../lib/invoice'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function OrderDetailScreen({ navigation, route }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const insets = useSafeAreaInsets()
  const { token } = useAuth()
  const { addItem } = useCart()
  const orderNo = route.params?.orderNo
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloadingInvoice, setDownloadingInvoice] = useState(false)

  const load = useCallback(async () => {
    const data = await authGet(`/account/orders/${encodeURIComponent(orderNo)}`, token)
    setOrder(normalizeOrder(data.order))
  }, [orderNo, token])

  useEffect(() => {
    load()
      .catch((error) => Alert.alert('Error', error.message))
      .finally(() => setLoading(false))
  }, [load])

  const repeatOrder = async () => {
    try {
      for (const item of order.items || []) {
        const slug = item.slug
        if (slug) await addItem(slug, item.quantity || 1, item)
      }
      navigation.navigate('Main', { screen: 'Cart' })
    } catch (error) {
      Alert.alert('Could not repeat order', error.message)
    }
  }

  const rateOrder = () => {
    Alert.alert('Rate order', 'How were your ordered items?', [
      { text: 'Not now', style: 'cancel' },
      { text: '★★★★★ Great', onPress: () => Alert.alert('Thanks', 'Thanks for rating your order.') },
      { text: '★★★ Okay', onPress: () => Alert.alert('Thanks', 'Thanks for your feedback.') },
    ])
  }

  const shareInvoice = async () => {
    setDownloadingInvoice(true)
    try {
      await downloadOrderInvoice(order.orderNo, token)
    } catch (error) {
      Alert.alert('Invoice unavailable', error.message || 'Could not download this invoice.')
    } finally {
      setDownloadingInvoice(false)
    }
  }

  if (loading) return <LoadingView />
  if (!order) return null

  const arrived = String(order.status).toLowerCase() === 'delivered'

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Pressable style={styles.back} onPress={() => navigation.goBack()} hitSlop={12}>
        <Icon name="chevron-back" size={22} color={colors.text} />
      </Pressable>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Order summary</Text>
        <Text style={styles.arrived}>
          {arrived ? `Arrived at ${formatOrderWhen(order.createdAt).split(', ')[1] || ''}` : statusLabel(order)}
        </Text>
        {formatExpectedDeliveryDate(order.expectedDeliveryDate) ? (
          <Text style={styles.arrived}>Expected delivery: {formatExpectedDeliveryDate(order.expectedDeliveryDate)}</Text>
        ) : null}
        <Pressable
          style={styles.invoiceLink}
          disabled={downloadingInvoice}
          onPress={shareInvoice}
        >
          <Text style={styles.invoiceText}>
            {downloadingInvoice ? 'Preparing invoice…' : 'Download Invoice'}
          </Text>
          <Icon name="download-outline" size={16} color={colors.brand} />
        </Pressable>

        <Text style={styles.itemCount}>
          {order.itemCount} item{order.itemCount === 1 ? '' : 's'} in this order
        </Text>
        {(order.items || []).map((item) => (
          <View key={item.id || item.slug} style={styles.itemRow}>
            <RemoteImage uri={item.image} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.itemQty}>
                {item.weight || '1 unit'} x {item.quantity}
              </Text>
            </View>
            <View style={styles.itemPriceWrap}>
              {item.oldPriceValue && item.oldPriceValue > item.priceValue ? (
                <Text style={styles.oldPrice}>{formatPrice(item.oldPriceValue)}</Text>
              ) : null}
              <Text style={styles.itemPrice}>{formatPrice(item.lineTotal || item.priceValue * item.quantity)}</Text>
            </View>
          </View>
        ))}

        <View style={styles.rateBar}>
          <View style={styles.starBox}>
            <Icon name="star" size={18} color="#fbbf24" />
          </View>
          <Text style={styles.rateCopy}>How were your ordered items?</Text>
          <Pressable style={styles.rateNow} onPress={rateOrder}>
            <Text style={styles.rateNowText}>Rate now</Text>
          </Pressable>
        </View>

        <Text style={styles.blockTitle}>Bill details</Text>
        <BillRow label={`Item total${order.gstIncluded ? ' (GST included)' : ''}`} value={formatPrice(order.itemsTotal)} />
        {Number(order.taxTotal) > 0 ? order.gstIncluded ? order.isInterState ? (
          <BillRow label="IGST included" value={formatPrice(order.igstTotal)} />
        ) : (
          <>
            <BillRow label="CGST included" value={formatPrice(order.cgstTotal)} />
            <BillRow label="SGST included" value={formatPrice(order.sgstTotal)} />
          </>
        ) : (
          <BillRow label="Taxes & GST" value={formatPrice(order.taxTotal)} />
        ) : null}
        <BillRow label="Cart handling" value={`+${formatPrice(order.handlingCharge)}`} />
        <BillRow
          label="Delivery charges"
          value={Number(order.deliveryCharge) ? formatPrice(order.deliveryCharge) : 'FREE'}
        />
        {Number(order.discount) ? (
          <BillRow label={order.automaticDiscount ? `Automatic discount (${order.automaticDiscount.percentage}%)${order.couponCode ? " + shipping coupon" : ""}` : "Coupon discount"} value={`-${formatPrice(order.discount)}`} discount />
        ) : null}
        <BillRow label="Bill total" value={formatPrice(order.grandTotal)} bold />

        <Text style={[styles.blockTitle, { marginTop: 22 }]}>Order details</Text>
        <Text style={styles.detailLabel}>Order id</Text>
        <View style={styles.orderIdRow}>
          <Text style={styles.detailValue}>{order.orderNo}</Text>
          <Pressable
            onPress={() => {
              Clipboard.setString(order.orderNo)
              Alert.alert('Copied', 'Order id copied.')
            }}
            hitSlop={10}
            style={styles.copyBtn}
          >
            <Icon name="copy-outline" size={16} color={colors.brand} />
          </Pressable>
        </View>
        {formatExpectedDeliveryDate(order.expectedDeliveryDate) ? (
          <>
            <Text style={styles.detailLabel}>Expected delivery</Text>
            <Text style={styles.detailValue}>{formatExpectedDeliveryDate(order.expectedDeliveryDate)}</Text>
          </>
        ) : null}
        <Text style={styles.detailLabel}>Payment</Text>
        <Text style={styles.detailValue}>{paymentLabel(order)}</Text>
        {order.address?.formatted ? (
          <>
            <Text style={styles.detailLabel}>Deliver to</Text>
            <Text style={styles.detailValue}>{order.address.formatted}</Text>
          </>
        ) : null}
        <View style={{ height: 88 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: 12 + insets.bottom }]}>
        <Pressable style={styles.repeat} onPress={repeatOrder}>
          <Text style={styles.repeatTitle}>Repeat Order</Text>
          <Text style={styles.repeatSub}>VIEW CART ON NEXT STEP</Text>
        </Pressable>
      </View>
    </View>
  )
}

function BillRow({ label, value, bold, discount }) {
  const styles = useThemedStyles(createStyles)
  return (
    <View style={styles.billRow}>
      <Text style={[styles.billLabel, bold && styles.billBold, discount && styles.discount]}>{label}</Text>
      <Text style={[styles.billValue, bold && styles.billBold, discount && styles.discount]}>{value}</Text>
    </View>
  )
}

const createStyles = (c) => ({
  screen: { flex: 1, backgroundColor: c.canvas },
  back: {
    marginLeft: 16,
    marginTop: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: c.panel2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: 16, paddingTop: 8 },
  title: { color: c.text, fontSize: 28, fontWeight: '800' },
  arrived: { color: c.muted, marginTop: 4 },
  invoiceLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, marginBottom: 18 },
  invoiceText: { color: c.brand, fontWeight: '800' },
  itemCount: { color: c.text, fontWeight: '800', fontSize: 16, marginBottom: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  itemImage: { width: 54, height: 54, borderRadius: 10, backgroundColor: c.panel2 },
  itemInfo: { flex: 1 },
  itemName: { color: c.text, fontWeight: '700' },
  itemQty: { color: c.muted, marginTop: 4, fontSize: 12 },
  itemPriceWrap: { alignItems: 'flex-end' },
  oldPrice: { color: c.muted, textDecorationLine: 'line-through', fontSize: 12 },
  itemPrice: { color: c.text, fontWeight: '800' },
  rateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.panel,
    borderRadius: 12,
    padding: 10,
    gap: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: c.line,
  },
  starBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: c.panel2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateCopy: { flex: 1, color: c.text, fontWeight: '700' },
  rateNow: {
    backgroundColor: c.brand,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  rateNowText: { color: c.onBrand, fontWeight: '800', fontSize: 12 },
  blockTitle: { color: c.text, fontSize: 18, fontWeight: '800', marginTop: 16, marginBottom: 10 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  billLabel: { color: c.muted },
  billValue: { color: c.text },
  billBold: { color: c.text, fontWeight: '800', fontSize: 16 },
  discount: { color: '#60a5fa' },
  detailLabel: { color: c.muted, fontSize: 12, marginTop: 10 },
  orderIdRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  detailValue: { color: c.text, fontWeight: '700' },
  copyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.panel2,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: c.line,
    backgroundColor: c.canvas,
  },
  repeat: {
    backgroundColor: c.brand,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  repeatTitle: { color: '#fff', fontWeight: '800', fontSize: 18 },
  repeatSub: { color: '#d1fae5', fontSize: 10, fontWeight: '800', marginTop: 2, letterSpacing: 0.4 },
})
