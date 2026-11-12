import { Image } from 'expo-image'

/** Catalog/remote images with disk+memory cache. Layout/props stay like expo-image. */
export default function RemoteImage({ uri, style, contentFit = 'cover', recyclingKey, ...rest }) {
  if (!uri) return null
  return (
    <Image
      source={{ uri }}
      style={style}
      contentFit={contentFit}
      cachePolicy="memory-disk"
      recyclingKey={recyclingKey || uri}
      transition={120}
      {...rest}
    />
  )
}
