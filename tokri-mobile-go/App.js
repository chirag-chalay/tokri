import { StatusBar } from 'expo-status-bar'
import { AppState, View } from 'react-native'
import { useEffect } from 'react'
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context'
import { AuthProvider, useAuth } from './src/context/AuthContext'
import { CartProvider } from './src/context/CartContext'
import { AddressProvider } from './src/context/AddressContext'
import { ThemeProvider, useTheme } from './src/context/ThemeContext'
import RootNavigator from './src/navigation/RootNavigator'
import { AnalyticsProvider, useAnalyticsSettings } from './src/context/AnalyticsContext'
import { recoverPurchases, setPurchaseTrackingSession } from './src/lib/purchaseTracking'
import AppUpdateGate from './src/components/AppUpdateGate'

function AppShell() {
  const { colors, isDark } = useTheme()
  const { token, user } = useAuth()
  const { choice } = useAnalyticsSettings()
  useEffect(() => {
    setPurchaseTrackingSession(token ? user?.id : null)
    return () => setPurchaseTrackingSession(null)
  }, [token, user?.id])
  useEffect(() => {
    if (!choice || !token || !user?.id) return undefined
    const recover = () => recoverPurchases(token, user.id).catch(() => {})
    recover()
    const subscription = AppState.addEventListener('change', (state) => { if (state === 'active') recover() })
    return () => subscription.remove()
  }, [choice, token, user?.id])

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
