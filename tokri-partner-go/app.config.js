const LIVE_API = 'https://tokriii.com/api/v1'
const STAGING_API = 'https://server.tokriii.com/api/v1'

function resolveApiBaseUrl() {
  const fromEnv = String(process.env.EXPO_PUBLIC_API_BASE_URL || '')
    .trim()
    .replace(/\/+$/, '')
  if (fromEnv) return fromEnv
  if (process.env.EAS_BUILD_PROFILE === 'production') return LIVE_API
  // Local Expo + development/staging EAS → staging by default
  return STAGING_API
}

const apiBaseUrl = resolveApiBaseUrl()
const isStaging = process.env.APP_VARIANT === 'staging' || !process.env.EAS_BUILD_PROFILE || process.env.EAS_BUILD_PROFILE !== 'production'
const isLiveApi = apiBaseUrl.includes('tokriii.com') && !apiBaseUrl.includes('server.tokriii.com')

module.exports = {
  expo: {
    name: isLiveApi ? 'Tokriii Partner' : 'Tokriii Partner Staging',
    slug: 'tokriii-partner',
    version: '1.0.1',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    ios: {
      supportsTablet: false,
      buildNumber: '2',
      bundleIdentifier: isLiveApi ? 'com.tokriii.partner' : 'com.tokriii.partner.staging',
    },
    updates: { enabled: false },
    android: {
      package: isLiveApi ? 'com.tokriii.partner' : 'com.tokriii.partner.staging',
      versionCode: 2,
      usesCleartextTraffic: true,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#022c22',
      },
    },
    web: { favicon: './assets/favicon.png' },
    extra: {
      apiBaseUrl,
      isLiveApi,
      eas: {
        // Fill after `eas init` for this project
        projectId: process.env.EAS_PROJECT_ID || '',
      },
    },
    plugins: [
      'expo-font',
      'expo-image',
      'expo-status-bar',
      [
        'expo-splash-screen',
        {
          image: './assets/splash-icon.png',
          imageWidth: 280,
          resizeMode: 'contain',
          backgroundColor: '#022c22',
        },
      ],
    ],
  },
}
