import { useEffect, useRef, useState } from 'react'
import { Animated, Dimensions, Linking, Pressable, View } from 'react-native'
import RemoteImage from '../components/RemoteImage'
import { useThemedStyles } from '../context/ThemeContext'
import { openHomeLink } from './homeLinks'

const SCREEN_WIDTH = Dimensions.get('window').width
const SIDE_PEEK = 44
const GAP = 12
const CARD_WIDTH = SCREEN_WIDTH - SIDE_PEEK * 2
const CARD_HEIGHT = Math.round(CARD_WIDTH * 0.5)
const SNAP = CARD_WIDTH + GAP
const DEFAULT_AUTOPLAY_SECONDS = 3
/** Side cards stay almost as wide but clearly shorter — center reads taller. */
const SIDE_SCALE_X = 0.94
const SIDE_SCALE_Y = 0.78

function openSlide(navigation, slide) {
  if (slide.link?.type === 'url' && slide.link?.value) {
    Linking.openURL(slide.link.value).catch(() => {})
    return
  }
  openHomeLink(navigation, slide.link)
}

function PromoCard({ slide, trackIndex, scrollX, navigation, styles, isLast }) {
  const scaleX = scrollX.interpolate({
    inputRange: [(trackIndex - 1) * SNAP, trackIndex * SNAP, (trackIndex + 1) * SNAP],
    outputRange: [SIDE_SCALE_X, 1, SIDE_SCALE_X],
    extrapolate: 'clamp',
  })
  const scaleY = scrollX.interpolate({
    inputRange: [(trackIndex - 1) * SNAP, trackIndex * SNAP, (trackIndex + 1) * SNAP],
    outputRange: [SIDE_SCALE_Y, 1, SIDE_SCALE_Y],
    extrapolate: 'clamp',
  })

  return (
    <Animated.View
      style={[
        styles.cardShell,
        !isLast ? styles.cardGap : null,
        { transform: [{ scaleX }, { scaleY }] },
      ]}
    >
      <Pressable style={styles.card} onPress={() => openSlide(navigation, slide)}>
        <RemoteImage uri={slide.image} style={styles.image} contentFit="cover" />
      </Pressable>
    </Animated.View>
  )
}

export default function PromoSlider({ slides = [], autoplaySeconds = DEFAULT_AUTOPLAY_SECONDS, navigation }) {
  const styles = useThemedStyles(createStyles)
  const items = (slides || []).filter((slide) => slide.image)
  const loop = items.length > 1
  const track = loop ? [items[items.length - 1], ...items, items[0]] : items
  const scroller = useRef(null)
  const indexRef = useRef(loop ? 1 : 0)
  const scrollX = useRef(new Animated.Value(loop ? SNAP : 0)).current
  const [ready, setReady] = useState(false)

  const jumpTo = (trackIndex, animated) => {
    indexRef.current = trackIndex
    scroller.current?.scrollTo({ x: trackIndex * SNAP, animated })
    if (!animated) {
      scrollX.setValue(trackIndex * SNAP)
    }
  }

  const normalizeOffset = (trackIndex) => {
    if (!loop) return trackIndex
    if (trackIndex <= 0) {
      jumpTo(items.length, false)
      return items.length
    }
    if (trackIndex >= items.length + 1) {
      jumpTo(1, false)
      return 1
    }
    return trackIndex
  }

  useEffect(() => {
    if (!items.length) return undefined
    const id = requestAnimationFrame(() => {
      jumpTo(loop ? 1 : 0, false)
      setReady(true)
    })
    return () => cancelAnimationFrame(id)
  }, [items.length, loop])

  useEffect(() => {
    if (!ready || !loop) return undefined
    const seconds = Number(autoplaySeconds)
    const ms = (Number.isFinite(seconds) && seconds > 0 ? seconds : DEFAULT_AUTOPLAY_SECONDS) * 1000
    const timer = setInterval(() => {
      jumpTo(indexRef.current + 1, true)
    }, ms)
    return () => clearInterval(timer)
  }, [autoplaySeconds, items.length, loop, ready])

  if (!items.length) return null

  return (
    <View style={styles.wrap}>
      <Animated.ScrollView
        ref={scroller}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={SNAP}
        snapToAlignment="start"
        disableIntervalMomentum
        contentContainerStyle={styles.row}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: true,
        })}
        onMomentumScrollEnd={(event) => {
          const next = Math.round(event.nativeEvent.contentOffset.x / SNAP)
          indexRef.current = normalizeOffset(next)
        }}
      >
        {track.map((slide, trackIndex) => (
          <PromoCard
            key={`${slide.id || 'slide'}-${trackIndex}`}
            slide={slide}
            trackIndex={trackIndex}
            scrollX={scrollX}
            navigation={navigation}
            styles={styles}
            isLast={trackIndex === track.length - 1}
          />
        ))}
      </Animated.ScrollView>
    </View>
  )
}

const createStyles = (c) => ({
  wrap: {
    marginTop: 14,
    overflow: 'visible',
  },
  row: {
    paddingHorizontal: SIDE_PEEK,
    alignItems: 'center',
    paddingVertical: Math.round(CARD_HEIGHT * (1 - SIDE_SCALE_Y) * 0.5) + 4,
  },
  cardShell: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  cardGap: {
    marginRight: GAP,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: c.panel2,
  },
  image: {
    width: '100%',
    height: '100%',
  },
})
