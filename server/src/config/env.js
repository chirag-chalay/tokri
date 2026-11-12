import { publicAssetOrigin } from '../../../shared/assets.js'
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
dotenv.config({ path: path.join(serverRoot, '.env') })

function stripTrailingSlash(value) {
  return String(value || '').replace(/\/+$/, '')
}

const port = Number(process.env.PORT) || 5223
const adminPath = process.env.ADMIN_PATH || '/tokri-backoffice'
const clientUrl = stripTrailingSlash(process.env.CLIENT_URL || 'http://localhost:5222')
const appUrl = stripTrailingSlash(process.env.APP_URL || clientUrl)
const apiUrl = stripTrailingSlash(process.env.API_URL || `http://localhost:${port}`)

// Uploads are hosted by the public site; the API may use a separate hostname.
const publicAssetUrl = publicAssetOrigin({
  publicAssetUrl: process.env.PUBLIC_ASSET_URL,
  clientUrl,
  apiUrl,
})

const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => stripTrailingSlash(origin.trim())).filter(Boolean)
  : [clientUrl, appUrl].filter((value, index, list) => value && list.indexOf(value) === index)

// When set (e.g. http://127.0.0.1:3000), Express keeps /api + admin on this
// host/port and proxies the public storefront to a local Next.js process.
const nextOrigin = stripTrailingSlash(process.env.TOKRIII_NEXT_ORIGIN || '')

export const env = {
  port,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl,
  appUrl,
  apiUrl,
  publicAssetUrl,
  nextOrigin,
  corsOrigins,
  trustProxy: process.env.TRUST_PROXY === 'true' || process.env.NODE_ENV === 'production',
  adminPath: adminPath.startsWith('/') ? adminPath : `/${adminPath}`,
  adminEmail: process.env.ADMIN_EMAIL || 'admin@tokriii.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  sessionSecret: process.env.SESSION_SECRET || 'dev-session-secret',
  jwtSecret: process.env.JWT_SECRET || process.env.SESSION_SECRET || 'dev-session-secret',
  jwtExpiresInSeconds: Number(process.env.JWT_EXPIRES_IN_SECONDS) || 60 * 60 * 24 * 30,
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'Tokriii <noreply@tokriii.com>',
  },
}
