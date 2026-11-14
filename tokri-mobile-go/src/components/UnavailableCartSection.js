import { useState } from 'react'
import { Alert, ScrollView, Pressable, Text, View } from 'react-native'
import { useThemedStyles } from '../context/ThemeContext'
import { formatPrice, resolveAssetUrl } from '../lib/api'
import { useCart } from '../context/CartContext'
import Icon from './Icon'
import RemoteImage from './RemoteImage'

const CARD_GAP = 10
const SIDE_PAD = 14

function discountPercent(product) {
  const price = Number(product.priceValue)
  const oldPrice = Number(product.oldPriceValue)
  if (!oldPrice || !price || oldPrice <= price) return 0
  return Math.round((1 - price / oldPrice) * 100)
}

function SuggestionCard({ product, width, onPress }) {
  const styles = useThemedStyles(createStyles)
  const { addItem, updateQuantity, items } = useCart()
  const qty = items.find((item) => item.slug === product.slug)?.quantity || 0
  const off = discountPercent(product)

  const onAdd = async (event) => {
    event?.stopPropagation?.()
    try {
      if (qty) await updateQuantity(product.slug, qty + 1)
      else await addItem(product.slug, 1, product)
    } catch (error) {
      Alert.alert('Cart', error.message)
    }
  }

  const onMinus = async (event) => {
    event?.stopPropagation?.()
    if (!qty) return
    try {
      await updateQuantity(product.slug, qty - 1)
    } catch (error) {
      Alert.alert('Cart', error.message)
    }
  }

  return (
    <Pressable
      style={[styles.suggestCard, { width }]}
      onPress={() => onPress?.(product.slug)}
    >
      <View style={styles.suggestImageWrap}>
        {off > 0 ? <Text style={styles.off}>{off}% OFF</Text> : null}
        <RemoteImage uri={resolveAssetUrl(product.image) || product.image} style={styles.suggestImage} />
      </View>
      <View style={styles.suggestInfo}>
        <Text style={styles.suggestName} numberOfLines={2}>
          {product.name}
        </Text>
        {product.weight ? <Text style={styles.suggestWeight}>{product.weight}</Text> : null}
        <View style={styles.suggestPriceRow}>
          <View style={styles.suggestPriceCol}>
            <Text style={styles.suggestPrice} numberOfLines={1}>
              {product.price || formatPrice(product.priceValue)}
            </Text>
            {off > 0 && product.oldPrice ? <Text style={styles.suggestOld}>{product.oldPrice}</Text> : null}
          </View>
          {qty > 0 ? (
            <View style={styles.qtyBox}>
              <Pressable onPress={onMinus} hitSlop={6}>
                <Text style={styles.qtyBtn}>-</Text>
              </Pressable>
              <Text style={styles.qty}>{qty}</Text>
              <Pressable onPress={onAdd} hitSlop={6}>
                <Text style={styles.qtyBtn}>+</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.add} onPress={onAdd}>
              <Text style={styles.addText}>ADD</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  )
}

export default function UnavailableCartSection({ items = [], suggestions = [], onDismiss, onPressSuggestion }) {
  const styles = useThemedStyles(createStyles)
  const [trackWidth, setTrackWidth] = useState(0)
  // First card ~80% of track so the next card peeks at ~20%.
  const cardWidth = trackWidth > 0 ? Math.round(trackWidth * 0.8) : 260

  if (!items.length) return null

  const count = items.length
  const heading = count === 1 ? '1 item is not in stock' : `${count} items are not in stock`

  return (
    <View style={styles.box}>
      <View style={styles.header}>
        <Text style={styles.heading}>{heading}</Text>
        <Pressable onPress={onDismiss} hitSlop={10} style={styles.closeBtn} accessibilityLabel="Dismiss unavailable items">
          <Icon name="close" size={14} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.list}>
        {items.map((item) => (
          <View key={item.slug || item.id} style={styles.row}>
            <RemoteImage uri={resolveAssetUrl(item.image) || item.image} style={styles.thumb} />
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={2}>
                {item.name}
              </Text>
              {item.weight ? <Text style={styles.weight}>{item.weight}</Text> : null}
            </View>
          </View>
        ))}
      </View>

      {suggestions.length ? (
        <View style={styles.suggestWrap}>
          <Text style={styles.suggestTitle}>Add these items instead</Text>
          <ScrollView
            horizontal
            nestedScrollEnabled
            directionalLockEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={cardWidth + CARD_GAP}
            snapToAlignment="start"
            disableIntervalMomentum
            bounces
            onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
            contentContainerStyle={styles.suggestRow}
            style={styles.suggestScroller}
          >
            {suggestions.map((product) => (
              <SuggestionCard
                key={product.slug}
                product={product}
                width={cardWidth}
                onPress={onPressSuggestion}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}
    </View>
  )
}

const createStyles = (c) => ({
  box: {
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: c.card,
    borderRadius: 16,
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: c.line,
  },
  heading: { flex: 1, color: '#dc2626', fontSize: 15, fontWeight: '700', paddingRight: 8 },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { paddingHorizontal: 14, paddingVertical: 10, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  thumb: { width: 48, height: 48, borderRadius: 10, backgroundColor: c.panel },
  info: { flex: 1, minWidth: 0 },
  name: { color: c.text, fontSize: 13, fontWeight: '600' },
  weight: { color: c.muted, fontSize: 12, marginTop: 2 },
  suggestWrap: { borderTopWidth: 1, borderTopColor: c.line, paddingTop: 12, paddingBottom: 14 },
  suggestTitle: {
    color: c.text,
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: SIDE_PAD,
    marginBottom: 20,
  },
  suggestScroller: { flexGrow: 0 },
  suggestRow: { paddingLeft: SIDE_PAD, paddingRight: SIDE_PAD },
  suggestCard: {
    flexDirection: 'row',
    gap: 10,
    marginRight: CARD_GAP,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.panel,
    alignItems: 'center',
  },
  suggestImageWrap: {
    width: 72,
    height: 72,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: c.panel2,
    position: 'relative',
  },
  suggestImage: { width: '100%', height: '100%' },
  off: {
    position: 'absolute',
    left: 0,
    top: 4,
    zIndex: 2,
    backgroundColor: '#2563eb',
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    overflow: 'hidden',
  },
  suggestInfo: { flex: 1, minWidth: 0, justifyContent: 'center' },
  suggestName: { color: c.text, fontSize: 13, fontWeight: '700', lineHeight: 17 },
  suggestWeight: { color: c.muted, fontSize: 11, marginTop: 2 },
  suggestPriceRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  suggestPriceCol: { flex: 1, minWidth: 0 },
  suggestPrice: { color: c.text, fontSize: 14, fontWeight: '800' },
  suggestOld: { color: c.muted, fontSize: 11, textDecorationLine: 'line-through', marginTop: 1 },
  add: {
    borderWidth: 1,
    borderColor: c.brand,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: c.addBg,
  },
  addText: { color: c.brand, fontWeight: '800', fontSize: 12 },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    backgroundColor: c.brand,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 4,
    gap: 2,
  },
  qtyBtn: { color: c.onBrand, fontWeight: '800', fontSize: 16, width: 18, textAlign: 'center' },
  qty: { color: c.onBrand, fontWeight: '800', fontSize: 12, minWidth: 14, textAlign: 'center' },
})
