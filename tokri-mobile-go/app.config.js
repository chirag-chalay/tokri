const fs = require('fs')

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
const metaEnabled = !isStaging && process.env.META_ENABLED !== 'false' && Boolean(process.env.META_APP_ID && process.env.META_CLIENT_TOKEN)
if (process.env.EAS_BUILD && !isStaging && process.env.META_ENABLED !== 'false' && !metaEnabled) {
  throw new Error('Configure META_APP_ID and META_CLIENT_TOKEN in the production EAS environment, or explicitly set META_ENABLED=false.')
}
// Separate file variables must be configured for each EAS environment.
const androidFirebase = process.env.GOOGLE_SERVICES_JSON || (!isStaging ? './firebase/production/google-services.json' : null)
const iosFirebase = process.env.GOOGLE_SERVICE_INFO_PLIST || (!isStaging ? './firebase/production/GoogleService-Info.plist' : null)
if (process.env.EAS_BUILD && (!androidFirebase || !iosFirebase || !fs.existsSync(androidFirebase) || !fs.existsSync(iosFirebase))) {
  throw new Error('Firebase files are missing for this app variant. Configure both EAS file variables for the matching environment.')
}
if (process.env.EAS_BUILD) {
  const androidConfig = JSON.parse(fs.readFileSync(androidFirebase, 'utf8'))
  const iosConfig = require('@expo/plist').default.parse(fs.readFileSync(iosFirebase, 'utf8'))
  const expectedId = isStaging ? 'com.tokriii.app.staging' : 'com.tokriii.app'
  const androidIds = (androidConfig.client || []).map((client) => client.client_info?.android_client_info?.package_name)
  const androidProject = androidConfig.project_info?.project_id
  if (!androidIds.includes(expectedId) || iosConfig.BUNDLE_ID !== expectedId || !androidProject || androidProject !== iosConfig.PROJECT_ID) {
    throw new Error('Firebase app identifiers or projects do not match the selected build variant.')
  }
  if (isStaging && androidProject === 'tokriii-ec2de') {
    throw new Error('The staging app must not use the production Firebase project.')
  }
}

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
      ...(iosFirebase ? { googleServicesFile: iosFirebase } : {}),
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
      ...(androidFirebase ? { googleServicesFile: androidFirebase } : {}),
      versionCode: 12,
      ...(metaEnabled ? { permissions: ['com.google.android.gms.permission.AD_ID'] } : {}),
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
      metaEnabled,
      metaAppId: metaEnabled ? process.env.META_APP_ID : null,
      eas: {
        projectId: '691345d1-b096-4f13-b978-0750f6e66762',
      },
    },
    plugins: [
      ['react-native-fbsdk-next', {
        appID: metaEnabled ? process.env.META_APP_ID : '0',
        clientToken: metaEnabled ? process.env.META_CLIENT_TOKEN : 'disabled',
        displayName: process.env.META_APP_DISPLAY_NAME || 'Tokriii',
        scheme: metaEnabled ? `fb${process.env.META_APP_ID}` : 'fb0',
        isAutoInitEnabled: false,
        autoLogAppEventsEnabled: false,
        advertiserIDCollectionEnabled: false,
        iosUserTrackingPermission: 'Allow Tokriii to measure advertising performance and personalize ads with your permission.',
      }],
      ['expo-tracking-transparency', { userTrackingPermission: 'Allow Tokriii to measure advertising performance and personalize ads with your permission.' }],
      '@react-native-firebase/app',
      '@react-native-firebase/analytics',
      ['expo-build-properties', { android: { minSdkVersion: 24, kotlinVersion: '2.4.0' }, ios: { useFrameworks: 'dynamic' } }],
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
