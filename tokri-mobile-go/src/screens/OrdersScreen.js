import { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Image } from 'expo-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icon from '../components/Icon'
import LoadingView from '../components/LoadingView'
import { useTheme, useThemedStyles } from '../context/ThemeContext'
import { authGet, formatPrice, normalizeOrder } from '../lib/api'
import { formatOrderWhen, paymentLabel } from '../lib/orders'
import { downloadOrderInvoice } from '../lib/invoice'
import { useAuth } from '../context/AuthContext'

function rateOrder() {
  Alert.alert('Rate order', 'How was your Tokriii order?', [
    { text: 'Not now', style: 'cancel' },
    { text: '★★★★★ Great', onPress: () => Alert.alert('Thanks', 'Thanks for rating your order.') },
    { text: '★★★ Okay', onPress: () => Alert.alert('Thanks', 'Thanks for your feedback.') },
  ])
}

export default function OrdersScreen({ navigation }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const insets = useSafeAreaInsets()
  const { token, isLoggedIn } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [downloadingInvoice, setDownloadingInvoice] = useState(null)

  const shareInvoice = async (order) => {
    setDownloadingInvoice(order.orderNo)
    try {
      await downloadOrderInvoice(order.orderNo, token)
    } catch (error) {
      Alert.alert('Invoice unavailable', error.message || 'Could not download this invoice.')
    } finally {
      setDownloadingInvoice(null)
    }
  }

  const load = useCallback(async () => {
    if (!isLoggedIn) {
      setOrders([])
      return
    }
    const data = await authGet('/account/orders?perPage=20', token)
    setOrders((data.orders || []).map(normalizeOrder))
  }, [isLoggedIn, token])

  useEffect(() => {
    load()
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [load])

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await load()
    } finally {
      setRefreshing(false)
    }
  }

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack()
    else navigation.navigate('Main', { screen: 'Account' })
  }

  if (loading) return <LoadingView />

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={goBack} hitSlop={12}>
          <Icon name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Your orders</Text>
      </View>

      {!isLoggedIn ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Login to view orders</Text>
          <Pressable style={styles.button} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.buttonText}>Login</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.orderNo}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
          contentContainerStyle={
            orders.length
              ? [styles.list, { paddingBottom: 28 + insets.bottom }]
              : [styles.center, { paddingBottom: insets.bottom }]
          }
          ListEmptyComponent={<Text style={styles.emptyTitle}>No orders yet</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.payment}>{paymentLabel(item)}</Text>
              <Pressable style={styles.priceRow} onPress={() => navigation.navigate('OrderDetail', { orderNo: item.orderNo })}>
                <Text style={styles.priceMeta}>
                  {formatPrice(item.grandTotal)}  •  {formatOrderWhen(item.createdAt)}
                </Text>
                <Icon name="chevron-forward" size={18} color={colors.muted} />
              </Pressable>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbs}>
                {(item.items || []).map((product) => (
                  <View key={product.id || product.slug} style={styles.thumb}>
                    <Image source={{ uri: product.image }} style={styles.thumbImage} contentFit="cover" />
                  </View>
                ))}
              </ScrollView>

              <View style={styles.actions}>
                <Pressable
                  style={styles.actionBtn}
                  disabled={downloadingInvoice === item.orderNo}
                  onPress={() => shareInvoice(item)}
                >
                  <Text style={styles.actionText}>
                    {downloadingInvoice === item.orderNo ? 'Preparing invoice…' : 'Download invoice'}
                  </Text>
                </Pressable>
                <View style={styles.actionSplit} />
                <Pressable style={styles.actionBtn} onPress={rateOrder}>
                  <Text style={styles.actionText}>Rate order</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
    </View>
  )
}

const SCREEN_WIDTH = Dimensions.get('window').width
const THUMB = Math.floor((SCREEN_WIDTH - 32 - 32 - 32) / 5)

const createStyles = (c) => ({
  screen: { flex: 1, backgroundColor: c.canvas },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 10, gap: 8 },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: c.panel2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: c.text, fontSize: 22, fontWeight: '800' },
  list: { padding: 16, paddingBottom: 28 },
  center: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: c.text, textAlign: 'center' },
  card: {
    backgroundColor: c.panel,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: c.line,
  },
  payment: { color: c.text, fontSize: 18, fontWeight: '800' },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 12,
  },
  priceMeta: { color: c.muted, fontSize: 13, flex: 1, paddingRight: 8 },
  thumbs: { gap: 8, paddingBottom: 4 },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: c.panel2,
  },
  thumbImage: { width: '100%', height: '100%' },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: c.line,
  },
  actionBtn: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  actionText: { color: c.brand, fontWeight: '800', fontSize: 14 },
  actionSplit: { width: 1, height: 16, backgroundColor: c.line },
  button: {
    marginTop: 16,
    backgroundColor: c.brand,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  buttonText: { color: c.onBrand, fontWeight: '800' },
})
