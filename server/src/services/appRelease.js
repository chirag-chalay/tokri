import { prisma } from '../lib/prisma.js'

const PLATFORMS = new Set(['android', 'ios'])

export function parseBlockedBuilds(value) {
  const builds = String(value || '')
    .split(/[^0-9]+/)
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0)
  return [...new Set(builds)]
}

export function evaluateAppRelease(policy, build) {
  const remindAfterHours = Math.min(720, Math.max(1, Number(policy?.remindAfterHours) || 24))
  const latestBuild = Number(policy?.latestBuild) || 0
  const idle = {
    action: 'none',
    title: '',
    message: '',
    remindAfterHours,
    latestBuild,
  }
  if (!policy?.enabled) return idle

  if (policy.maintenance) {
    return {
      action: 'maintenance',
      title: policy.maintenanceTitle || 'Tokriii is paused',
      message: policy.maintenanceMessage || 'Please try again soon.',
      remindAfterHours,
      latestBuild,
    }
  }

  const installed = Number(build)
  if (!Number.isInteger(installed) || installed <= 0) return idle

  const minimumBuild = Number(policy.minimumBuild) || 0
  const blocked = parseBlockedBuilds(policy.blockedBuilds)
  const stopped = (minimumBuild > 0 && installed < minimumBuild) || blocked.includes(installed)
  if (stopped) {
    return {
      action: 'required',
      title: policy.title || 'Update Tokriii',
      message: policy.message || 'A new version of Tokriii is available.',
      remindAfterHours,
      latestBuild,
    }
  }

  if (latestBuild > 0 && installed < latestBuild) {
    return {
      action: 'recommend',
      title: policy.title || 'A new Tokriii is ready',
      message: policy.message || 'A new version of Tokriii is available.',
      remindAfterHours,
      latestBuild,
    }
  }

  return idle
}

export async function readAppRelease(platform, build) {
  const key = String(platform || '').toLowerCase()
  if (!PLATFORMS.has(key)) return evaluateAppRelease(null, build)
  const policy = await prisma.appReleasePolicy.findUnique({ where: { platform: key } })
  return evaluateAppRelease(policy, build)
}

export async function assertAppReleaseAllowed(req) {
  const platform = String(req.get('x-app-platform') || '').toLowerCase()
  const rawBuild = req.get('x-app-build')
  if (!PLATFORMS.has(platform) || rawBuild == null || rawBuild === '') return

  const decision = await readAppRelease(platform, rawBuild)
  if (decision.action !== 'required' && decision.action !== 'maintenance') return

  const error = new Error(decision.message || 'Please update Tokriii to continue.')
  error.status = 409
  error.code = 'APP_UPDATE_REQUIRED'
  throw error
}
