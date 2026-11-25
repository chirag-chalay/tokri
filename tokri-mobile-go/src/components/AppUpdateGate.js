import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Alert,
  AppState,
  BackHandler,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { fetchJson } from '../lib/api'
import { appBuild, appPlatform, storeUrl } from '../lib/appBuild'
import { getStoreUpdate } from '../lib/storeUpdate'
import { useTheme } from '../context/ThemeContext'
import { useAnalyticsSettings } from '../context/AnalyticsContext'

const CACHE_KEY = `tokri-app-release-${appPlatform()}-${appBuild()}`
const CACHE_MAX_AGE = 6 * 60 * 60 * 1000

function snoozeKey(decision) {
  return `tokri-app-release-snooze-${decision?.storeRelease || decision?.latestBuild || 0}`
}

async function readCache() {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const saved = JSON.parse(raw)
    if (!saved?.savedAt || Date.now() - saved.savedAt > CACHE_MAX_AGE) return null
    return saved.decision || null
  } catch {
    return null
  }
}

export default function AppUpdateGate({ children }) {
  const { colors } = useTheme()
  const [decision, setDecision] = useState(null)
  const [open, setOpen] = useState(false)
  const [checked, setChecked] = useState(false)
  const checking = useRef(false)
  const { setStartupBlocked } = useAnalyticsSettings()
  useEffect(() => { setStartupBlocked(!checked || open) }, [checked, open, setStartupBlocked])

  const applyDecision = useCallback(async (next) => {
    if (!next || next.action === 'none') {
      setDecision(next)
      setOpen(false)
      return
    }
    if (next.action === 'recommend') {
      const until = Number(await AsyncStorage.getItem(snoozeKey(next)).catch(() => null))
      if (Number.isFinite(until) && Date.now() < until) {
        setDecision(next)
        setOpen(false)
        return
      }
    }
    setDecision(next)
    setOpen(true)
  }, [])

  const check = useCallback(async () => {
    if (checking.current) return
    checking.current = true
    try {
      const storeCheck = getStoreUpdate()
      const policy = await fetchJson(`/app/release?platform=${appPlatform()}&build=${appBuild()}`, { timeoutMs: 5000 })
        .then((next) => {
          void AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), decision: next })).catch(() => {})
          return next
        })
        .catch(readCache)
      if (policy?.action === 'required' || policy?.action === 'maintenance') {
        await applyDecision(policy)
        return
      }
      setChecked(true)
      const release = await storeCheck
      if (release === undefined) {
        await applyDecision(policy)
        return
      }
      await applyDecision(release && {
        action: 'recommend',
        title: policy?.action === 'recommend' ? policy.title : 'Update Tokriii',
        message: release.version
          ? `Tokriii ${release.version} is available in the App Store.`
          : 'A new version of Tokriii is available on Google Play.',
        latestBuild: release.build,
        storeRelease: release.id,
        remindAfterHours: policy?.remindAfterHours,
      })
    } finally {
      checking.current = false
      setChecked(true)
    }
  }, [applyDecision])

  useEffect(() => {
    check()
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') check()
    })
    return () => sub.remove()
  }, [check])

  const later = async () => {
    const hours = Math.min(720, Math.max(1, Number(decision?.remindAfterHours) || 24))
    await AsyncStorage.setItem(snoozeKey(decision), String(Date.now() + hours * 60 * 60 * 1000)).catch(() => {})
    setOpen(false)
  }

  const update = async () => {
    try {
      await Linking.openURL(storeUrl())
    } catch (error) {
      Alert.alert('Unable to open the app store', error.message || 'Please try again later.')
    }
  }

  const required = decision?.action === 'required'
  const maintenance = decision?.action === 'maintenance'
  const closePopup = () => {
    if (required && Platform.OS === 'android') {
      BackHandler.exitApp()
    } else if (!required && !maintenance) {
      later()
    }
  }

  return (
    <View style={styles.fill}>
      {children}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={closePopup}
      >
        <View style={[styles.cover, { backgroundColor: colors.overlay }]}>
          <View style={[styles.dialog, { backgroundColor: colors.panel, borderColor: colors.line }]}>
            <Text style={[styles.title, { color: colors.text }]}>
              {decision?.title || (maintenance ? 'Tokriii is temporarily unavailable' : 'Update Tokriii')}
            </Text>
            {decision?.message ? (
              <Text style={[styles.message, { color: colors.muted }]}>{decision.message}</Text>
            ) : null}
            {maintenance ? null : (
              <Pressable
                accessibilityRole="button"
                style={[styles.primary, { backgroundColor: colors.brand }]}
                onPress={update}
              >
                <Text style={[styles.primaryText, { color: colors.ink }]}>Update now</Text>
              </Pressable>
            )}
            {required && Platform.OS === 'android' ? (
              <Pressable accessibilityRole="button" style={styles.secondary} onPress={() => BackHandler.exitApp()}>
                <Text style={[styles.secondaryText, { color: colors.muted }]}>Exit</Text>
              </Pressable>
            ) : null}
            {!required && !maintenance ? (
              <Pressable accessibilityRole="button" style={styles.secondary} onPress={later}>
                <Text style={[styles.secondaryText, { color: colors.muted }]}>Cancel</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  cover: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
  },
  primary: {
    marginTop: 24,
    borderRadius: 999,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    fontSize: 16,
    fontWeight: '700',
  },
  secondary: {
    marginTop: 14,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    fontSize: 16,
    fontWeight: '600',
  },
})
