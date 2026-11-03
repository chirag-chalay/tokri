import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuth } from '../context/AuthContext'
import LoginScreen from '../screens/LoginScreen'
import OrdersScreen from '../screens/OrdersScreen'
import OrderDetailScreen from '../screens/OrderDetailScreen'
import { COLORS } from '../config'

const Stack = createNativeStackNavigator()

export default function RootNavigator() {
  const { isLoggedIn } = useAuth()

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.panel },
          headerTintColor: COLORS.text,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: COLORS.canvas },
        }}
      >
        {isLoggedIn ? (
          <>
            <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: 'My deliveries' }} />
            <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order' }} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
