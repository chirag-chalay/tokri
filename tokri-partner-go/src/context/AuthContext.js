import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { fetchPartnerMe, partnerLogin } from '../lib/api'

const STORAGE_KEY = 'tokri_partner_session'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [partner, setPartner] = useState(null)
  const [booting, setBooting] = useState(true)

  useEffect(() => {
    let ignore = false
    async function restore() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY)
        if (!raw) return
        const stored = JSON.parse(raw)
        if (!stored?.token) return
        const me = await fetchPartnerMe(stored.token)
        if (!ignore) {
          setPartner({ ...me.partner, token: stored.token })
        }
      } catch {
        await AsyncStorage.removeItem(STORAGE_KEY)
      } finally {
        if (!ignore) setBooting(false)
      }
    }
    restore()
    return () => {
      ignore = true
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await partnerLogin(email, password)
    const next = { ...data.partner, token: data.token }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ token: data.token }))
    setPartner(next)
    return next
  }, [])

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY)
    setPartner(null)
  }, [])

  const value = useMemo(
    () => ({
      partner,
      token: partner?.token || null,
      booting,
      login,
      logout,
      isLoggedIn: Boolean(partner?.token),
    }),
    [partner, booting, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
