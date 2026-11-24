import { Linking, Pressable, View } from 'react-native'
import RemoteImage from '../components/RemoteImage'
import { useThemedStyles } from '../context/ThemeContext'
import { openHomeLink } from './homeLinks'

export default function ImageBanner({ image, mobileImage, link, navigation }) {
  const styles = useThemedStyles(createStyles)
  const uri = mobileImage || image
  if (!uri) return null

  return (
    <Pressable
      style={styles.wrap}
      onPress={() => {
        if (link?.type === 'url' && link?.value) {
          Linking.openURL(link.value).catch(() => {})
          return
        }
        openHomeLink(navigation, link)
      }}
    >
      <RemoteImage uri={uri} style={styles.image} />
      <View />
    </Pressable>
  )
}

const createStyles = (c) => ({
  wrap: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: c.panel2,
  },
  image: {
    width: '100%',
    height: 140,
  },
})
