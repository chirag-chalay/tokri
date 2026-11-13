import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { loadAnalyticsChoice, saveAnalyticsChoice } from '../lib/analytics'

const AnalyticsContext = createContext({ choice: null, showAnalyticsChoice: () => {} })

export function AnalyticsProvider({ children }) {
  const [loaded, setLoaded] = useState(false)
  const [choice, setChoice] = useState(null)

  const choose = useCallback(async (value) => {
    try {
      await saveAnalyticsChoice(value)
      setChoice(value)
    } catch {
      Alert.alert('Could not save preference', 'Please try again from your account settings.')
    }
  }, [])

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
