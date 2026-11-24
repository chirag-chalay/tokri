import { NativeModules, TurboModuleRegistry } from 'react-native'
import Constants from 'expo-constants'

/** Expo Go / store client — no custom native modules. */
export function isExpoGo() {
  if (Constants.appOwnership === 'expo') return true
  if (Constants.executionEnvironment === 'storeClient') return true
  return false
}

function hasRnfirebaseNative() {
  try {
    if (TurboModuleRegistry?.get?.('NativeRNFBTurboApp')) return true
  } catch {}
  try {
    if (NativeModules?.RNFBAppModule) return true
  } catch {}
  return false
}

/**
 * Only load Firebase / Meta when a real native binary is present.
 * Expo Go and incomplete installs must never require those packages.
 */
export function canUseNativeTrackingSdks() {
  if (isExpoGo()) return false
  return hasRnfirebaseNative()
}
