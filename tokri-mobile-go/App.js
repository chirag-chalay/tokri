import { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { View } from 'react-native'
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context'
import { AuthProvider } from './src/context/AuthContext'
import { CartProvider } from './src/context/CartContext'
import { AddressProvider } from './src/context/AddressContext'
import { ThemeProvider, useTheme } from './src/context/ThemeContext'
import RootNavigator from './src/navigation/RootNavigator'
import { AnalyticsProvider } from './src/context/AnalyticsContext'
import AppUpdateGate from './src/components/AppUpdateGate'

function AppShell() {
  const { colors, isDark } = useTheme()

  // #region agent log
  useEffect(() => {
    let expoConfig = null
    try {
      // eslint-disable-next-line global-require, import/no-extraneous-dependencies
      expoConfig = require('expo-constants').default?.expoConfig || null
    } catch (_) {
      expoConfig = null
    }
    const splashPlugin = (expoConfig?.plugins || []).find(
      (p) => Array.isArray(p) && p[0] === 'expo-splash-screen',
    )
    fetch('http://127.0.0.1:7316/ingest/db52256f-3cb2-454c-a236-a9264b383672', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '0c79f7' },
      body: JSON.stringify({
        sessionId: '0c79f7',
        runId: 'post-fix-runtime',
        hypothesisId: 'A',
        location: 'App.js:AppShell',
        message: 'app boot branding config',
        data: {
          icon: expoConfig?.icon || null,
          adaptive: expoConfig?.android?.adaptiveIcon || null,
          splashPlugin: splashPlugin?.[1] || null,
          version: expoConfig?.version || null,
          versionCode: expoConfig?.android?.versionCode || null,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
  }, [])
  // #endregion

  return (
    <View style={{ flex: 1, backgroundColor: colors.panel }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppUpdateGate>
        <RootNavigator />
      </AppUpdateGate>
    </View>
  )
}

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ThemeProvider>
        <AnalyticsProvider>
        <AuthProvider>
          <AddressProvider>
            <CartProvider>
              <AppShell />
            </CartProvider>
          </AddressProvider>
        </AuthProvider>
        </AnalyticsProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
