import { Text, View } from 'react-native'
import { useThemedStyles } from '../context/ThemeContext'
import BannerSlider from './BannerSlider'
import CategoryStrip from './CategoryStrip'
import ProductRail from './ProductRail'
import ImageBanner from './ImageBanner'
import MobileBanner from './MobileBanner'
import PromoSlider from './PromoSlider'

export default function HomeSectionRenderer({
  sections = [],
  navigation,
  onProduct,
  onCategory,
}) {
  const styles = useThemedStyles(createStyles)

  return (
    <View>
      {(sections || []).map((section) => {
        switch (section.type) {
          case 'banner_slider':
            return (
              <BannerSlider
                key={section.id}
                slides={section.slides}
                autoplaySeconds={section.autoplaySeconds}
                navigation={navigation}
              />
            )
          case 'category_strip':
            return (
              <CategoryStrip
                key={section.id}
                title={section.title}
                categories={section.categories}
                onCategory={onCategory}
              />
            )
          case 'product_rail':
            return (
              <ProductRail
                key={section.id}
                title={section.title}
                products={section.products}
                seeAll={section.seeAll}
                seeAllLink={section.seeAllLink}
                onProduct={onProduct}
                navigation={navigation}
                listId={`home_${section.id}`}
              />
            )
          case 'category_rails':
            return (
              <View key={section.id}>
                {section.title ? <Text style={styles.sectionTitle}>{section.title}</Text> : null}
                {(section.rows || []).map((row) => (
                  <ProductRail
                    key={`${section.id}-${row.category?.slug}`}
                    title={row.category?.label || ''}
                    products={row.products}
                    seeAll
                    seeAllLink={{ type: 'category', value: row.category?.slug || '' }}
                    onProduct={onProduct}
                    navigation={navigation}
                    listId={`home_${row.category?.slug || section.id}`}
                  />
                ))}
              </View>
            )
          case 'image_banner':
            return (
              <ImageBanner
                key={section.id}
                image={section.image}
                mobileImage={section.mobileImage}
                link={section.link}
                navigation={navigation}
              />
            )
          case 'mobile_banner':
            return (
              <MobileBanner
                key={section.id}
                image={section.image}
                link={section.link}
                fullWidth={Boolean(section.fullWidth)}
                navigation={navigation}
              />
            )
          case 'promo_slider':
            return (
              <PromoSlider
                key={section.id}
                slides={section.slides}
                autoplaySeconds={section.autoplaySeconds}
                navigation={navigation}
              />
            )
          default:
            return null
        }
      })}
    </View>
  )
}

const createStyles = (c) => ({
  sectionTitle: {
    color: c.text,
    fontSize: 20,
    fontWeight: '800',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
  },
})
