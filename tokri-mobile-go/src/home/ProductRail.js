import { Pressable, Text, View } from 'react-native'
import ProductCard from '../components/ProductCard'
import { useThemedStyles } from '../context/ThemeContext'
import { openHomeLink } from './homeLinks'

export default function ProductRail({
  title = '',
  products = [],
  seeAll = false,
  seeAllLink = null,
  onProduct,
  navigation,
  listId = 'home_rail',
}) {
  const styles = useThemedStyles(createStyles)
  if (!products.length) return null

  return (
    <View style={styles.section}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      <View style={styles.grid}>
        {products.map((product) => (
          <View key={product.slug} style={styles.cardWrap}>
            <ProductCard product={product} onPress={onProduct} listId={listId} compact />
          </View>
        ))}
      </View>
      {seeAll ? (
        <Pressable
          style={styles.seeAllBtn}
          onPress={() => openHomeLink(navigation, seeAllLink || { type: 'shop', value: '' })}
        >
          <Text style={styles.seeAllText}>See all products</Text>
        </Pressable>
      ) : null}
    </View>
  )
}

const createStyles = (c) => ({
  section: { marginTop: 8 },
  sectionTitle: {
    color: c.text,
    fontSize: 20,
    fontWeight: '800',
    marginHorizontal: 16,
    marginTop: 16,
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
