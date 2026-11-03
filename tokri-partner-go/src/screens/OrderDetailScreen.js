import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useAuth } from '../context/AuthContext'
import {
  collectCash,
  createPaymentQr,
  fetchPartnerOrder,
  resolveAssetUrl,
} from '../lib/api'
import {
  formatDeliveryOption,
  formatExpectedDeliveryDate,
  formatOrderDate,
  formatOrderStatus,
  canCollectPayment,
  formatPaymentStatus,
  paymentTone,
  statusTone,
} from '../lib/format'
import { COLORS } from '../config'

function money(value) {
  return `₹${Number(value || 0).toFixed(0)}`
}

function mapsUrl(order) {
  const lat = order.latitude ?? order.address?.latitude
  const lng = order.longitude ?? order.address?.longitude
  if (lat != null && lng != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
  }
  const parts = [
    order.address?.line1,
    order.address?.line2,
    order.address?.landmark,
    order.address?.city,
    order.address?.pincode,
  ]
    .filter(Boolean)
    .join(', ')
  if (!parts) return null
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts)}`
}

export default function OrderDetailScreen({ route, navigation }) {
  const { orderId, order: initialOrder } = route.params
  const { token } = useAuth()
  const [order, setOrder] = useState(initialOrder || null)
  const [loading, setLoading] = useState(!initialOrder)
  const [busy, setBusy] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const [error, setError] = useState('')
  const pollRef = useRef(null)

  const load = useCallback(async () => {
    setError('')
    try {
      const data = await fetchPartnerOrder(token, orderId)
      setOrder(data.order)
      navigation.setOptions({ title: data.order?.orderNo || 'Order' })
      return data.order
    } catch (err) {
      setError(err.message || 'Could not load order')
      return null
    } finally {
      setLoading(false)
    }
  }, [token, orderId, navigation])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load]),
  )

  useEffect(() => {
    if (!qrOpen) {
      if (pollRef.current) clearInterval(pollRef.current)
      return undefined
    }
    pollRef.current = setInterval(async () => {
      const next = await load()
      if (next?.paymentStatus === 'paid') {
        setQrOpen(false)
        Alert.alert('Paid', 'Customer paid via QR. Order marked delivered.')
      }
    }, 3000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [qrOpen, load])

  async function onCollectCash() {
    Alert.alert('Cash received?', `Confirm you collected ${money(order.grandTotal)} in cash.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes, collected',
        onPress: async () => {
          setBusy(true)
          try {
            const data = await collectCash(token, orderId)
            setOrder(data.order)
            Alert.alert('Done', 'Marked paid and delivered.')
          } catch (err) {
            Alert.alert('Could not collect', err.message || 'Try again')
          } finally {
            setBusy(false)
          }
        },
      },
    ])
  }

  async function onShowQr() {
    setBusy(true)
    try {
      const data = await createPaymentQr(token, orderId)
      setOrder(data.order)
      setQrOpen(true)
    } catch (err) {
      Alert.alert('QR unavailable', err.message || 'Try again')
    } finally {
      setBusy(false)
    }
  }

  if (loading || !order) {
    return (
      <View style={styles.center}>
        {loading ? <ActivityIndicator color={COLORS.brand} /> : <Text style={styles.error}>{error || 'Not found'}</Text>}
      </View>
    )
  }

  const cancelled = String(order.status || '').toLowerCase() === 'cancelled'
  const collectable = canCollectPayment(order)
  const paid = String(order.paymentStatus || '').toLowerCase() === 'paid'
  const phone = order.customerPhone || order.address?.phone
  const map = mapsUrl(order)
  const tone = statusTone(order.status)
  const payTone = paymentTone(order.paymentStatus)
  const orderedOn = formatOrderDate(order.createdAt)
  const deliverOn = formatExpectedDeliveryDate(order.expectedDeliveryDate)
  const deliveryLabel = formatDeliveryOption(order.deliveryOption)

  return (
    <>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusBlock}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Order status</Text>
            <Text style={[styles.badge, styles[`badge_${tone}`]]}>{formatOrderStatus(order.status)}</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Payment status</Text>
            <Text style={[styles.badge, styles[`badge_${payTone}`]]}>
              {formatPaymentStatus(order.paymentStatus)}
            </Text>
          </View>
        </View>
        {cancelled ? (
          <Text style={styles.cancelledNote}>This order was cancelled. Do not collect payment or deliver.</Text>
        ) : (
          <Text style={styles.status}>
            {paid
              ? `Collected as ${order.paymentCollectedAs || 'paid'}`
              : 'COD · waiting for payment'}
          </Text>
        )}
        <Text style={styles.total}>{money(order.grandTotal)}</Text>
        <Text style={styles.meta}>Ordered {orderedOn || '—'}</Text>
        {deliverOn ? <Text style={styles.meta}>Expected delivery {deliverOn}</Text> : null}
        {deliveryLabel ? <Text style={styles.meta}>Delivery option: {deliveryLabel}</Text> : null}

        <Text style={styles.section}>Customer</Text>
        <Text style={styles.name}>{order.customerName}</Text>
        {order.address ? (
          <Text style={styles.meta}>
            {[order.address.line1, order.address.line2, order.address.landmark, order.address.city, order.address.pincode]
              .filter(Boolean)
              .join(', ')}
          </Text>
        ) : null}

        <View style={styles.actions}>
          {phone ? (
            <Pressable style={styles.secondary} onPress={() => Linking.openURL(`tel:${phone}`)}>
              <Text style={styles.secondaryText}>Call</Text>
            </Pressable>
          ) : null}
          {map ? (
            <Pressable style={styles.secondary} onPress={() => Linking.openURL(map)}>
              <Text style={styles.secondaryText}>Maps</Text>
            </Pressable>
          ) : null}
        </View>

        <Text style={styles.section}>Items</Text>
        {(order.items || []).map((item) => (
          <View key={item.id} style={styles.itemRow}>
            {item.image ? (
              <Image source={{ uri: resolveAssetUrl(item.image) }} style={styles.thumb} />
            ) : (
              <View style={[styles.thumb, styles.thumbEmpty]} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.meta}>
                qty {item.quantity}
                {item.weight ? ` · ${item.weight}` : ''}
              </Text>
            </View>
            <Text style={styles.itemPrice}>{money(item.priceValue * item.quantity)}</Text>
          </View>
        ))}

        {cancelled ? (
          <View style={styles.cancelledBox}>
            <Text style={styles.cancelledBoxText}>Order cancelled — payment collection is closed.</Text>
          </View>
        ) : collectable ? (
          <View style={styles.payBox}>
            <Pressable style={[styles.primary, busy && styles.disabled]} disabled={busy} onPress={onCollectCash}>
              <Text style={styles.primaryText}>Cash received</Text>
            </Pressable>
            <Pressable style={[styles.outline, busy && styles.disabled]} disabled={busy} onPress={onShowQr}>
              <Text style={styles.outlineText}>Show QR</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.doneBox}>
            <Text style={styles.doneText}>
              {paid ? 'Payment complete. Order delivered.' : 'Payment collection not available.'}
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={qrOpen} animationType="slide" transparent onRequestClose={() => setQrOpen(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Ask customer to scan</Text>
            <Text style={styles.meta}>Amount {money(order.grandTotal)} · auto-refreshes</Text>
            {order.razorpayQrUrl ? (
              <Image source={{ uri: order.razorpayQrUrl }} style={styles.qr} resizeMode="contain" />
            ) : (
              <Text style={styles.error}>QR image missing</Text>
            )}
            <Pressable style={styles.outline} onPress={() => setQrOpen(false)}>
              <Text style={styles.outlineText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  content: { padding: 16, paddingBottom: 48 },
  statusBlock: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  statusItem: { gap: 6 },
  statusLabel: { fontSize: 12, fontWeight: '700', color: COLORS.muted, letterSpacing: 0.2 },
  status: { color: COLORS.muted, fontWeight: '600', marginTop: 10 },
  badge: { fontSize: 12, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  badge_muted: { backgroundColor: '#e2e8f0', color: COLORS.muted },
  badge_warning: { backgroundColor: '#fef3c7', color: COLORS.warning },
  badge_success: { backgroundColor: '#dcfce7', color: COLORS.success },
  badge_danger: { backgroundColor: '#fee2e2', color: COLORS.danger },
  total: { fontSize: 34, fontWeight: '800', color: COLORS.ink, marginTop: 6, marginBottom: 8 },
  section: { marginTop: 18, marginBottom: 8, fontWeight: '800', color: COLORS.text, fontSize: 13, letterSpacing: 0.4 },
  name: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  meta: { color: COLORS.muted, marginTop: 4, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  secondary: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.brand,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryText: { color: COLORS.brandDeep, fontWeight: '700' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  thumb: { width: 48, height: 48, backgroundColor: COLORS.panel2 },
  thumbEmpty: { borderWidth: 1, borderColor: COLORS.line },
  itemName: { fontWeight: '600', color: COLORS.text },
  itemPrice: { fontWeight: '700', color: COLORS.text },
  payBox: { marginTop: 28, gap: 10 },
  primary: { backgroundColor: COLORS.brand, paddingVertical: 16, alignItems: 'center' },
  primaryText: { color: COLORS.onBrand, fontWeight: '800', fontSize: 16 },
  outline: { borderWidth: 1, borderColor: COLORS.line, paddingVertical: 14, alignItems: 'center' },
  outlineText: { color: COLORS.text, fontWeight: '700' },
  disabled: { opacity: 0.6 },
  doneBox: { marginTop: 28, backgroundColor: '#dcfce7', padding: 16 },
  doneText: { color: COLORS.success, fontWeight: '700' },
  cancelledNote: { marginTop: 10, color: COLORS.danger, fontWeight: '700' },
  cancelledBox: { marginTop: 28, backgroundColor: '#fee2e2', padding: 16 },
  cancelledBoxText: { color: COLORS.danger, fontWeight: '700' },
  error: { color: COLORS.danger },
  modalBg: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  modalCard: { backgroundColor: COLORS.panel, padding: 20, paddingBottom: 36 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.ink },
  qr: { width: 260, height: 260, alignSelf: 'center', marginVertical: 20 },
})
