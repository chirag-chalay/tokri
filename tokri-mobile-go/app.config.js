const LIVE_API = 'https://tokriii.com/api/v1'
const STAGING_API = 'https://server.tokriii.com/api/v1'

function resolveApiBaseUrl() {
  const fromEnv = String(process.env.EXPO_PUBLIC_API_BASE_URL || '')
    .trim()
    .replace(/\/+$/, '')
  if (fromEnv) return fromEnv
  if (process.env.EAS_BUILD_PROFILE === 'staging') return STAGING_API
  return LIVE_API
}

const apiBaseUrl = resolveApiBaseUrl()
const isStaging = process.env.APP_VARIANT === 'staging'

module.exports = {
  expo: {
    name: isStaging ? 'Tokriii Staging' : 'Tokriii',
    slug: 'tokriii',
    version: '1.0.5',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      buildNumber: '7',
      bundleIdentifier: isStaging ? 'com.tokriii.app.staging' : 'com.tokriii.app',
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'Tokriii uses your location to show where you are. Your saved delivery address is not changed unless you update it.',
        LSApplicationQueriesSchemes: [
          'tez',
          'phonepe',
          'paytmmp',
          'credpay',
          'amazonpay',
          'upi',
          'gpay',
        ],
      },
    },
    updates: {
      enabled: false,
    },
    android: {
      package: isStaging ? 'com.tokriii.app.staging' : 'com.tokriii.app',
      versionCode: 8,
      usesCleartextTraffic: true,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#022c22',
      },
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      apiBaseUrl,
      eas: {
        projectId: '691345d1-b096-4f13-b978-0750f6e66762',
      },
    },
    plugins: [
      './plugins/withUpiApps',
      [
        'expo-splash-screen',
        {
          image: './assets/splash-icon.png',
          imageWidth: 280,
          resizeMode: 'contain',
          backgroundColor: '#022c22',
        },
      ],
      '@react-native-community/datetimepicker',
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            'Tokriii uses your location to show where you are. Your saved delivery address is not changed unless you update it.',
        },
      ],
    ],
  },
}
