import { recordWebsiteDebug } from '../lib/websiteMonitoring'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authGet, authPatch } from '../lib/api'

const STORAGE_KEY = 'tokri_user'

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function toUserData(nextUser, token) {
  return {
    id: nextUser.id,
    phone: String(nextUser.phone || ''),
    name: nextUser.name || null,
    dateOfBirth: nextUser.dateOfBirth || null,
    token: token || nextUser.token || null,
    freeDelivery: nextUser.freeDelivery || null,
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)

  const persist = useCallback((nextUser) => {
    if (nextUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
    setUser(nextUser)
  }, [])

  const login = useCallback((nextUser) => {
    persist(toUserData(nextUser, nextUser.token || null))
    recordWebsiteDebug('customer.session.started')
  }, [persist])

  const logout = useCallback(() => {
    persist(null)
    recordWebsiteDebug('customer.session.ended')
  }, [persist])

  const updateProfile = useCallback(
    async (patch) => {
      if (!user) return null
      const data = await authPatch('/account/profile', user, patch)
      const nextUser = toUserData({ ...user, ...(data.user || {}) }, user.token)
      persist(nextUser)
      return nextUser
    },
    [persist, user],
  )

  const refreshUser = useCallback(async () => {
    if (!user?.token) return null
    try {
      const data = await authGet('/auth/me', user)
      if (data?.user) {
        const updated = toUserData(
          { ...user, ...data.user, freeDelivery: data.user.freeDelivery },
          user.token,
        )
        persist(updated)
        return updated
      }
    } catch (err) {
      const msg = String(err.message || '').toLowerCase()
      if (msg.includes('401') || msg.includes('session') || msg.includes('log in') || msg.includes('token')) {
        logout()
      }
    }
    return user
  }, [logout, persist, user])

  useEffect(() => {
    if (!user?.token) return
    let ignore = false
    authGet('/auth/me', user)
      .then((data) => {
        if (ignore || !data?.user) return
        const updated = toUserData(
          { ...user, ...data.user, freeDelivery: data.user.freeDelivery },
          user.token,
        )
        persist(updated)
      })
      .catch((err) => {
        const msg = String(err.message || '').toLowerCase()
        if (msg.includes('401') || msg.includes('session') || msg.includes('log in') || msg.includes('token')) {
          logout()
        }
      })
    return () => {
      ignore = true
    }
  }, [user?.token])

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: Boolean(user?.phone),
      login,
      logout,
      updateProfile,
      refreshUser,
    }),
    [user, login, logout, updateProfile, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
