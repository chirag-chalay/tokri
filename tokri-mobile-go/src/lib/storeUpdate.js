import { Platform } from 'react-native'
import Constants from 'expo-constants'
import { requireOptionalNativeModule } from 'expo'
import { APPLE_APP_ID, STORE_PACKAGE, appBuild } from './appBuild'

const CHECK_INTERVAL = 30 * 60 * 1000
const PROBE_TIMEOUT = 3500
let lastCheck

function versionParts(value) {
  return /^\d{1,8}(?:\.\d{1,8}){0,2}$/.test(String(value ?? ''))
    ? String(value).split('.').map(Number)
    : null
}

export function compareStoreVersions(left, right) {
  const a = versionParts(left)
  const b = versionParts(right)
  if (!a || !b) return null
  for (let index = 0; index < 3; index++) {
    const difference = (a[index] || 0) - (b[index] || 0)
    if (difference) return Math.sign(difference)
  }
  return 0
}

export function matchAppleUpdate(results, installedVersion, installedOs) {
  if (!Array.isArray(results)) return null
  const app = results.find(entry => String(entry?.trackId) === APPLE_APP_ID && entry.bundleId === STORE_PACKAGE)
  if (!app || compareStoreVersions(app.version, installedVersion) !== 1 ||
      ![0, 1].includes(compareStoreVersions(installedOs, app.minimumOsVersion))) return null
  return { id: `ios-${app.version}`, version: app.version }
}

async function probeStore() {
  const controller = new AbortController()
  let timer
  async function read() {
    if (Platform.OS === 'android') {
      const native = requireOptionalNativeModule('TokriPlayUpdates')
      if (!native) return undefined
      const availableBuild = await native.getAvailableBuild()
      const installedBuild = appBuild()
      return Number.isSafeInteger(availableBuild) && installedBuild > 0 && availableBuild > installedBuild
        ? { id: `android-${availableBuild}`, build: availableBuild }
        : null
    }
    const response = await fetch(`https://itunes.apple.com/lookup?id=${APPLE_APP_ID}&country=in`, { signal: controller.signal })
    if (!response.ok) return null
    const data = await response.json()
    // Expo updates are disabled, so expoConfig contains the version bundled with this release.
    return matchAppleUpdate(data?.results, Constants.expoConfig?.version, Platform.Version)
  }
  try {
    return await Promise.race([
      read(),
      new Promise(resolve => {
        timer = setTimeout(() => { controller.abort(); resolve(null) }, PROBE_TIMEOUT)
      }),
    ])
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

export function getStoreUpdate() {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') return Promise.resolve(undefined)
  const config = Constants.expoConfig
  const packageName = Platform.OS === 'ios' ? config?.ios?.bundleIdentifier : config?.android?.package
  if (packageName !== STORE_PACKAGE || Constants.executionEnvironment === 'storeClient' || __DEV__) {
    return Promise.resolve(undefined)
  }
  if (!lastCheck || Date.now() - lastCheck.at >= CHECK_INTERVAL) {
    lastCheck = { at: Date.now(), result: probeStore() }
  }
  return lastCheck.result
}
