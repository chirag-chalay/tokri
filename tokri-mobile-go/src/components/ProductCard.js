import { useRef } from 'react'
import { Alert, Pressable, Text, View } from 'react-native'
import { useThemedStyles } from '../context/ThemeContext'
import { formatPrice } from '../lib/api'
import { useCart } from '../context/CartContext'
import { trackCommerce } from '../lib/analytics'
import RemoteImage from './RemoteImage'

function discountPercent(product) {
  const price = Number(product.priceValue)
  const oldPrice = Number(product.oldPriceValue)
  if (!oldPrice || !price || oldPrice <= price) return 0
  return Math.round((1 - price / oldPrice) * 100)
}

export default function ProductCard({ product, onPress, compact = false }) {
  const styles = useThemedStyles(createStyles)
  const cardRef = useRef(null)
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

  const open = () => {
    trackCommerce('select_item', [{ ...product, quantity: 1 }])
    const emit = (origin) => onPress?.(product.slug, origin)
    if (!cardRef.current?.measureInWindow) {
      emit(null)
      return
    }
    cardRef.current.measureInWindow((x, y, width, height) => emit({ x, y, width, height }))
  }

  return (
    <Pressable ref={cardRef} style={[styles.card, compact && styles.compact]} onPress={open}>
      <View style={styles.imageWrap}>
        {off > 0 ? <Text style={styles.off}>{off}% OFF</Text> : null}
        <RemoteImage uri={product.image} style={styles.image} />
      </View>
      <Text style={[styles.name, compact && styles.nameCompact]} numberOfLines={2}>
        {product.name}
      </Text>
      {product.weight ? <Text style={styles.weight}>{product.weight}</Text> : null}
      <View style={styles.footer}>
        <View style={{ flex: 1, paddingRight: 2, minWidth: 0 }}>
          <Text style={[styles.price, compact && styles.priceCompact]} numberOfLines={1}>
            {product.price || formatPrice(product.priceValue)}
          </Text>
          {off > 0 && product.oldPrice ? <Text style={styles.old}>{product.oldPrice}</Text> : null}
        </View>
        {qty > 0 ? (
          <View style={[styles.qtyBox, compact && styles.qtyBoxCompact]}>
            <Pressable onPress={onMinus} hitSlop={6}>
              <Text style={styles.qtyBtn}>-</Text>
            </Pressable>
            <Text style={styles.qty}>{qty}</Text>
            <Pressable onPress={onAdd} hitSlop={6}>
              <Text style={styles.qtyBtn}>+</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={[styles.add, compact && styles.addCompact]} onPress={onAdd}>
            <Text style={[styles.addText, compact && styles.addTextCompact]}>ADD</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  )
}

const createStyles = (c) => ({
  card: {
    width: '100%',
    flex: 1,
    backgroundColor: c.card,
    borderRadius: 12,
    padding: 6,
    borderWidth: 1,
    borderColor: c.line,
    overflow: 'hidden',
  },
  compact: { padding: 5 },
  nameCompact: { fontSize: 11, minHeight: 28, lineHeight: 14 },
  priceCompact: { fontSize: 12 },
  addCompact: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  addTextCompact: { fontSize: 10 },
  qtyBoxCompact: { paddingHorizontal: 3, paddingVertical: 3, gap: 1 },
  imageWrap: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: c.panel2,
    marginBottom: 3,
  },
  image: { width: '100%', height: '100%' },
  off: {
    position: 'absolute',
    left: 0,
    top: 6,
    zIndex: 2,
    backgroundColor: '#2563eb',
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    overflow: 'hidden',
  },
  name: { fontSize: 12, fontWeight: '700', color: c.cardText, minHeight: 32, lineHeight: 16 },
  weight: { fontSize: 11, color: c.cardMuted, marginTop: 1 },
  footer: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  price: { fontSize: 13, fontWeight: '800', color: c.cardText },
  old: { fontSize: 11, color: c.cardMuted, textDecorationLine: 'line-through' },
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
  qtyBtn: { color: c.onBrand, fontWeight: '800', fontSize: 16, width: 14, textAlign: 'center' },
  qty: { color: c.onBrand, fontWeight: '800', fontSize: 12, minWidth: 12, textAlign: 'center' },
})
