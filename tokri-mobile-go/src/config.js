import Constants from 'expo-constants'

const LIVE_API = 'https://tokriii.com/api/v1'
const STAGING_API = 'https://server.tokriii.com/api/v1'

function stripTrailingSlash(value) {
  return String(value || '').replace(/\/+$/, '')
}

/**
 * Prefer app.config.js `extra.apiBaseUrl` (loaded from .env when Expo starts),
 * then EXPO_PUBLIC_*, then EAS/live defaults.
 */
export const API_BASE_URL = (() => {
  const fromExtra = stripTrailingSlash(Constants.expoConfig?.extra?.apiBaseUrl)
  if (fromExtra) return fromExtra
  const fromEnv = stripTrailingSlash(process.env.EXPO_PUBLIC_API_BASE_URL)
  if (fromEnv) return fromEnv
  if (process.env.EAS_BUILD_PROFILE === 'staging') return STAGING_API
  return LIVE_API
})()

export const THEMES = {
  dark: {
    canvas: '#0a110a',
    panel: '#121612',
    panel2: '#1a211a',
    line: '#2a332a',
    mint: '#a7d8b9',
    muted: '#a1a1aa',
    brand: '#4daf7b',
    brandHover: '#3d9a6a',
    brandDeep: '#2f7d56',
    onBrand: '#ffffff',
    text: '#ffffff',
    danger: '#ef4444',
    white: '#ffffff',
    card: '#1a211a',
    cardText: '#ffffff',
    cardMuted: '#a1a1aa',
    ink: '#04140c',
    overlay: 'rgba(0,0,0,0.55)',
    successBg: '#052e16',
    addBg: '#163322',
    savingsBg: '#17345c',
    savingsText: '#8ec5ff',
    avatar: '#3a3a3a',
    background: '#0a110a',
    primary: '#4daf7b',
    border: '#2a332a',
    primaryLight: '#4daf7b',
  },
  light: {
    canvas: '#f3f6f3',
    panel: '#ffffff',
    panel2: '#eef2ee',
    line: '#d5ddd5',
    mint: '#2f7d56',
    muted: '#64748b',
    brand: '#4daf7b',
    brandHover: '#3d9a6a',
    brandDeep: '#2f7d56',
    onBrand: '#ffffff',
    text: '#0f172a',
    danger: '#ef4444',
    white: '#ffffff',
    card: '#ffffff',
    cardText: '#0f172a',
    cardMuted: '#64748b',
    ink: '#04140c',
    overlay: 'rgba(15,23,42,0.4)',
    successBg: '#edf8f1',
    addBg: '#edf8f1',
    savingsBg: '#dbeafe',
    savingsText: '#1d4ed8',
    avatar: '#d7e4d7',
    background: '#f3f6f3',
    primary: '#4daf7b',
    border: '#d5ddd5',
    primaryLight: '#4daf7b',
  },
}

export const COLORS = THEMES.dark

export const TAB_BAR_HEIGHT = 64
