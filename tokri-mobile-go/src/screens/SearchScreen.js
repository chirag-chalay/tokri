import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import RemoteImage from '../components/RemoteImage'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ProductCard from '../components/ProductCard'
import Icon from '../components/Icon'
import { useTheme, useThemedStyles } from '../context/ThemeContext'
import { fetchJson, formatPrice, normalizeProduct, resolveAssetUrl } from '../lib/api'
import { listenForSearch } from '../lib/voiceSearch'
import { trackSearch } from '../lib/analytics'

const RECENT_KEY = 'tokri_recent_searches'
const MIN_CHARS = 2
const DEBOUNCE_MS = 300

export default function SearchScreen({ navigation, route }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const insets = useSafeAreaInsets()
  const initial = route.params?.q || ''
  const [query, setQuery] = useState(initial)
  const [products, setProducts] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [resultQuery, setResultQuery] = useState('')
  const [total, setTotal] = useState(0)
  const [topPicks, setTopPicks] = useState([])
  const [bestSellers, setBestSellers] = useState([])
  const [dryFruits, setDryFruits] = useState([])
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const requestId = useRef(0)
  const debounceRef = useRef(null)

  const openProduct = (slug, origin) => {
    navigation.navigate('Product', { slug, origin })
  }

  const remember = async (term, image) => {
    const q = String(term || '').trim()
    if (!q) return
    const next = [{ q, image: image || '' }, ...recent.filter((item) => item.q.toLowerCase() !== q.toLowerCase())].slice(0, 8)
    setRecent(next)
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next)).catch(() => {})
  }

  const runSearch = async (term) => {
    const q = String(term || '').trim()
    const id = ++requestId.current
    if (q.length < MIN_CHARS) {
      setProducts([])
      setSuggestions([])
      setResultQuery('')
      setTotal(0)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await fetchJson(`/search?q=${encodeURIComponent(q)}`)
      if (id !== requestId.current) return
      const list = (data.products || []).map(normalizeProduct)
      const suggest = (data.suggestions || []).map(normalizeProduct)
      setProducts(list)
      setSuggestions(suggest)
      setResultQuery(data.query || q)
      trackSearch(q)
      setTotal(Number(data.total) || list.length)
      await remember(q, list[0]?.image || suggest[0]?.image)
    } catch {
      if (id !== requestId.current) return
      setProducts([])
      setSuggestions([])
      setResultQuery(q)
      setTotal(0)
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }

  useEffect(() => {
    AsyncStorage.getItem(RECENT_KEY)
      .then((raw) => {
        const parsed = raw ? JSON.parse(raw) : []
        if (Array.isArray(parsed)) {
          setRecent(
            parsed
              .filter((item) => item?.q)
              .map((item) => ({ ...item, image: resolveAssetUrl(item.image) || item.image || '' })),
          )
        }
      })
      .catch(() => {})
    fetchJson('/app/bootstrap')
      .then(async (data) => {
        const sellers = (data.bestSellers || []).map(normalizeProduct)
        setBestSellers(sellers.slice(0, 6))
        setTopPicks(sellers.slice(0, 6))
        const dry = (data.categories || []).find((item) => /dry/i.test(item.label || item.slug || ''))
        if (!dry?.slug) return
        const result = await fetchJson(`/products?category=${encodeURIComponent(dry.slug)}&limit=6`)
        const list = (Array.isArray(result) ? result : result.products || []).map(normalizeProduct)
        setDryFruits(list.slice(0, 6))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const term = query.trim()
    if (term.length < MIN_CHARS) {
      setProducts([])
      setSuggestions([])
      setResultQuery('')
      setTotal(0)
      setLoading(false)
      return undefined
    }
    debounceRef.current = setTimeout(() => runSearch(term), DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  useEffect(() => {
    const next = route.params?.q
    if (next != null && String(next) !== query) setQuery(String(next))
  }, [route.params?.q])

  const onMic = async () => {
    try {
      setListening(true)
      const spoken = await listenForSearch()
      setQuery(spoken)
    } catch (error) {
      Alert.alert('Voice search', error.message || 'Could not start voice search.')
    } finally {
      setListening(false)
    }
  }

  const clearRecent = () => {
    setRecent([])
    AsyncStorage.removeItem(RECENT_KEY).catch(() => {})
  }

  const showBrowse = query.trim().length < MIN_CHARS

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
            <Icon name="arrow-back" size={20} color={colors.text} />
          </Pressable>
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Search for atta, dal, coke and..."
            placeholderTextColor={colors.muted}
            returnKeyType="search"
            autoFocus
            onSubmitEditing={() => runSearch(query)}
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Icon name="close-circle" size={18} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>
        <Pressable style={styles.mic} onPress={onMic}>
          <Icon name={listening ? 'mic' : 'mic-outline'} size={22} color={colors.text} />
        </Pressable>
      </View>

      {showBrowse ? (
        <ScrollView contentContainerStyle={styles.browse} keyboardShouldPersistTaps="handled">
          {recent.length ? (
            <>
              <View style={styles.sectionHead}>
                <Text style={styles.sectionTitle}>Recent searches</Text>
                <Pressable onPress={clearRecent}>
                  <Text style={styles.clear}>clear</Text>
                </Pressable>
              </View>
              <View style={styles.chips}>
                {recent.map((item) => (
                  <Pressable key={item.q} style={styles.chip} onPress={() => setQuery(item.q)}>
                    {item.image ? (
                      <RemoteImage uri={item.image} style={styles.chipImage} />
                    ) : (
                      <View style={styles.chipIcon}>
                        <Icon name="search" size={18} color={colors.muted} />
                      </View>
                    )}
                    <Text style={styles.chipText} numberOfLines={1}>
                      {item.q}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}

          <ProductRow title="Top picks for you" products={topPicks} onProduct={openProduct} />
          <ProductRow title="Bestsellers" products={bestSellers} onProduct={openProduct} />
          <ProductRow title="Dry fruits" products={dryFruits} onProduct={openProduct} />
        </ScrollView>
      ) : loading && !products.length && !suggestions.length ? (
        <ActivityIndicator color={colors.brand} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.results} keyboardShouldPersistTaps="handled">
          {suggestions.length ? (
            <View style={styles.suggestBlock}>
              {suggestions.map((item) => (
                <Pressable
                  key={`s-${item.slug}`}
                  style={styles.suggestRow}
                  onPress={() => openProduct(item.slug)}
                >
                  <RemoteImage uri={resolveAssetUrl(item.image) || item.image} style={styles.suggestImage} />
                  <View style={styles.suggestCopy}>
                    <Text style={styles.suggestName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    {item.weight ? <Text style={styles.suggestWeight}>{item.weight}</Text> : null}
                  </View>
                  <Text style={styles.suggestPrice}>
                    {item.price || formatPrice(item.priceValue)}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          <Text style={styles.resultTitle}>
            {total > 0
              ? `Showing results for “${resultQuery || query.trim()}”`
              : `No products found for “${resultQuery || query.trim()}”`}
          </Text>

          {products.length ? (
            <View style={styles.grid}>
              {products.map((item) => (
                <View key={item.slug} style={styles.cardWrap}>
                  <ProductCard product={item} onPress={openProduct} />
                </View>
              ))}
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  )
}

function ProductRow({ title, products, onProduct }) {
  const styles = useThemedStyles(createStyles)
  if (!products.length) return null
  return (
    <View style={styles.rowBlock}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.picks}>
        {products.map((item) => (
          <View key={item.slug} style={styles.pickCard}>
            <ProductCard product={item} compact onPress={onProduct} />
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const createStyles = (c) => ({
  screen: { flex: 1, backgroundColor: c.canvas },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12 },
  searchBox: {
    flex: 1,
    height: 48,
    borderRadius: 999,
    backgroundColor: c.panel,
    borderWidth: 1,
    borderColor: c.line,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  input: { flex: 1, color: c.text, fontSize: 15, paddingVertical: 0 },
  mic: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: c.panel,
    borderWidth: 1,
    borderColor: c.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  browse: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 28 },
  results: { paddingTop: 8, paddingBottom: 28 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: c.text, fontSize: 18, fontWeight: '800' },
  clear: { color: c.brand, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  chip: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.panel,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  chipImage: { width: 42, height: 42, borderRadius: 10, backgroundColor: c.panel2 },
  chipIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: { color: c.text, fontWeight: '600', flex: 1 },
  rowBlock: { marginTop: 22 },
  picks: { paddingTop: 12, paddingRight: 8 },
  pickCard: { width: 148, marginRight: 10 },
  suggestBlock: {
    marginHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 14,
    backgroundColor: c.panel,
    overflow: 'hidden',
  },
  suggestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: c.line,
  },
  suggestImage: { width: 36, height: 36, borderRadius: 8, backgroundColor: c.panel2 },
  suggestCopy: { flex: 1, minWidth: 0 },
  suggestName: { color: c.mint, fontSize: 14, fontWeight: '600' },
  suggestWeight: { color: c.muted, fontSize: 11, marginTop: 2 },
  suggestPrice: { color: c.text, fontSize: 13, fontWeight: '800' },
  resultTitle: {
    color: c.text,
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 3 },
  cardWrap: { width: '50%', paddingHorizontal: 3, marginBottom: 8 },
  empty: { color: c.muted, textAlign: 'center', marginTop: 40 },
})
