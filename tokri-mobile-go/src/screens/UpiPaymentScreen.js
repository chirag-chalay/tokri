import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Animated, AppState, Easing, Pressable, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icon from '../components/Icon'
import { useTheme, useThemedStyles } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { authPost, formatPrice } from '../lib/api'
import { openUpiApp, upiAppById } from '../lib/upiApps'
import { recoverPurchases } from '../lib/purchaseTracking'

const OPEN_DELAY_MS = 450
const POLL_MS = 2000
const POLL_LIMIT = 45
const SUCCESS_HOLD_MS = 1700

export default function UpiPaymentScreen({ navigation, route }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const insets = useSafeAreaInsets()
  const { token, user } = useAuth()
  const { clearCart, refreshCart } = useCart()
  const { appId, intentUrl, paymentId, orderNo, amount } = route.params || {}
  const app = upiAppById(appId)

  const [phase, setPhase] = useState('opening')
  const [message, setMessage] = useState('')
  const spin = useRef(new Animated.Value(0)).current
  const pop = useRef(new Animated.Value(0)).current
  const fade = useRef(new Animated.Value(0)).current
  const finished = useRef(false)

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start()
  }, [fade])

  useEffect(() => {
    const rotate = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    )
    rotate.start()
    return () => rotate.stop()
  }, [spin])

  useEffect(() => {
    if (phase !== 'success') return undefined
    pop.setValue(0)
    Animated.spring(pop, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }).start()
    const timer = setTimeout(() => {
      navigation.replace('OrderDetail', { orderNo })
    }, SUCCESS_HOLD_MS)
    return () => clearTimeout(timer)
  }, [navigation, orderNo, phase, pop])

  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(() => {
      if (cancelled || finished.current) return
      setPhase('waiting')
      openUpiApp(appId, intentUrl).catch((error) => {
        if (cancelled || finished.current) return
        setMessage(error.message || 'Could not open the UPI app.')
        setPhase('failed')
      })
    }, OPEN_DELAY_MS)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [appId, intentUrl])

  useEffect(() => {
    if (phase !== 'waiting') return undefined
    let stopped = false
    let running = false
    let closed = false

    const fail = (text) => {
      closed = true
      setMessage(text)
      setPhase('failed')
    }

    const markPaid = async () => {
      if (finished.current) return
      finished.current = true
      recoverPurchases(token, user?.id).catch(() => {})
      await clearCart().catch(() => {})
      await refreshCart().catch(() => {})
      if (!stopped) setPhase('success')
    }

    const poll = async () => {
      if (running || stopped || finished.current || closed) return
      running = true
      try {
        for (let attempt = 0; attempt < POLL_LIMIT; attempt += 1) {
          if (stopped || finished.current) return
          try {
            const result = await authPost('/checkout/confirm-intent', token, {
              orderNo,
              razorpayPaymentId: paymentId,
            })
            if (stopped || finished.current) return
            if (result.status === 'paid') {
              await markPaid()
              return
            }
            if (result.status === 'failed') {
              fail(result.message || 'Payment failed. Please try again.')
              return
            }
          } catch (error) {
            if (stopped || finished.current) return
            const text = error?.message || ''
            if (/not found|do not match|not waiting/i.test(text)) {
              fail(text || 'Payment could not be confirmed.')
              return
            }
          }
          try {
            const synced = await authPost('/checkout/sync-payment', token, { orderNo })
            if (stopped || finished.current) return
            if (synced?.status === 'paid') {
              await markPaid()
              return
            }
          } catch {
            // Keep polling Razorpay until timeout.
          }
          await new Promise((resolve) => setTimeout(resolve, POLL_MS))
        }
        if (!stopped && !finished.current && !closed) {
          fail(
            'Payment was not completed. If money was deducted, the order updates once the bank confirms it.',
          )
        }
      } finally {
        running = false
      }
    }

    const kickoff = setTimeout(poll, 700)
    const onChange = (next) => {
      if (next === 'active' && !closed && !finished.current) poll()
    }
    const sub = AppState.addEventListener('change', onChange)
    return () => {
      stopped = true
      clearTimeout(kickoff)
      sub.remove()
    }
  }, [clearCart, orderNo, paymentId, phase, refreshCart, token])

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] })
  const waiting = phase === 'opening' || phase === 'waiting'
  const title =
    phase === 'success'
      ? 'Payment successful'
      : phase === 'failed'
        ? 'Payment not completed'
        : phase === 'waiting'
          ? `Complete payment in ${app?.label || 'your UPI app'}`
          : `Opening ${app?.label || 'UPI app'}`

  const body =
    phase === 'success'
      ? `Order ${orderNo} is confirmed.`
      : phase === 'failed'
        ? message || 'You can go back and try again.'
        : phase === 'waiting'
          ? 'Finish the payment, then return here. This screen updates automatically.'
          : `Launching ${app?.label || 'UPI'} securely…`

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
      <Animated.View style={[styles.center, { opacity: fade }]}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>T</Text>
          </View>
          <Text style={styles.brandName}>Tokriii</Text>
        </View>

        {phase === 'success' ? (
          <Animated.View style={[styles.checkCircle, { transform: [{ scale: pop }] }]}>
            <Icon name="checkmark" size={46} color={colors.onBrand} />
          </Animated.View>
        ) : (
          <View style={styles.card}>
            <View style={styles.appRow}>
              {app?.icon ? (
                <Image source={app.icon} style={styles.appIcon} contentFit="cover" />
              ) : (
                <View style={[styles.appIcon, { backgroundColor: app?.color || colors.brand }]} />
              )}
              <View style={styles.appMeta}>
                <Text style={styles.appLabel}>{app?.label || 'UPI'}</Text>
                <Text style={styles.appHint}>
                  {waiting ? 'Secure UPI checkout' : 'Could not open app'}
                </Text>
              </View>
              {waiting ? (
                <Animated.View
                  style={[
                    styles.ring,
                    {
                      borderColor: colors.line,
                      borderTopColor: colors.brand,
                      transform: [{ rotate }],
                    },
                  ]}
                />
              ) : (
                <View style={styles.failMark}>
                  <Icon name="close" size={18} color={colors.danger} />
                </View>
              )}
            </View>
            {amount ? <Text style={styles.payAmount}>{formatPrice(amount)}</Text> : null}
            {waiting ? <ActivityIndicator color={colors.brand} style={styles.inlineSpinner} /> : null}
          </View>
        )}

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
        {phase === 'success' ? <Text style={styles.hint}>Taking you to your order…</Text> : null}

        {phase !== 'success' ? (
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.cancelBtn}>
            <Text style={styles.cancel}>{phase === 'failed' ? 'Back to checkout' : 'Cancel'}</Text>
          </Pressable>
        ) : null}
      </Animated.View>
    </View>
  )
}

function createStyles(colors) {
  return {
    screen: { flex: 1, backgroundColor: colors.canvas },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    brandRow: {
      position: 'absolute',
      top: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    brandMark: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: colors.brand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    brandMarkText: { color: colors.onBrand, fontWeight: '900', fontSize: 16 },
    brandName: { color: colors.text, fontWeight: '800', fontSize: 18 },
    card: {
      width: '100%',
      maxWidth: 360,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.panel,
      paddingHorizontal: 16,
      paddingVertical: 18,
    },
    appRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    appIcon: { width: 44, height: 44, borderRadius: 12 },
    appMeta: { flex: 1, minWidth: 0 },
    appLabel: { color: colors.text, fontWeight: '800', fontSize: 16 },
    appHint: { marginTop: 2, color: colors.muted, fontSize: 12, fontWeight: '600' },
    ring: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2.5,
    },
    inlineSpinner: { marginTop: 14 },
    payAmount: {
      marginTop: 14,
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
    },
    checkCircle: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: colors.brand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    failMark: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: colors.danger,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      marginTop: 22,
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
    },
    body: {
      marginTop: 8,
      fontSize: 15,
      lineHeight: 22,
      color: colors.muted,
      textAlign: 'center',
      maxWidth: 320,
    },
    hint: {
      marginTop: 18,
      fontSize: 13,
      fontWeight: '700',
      color: colors.brand,
    },
    cancelBtn: { marginTop: 28 },
    cancel: { color: colors.brand, fontWeight: '800', fontSize: 15 },
  }
}
