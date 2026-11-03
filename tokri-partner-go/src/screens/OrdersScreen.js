import { useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useAuth } from '../context/AuthContext'
import { fetchPartnerOrders } from '../lib/api'
import {
  filterRecentOrders,
  formatDeliveryOption,
  formatExpectedDeliveryDate,
  formatOrderDate,
  formatOrderStatus,
  formatPaymentStatus,
  paginate,
  paymentTone,
  statusTone,
} from '../lib/format'
import { COLORS, IS_LIVE_API } from '../config'

const PER_PAGE = 10
const RECENT_DAYS = 4

function money(value) {
  return `₹${Number(value || 0).toFixed(0)}`
}

export default function OrdersScreen({ navigation }) {
  const { token, partner, logout } = useAuth()
  const [orders, setOrders] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      setError('')
      try {
        const data = await fetchPartnerOrders(token)
        setOrders(data.orders || [])
        if (isRefresh) setPage(1)
      } catch (err) {
        setError(err.message || 'Could not load orders')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [token],
  )

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load]),
  )

  const recent = useMemo(() => filterRecentOrders(orders, RECENT_DAYS), [orders])
  const { items, page: safePage, totalPages, total } = useMemo(
    () => paginate(recent, page, PER_PAGE),
    [recent, page],
  )

  return (
    <View style={styles.wrap}>
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <Text style={styles.hello}>Hi, {partner?.name || 'Partner'}</Text>
          {!IS_LIVE_API ? <Text style={styles.staging}>STAGING API</Text> : null}
          <Text style={styles.sub}>Last {RECENT_DAYS} days · {total} order{total === 1 ? '' : 's'}</Text>
        </View>
        <Pressable onPress={logout}>
          <Text style={styles.logout}>Log out</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.brand} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />
          }
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {error || `No orders in the last ${RECENT_DAYS} days.`}
            </Text>
          }
          ListFooterComponent={
            total > 0 ? (
              <View style={styles.pager}>
                <Pressable
                  style={[styles.pageBtn, safePage <= 1 && styles.pageBtnDisabled]}
                  disabled={safePage <= 1}
                  onPress={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <Text style={styles.pageBtnText}>Prev</Text>
                </Pressable>
                <Text style={styles.pageMeta}>
                  Page {safePage} / {totalPages}
                </Text>
                <Pressable
                  style={[styles.pageBtn, safePage >= totalPages && styles.pageBtnDisabled]}
                  disabled={safePage >= totalPages}
                  onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <Text style={styles.pageBtnText}>Next</Text>
                </Pressable>
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const orderTone = statusTone(item.status, item.paymentStatus)
            const payTone = paymentTone(item.paymentStatus)
            const deliveryLabel = formatDeliveryOption(item.deliveryOption)
            return (
              <Pressable
                style={styles.card}
                onPress={() => navigation.navigate('OrderDetail', { orderId: item.id, order: item })}
              >
                <View style={styles.row}>
                  <Text style={styles.orderNo}>{item.orderNo}</Text>
                  <View style={styles.badges}>
                    <Text style={[styles.badge, styles[`badge_${orderTone}`]]}>
                      {formatOrderStatus(item.status)}
                    </Text>
                    <Text style={[styles.badge, styles[`badge_${payTone}`]]}>
                      {formatPaymentStatus(item.paymentStatus)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.name}>{item.customerName}</Text>
                <Text style={styles.meta}>
                  Ordered {formatOrderDate(item.createdAt) || '—'}
                  {formatExpectedDeliveryDate(item.expectedDeliveryDate)
                    ? ` · Deliver ${formatExpectedDeliveryDate(item.expectedDeliveryDate)}`
                    : ''}
                </Text>
                {deliveryLabel ? (
                  <Text style={styles.meta}>Delivery: {deliveryLabel}</Text>
                ) : null}
                <Text style={styles.meta}>
                  {item.address?.line1 || 'Address'}
                  {item.address?.pincode ? ` · ${item.address.pincode}` : ''}
                </Text>
                <Text style={styles.total}>{money(item.grandTotal)}</Text>
              </Pressable>
            )
          }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: COLORS.canvas },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  hello: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  staging: { color: COLORS.warning, fontWeight: '700', fontSize: 12, marginTop: 2 },
  sub: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  logout: { color: COLORS.brandDeep, fontWeight: '600' },
  empty: { textAlign: 'center', color: COLORS.muted, marginTop: 48 },
  card: {
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 16,
    marginBottom: 12,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  orderNo: { fontWeight: '800', color: COLORS.ink, fontSize: 16, flexShrink: 1 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end', maxWidth: '58%' },
  badge: { fontSize: 12, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3 },
  badge_muted: { backgroundColor: '#e2e8f0', color: COLORS.muted },
  badge_warning: { backgroundColor: '#fef3c7', color: COLORS.warning },
  badge_success: { backgroundColor: '#dcfce7', color: COLORS.success },
  badge_danger: { backgroundColor: '#fee2e2', color: COLORS.danger },
  name: { marginTop: 8, fontSize: 15, fontWeight: '600', color: COLORS.text },
  meta: { marginTop: 4, color: COLORS.muted },
  total: { marginTop: 10, fontWeight: '800', color: COLORS.brandDeep, fontSize: 18 },
  pager: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 16,
  },
  pageBtn: {
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.panel,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  pageBtnDisabled: { opacity: 0.4 },
  pageBtnText: { fontWeight: '700', color: COLORS.text },
  pageMeta: { color: COLORS.muted, fontWeight: '600' },
})
