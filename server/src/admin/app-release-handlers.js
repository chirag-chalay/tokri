import { ValidationError } from 'adminjs'
import { parseBlockedBuilds } from '../services/appRelease.js'

function toBoolean(value) {
  return value === true || value === 'true' || value === 'on' || value === 1 || value === '1'
}

function readBuild(value, label, errors) {
  const text = String(value ?? '').trim()
  if (!text) return 0
  if (!/^\d+$/.test(text)) {
    errors[label] = { message: 'Use a whole number, like 6.' }
    return 0
  }
  return Number(text)
}

export function prepareAppReleasePayload(request) {
  if (request.method !== 'post') return request
  const payload = request.payload || {}
  const errors = {}
  const latestBuild = readBuild(payload.latestBuild, 'latestBuild', errors)
  const minimumBuild = readBuild(payload.minimumBuild, 'minimumBuild', errors)
  const remindRaw = String(payload.remindAfterHours ?? '').trim()
  let remindAfterHours = 24
  if (remindRaw) {
    if (!/^\d+$/.test(remindRaw) || Number(remindRaw) < 1 || Number(remindRaw) > 720) {
      errors.remindAfterHours = { message: 'Use hours from 1 to 720.' }
    } else {
      remindAfterHours = Number(remindRaw)
    }
  }
  if (latestBuild > 0 && minimumBuild > latestBuild) {
    errors.minimumBuild = { message: 'Minimum build cannot be higher than the latest build.' }
  }
  if (Object.keys(errors).length) {
    throw new ValidationError(errors)
  }

  const blocked = parseBlockedBuilds(payload.blockedBuilds)
  request.payload = {
    ...payload,
    enabled: toBoolean(payload.enabled),
    maintenance: toBoolean(payload.maintenance),
    latestBuild,
    minimumBuild,
    remindAfterHours,
    blockedBuilds: blocked.length ? blocked.join(', ') : null,
    title: String(payload.title || '').trim() || 'Update Tokriii',
    message: String(payload.message || '').trim() || null,
    maintenanceTitle: String(payload.maintenanceTitle || '').trim() || 'Tokriii is paused',
    maintenanceMessage: String(payload.maintenanceMessage || '').trim() || null,
  }
  delete request.payload.platform
  return request
}
