import crypto from 'node:crypto'
import { env } from '../../config/env.js'
import { PLATFORMS, PREVIEW_TTL_SECONDS } from './blocks.js'

function b64url(value) {
  return Buffer.from(value).toString('base64url')
}

function fromB64url(value) {
  return Buffer.from(String(value || ''), 'base64url').toString('utf8')
}

function sign(payload) {
  return crypto.createHmac('sha256', env.sessionSecret).update(payload).digest('base64url')
}

export function createPreviewToken(platform, ttlSeconds = PREVIEW_TTL_SECONDS) {
  if (!PLATFORMS.includes(platform)) throw new Error('Invalid platform')
  const exp = Math.floor(Date.now() / 1000) + Number(ttlSeconds || PREVIEW_TTL_SECONDS)
  const payload = `${platform}|${exp}`
  return `${b64url(payload)}.${sign(payload)}`
}

export function verifyPreviewToken(token, expectedPlatform) {
  const raw = String(token || '')
  const [encoded, signature] = raw.split('.')
  if (!encoded || !signature) return { ok: false, reason: 'malformed' }
  const payload = fromB64url(encoded)
  const expected = sign(payload)
  const left = Buffer.from(signature)
  const right = Buffer.from(expected)
  if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) {
    return { ok: false, reason: 'tampered' }
  }
  const [platform, expRaw] = payload.split('|')
  const exp = Number(expRaw)
  if (!PLATFORMS.includes(platform)) return { ok: false, reason: 'platform' }
  if (expectedPlatform && platform !== expectedPlatform) return { ok: false, reason: 'platform_mismatch' }
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) {
    return { ok: false, reason: 'expired' }
  }
  return { ok: true, platform, exp }
}
