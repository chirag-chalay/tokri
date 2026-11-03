import { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../context/AuthContext'
import { partnerForgot } from '../lib/api'
import { COLORS, IS_LIVE_API } from '../config'

export default function LoginScreen() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function onLogin() {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await login(email.trim(), password)
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  async function onForgot() {
    setBusy(true)
    setError('')
    try {
      const data = await partnerForgot(email.trim())
      setMessage(data.message || 'Check your email for a password link.')
    } catch (err) {
      setError(err.message || 'Could not send reset email')
    } finally {
      setBusy(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.wrap}>
        {!IS_LIVE_API ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>STAGING</Text>
          </View>
        ) : null}
        <Text style={styles.brand}>Tokriii Partner</Text>
        <Text style={styles.sub}>Sign in to see assigned deliveries.</Text>

        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="Email"
          placeholderTextColor={COLORS.muted}
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          secureTextEntry
          placeholder="Password"
          placeholderTextColor={COLORS.muted}
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {message ? <Text style={styles.message}>{message}</Text> : null}

        <Pressable style={[styles.btn, busy && styles.btnDisabled]} onPress={onLogin} disabled={busy}>
          {busy ? <ActivityIndicator color={COLORS.onBrand} /> : <Text style={styles.btnText}>Sign in</Text>}
        </Pressable>

        <Pressable onPress={onForgot} disabled={busy || !email.trim()} style={styles.linkWrap}>
          <Text style={styles.link}>Forgot password?</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.canvas },
  wrap: { flex: 1, padding: 24, justifyContent: 'center' },
  banner: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.warning,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 16,
  },
  bannerText: { color: '#fff', fontWeight: '800', fontSize: 12, letterSpacing: 1 },
  brand: { fontSize: 32, fontWeight: '800', color: COLORS.ink, marginBottom: 8 },
  sub: { color: COLORS.muted, marginBottom: 28, fontSize: 16 },
  input: {
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: COLORS.line,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 12,
  },
  btn: {
    backgroundColor: COLORS.brand,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: COLORS.onBrand, fontWeight: '700', fontSize: 16 },
  linkWrap: { marginTop: 18, alignItems: 'center' },
  link: { color: COLORS.brandDeep, fontWeight: '600' },
  error: { color: COLORS.danger, marginBottom: 8 },
  message: { color: COLORS.success, marginBottom: 8 },
})
