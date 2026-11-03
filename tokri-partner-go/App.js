import { StatusBar } from 'expo-status-bar'
import { ActivityIndicator, View } from 'react-native'
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context'
import { AuthProvider, useAuth } from './src/context/AuthContext'
import RootNavigator from './src/navigation/RootNavigator'
import { COLORS } from './src/config'

function AppShell() {
  const { booting } = useAuth()
  if (booting) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.canvas }}>
        <ActivityIndicator color={COLORS.brand} size="large" />
      </View>
    )
  }
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.canvas }}>
      <StatusBar style="dark" />
      <RootNavigator />
    </View>
  )
}

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </SafeAreaProvider>
  )
}
