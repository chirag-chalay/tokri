import { useCallback, useEffect, useState } from 'react'
import { AppState, BackHandler, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { fetchJson } from '../lib/api'
import { appBuild, appPlatform, storeUrl } from '../lib/appBuild'
import { useTheme } from '../context/ThemeContext'

const CACHE_KEY = 'tokri-app-release'
const CACHE_MAX_AGE = 6 * 60 * 60 * 1000

function snoozeKey(latestBuild) {
  return `tokri-app-release-snooze-${latestBuild || 0}`
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

  const applyDecision = useCallback(async (next) => {
    if (!next || next.action === 'none') {
      setDecision(next)
      setOpen(false)
      return
    }
    if (next.action === 'recommend') {
      const until = Number(await AsyncStorage.getItem(snoozeKey(next.latestBuild)))
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
    try {
      const next = await fetchJson(`/app/release?platform=${appPlatform()}&build=${appBuild()}`)
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), decision: next }))
      await applyDecision(next)
    } catch {
      const cached = await readCache()
      if (cached?.action === 'required' || cached?.action === 'maintenance') {
        await applyDecision(cached)
        return
      }
      setOpen(false)
    }
  }, [applyDecision])

  useEffect(() => {
    check()
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') check()
    })
    return () => sub.remove()
  }, [check])

  useEffect(() => {
    if (!open || decision?.action !== 'required' || Platform.OS !== 'android') return undefined
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      BackHandler.exitApp()
      return true
    })
    return () => sub.remove()
  }, [open, decision?.action])

  const later = async () => {
    const hours = Math.min(720, Math.max(1, Number(decision?.remindAfterHours) || 24))
    await AsyncStorage.setItem(snoozeKey(decision?.latestBuild), String(Date.now() + hours * 60 * 60 * 1000))
    setOpen(false)
  }

  const update = () => {
    Linking.openURL(storeUrl()).catch(() => {})
  }

  const required = decision?.action === 'required'
  const maintenance = decision?.action === 'maintenance'

  return (
    <View style={styles.fill}>
      {children}
      {open ? (
        <View style={[styles.cover, { backgroundColor: colors.canvas }]}>
          <Text style={[styles.title, { color: colors.text }]}>{decision?.title || 'Update Tokriii'}</Text>
          {decision?.message ? (
            <Text style={[styles.message, { color: colors.muted }]}>{decision.message}</Text>
          ) : null}
          {maintenance ? null : (
            <Pressable style={[styles.primary, { backgroundColor: colors.brand }]} onPress={update}>
              <Text style={[styles.primaryText, { color: colors.ink }]}>Update</Text>
            </Pressable>
          )}
          {required && Platform.OS === 'android' ? (
            <Pressable style={styles.secondary} onPress={() => BackHandler.exitApp()}>
              <Text style={[styles.secondaryText, { color: colors.muted }]}>Exit</Text>
            </Pressable>
          ) : null}
          {!required && !maintenance ? (
            <Pressable style={styles.secondary} onPress={later}>
              <Text style={[styles.secondaryText, { color: colors.muted }]}>Not now</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  cover: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
  },
  primary: {
    marginTop: 28,
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
