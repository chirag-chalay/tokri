import { useEffect, useRef, useState } from 'react'
import { Dimensions, Linking, Pressable, ScrollView, View } from 'react-native'
import RemoteImage from '../components/RemoteImage'
import { useThemedStyles } from '../context/ThemeContext'
import { openHomeLink } from './homeLinks'

const WIDTH = Dimensions.get('window').width

export default function BannerSlider({ slides = [], autoplaySeconds = 5, navigation }) {
  const styles = useThemedStyles(createStyles)
  const items = (slides || []).filter((slide) => slide.image || slide.mobileImage)
  const [index, setIndex] = useState(0)
  const scroller = useRef(null)

  useEffect(() => {
    if (items.length < 2) return undefined
    const ms = Math.max(Number(autoplaySeconds) || 0, 0) * 1000
    if (!ms) return undefined
    const timer = setInterval(() => {
      setIndex((current) => {
        const next = (current + 1) % items.length
        scroller.current?.scrollTo({ x: next * (WIDTH - 32), animated: true })
        return next
      })
    }, ms)
    return () => clearInterval(timer)
  }, [autoplaySeconds, items.length])

  if (!items.length) return null

  return (
    <View style={styles.wrap}>
      <ScrollView
        ref={scroller}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const next = Math.round(event.nativeEvent.contentOffset.x / (WIDTH - 32))
          setIndex(next)
        }}
      >
        {items.map((slide) => {
          const uri = slide.mobileImage || slide.image
          return (
            <Pressable
              key={slide.id}
              style={styles.slide}
              onPress={() => {
                if (slide.link?.type === 'url' && slide.link?.value) {
                  Linking.openURL(slide.link.value).catch(() => {})
                  return
                }
                openHomeLink(navigation, slide.link)
              }}
            >
              <RemoteImage uri={uri} style={styles.image} />
            </Pressable>
          )
        })}
      </ScrollView>
      {items.length > 1 ? (
        <View style={styles.dots}>
          {items.map((slide, dotIndex) => (
            <View key={slide.id || dotIndex} style={[styles.dot, dotIndex === index && styles.dotOn]} />
          ))}
        </View>
      ) : null}
    </View>
  )
}

const createStyles = (c) => ({
  wrap: { marginTop: 12, marginHorizontal: 16 },
  slide: {
    width: WIDTH - 32,
    height: Math.round((WIDTH - 32) / 2),
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: c.panel2,
  },
  image: { width: '100%', height: '100%' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 8 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: c.line },
  dotOn: { backgroundColor: c.brand },
})
