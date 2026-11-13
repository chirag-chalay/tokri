import { useEffect, useRef, useState } from 'react'
import { Alert, Animated, Dimensions, Pressable, ScrollView, Share, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import LoadingView from '../components/LoadingView'
import ProductCard from '../components/ProductCard'
import RemoteImage from '../components/RemoteImage'
import Icon from '../components/Icon'
import { useTheme, useThemedStyles } from '../context/ThemeContext'
import { fetchJson, formatPrice, normalizeProduct, resolveAssetUrl } from '../lib/api'
import { useSystemBottomInset } from '../lib/safeArea'
import { useCart } from '../context/CartContext'
import { trackCommerce } from '../lib/analytics'

export default function ProductScreen({ route, navigation }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const insets = useSafeAreaInsets()
  const bottomInset = useSystemBottomInset()
  const closing = useRef(new Animated.Value(0)).current
  const { slug } = route.params
  const { addItem, updateQuantity, items, totalCount } = useCart()
  const scrollRef = useRef(null)
  const [product, setProduct] = useState(null)
  const [similar, setSimilar] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [footerHeight, setFooterHeight] = useState(120)

  const cartQty = items.find((item) => item.slug === slug)?.quantity || 0
  const categorySlug = product?.categoryId || product?.category?.slug

  useEffect(() => {
    let ignore = false
    setLoading(true)
    setSimilar([])
    scrollRef.current?.scrollTo({ y: 0, animated: false })

    fetchJson(`/products/${slug}`)
      .then(async (data) => {
        const normalized = normalizeProduct(data)
        if (ignore) return
        setProduct(normalized)
        trackCommerce('view_item', [{ ...normalized, quantity: 1 }])

        const cat = normalized.categoryId || normalized.category?.slug
        try {
          const path = cat
            ? `/products?category=${encodeURIComponent(cat)}&limit=12`
            : '/products?limit=12'
          const result = await fetchJson(path)
          const list = (Array.isArray(result) ? result : result.products || [])
            .map(normalizeProduct)
            .filter((item) => item.slug && item.slug !== slug)
            .slice(0, 6)
          if (!ignore) setSimilar(list)
        } catch {
          if (!ignore) setSimilar([])
        }
      })
      .catch((error) => Alert.alert('Error', error.message))
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [slug, navigation])

  const handleAdd = async () => {
    setAdding(true)
    try {
      if (cartQty) await updateQuantity(slug, cartQty + 1)
      else await addItem(slug, 1, product)
    } catch (error) {
      Alert.alert('Could not add', error.message)
    } finally {
      setAdding(false)
    }
  }

  const handleMinus = async () => {
    if (!cartQty) return
    try {
      await updateQuantity(slug, cartQty - 1)
    } catch (error) {
      Alert.alert('Cart', error.message)
    }
  }

  const goBack = () => {
    if (closing.__closing) return
    closing.__closing = true
    Animated.timing(closing, { toValue: 1, duration: 280, useNativeDriver: true }).start(() => {
      navigation.goBack()
    })
  }

  const openSearch = () => {
    navigation.navigate('Search', { fromProduct: true })
  }

  const shareProduct = () => {
    const link = `https://tokriii.com/product/${product?.slug || slug}`
    Share.share({ message: `${product?.name || 'Tokriii'}\n${link}`, url: link }).catch(() => {})
  }

  if (loading && !product) return <LoadingView />
  if (!product) return null

  const windowSize = Dimensions.get('window')
  const origin = route.params?.origin
  const originShift = origin
    ? {
        x: origin.x + origin.width / 2 - windowSize.width / 2,
        y: origin.y + origin.height / 2 - windowSize.height / 2,
        scale: Math.max(0.12, Math.min(origin.width / windowSize.width, origin.height / windowSize.height)),
      }
    : { x: 0, y: 0, scale: 0.18 }

  const previewItems = items.slice(-3)
  const itemLabel = `${totalCount || items.length} ${ (totalCount || items.length) === 1 ? 'item' : 'items' }`

  return (
    <Animated.View
      style={[
        styles.stage,
        {
          opacity: closing.interpolate({ inputRange: [0, 1], outputRange: [1, 0.35] }),
          transform: [
            { translateX: closing.interpolate({ inputRange: [0, 1], outputRange: [0, originShift.x] }) },
            { translateY: closing.interpolate({ inputRange: [0, 1], outputRange: [0, originShift.y] }) },
            { scale: closing.interpolate({ inputRange: [0, 1], outputRange: [1, originShift.scale] }) },
          ],
        },
      ]}
    >
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: footerHeight + (items.length ? 36 : 4) }]}
    >
      <View>
        <RemoteImage uri={product.image} style={styles.image} />
        <View style={[styles.imageBar, { top: insets.top + 10 }]}>
          <Pressable style={styles.roundBtn} onPress={goBack} hitSlop={8}>
            <Icon name="chevron-down" size={22} color="#111827" />
          </Pressable>
          <View style={styles.imageActions}>
            <Pressable style={styles.roundBtn} onPress={openSearch} hitSlop={8}>
              <Icon name="search" size={20} color="#111827" />
            </Pressable>
            <Pressable style={styles.roundBtn} onPress={shareProduct} hitSlop={8}>
              <Icon name="share-outline" size={20} color="#111827" />
            </Pressable>
          </View>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.weight}>{product.weight}</Text>
        <Text style={styles.price}>{product.price || formatPrice(product.priceValue)}</Text>
        {product.description ? (
          <Text style={styles.description}>{product.description.replace(/<[^>]+>/g, ' ')}</Text>
        ) : null}
      </View>

      {similar.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Similar products</Text>
          <View style={styles.grid}>
            {similar.map((item) => (
              <View key={item.slug} style={styles.cardWrap}>
                <ProductCard
                  product={item}
                  compact
                  onPress={(nextSlug, origin) => navigation.push('Product', { slug: nextSlug, origin })}
                />
              </View>
            ))}
          </View>
          <Pressable
            style={styles.seeAllBtn}
            onPress={() =>
              navigation.navigate('Main', {
                screen: 'Categories',
                params: categorySlug ? { slug: categorySlug } : undefined,
              })
            }
          >
            <Text style={styles.seeAllText}>See all products</Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>

    {items.length ? (
      <Pressable
        style={[styles.viewCart, { bottom: footerHeight + 8 }]}
        onPress={() => navigation.navigate('Main', { screen: 'Cart' })}
      >
        <View style={styles.previewRow}>
          {previewItems.map((item, index) => (
            <RemoteImage
              key={item.slug || item.id || index}
              uri={resolveAssetUrl(item.image) || item.image}
              style={[styles.previewImage, index > 0 && { marginLeft: -14 }]}
            />
          ))}
        </View>
        <View style={styles.viewCartText}>
          <Text style={styles.viewCartTitle} numberOfLines={1}>View cart</Text>
          <Text style={styles.viewCartCount} numberOfLines={1}>{itemLabel}</Text>
        </View>
        <Icon name="chevron-forward" size={22} color={colors.onBrand} />
      </Pressable>
    ) : null}

    <View
      style={[styles.footer, { paddingBottom: bottomInset }]}
      onLayout={(event) => setFooterHeight(event.nativeEvent.layout.height)}
    >
      <View style={styles.buyRow}>
        <View style={styles.buyInfo}>
          {product.weight ? <Text style={styles.buyWeight}>{product.weight}</Text> : null}
          <Text style={styles.buyPrice}>{product.price || formatPrice(product.priceValue)}</Text>
          <Text style={styles.buyTax}>Inclusive of all taxes</Text>
        </View>
        {cartQty > 0 ? (
          <View style={styles.qtyBox}>
            <Pressable onPress={handleMinus} hitSlop={8} disabled={adding}>
              <Text style={styles.qtyBtn}>-</Text>
            </Pressable>
            <Text style={styles.qty}>{cartQty}</Text>
            <Pressable onPress={handleAdd} hitSlop={8} disabled={adding}>
              <Text style={styles.qtyBtn}>+</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={[styles.button, adding && styles.buttonDisabled]}
            onPress={handleAdd}
            disabled={adding}
          >
            <Text style={styles.buttonText}>{adding ? 'Adding…' : 'Add to cart'}</Text>
          </Pressable>
        )}
      </View>
    </View>
    </Animated.View>
  )
}

const createStyles = (c) => ({
  container: { flex: 1, backgroundColor: c.canvas },
  stage: { flex: 1, backgroundColor: 'transparent' },
  content: { paddingBottom: 28 },
  footer: {
    backgroundColor: c.panel,
    borderTopWidth: 1,
    borderTopColor: c.line,
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  imageBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  imageActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  roundBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewCart: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 2,
    backgroundColor: c.brand,
    borderRadius: 999,
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  previewRow: { flexDirection: 'row', alignItems: 'center' },
  previewImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: c.brand,
    backgroundColor: c.panel,
  },
  viewCartText: { flexShrink: 0 },
  viewCartTitle: { color: c.onBrand, fontWeight: '800', fontSize: 15 },
  viewCartCount: { color: c.onBrand, fontSize: 12, fontWeight: '600', opacity: 0.85 },
  buyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingBottom: 6,
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.brand,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 10,
    minWidth: 140,
    justifyContent: 'space-between',
  },
  qtyBtn: { color: c.onBrand, fontWeight: '800', fontSize: 22, width: 28, textAlign: 'center' },
  qty: { color: c.onBrand, fontWeight: '800', fontSize: 16, minWidth: 20, textAlign: 'center' },
  buyInfo: { flex: 1 },
  buyWeight: { color: c.muted, fontSize: 13 },
  buyPrice: { color: c.text, fontSize: 18, fontWeight: '800', marginTop: 2 },
  buyTax: { color: c.muted, fontSize: 12, marginTop: 2 },
  image: { width: '100%', aspectRatio: 1, backgroundColor: c.panel2 },
  body: { padding: 20, gap: 8 },
  name: { fontSize: 24, fontWeight: '800', color: c.text },
  weight: { fontSize: 14, color: c.muted },
  price: { fontSize: 22, fontWeight: '800', color: c.brand, marginTop: 4 },
  description: { fontSize: 14, lineHeight: 22, color: c.muted, marginTop: 8 },
  button: {
    backgroundColor: c.brand,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 22,
    alignItems: 'center',
    minWidth: 140,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: {
    color: c.onBrand,
    fontWeight: '800',
    fontSize: 16,
  },
  section: { marginTop: 8 },
  sectionTitle: {
    color: c.text,
    fontSize: 20,
    fontWeight: '800',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 10,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 3 },
  cardWrap: { width: '33.333%', paddingHorizontal: 3, marginBottom: 5 },
  seeAllBtn: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: c.brand,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  seeAllText: { color: c.brand, fontWeight: '800', fontSize: 14 },
})
