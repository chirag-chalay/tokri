import { loadMetaChoice, saveMetaChoice, getMetaConsentId, readMetaConsentId, requestMetaTrackingPermission } from '../lib/metaTracking'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import Constants from 'expo-constants'
import { Alert, AppState, Linking, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTheme } from './ThemeContext'
import { restoreTrackingPreferences } from '../lib/trackingPreferences'
import { loadAnalyticsChoice, saveAnalyticsChoice, getAnalyticsConsentId, readAnalyticsConsentId, refreshAnalyticsConfig } from '../lib/analytics'

import { recordTrackingOutcome } from '../lib/trackingDiagnostics'
import { useAuth } from './AuthContext'
import { queueRevocation, flushRevocations } from '../lib/purchaseTracking'

const AnalyticsContext = createContext({ choice: null, marketingChoice: null, marketingAvailable: false, showAnalyticsChoice: () => {}, showMarketingChoice: () => {} })

export function AnalyticsProvider({ children }) {
  const { token, user } = useAuth()
  const defaultEnabled = Constants.expoConfig?.extra?.trackingDefaultMode === 'opt_out'
  const [notice, setNotice] = useState(false)
  const marketingAvailable = Boolean(Constants.expoConfig?.extra?.metaEnabled)
  const [loaded, setLoaded] = useState(false)
  const [choice, setChoice] = useState(null)
  const [marketingChoice, setMarketingChoice] = useState(null)
  const [open, setOpen] = useState(false)
  const [analyticsDraft, setAnalyticsDraft] = useState(false)
  const [marketingDraft, setMarketingDraft] = useState(false)
  const [saving, setSaving] = useState(false)
  const [analyticsReady, setAnalyticsReady] = useState(0)
  const { colors } = useTheme()
  const [startupBlocked, setStartupBlocked] = useState(true)
  const [navigationReady, setNavigationReady] = useState(false)
  const [foreground, setForeground] = useState(AppState.currentState === 'active')
  const [presentationReady, setPresentationReady] = useState(false)
  const saveLock = useRef(false)
  const markNavigationReady = useCallback(() => setNavigationReady(true), [])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => setForeground(state === 'active'))
    return () => subscription.remove()
  }, [])
  useEffect(() => {
    setPresentationReady(false)
    if (!loaded || startupBlocked || !navigationReady || !foreground) return undefined
    // Let an update modal finish dismissing before presenting privacy on iOS.
    const timer = setTimeout(() => setPresentationReady(true), 400)
    return () => clearTimeout(timer)
  }, [loaded, startupBlocked, navigationReady, foreground])

  useEffect(() => {
    const refresh = () => { if (AppState.currentState === 'active') { refreshAnalyticsConfig().catch(() => {}); loadMetaChoice().catch(() => {}) } }
    const subscription = AppState.addEventListener('change', (state) => { if (state === 'active') refresh() })
    const timer = setInterval(refresh, 300000)
    return () => { subscription.remove(); clearInterval(timer) }
  }, [])

  const choose = useCallback(async (value) => {
    try {
      const previous = getAnalyticsConsentId() || await readAnalyticsConsentId()
      const saving = saveAnalyticsChoice(value)
      if (!value && previous) {
        await queueRevocation(user?.id, previous).catch(() => recordTrackingOutcome('cleanupPending'))
        if (token && user?.id) flushRevocations(token, user.id).catch(() => {})
      }
      await saving
      setChoice(value)
      return true
    } catch {
      Alert.alert('Could not save preference', 'Please try again from your account settings.')
      return false
    }
  }, [token, user?.id])

  const chooseMarketing = useCallback(async (value) => {
    try {
      const previous = getMetaConsentId() || await readMetaConsentId()
      const saving = saveMetaChoice(value)
      if (!value && previous) {
        await queueRevocation(user?.id, previous, 'meta').catch(() => recordTrackingOutcome('cleanupPending'))
        if (token && user?.id) flushRevocations(token, user.id).catch(() => {})
      }
      await saving
      setMarketingChoice(value)
      return true
    } catch { Alert.alert('Could not save preference', 'Please try again from your account settings.'); return false }
  }, [token, user?.id])
  const showPreferences = useCallback(() => {
    setAnalyticsDraft(choice === true)
    setMarketingDraft(marketingChoice === true)
    setOpen(true)
  }, [choice, marketingChoice])

  useEffect(() => {
    let active = true
    // Preferences must not wait for the network or native SDK startup.
    restoreTrackingPreferences(AsyncStorage, defaultEnabled, marketingAvailable).then(({ values: [analytics, marketing], defaultApplied }) => {
      if (!active) return
      const parse = (value) => ['granted', 'default_allowed'].includes(value) ? true : value === 'denied' ? false : null
      const a = parse(analytics), m = parse(marketing)
      setChoice(a); setMarketingChoice(m); setLoaded(true)
      setNotice(defaultApplied)
      loadAnalyticsChoice().then(() => { if (active) setAnalyticsReady((value) => value + 1) }).catch(() => {})
      loadMetaChoice().catch(() => {})
      if (a === null || (marketingAvailable && m === null)) {
        setAnalyticsDraft(a !== false); setMarketingDraft(m !== false); setOpen(true)
      }
    }).catch(() => { if (active) setLoaded(true) })
    return () => { active = false }
  }, [defaultEnabled, marketingAvailable])

  useEffect(() => {
    if (presentationReady && marketingChoice === true && marketingAvailable) {
      requestMetaTrackingPermission().catch(() => {})
    }
  }, [presentationReady, marketingChoice, marketingAvailable])

  const savePreferences = async (analytics, marketing) => {
    if (saveLock.current) return
    saveLock.current = true
    setSaving(true)
    setOpen(false)
    try {
      // Neither destination's withdrawal should wait for the other's save.
      const results = await Promise.all([
        analytics !== choice ? choose(analytics) : Promise.resolve(true),
        marketingAvailable && marketing !== marketingChoice
          ? (marketing ? new Promise((resolve) => setTimeout(resolve, 500)).then(() => chooseMarketing(true)) : chooseMarketing(false))
          : Promise.resolve(true),
      ])
      if (results.some((result) => !result)) setOpen(true)
    } finally {
      saveLock.current = false
      setSaving(false)
    }
  }

  const value = { choice, marketingChoice, marketingAvailable, analyticsReady, setStartupBlocked, markNavigationReady, showAnalyticsChoice: showPreferences, showMarketingChoice: showPreferences, showPreferences }
  return (
    <AnalyticsContext.Provider value={value}>
      {children}
      {notice && presentationReady && !open ? <View style={[styles.notice, { backgroundColor: colors.panel, borderColor: colors.line }]}>
        <Text style={{ color: colors.text }}>Tokriii uses Google Analytics for app usage and Meta for advertising measurement. You can turn either off in Privacy and measurement.</Text>
        <Pressable accessibilityRole="button" onPress={showPreferences}><Text style={{ color: colors.brand }}>Privacy settings</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={() => setNotice(false)}><Text style={{ color: colors.text }}>Dismiss</Text></Pressable>
      </View> : null}
      <Modal visible={presentationReady && open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <View style={[styles.card, { backgroundColor: colors.panel, borderColor: colors.line }]}>
            <ScrollView contentContainerStyle={styles.content}>
              <Text style={[styles.title, { color: colors.text }]}>Privacy and measurement</Text>
              <Text style={[styles.description, { color: colors.muted }]}>Choose how Tokriii uses optional app activity. Tracking follows these settings and your device permissions. You can change these choices in your account at any time.</Text>
              <View style={styles.row}>
                <View style={styles.rowText}><Text style={[styles.label, { color: colors.text }]}>App analytics</Text><Text style={{ color: colors.muted }}>Share app activity with Google Analytics to help improve the app.</Text></View>
                <Switch accessibilityLabel="App analytics" value={analyticsDraft} onValueChange={setAnalyticsDraft} />
              </View>
              {marketingAvailable ? <View style={styles.row}>
                <View style={styles.rowText}><Text style={[styles.label, { color: colors.text }]}>Advertising measurement</Text><Text style={{ color: colors.muted }}>Share app activity and purchases with Meta to measure advertising.</Text></View>
                <Switch accessibilityLabel="Advertising measurement" value={marketingDraft} onValueChange={setMarketingDraft} />
              </View> : null}
              <Pressable accessibilityRole="link" onPress={() => Linking.openURL('https://tokriii.com/privacy-policy').catch(() => {})}><Text style={{ color: colors.brand }}>Read privacy policy</Text></Pressable>
              <Pressable accessibilityRole="button" disabled={saving} style={[styles.button, { backgroundColor: colors.brand }]} onPress={() => savePreferences(analyticsDraft, marketingDraft)}><Text style={[styles.buttonText, { color: colors.ink }]}>{choice === null || (marketingAvailable && marketingChoice === null) ? 'Agree and continue' : 'Save preferences'}</Text></Pressable>
              <Pressable accessibilityRole="button" disabled={saving} style={styles.secondary} onPress={() => savePreferences(false, false)}><Text style={{ color: colors.muted }}>Continue without optional tracking</Text></Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </AnalyticsContext.Provider>
  )
}

export function useAnalyticsSettings() {
  return useContext(AnalyticsContext)
}

const styles = StyleSheet.create({
  notice: { position: 'absolute', bottom: 100, left: 20, right: 20, borderRadius: 14, padding: 18, borderWidth: 1, gap: 12 },
  overlay: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'rgba(0,0,0,0.65)' },
  card: { borderWidth: 1, borderRadius: 18, maxHeight: '85%' },
  content: { padding: 22, gap: 16 },
  title: { fontSize: 21, fontWeight: '700' },
  description: { fontSize: 14, lineHeight: 21 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowText: { flex: 1, gap: 4 },
  label: { fontSize: 15, fontWeight: '600' },
  button: { padding: 14, borderRadius: 10, alignItems: 'center' },
  buttonText: { fontWeight: '700', fontSize: 15 },
  secondary: { alignItems: 'center', padding: 10 },
})
