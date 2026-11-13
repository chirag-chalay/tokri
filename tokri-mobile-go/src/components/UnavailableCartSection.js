import { useState } from 'react'
import { ScrollView, Pressable, Text, View } from 'react-native'
import { useThemedStyles } from '../context/ThemeContext'
import { resolveAssetUrl } from '../lib/api'
import Icon from './Icon'
import ProductCard from './ProductCard'
import RemoteImage from './RemoteImage'

const CARD_GAP = 10
const SIDE_PAD = 14

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
              <View key={product.slug} style={[styles.suggestCard, { width: cardWidth, marginRight: CARD_GAP }]}>
                <ProductCard
                  product={product}
                  compact
                  onPress={(slug, origin) => onPressSuggestion?.(slug, origin)}
                />
              </View>
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
  suggestCard: {},
})
