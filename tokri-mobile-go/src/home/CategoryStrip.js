import { Dimensions, Pressable, ScrollView, Text, View } from 'react-native'
import RemoteImage from '../components/RemoteImage'
import { useThemedStyles } from '../context/ThemeContext'

const SCREEN_WIDTH = Dimensions.get('window').width
const CAT_GAP = 10
const CAT_PAD = 16
const CAT_ITEM_WIDTH = (SCREEN_WIDTH - CAT_PAD - CAT_GAP * 3) / 3.5

export default function CategoryStrip({ title = '', categories = [], onCategory }) {
  const styles = useThemedStyles(createStyles)
  if (!categories.length) return null

  return (
    <View style={styles.wrap}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {categories.map((category) => (
          <Pressable
            key={category.slug}
            style={styles.item}
            onPress={() => onCategory?.(category.slug)}
          >
            <RemoteImage uri={category.image} style={styles.image} />
            <Text style={styles.label} numberOfLines={2}>
              {category.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
}

const createStyles = (c) => ({
  wrap: { marginTop: 8 },
  title: {
    color: c.text,
    fontSize: 20,
    fontWeight: '800',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  row: {
    paddingLeft: CAT_PAD,
    paddingRight: CAT_PAD,
    paddingTop: 8,
    paddingBottom: 8,
  },
  item: {
    width: CAT_ITEM_WIDTH,
    marginRight: CAT_GAP,
    alignItems: 'center',
  },
  image: {
    width: CAT_ITEM_WIDTH - 8,
    height: CAT_ITEM_WIDTH - 8,
    borderRadius: 14,
    backgroundColor: c.panel2,
  },
  label: {
    marginTop: 6,
    color: c.muted,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
})
