import { Linking, Pressable } from 'react-native'
import RemoteImage from '../components/RemoteImage'
import { useThemedStyles } from '../context/ThemeContext'
import { openHomeLink } from './homeLinks'

export default function MobileBanner({ image, link, fullWidth = false, navigation }) {
  const styles = useThemedStyles((c) => createStyles(c, Boolean(fullWidth)))
  if (!image) return null

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
      <RemoteImage uri={image} style={styles.image} contentFit="cover" />
    </Pressable>
  )
}

const createStyles = (c, fullWidth) => ({
  wrap: {
    marginHorizontal: fullWidth ? 0 : 16,
    marginTop: 12,
    borderRadius: fullWidth ? 0 : 16,
    overflow: 'hidden',
    backgroundColor: c.panel2,
  },
  image: {
    width: '100%',
    height: fullWidth ? 160 : 148,
  },
})
