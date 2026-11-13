# Tokriii customer app: analytics implementation handoff

Prepared 13 November 2026 from the `marketingdimpal` repository and local tooling. The customer app is `tokri-mobile-go`. “Unknown” means this could not be verified from the repository or currently available accounts; it is not a negative answer.

## Part A: Requested files and output

### `tokri-mobile-go/package.json`

```json
{
  "name": "tokri-mobile-go",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "TMPDIR=\"$PWD/.metro-tmp\" EXPO_UNSTABLE_HEADLESS=1 expo start --tunnel --clear",
    "start:lan": "TMPDIR=\"$PWD/.metro-tmp\" EXPO_UNSTABLE_HEADLESS=1 expo start --lan --clear",
    "start:tunnel": "TMPDIR=\"$PWD/.metro-tmp\" expo start --tunnel --clear",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "@expo/vector-icons": "^15.0.2",
    "@react-native-async-storage/async-storage": "2.2.0",
    "@react-native-community/datetimepicker": "9.2.1",
    "@react-navigation/bottom-tabs": "^7.18.16",
    "@react-navigation/native": "^7.3.16",
    "@react-navigation/native-stack": "^7.18.8",
    "expo": "^58.0.0",
    "expo-build-properties": "~58.0.12",
    "expo-file-system": "~58.0.13",
    "expo-image": "~58.0.18",
    "expo-intent-launcher": "~58.0.3",
    "expo-location": "~58.0.20",
    "expo-otp-autofill-consent": "^0.1.6",
    "expo-sharing": "~58.0.22",
    "expo-splash-screen": "~58.0.13",
    "expo-status-bar": "~58.0.4",
    "react": "19.3.0",
    "react-native": "0.88.1",
    "react-native-gesture-handler": "~3.3.0",
    "react-native-safe-area-context": "~5.11.1",
    "react-native-screens": "~4.30.1",
    "react-native-webview": "14.0.1"
  },
  "private": true,
  "devDependencies": {
    "@expo/ngrok": "^4.1.3"
  }
}
```

### `tokri-mobile-go/app.config.js`

```js
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
      buildNumber: '8',
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
      versionCode: 9,
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
          // Website wordmark (src/assets/tokri-logo.png) — contain keeps aspect ratio.
          image: './assets/splash-icon.png',
          imageWidth: 260,
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
```

### `npx expo-doctor`

```text
Running 20 checks on your project...
17/20 checks passed. 3 checks failed. Possible issues detected:
Use the --verbose flag to see more details about passed checks.

✖ Check that required peer dependencies are installed
Missing peer dependency: expo-font
Required by: @expo/vector-icons
Advice:
Install missing required peer dependency with "npx expo install expo-font"
Your app may crash outside of Expo Go without this dependency. Native module peer dependencies must be installed directly.

✖ Check that no duplicate dependencies are installed
Your project contains duplicate native module dependencies, which should be de-duplicated.
Native builds may only contain one version of any given native module, and having multiple versions of a single Native module installed may lead to unexpected build errors.
Found duplicates for expo-font:
  ├─ expo-font@57.0.4 (at: node_modules/expo-font)
  └─ expo-font@58.0.11 (at: node_modules/expo/node_modules/expo-font)
Advice:
Resolve your dependency issues and deduplicate your dependencies. Learn more: https://expo.fyi/resolving-dependency-issues

✖ Check that packages match versions required by installed Expo SDK

🔧 Patch version mismatches
package             expected  found
expo                ~58.0.25  58.0.23
expo-location       ~58.0.22  58.0.20
expo-sharing        ~58.0.23  58.0.22
expo-splash-screen  ~58.0.14  58.0.13
expo-status-bar     ~58.0.5   58.0.4

Changelogs:
- expo-location → https://github.com/expo/expo/blob/sdk-58/packages/expo-location/CHANGELOG.md
- expo-sharing → https://github.com/expo/expo/blob/sdk-58/packages/expo-sharing/CHANGELOG.md
- expo-splash-screen → https://github.com/expo/expo/blob/sdk-58/packages/expo-splash-screen/CHANGELOG.md
- expo-status-bar → https://github.com/expo/expo/blob/sdk-58/packages/expo-status-bar/CHANGELOG.md

5 packages out of date.
Advice:
Use 'npx expo install --check' to review and upgrade your dependencies.
To ignore specific packages, add them to "expo.install.exclude" in package.json. Learn more: https://expo.fyi/dependency-validation

3 checks failed, indicating possible issues with the project.
```

### `tokri-mobile-go/eas.json`

```json
{
  "cli": {
    "version": ">= 22.0.0",
    "appVersionSource": "local"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "APP_VARIANT": "staging",
        "EXPO_PUBLIC_API_BASE_URL": "https://server.tokriii.com/api/v1"
      }
    },
    "staging": {
      "distribution": "internal",
      "env": {
        "APP_VARIANT": "staging",
        "EXPO_PUBLIC_API_BASE_URL": "https://server.tokriii.com/api/v1"
      },
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "https://tokriii.com/api/v1"
      }
    },
    "production": {
      "distribution": "store",
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "https://tokriii.com/api/v1"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "6822043083"
      }
    }
  }
}
```

## Part B: Answers

### App setup

**1. Managed or bare?** The customer app is an Expo/config-plugin project with no checked-in `android/` or `ios/` directories. This is a managed/prebuild workflow in the current repository; it contains native dependencies and config plugins, so a custom development or production build may be required for native features. The local app instruction references Expo SDK 54 documentation, while `package.json` currently specifies Expo SDK 58; reconcile that instruction with the installed SDK before implementation.

**2. Navigation?** React Navigation: `@react-navigation/native`, native stack, and bottom tabs. Expo Router is not listed.

**3. WebViews?** Yes. `RazorpayCheckout.js` uses a WebView for card, netbanking, and wallet checkout; UPI commonly uses an external app/intent and backend polling. `CardPaySheet.js` also contains a WebView implementation, although its current usage was not established in this review. Native analytics SDKs do not automatically report actions inside third-party WebViews; record the relevant milestones at the native/backend boundaries.

**4. Firebase, Meta, analytics, push, Crashlytics, login SDKs?** No Firebase Analytics, Firebase/Crashlytics, Meta SDK, AppsFlyer, or dedicated analytics/ads SDK is declared in the customer app's `package.json`; no Firebase app configuration file was found in the tracked app tree. There is an `expo-otp-autofill-consent` package and an SMS/OTP login implemented through the backend, plus a `react-native-webview` dependency. The backend has device-token APIs, but that alone does not establish an installed app push SDK or an active push service. Dashboard-side integrations and configurations outside this checkout have not been verified.

### Accounts

**5. Android package and iOS bundle ID?** Production: both `com.tokriii.app`. When `APP_VARIANT=staging`, both are `com.tokriii.app.staging`. Source: `tokri-mobile-go/app.config.js`.

**6. Existing Firebase project or Meta app, and ownership?** Unknown. The web GA4 stream and Meta Pixel exist, but they do not establish the existence, ownership, or app registration of a Firebase project or Meta app. Check Firebase Console and Meta for Developers with the business owner. The EAS project ID in Part A identifies an Expo project, not proof of Firebase or Meta setup.

**7. Apple Developer and Google Play access?** Unknown. The project has an iOS App Store Connect app ID in `eas.json`; that does not identify who can access it. The owner stated that their app publisher will build and upload the update. Confirm the publisher's account access and which stores are active directly with them.

### Orders and purchase

**8. Payment methods and gateway?** The app supports cash/UPI on delivery when enabled, and online payment via Razorpay: UPI app intent, cards, netbanking and wallets, subject to backend settings and provider availability. UPI uses an external-app intent and reconciliation; other online methods use Razorpay Checkout in a WebView.

**9. Confirmation boundary and source?** The owner chose successful backend confirmation of COD as the Purchase boundary; a later cash/QR collection must not count again. The app calls `POST /checkout/confirm-cod` and awaits success. Online card/netbanking/wallet flows call `POST /checkout/verify-payment`, falling back to `/checkout/sync-payment`; UPI polls backend confirmation/sync until paid. The backend verifies or reconciles Razorpay before marking the online order paid. These are backend responses, not solely a success-screen signal. Note: the app's create-order request currently does not supply the website tracking context, so the existing **web-only** CAPI purchase logic does not instrument app orders.

**10. Order API data?** The create-order response includes `order.id`, `order.orderNo`, `order.grandTotal`, `paymentMode`, `expectedDeliveryDate`, plus `totals` and optional Razorpay payment details (whose currency is `INR`). It does **not** include a full item array in `order`. Authenticated `GET /account/orders/:orderNo` returns `id`, `orderNo`, status, payment status/method, `itemsTotal`, `deliveryCharge` (shipping), `handlingCharge`, `smallCartCharge`, `discount`, tax totals, `grandTotal`, and `items`. Each item includes an **order-line** `id`, product `slug` (nullable), `name`, `priceValue`, `quantity`, `lineTotal`, and discount/tax fields. It does not currently provide product category or an explicit order currency in this formatted response; the Razorpay create-order configuration uses `INR`, and the public product API declares currency. Use product `slug` as the shared catalog identifier when available, not the order-line ID. These response formats should be reviewed and, if needed, extended with a canonical confirmed purchase payload before instrumentation. Customer order responses also include an address; do not copy customer details or payment credentials into analytics.

**11. Purchase deduplication?** The current mobile app has no native purchase event implementation, so no native SDK deduplication across success-screen revisits or app restarts exists yet. The website backend uses a deterministic purchase identity and a unique outbox record for eligible **web** orders; that should not be assumed to cover app purchases. The app implementation needs one stable backend-confirmed purchase identity, durable idempotency across restarts, and consistent event name/ID for any chosen Meta app/server pairing. Avoid generating a purchase merely because a screen opens.

### Data match with website

**12. Product IDs consistent?** The public product formatter exposes the product slug as `id` and `slug`, and the mobile app's product normalizer prefers the same slug. The website event mapper uses product IDs derived from that public product object, so website and app catalog product identifiers are aligned by design. Order items' `id` is an order-line identifier; use `slug` where present. Whether these slugs match the **Meta catalog's** retailer IDs is **unknown** and must be checked against the actual feed/catalog, including deleted products where order-item slug may be null.

**13. Login with user ID?** Yes. Phone/OTP login returns a customer ID and bearer token, stored by the app's AuthContext in AsyncStorage. For analytics use a stable, non-PII identifier and the appropriate consent/SDK rules; never send the bearer token or raw phone as an analytics parameter.

### Release

**14. Android/iPhone test devices and test order account?** Unknown. The repo does not establish physical device access, a dedicated test account, or whether the payment gateway has usable test credentials. The owner said their app publisher will build and upload. Ask them to confirm devices, test account, test environment and payment test mode before doing purchase tests; do not create real production orders merely to test tracking.

**15. Current live version and OTA?** The repository's configuration specifies version `1.0.6`, Android `versionCode: 9`, and iOS `buildNumber: 8`; these are **configured source values**, not verified live Google Play/App Store versions. `updates.enabled: false`, and `expo-updates` is not declared as a direct dependency, so this config does not enable Expo OTA updates. Confirm the live store versions, build numbers and release state with the app publisher. A new native build and store distribution are expected for app SDK changes.

## Key source files

- App configuration: `tokri-mobile-go/package.json`, `app.config.js`, `eas.json`, `AGENTS.md`.
- Checkout and payment: `tokri-mobile-go/src/screens/CartScreen.js`, `UpiPaymentScreen.js`, `src/components/RazorpayCheckout.js`, `src/components/PaymentSheet.js`.
- Login and product IDs: `tokri-mobile-go/src/context/AuthContext.js`, `src/lib/api.js`, `server/src/utils/formatters.js`.
- Order payload and confirmation: `server/src/services/customerOrders.js`, `server/src/services/checkout.js`, `server/src/services/trackingPurchase.js`.
