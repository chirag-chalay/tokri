import { NavigationContainer, DefaultTheme } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useEffect, useMemo, useRef } from 'react'
import { trackScreen } from '../lib/analytics'
import { useAnalyticsSettings } from '../context/AnalyticsContext'
import { View } from 'react-native'
import Icon from '../components/Icon'
import HomeScreen from '../screens/HomeScreen'
import ShopScreen from '../screens/ShopScreen'
import CartScreen from '../screens/CartScreen'
import ReorderScreen from '../screens/ReorderScreen'
import AccountScreen from '../screens/AccountScreen'
import ProductScreen from '../screens/ProductScreen'
import LoginScreen from '../screens/LoginScreen'
import OtpScreen from '../screens/OtpScreen'
import SearchScreen from '../screens/SearchScreen'
import OrdersScreen from '../screens/OrdersScreen'
import OrderDetailScreen from '../screens/OrderDetailScreen'
import UpiPaymentScreen from '../screens/UpiPaymentScreen'
import { useCart } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'
import AddressPicker from '../components/AddressPicker'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

function TabIcon({ name, focused, badge }) {
  const { colors } = useTheme()
  return (
    <View>
      <Icon name={focused ? name : `${name}-outline`} size={22} color={focused ? colors.brand : colors.muted} />
      {badge ? <View style={[styles.dot, { backgroundColor: colors.brand }]} /> : null}
    </View>
  )
}

const styles = {
  dot: {
    position: 'absolute',
    top: -2,
    right: -6,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
}

function Tabs() {
  const { totalCount } = useCart()
  const { colors } = useTheme()

  // Built-in BottomTabBar already applies safe-area insets (height + paddingBottom).
  // Only theme colours here — never hardcode height / paddingBottom / gesture floors.
  const tabBarStyle = {
    backgroundColor: colors.panel,
    borderTopColor: colors.line,
  }

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Reorder"
        component={ReorderScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="reload" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Categories"
        component={ShopScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="grid" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarStyle: { display: 'none' },
          tabBarIcon: ({ focused }) => <TabIcon name="person" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarStyle: { display: 'none' },
          tabBarLabel: totalCount ? `Checkout (${totalCount})` : 'Checkout',
          tabBarIcon: ({ focused }) => <TabIcon name="cart" focused={focused} badge={totalCount > 0} />,
        }}
      />
    </Tab.Navigator>
  )
}

export default function RootNavigator() {
  const { colors, isDark } = useTheme()
  const navigationRef = useRef(null)
  const { choice } = useAnalyticsSettings()
  const screenRef = useRef(null)
  const reportScreen = () => {
    const name = navigationRef.current?.getCurrentRoute()?.name
    if (name && screenRef.current !== name) {
      screenRef.current = name
      trackScreen(name)
    }
  }
  useEffect(() => {
    if (choice) trackScreen(navigationRef.current?.getCurrentRoute()?.name)
  }, [choice])
  const navTheme = useMemo(
    () => ({
      ...DefaultTheme,
      dark: isDark,
      colors: {
        ...DefaultTheme.colors,
        background: colors.canvas,
        card: colors.panel,
        text: colors.text,
        border: colors.line,
        primary: colors.brand,
      },
    }),
    [colors, isDark],
  )

  return (
    <NavigationContainer ref={navigationRef} theme={navTheme} onReady={reportScreen} onStateChange={reportScreen}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.panel },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTitle: '',
          headerBackTitleVisible: false,
          contentStyle: { backgroundColor: colors.canvas },
        }}
      >
        <Stack.Screen name="Main" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="Product"
          component={ProductScreen}
          options={{
            headerShown: false,
            presentation: 'transparentModal',
            animation: 'fade',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Otp" component={OtpScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={({ route }) => ({
            headerShown: false,
            animation: 'slide_from_right',
          })}
        />
        <Stack.Screen name="Orders" component={OrdersScreen} options={{ headerShown: false }} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="UpiPayment"
          component={UpiPaymentScreen}
          options={{
            headerShown: false,
            animation: 'slide_from_right',
            gestureEnabled: false,
          }}
        />
      </Stack.Navigator>
      <AddressPicker />
    </NavigationContainer>
  )
}
