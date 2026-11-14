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
import { recoverPurchases, setPurchaseTrackingSession, flushRevocations } from './src/lib/purchaseTracking'
import { loadAnalyticsChoice, setAnalyticsCustomer } from './src/lib/analytics'
import AppUpdateGate from './src/components/AppUpdateGate'

function AppShell() {
  const { colors, isDark } = useTheme()
  const { token, user } = useAuth()
  const { choice } = useAnalyticsSettings()
  useEffect(() => {
    setPurchaseTrackingSession(token ? user?.id : null)
    setAnalyticsCustomer(token ? user?.id : null)
    return () => { setPurchaseTrackingSession(null); setAnalyticsCustomer(null) }
  }, [token, user?.id])
  useEffect(() => {
    if (!token || !user?.id) return undefined
    const cleanup = () => flushRevocations(token, user.id).catch(() => {})
    cleanup()
    const subscription = AppState.addEventListener('change', (state) => { if (state === 'active') cleanup() })
    return () => subscription.remove()
  }, [token, user?.id])
  useEffect(() => {
    if (!choice || !token || !user?.id) return undefined
    const recover = () => loadAnalyticsChoice().then(() => recoverPurchases(token, user.id)).catch(() => {})
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
        <AuthProvider>
          <AnalyticsProvider>
            <AddressProvider>
              <CartProvider>
                <AppShell />
              </CartProvider>
            </AddressProvider>
          </AnalyticsProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
