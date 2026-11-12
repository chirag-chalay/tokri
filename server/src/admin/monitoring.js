import { ForbiddenError, ValidationError } from 'adminjs'
import { prisma } from '../lib/prisma.js'
import { isSuperAdmin } from './permissions.js'
import { enrichLogRows } from './monitoring-presentation.js'
import { categories } from '../monitoring/sanitize.js'
import { logContext, outboxHealth, persistCriticalLogs, monitoringState, changeDebugSettings, workerCall } from '../monitoring/index.js'

export async function monitoringHandler(request, _response, context) {
  // Re-read privileges so revoked/deactivated sessions cannot view logs or enable debug.
  const admin = context.currentAdmin?.id ? await prisma.user.findUnique({ where: { id: context.currentAdmin.id } }) : null
  if (!admin?.isActive || !isSuperAdmin(admin)) throw new ForbiddenError('Only active admins may access monitoring.')
  _response?.setHeader?.('Cache-Control', 'no-store')
  const query = request.query || {}
  const canManageDebug = isSuperAdmin(admin)
  if (String(request.method).toLowerCase() === 'post') {
    if (!canManageDebug) throw new ForbiddenError('Only authorized admins can change debug logging.')
    // Custom pages use the existing authenticated AdminJS transport. Require same-origin
    // browser fetch metadata, plus a non-simple header to prevent cross-site form posts.
    const headers = logContext.getStore()?.req?.headers || request.headers || {}
    if (headers['x-tokri-monitoring'] !== '1' || !['same-origin', 'none'].includes(headers['sec-fetch-site'])) {
      throw new ForbiddenError('Use monitoring controls from the admin panel.')
    }
    const action = request.payload?.action
    if (!['enable', 'disable'].includes(action)) throw new ValidationError({}, { message: 'Invalid debug action.' })
    await changeDebugSettings(action === 'enable', request.payload?.minutes)
    await persistCriticalLogs()
  }
  const filters = Object.fromEntries(['date', 'category', 'status', 'user', 'orderId', 'ip', 'search', 'page', 'perPage'].map((key) => [key, String(query[key] || '').slice(0, 100)]))
  if (filters.category && !categories.includes(filters.category)) throw new ValidationError({}, { message: 'Invalid log type.' })
  if (filters.date && (!/^\d{4}-\d{2}-\d{2}$/.test(filters.date) || !Number.isFinite(Date.parse(filters.date)) || new Date(filters.date).toISOString().slice(0, 10) !== filters.date)) throw new ValidationError({}, { message: 'Invalid date.' })
  const outbox = await outboxHealth()
  if (String(request.method).toLowerCase() === 'post') return { ...monitoringState(), outbox, canManageDebug }
  try {
    const result = await workerCall('read', filters)
    return { ...result, rows: await enrichLogRows(result.rows, prisma), ...monitoringState(), outbox, canManageDebug }
  }
  catch { return { rows: [], files: [], total: 0, totalBytes: 0, page: 1, perPage: 50, ...monitoringState(), outbox, canManageDebug, storageError: 'Log storage is unavailable. Check the supervisor stderr stream and storage permissions.' } }
}
