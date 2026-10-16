import { Platform } from 'react-native'
import Constants from 'expo-constants'

const APPLE_APP_ID = ''

export function appPlatform() {
  return Platform.OS === 'ios' ? 'ios' : 'android'
}

export function appBuild() {
  const native = Number(Constants.nativeBuildVersion)
  if (Number.isInteger(native) && native > 0) return native
  const configured = Platform.OS === 'ios'
    ? Number(Constants.expoConfig?.ios?.buildNumber)
    : Number(Constants.expoConfig?.android?.versionCode)
  return Number.isInteger(configured) && configured > 0 ? configured : 0
}

export function storeUrl() {
  if (appPlatform() === 'ios') {
    return APPLE_APP_ID
      ? `https://apps.apple.com/app/id${APPLE_APP_ID}`
      : 'https://apps.apple.com/search?term=Tokriii'
  }
  return 'https://play.google.com/store/apps/details?id=com.tokriii.app'
}
