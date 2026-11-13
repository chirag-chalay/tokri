import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, Platform, Pressable, Text, View } from 'react-native'
import RemoteImage from '../components/RemoteImage'
import { useRoute } from '@react-navigation/native'
import ProductCard from '../components/ProductCard'
import LoadingView from '../components/LoadingView'
import AppHeader from '../components/AppHeader'
import { useTheme, useThemedStyles } from '../context/ThemeContext'
import { fetchJson, normalizeCategory, normalizeProduct } from '../lib/api'

const PAGE_SIZE = 24
const RAIL_WIDTH = 82
const BOX_MARGIN = 10

function mergeProducts(existing, incoming) {
  const seen = new Set(existing.map((item) => item.id || item.slug))
  const merged = [...existing]
  for (const item of incoming) {
    const id = item.id || item.slug
    if (seen.has(id)) continue
    seen.add(id)
    merged.push(item)
  }
  return merged
}

function flattenSections(sections) {
  const rows = []
  sections.forEach((section) => {
    for (let index = 0; index < section.products.length; index += 2) {
      rows.push({
        left: section.products[index],
        right: section.products[index + 1] || null,
        categorySlug: section.slug,
        listKey: `${section.slug}:row:${index}:${rows.length}`,
      })
    }
  })
  return rows
}

const FeedRow = memo(function FeedRow({ left, right, onPress, wrapStyle, rowStyle }) {
  return (
    <View style={rowStyle}>
      <View style={wrapStyle}>
        <ProductCard product={left} onPress={onPress} compact />
      </View>
      <View style={wrapStyle}>
        {right ? <ProductCard product={right} onPress={onPress} compact /> : null}
      </View>
    </View>
  )
})

export default function ShopScreen({ navigation }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const route = useRoute()
  const requestedSlug = route.params?.slug || ''

  const listRef = useRef(null)
  const railRef = useRef(null)
  const categoriesRef = useRef([])
  const sectionsRef = useRef([])
  const appendingRef = useRef(false)
  const prependingRef = useRef(false)
  const reachedEndRef = useRef(false)
  const reachedStartRef = useRef(false)
  const canLoadPrevRef = useRef(false)
  const feedToken = useRef(0)
  const activeSlugRef = useRef('')

  const [categories, setCategories] = useState([])
  const [sections, setSections] = useState([])
  const [activeSlug, setActiveSlug] = useState('')
  const [loadingCats, setLoadingCats] = useState(true)
  const [loadingFeed, setLoadingFeed] = useState(true)
  const [appending, setAppending] = useState(false)
  const [prepending, setPrepending] = useState(false)

  const feed = useMemo(() => flattenSections(sections), [sections])

  useEffect(() => {
    categoriesRef.current = categories
  }, [categories])

  useEffect(() => {
    sectionsRef.current = sections
  }, [sections])

  useEffect(() => {
    activeSlugRef.current = activeSlug
  }, [activeSlug])

  const fetchCategoryPage = useCallback(async (slug, page) => {
    const data = await fetchJson(
      `/products?category=${encodeURIComponent(slug)}&page=${page}&limit=${PAGE_SIZE}`,
    )
    return {
      products: (data.products || []).map(normalizeProduct),
      hasMore: Boolean(data.hasMore),
      total: Number(data.total) || 0,
    }
  }, [])

  useEffect(() => {
    let ignore = false
    fetchJson('/categories')
      .then((items) => {
        if (ignore || !Array.isArray(items)) return
        setCategories(items.map(normalizeCategory))
      })
      .catch(() => {
        if (!ignore) setCategories([])
      })
      .finally(() => {
        if (!ignore) setLoadingCats(false)
      })
    return () => {
      ignore = true
    }
  }, [])

  const startFeedAt = useCallback(
    async (slug) => {
      const list = categoriesRef.current
      const start = list.find((item) => item.slug === slug) || list[0]
      if (!start) return

      const token = feedToken.current + 1
      feedToken.current = token
      reachedEndRef.current = false
      reachedStartRef.current = false
      canLoadPrevRef.current = false
      appendingRef.current = false
      prependingRef.current = false
      setLoadingFeed(true)
      setSections([])
      listRef.current?.scrollToOffset({ offset: 0, animated: false })

      try {
        const page = await fetchCategoryPage(start.slug, 1)
        if (token !== feedToken.current) return
        setSections([
          {
            slug: start.slug,
            label: start.label,
            products: page.products,
            firstPage: 1,
            lastPage: 1,
            hasMore: page.hasMore,
          },
        ])
        setActiveSlug(start.slug)
      } catch {
        if (token !== feedToken.current) return
        setSections([
          {
            slug: start.slug,
            label: start.label,
            products: [],
            firstPage: 1,
            lastPage: 1,
            hasMore: false,
          },
        ])
        reachedEndRef.current = true
        setActiveSlug(start.slug)
      } finally {
        if (token === feedToken.current) setLoadingFeed(false)
      }
    },
    [fetchCategoryPage],
  )

  useEffect(() => {
    if (!categories.length) return
    const start = requestedSlug || categories[0].slug
    const index = flattenSections(sectionsRef.current).findIndex((item) => item.categorySlug === start)
    if (index >= 0) {
      setActiveSlug(start)
      requestAnimationFrame(() => {
        try {
          listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0 })
        } catch {
          /* list may still be measuring */
        }
      })
      return
    }
    startFeedAt(start)
  }, [categories, requestedSlug, startFeedAt])

  const loadNext = useCallback(async () => {
    if (appendingRef.current || reachedEndRef.current) return
    const token = feedToken.current
    const last = sectionsRef.current[sectionsRef.current.length - 1]
    if (!last) return

    appendingRef.current = true
    setAppending(true)

    try {
      if (last.hasMore) {
        const next = await fetchCategoryPage(last.slug, last.lastPage + 1)
        if (token !== feedToken.current) return
        setSections((prev) =>
          prev.map((section, index) =>
            index === prev.length - 1
              ? {
                  ...section,
                  products: mergeProducts(section.products, next.products),
                  lastPage: section.lastPage + 1,
                  hasMore: next.hasMore,
                }
              : section,
          ),
        )
        return
      }

      const list = categoriesRef.current
      const lastIndex = list.findIndex((item) => item.slug === last.slug)
      const loaded = new Set(sectionsRef.current.map((section) => section.slug))

      if (lastIndex < 0) {
        reachedEndRef.current = true
        return
      }

      for (let index = lastIndex + 1; index < list.length; index += 1) {
        const category = list[index]
        if (loaded.has(category.slug)) continue
        const page = await fetchCategoryPage(category.slug, 1)
        if (token !== feedToken.current) return
        if (!page.products.length) continue
        setSections((prev) => [
          ...prev,
          {
            slug: category.slug,
            label: category.label,
            products: page.products,
            firstPage: 1,
            lastPage: 1,
            hasMore: page.hasMore,
          },
        ])
        return
      }

      reachedEndRef.current = true
    } catch {
      reachedEndRef.current = true
    } finally {
      appendingRef.current = false
      setAppending(false)
    }
  }, [fetchCategoryPage])

  const loadPrev = useCallback(async () => {
    if (prependingRef.current || reachedStartRef.current || !canLoadPrevRef.current) return
    const token = feedToken.current
    const first = sectionsRef.current[0]
    if (!first) return

    prependingRef.current = true
    setPrepending(true)

    try {
      if (first.firstPage > 1) {
        const previousPage = first.firstPage - 1
        const page = await fetchCategoryPage(first.slug, previousPage)
        if (token !== feedToken.current) return
        setSections((prev) =>
          prev.map((section, index) =>
            index === 0
              ? {
                  ...section,
                  products: mergeProducts(page.products, section.products),
                  firstPage: previousPage,
                }
              : section,
          ),
        )
        return
      }

      const list = categoriesRef.current
      const firstIndex = list.findIndex((item) => item.slug === first.slug)
      const loaded = new Set(sectionsRef.current.map((section) => section.slug))

      if (firstIndex < 0) {
        reachedStartRef.current = true
        return
      }

      for (let index = firstIndex - 1; index >= 0; index -= 1) {
        const category = list[index]
        if (loaded.has(category.slug)) continue
        const head = await fetchCategoryPage(category.slug, 1)
        if (token !== feedToken.current) return
        if (!head.products.length) continue

        const pageCount = Math.max(1, Math.ceil(head.total / PAGE_SIZE))
        let tail = head
        if (pageCount > 1) {
          tail = await fetchCategoryPage(category.slug, pageCount)
          if (token !== feedToken.current) return
        }

        setSections((prev) => [
          {
            slug: category.slug,
            label: category.label,
            products: tail.products,
            firstPage: pageCount,
            lastPage: pageCount,
            hasMore: false,
          },
          ...prev,
        ])
        return
      }

      reachedStartRef.current = true
    } catch {
      reachedStartRef.current = true
    } finally {
      prependingRef.current = false
      setPrepending(false)
    }
  }, [fetchCategoryPage])

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    const first = viewableItems.find((entry) => entry.item?.categorySlug)
    const slug = first?.item?.categorySlug
    if (!slug || slug === activeSlugRef.current) return
    setActiveSlug(slug)
  }).current

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 40,
    minimumViewTime: 80,
  }).current

  useEffect(() => {
    if (!activeSlug) return
    const index = categories.findIndex((item) => item.slug === activeSlug)
    if (index < 0) return
    try {
      railRef.current?.scrollToIndex({ index, viewPosition: 0.35, animated: true })
    } catch {
      railRef.current?.scrollToOffset({ offset: Math.max(0, index * 78 - 40), animated: true })
    }
  }, [activeSlug, categories])

  const selectCategory = (slug) => {
    const index = feed.findIndex((item) => item.categorySlug === slug)
    if (index >= 0) {
      setActiveSlug(slug)
      try {
        listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0 })
      } catch {
        listRef.current?.scrollToOffset({ offset: 0, animated: true })
      }
      return
    }
    startFeedAt(slug)
  }

  const openProduct = useCallback((slug, origin) => {
    navigation.navigate('Product', { slug, origin })
  }, [navigation])

  const renderProduct = useCallback(
    ({ item }) => (
      <FeedRow
        left={item.left}
        right={item.right}
        onPress={openProduct}
        wrapStyle={styles.cardWrap}
        rowStyle={styles.productRow}
      />
    ),
    [openProduct, styles.cardWrap, styles.productRow],
  )

  if (loadingCats) return <LoadingView />

  return (
    <View style={styles.screen}>
      <AppHeader navigation={navigation} />
      <View style={styles.box}>
        <View style={styles.rail}>
          <FlatList
            ref={railRef}
            data={categories}
            extraData={activeSlug}
            keyExtractor={(item) => item.slug}
            showsVerticalScrollIndicator={false}
            onScrollToIndexFailed={({ index }) => {
              railRef.current?.scrollToOffset({ offset: Math.max(0, index * 78 - 40), animated: true })
            }}
            renderItem={({ item }) => {
              const active = item.slug === activeSlug
              return (
                <Pressable style={[styles.railItem, active && styles.railActive]} onPress={() => selectCategory(item.slug)}>
                  {active ? <View style={styles.railBar} /> : null}
                  <View style={[styles.railImageWrap, active && styles.railImageActive]}>
                    <RemoteImage uri={item.image} style={styles.railImage} />
                  </View>
                  <Text style={[styles.railLabel, active && styles.railLabelActive]} numberOfLines={2}>
                    {item.label}
                  </Text>
                </Pressable>
              )
            }}
          />
        </View>

        <View style={styles.products}>
          {loadingFeed && !feed.length ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.brand} />
            </View>
          ) : (
            <FlatList
              ref={listRef}
              data={feed}
              keyExtractor={(item) => item.listKey}
              windowSize={6}
              maxToRenderPerBatch={4}
              updateCellsBatchingPeriod={50}
              initialNumToRender={6}
              removeClippedSubviews
              contentContainerStyle={styles.productList}
              onEndReached={loadNext}
              onEndReachedThreshold={0.45}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              maintainVisibleContentPosition={
                Platform.OS === 'ios' ? { minIndexForVisible: 1 } : undefined
              }
              onScroll={(event) => {
                const y = event.nativeEvent.contentOffset.y
                if (!canLoadPrevRef.current && y > 40) canLoadPrevRef.current = true
                if (canLoadPrevRef.current && y < 56) loadPrev()
              }}
              scrollEventThrottle={16}
              onScrollToIndexFailed={({ index }) => {
                listRef.current?.scrollToOffset({ offset: Math.max(0, index * 220), animated: true })
              }}
              ListEmptyComponent={<Text style={styles.empty}>No products yet in this category.</Text>}
              ListHeaderComponent={
                prepending ? <ActivityIndicator color={colors.brand} style={{ marginVertical: 8 }} /> : null
              }
              ListFooterComponent={appending ? <ActivityIndicator color={colors.brand} style={{ margin: 12 }} /> : null}
              renderItem={renderProduct}
            />
          )}
        </View>
      </View>
    </View>
  )
}

const createStyles = (c) => ({
  screen: { flex: 1, backgroundColor: c.canvas },
  box: {
    flex: 1,
    flexDirection: 'row',
    margin: BOX_MARGIN,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: c.panel,
  },
  rail: {
    width: RAIL_WIDTH,
    borderRightWidth: 1,
    borderRightColor: c.line,
    backgroundColor: c.panel,
  },
  railItem: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  railActive: { backgroundColor: c.panel2 },
  railBar: {
    position: 'absolute',
    right: 0,
    top: 10,
    bottom: 10,
    width: 3,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    backgroundColor: c.brand,
  },
  railImageWrap: {
    width: 42,
    height: 42,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: c.white,
    borderWidth: 1,
    borderColor: c.line,
  },
  railImageActive: { borderColor: c.brand },
  railImage: { width: '100%', height: '100%' },
  railLabel: {
    marginTop: 4,
    fontSize: 9,
    color: c.muted,
    textAlign: 'center',
    fontWeight: '600',
  },
  railLabelActive: { color: c.mint, fontWeight: '800' },
  products: { flex: 1, backgroundColor: c.canvas },
  productList: { paddingHorizontal: 3, paddingTop: 5, paddingBottom: 24 },
  productRow: { marginBottom: 5, flexDirection: 'row' },
  cardWrap: { flex: 1, paddingHorizontal: 3 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { color: c.muted, textAlign: 'center', marginTop: 40, paddingHorizontal: 16 },
})
