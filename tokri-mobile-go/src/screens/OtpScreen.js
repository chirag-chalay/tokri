import { trackAuthentication } from '../lib/analytics'
import { useEffect, useRef, useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icon from '../components/Icon'
import { useTheme, useThemedStyles } from '../context/ThemeContext'
import { postJson } from '../lib/api'
import { startOtpSmsListener, subscribeOtpSms } from '../lib/smsOtp'
import { useAuth } from '../context/AuthContext'

const OTP_LENGTH = 4
const RESEND_SECONDS = 60

function maskPhone(phone) {
  const digits = String(phone || '')
  if (digits.length < 4) return digits
  return `${digits.slice(0, 2)}${'X'.repeat(digits.length - 4)}${digits.slice(-2)}`
}

export default function OtpScreen({ navigation, route }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const insets = useSafeAreaInsets()
  const { login } = useAuth()
  const phone = String(route.params?.phone || '')
  const next = route.params?.next
  const [otp, setOtp] = useState('')
  const [devOtp, setDevOtp] = useState(String(route.params?.devOtp || ''))
  const [loading, setLoading] = useState(false)
  const [resendIn, setResendIn] = useState(RESEND_SECONDS)
  const inputRef = useRef(null)
  const submitted = useRef(false)

  useEffect(() => {
    if (resendIn <= 0) return undefined
    const timer = setTimeout(() => setResendIn((value) => value - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendIn])

  useEffect(() => {
    startOtpSmsListener()
    const stop = subscribeOtpSms((code) => {
      if (submitted.current) return
      onChangeOtp(code)
    })
    return stop
  }, [])

  const verifyOtp = async (code) => {
    if (!/^\d{4}$/.test(code) || loading) return
    setLoading(true)
    try {
      const result = await postJson('/auth/verify-otp', { phone, otp: code })
      await login({ ...result.user, token: result.token })
      trackAuthentication(result.isNewCustomer)
      navigation.popToTop()
      if (next === 'Checkout') navigation.navigate('Main', { screen: 'Cart' })
    } catch (error) {
      submitted.current = false
      setOtp('')
      Alert.alert('Login failed', error.message)
      setTimeout(() => inputRef.current?.focus(), 80)
    } finally {
      setLoading(false)
    }
  }

  const onChangeOtp = (value) => {
    const digits = String(value || '').replace(/\D/g, '').slice(0, OTP_LENGTH)
    setOtp(digits)
    if (digits.length === OTP_LENGTH && !submitted.current) {
      submitted.current = true
      verifyOtp(digits)
    }
  }

  const resendOtp = async () => {
    if (resendIn > 0 || loading) return
    setLoading(true)
    try {
      await startOtpSmsListener()
      const result = await postJson('/auth/send-otp', { phone })
      setOtp('')
      submitted.current = false
      setDevOtp(result.devOtp ? String(result.devOtp) : '')
      setResendIn(RESEND_SECONDS)
      inputRef.current?.focus()
    } catch (error) {
      Alert.alert('Could not resend OTP', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Pressable style={styles.back} onPress={() => navigation.goBack()} hitSlop={12}>
        <Icon name="chevron-back" size={22} color={colors.text} />
      </Pressable>

      <View style={styles.content}>
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Icon name="phone-portrait-outline" size={42} color={colors.white} />
          </View>
          <Text style={styles.title}>OTP verification</Text>
          <Text style={styles.subtitle}>
            Enter the 4-digit code sent to{'\n'}+91 {maskPhone(phone)}
          </Text>
        </View>

        <Pressable style={styles.otpWrap} onPress={() => inputRef.current?.focus()}>
          <View style={styles.otpRow} pointerEvents="none">
            {Array.from({ length: OTP_LENGTH }).map((_, index) => {
              const filled = Boolean(otp[index])
              const active = otp.length === index
              return (
                <View
                  key={index}
                  style={[styles.otpBox, filled && styles.otpBoxFilled, active && styles.otpBoxActive]}
                >
                  <Text style={styles.otpDigit}>{otp[index] || ''}</Text>
                </View>
              )
            })}
          </View>
          <TextInput
            ref={inputRef}
            style={styles.autofillInput}
            value={otp}
            onChangeText={onChangeOtp}
            keyboardType="number-pad"
            inputMode="numeric"
            maxLength={OTP_LENGTH}
            autoFocus
            autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
            textContentType="oneTimeCode"
            importantForAutofill="yes"
            autoCorrect={false}
            spellCheck={false}
            caretHidden
          />
        </Pressable>

        {devOtp ? <Text style={styles.devHint}>Dev OTP: {devOtp}</Text> : null}

        <Pressable
          style={[styles.continueBtn, loading && styles.buttonDisabled]}
          disabled={loading || otp.length !== OTP_LENGTH}
          onPress={() => verifyOtp(otp)}
        >
          <Text style={styles.continueText}>{loading ? 'Please wait…' : 'Continue'}</Text>
        </Pressable>

        <Pressable style={styles.linkBtn} onPress={resendOtp} disabled={resendIn > 0 || loading}>
          <Text style={[styles.linkText, resendIn > 0 && styles.linkMuted]}>
            {resendIn > 0 ? `Resend OTP in ${resendIn}s` : 'Resend OTP'}
          </Text>
        </Pressable>
        <Pressable style={styles.linkBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>Change number</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

const createStyles = (c) => ({
  screen: { flex: 1, backgroundColor: c.canvas },
  back: {
    marginLeft: 16,
    marginTop: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: c.panel2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  hero: { alignItems: 'center', paddingBottom: 24 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: c.avatar,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: { color: c.text, fontSize: 26, fontWeight: '800' },
  subtitle: { color: c.muted, fontSize: 14, marginTop: 6, textAlign: 'center', lineHeight: 20 },
  otpWrap: {
    marginBottom: 22,
    height: 64,
    position: 'relative',
  },
  otpRow: {
    flexDirection: 'row',
    gap: 10,
    height: 64,
  },
  otpBox: {
    flex: 1,
    flexBasis: 0,
    height: 64,
    borderRadius: 14,
    backgroundColor: c.panel,
    borderWidth: 1,
    borderColor: c.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxFilled: { borderColor: c.brand },
  otpBoxActive: { borderColor: c.brand, borderWidth: 1.5 },
  otpDigit: { color: c.text, fontSize: 24, fontWeight: '800' },
  autofillInput: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: 64,
    opacity: 0.02,
    color: 'transparent',
    backgroundColor: 'transparent',
    fontSize: 16,
    padding: 0,
  },
  devHint: { color: c.brand, textAlign: 'center', marginBottom: 14, fontWeight: '600' },
  continueBtn: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: c.brand,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.55 },
  continueText: { color: c.brand, fontSize: 18, fontWeight: '800' },
  linkBtn: { marginTop: 18, alignItems: 'center' },
  linkText: { color: c.mint, fontWeight: '600' },
  linkMuted: { color: c.muted },
})
