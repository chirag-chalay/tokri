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
    version: '1.0.6',
    orientation: 'portrait',
    // App icon: website favicon mark (fruit "o") on brand green — used by iOS + Android legacy.
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      buildNumber: '11',
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
      versionCode: 12,
      usesCleartextTraffic: true,
      // Adaptive icon: transparent foreground mark + solid brand background (no stretch of favicon).
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
      'expo-sharing',
      [
        'expo-splash-screen',
        {
          // Website brand splash (splash-icon.png) on both platforms.
          backgroundColor: '#022c22',
          image: './assets/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          android: {
            image: './assets/splash-icon.png',
            backgroundColor: '#022c22',
            imageWidth: 200,
            resizeMode: 'contain',
          },
          ios: {
            image: './assets/splash-icon.png',
            backgroundColor: '#022c22',
            imageWidth: 220,
            resizeMode: 'contain',
          },
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
