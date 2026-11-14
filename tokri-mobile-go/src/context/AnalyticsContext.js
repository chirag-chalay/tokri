import { loadMetaChoice, saveMetaChoice, getMetaConsentId, readMetaConsentId } from '../lib/metaTracking'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import Constants from 'expo-constants'
import { Alert, AppState } from 'react-native'
import { loadAnalyticsChoice, saveAnalyticsChoice, getAnalyticsConsentId, readAnalyticsConsentId, refreshAnalyticsConfig } from '../lib/analytics'

import { recordTrackingOutcome } from '../lib/trackingDiagnostics'
import { useAuth } from './AuthContext'
import { queueRevocation, flushRevocations } from '../lib/purchaseTracking'

const AnalyticsContext = createContext({ choice: null, marketingChoice: null, marketingAvailable: false, showAnalyticsChoice: () => {}, showMarketingChoice: () => {} })

export function AnalyticsProvider({ children }) {
  const { token, user } = useAuth()
  const marketingAvailable = Boolean(Constants.expoConfig?.extra?.metaEnabled)
  const [loaded, setLoaded] = useState(false)
  const [choice, setChoice] = useState(null)
  const [marketingChoice, setMarketingChoice] = useState(null)

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
    } catch {
      Alert.alert('Could not save preference', 'Please try again from your account settings.')
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
    } catch { Alert.alert('Could not save preference', 'Please try again from your account settings.') }
  }, [token, user?.id])
  const showMarketingChoice = useCallback(() => {
    Alert.alert('Advertising measurement', 'Allow Tokriii to send app activity and purchases to Meta to measure and improve advertising? You can change this in your account settings.', [
      { text: 'Not now', style: 'cancel', onPress: () => chooseMarketing(false) },
      { text: 'Allow', onPress: () => chooseMarketing(true) },
    ], { cancelable: false })
  }, [chooseMarketing])

  const showAnalyticsChoice = useCallback(() => {
    Alert.alert(
      'App analytics',
      'Allow Tokriii to use Google Analytics to understand how the app is used and improve it? You can change this choice in your account settings.',
      [
        { text: 'Not now', style: 'cancel', onPress: () => choose(false) },
        { text: 'Allow', onPress: () => choose(true) },
      ],
      { cancelable: false },
    )
  }, [choose])

  useEffect(() => {
    let active = true
    Promise.all([loadAnalyticsChoice(), loadMetaChoice().catch(() => null)]).then(([value, marketing]) => {
      if (active) { setChoice(value); setMarketingChoice(marketing); setLoaded(true) }
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (loaded && choice === null) showAnalyticsChoice()
  }, [choice, loaded, showAnalyticsChoice])

  useEffect(() => {
    if (marketingAvailable && loaded && choice !== null && marketingChoice === null) showMarketingChoice()
  }, [marketingAvailable, loaded, choice, marketingChoice, showMarketingChoice])

  return <AnalyticsContext.Provider value={{ choice, marketingChoice, marketingAvailable, showAnalyticsChoice, showMarketingChoice }}>{children}</AnalyticsContext.Provider>
}

export function useAnalyticsSettings() {
  return useContext(AnalyticsContext)
}
