import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Alert, AppState } from 'react-native'
import { loadAnalyticsChoice, saveAnalyticsChoice, getAnalyticsConsentId, readAnalyticsConsentId, refreshAnalyticsConfig } from '../lib/analytics'

import { recordTrackingOutcome } from '../lib/trackingDiagnostics'
import { useAuth } from './AuthContext'
import { queueRevocation, flushRevocations } from '../lib/purchaseTracking'

const AnalyticsContext = createContext({ choice: null, showAnalyticsChoice: () => {} })

export function AnalyticsProvider({ children }) {
  const { token, user } = useAuth()
  const [loaded, setLoaded] = useState(false)
  const [choice, setChoice] = useState(null)

  useEffect(() => {
    const refresh = () => { if (AppState.currentState === 'active') refreshAnalyticsConfig().catch(() => {}) }
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
    loadAnalyticsChoice().then((value) => {
      if (active) { setChoice(value); setLoaded(true) }
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (loaded && choice === null) showAnalyticsChoice()
  }, [choice, loaded, showAnalyticsChoice])

  return <AnalyticsContext.Provider value={{ choice, showAnalyticsChoice }}>{children}</AnalyticsContext.Provider>
}

export function useAnalyticsSettings() {
  return useContext(AnalyticsContext)
}
