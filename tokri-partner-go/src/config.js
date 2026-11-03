const LIVE_API = 'https://tokriii.com/api/v1'
const STAGING_API = 'https://server.tokriii.com/api/v1'

function stripTrailingSlash(value) {
  return String(value || '').replace(/\/+$/, '')
}

/** Local Expo + staging builds → staging. Production EAS → live. */
export const API_BASE_URL = (() => {
  const fromEnv = stripTrailingSlash(process.env.EXPO_PUBLIC_API_BASE_URL)
  if (fromEnv) return fromEnv
  if (process.env.EAS_BUILD_PROFILE === 'production') return LIVE_API
  return STAGING_API
})()

export const IS_LIVE_API =
  API_BASE_URL.includes('tokriii.com') && !API_BASE_URL.includes('server.tokriii.com')

export const COLORS = {
  canvas: '#f3f6f3',
  panel: '#ffffff',
  panel2: '#eef2ee',
  line: '#d5ddd5',
  muted: '#64748b',
  brand: '#4daf7b',
  brandDeep: '#2f7d56',
  onBrand: '#ffffff',
  text: '#0f172a',
  danger: '#b91c1c',
  warning: '#b45309',
  success: '#166534',
  ink: '#04140c',
  overlay: 'rgba(15,23,42,0.45)',
}
