import { createHash } from 'node:crypto'
import { ForbiddenError } from 'adminjs'
import { prisma } from '../lib/prisma.js'
import { logContext } from '../monitoring/index.js'
import { readSocialLinks, validateSocialLinks } from '../utils/socialLinks.js'
import { hasPermission } from './permissions.js'

function editorState(value) {
  const links = readSocialLinks(value)
  const revision = createHash('sha256').update(JSON.stringify(links)).digest('hex')
  return { links, revision }
}

export async function socialLinksHandler(request, response, { currentAdmin }) {
  const admin = currentAdmin?.id && await prisma.user.findUnique({
    where: { id: currentAdmin.id },
    select: { isActive: true, role: true, permissions: { select: { manageSettings: true } } },
  })
  if (!admin?.isActive || !['staff', 'admin', 'super_admin'].includes(admin.role) || !hasPermission(admin, 'manageSettings')) {
    throw new ForbiddenError('You need the Manage settings permission to edit social links.')
  }
  response?.setHeader?.('Cache-Control', 'no-store')
  if (request.method === 'get') {
    const setting = await prisma.setting.findUnique({ where: { id: 1 }, select: { socialLinks: true } })
    return editorState(setting?.socialLinks)
  }

  const headers = logContext.getStore()?.req?.headers ?? request.headers ?? {}
  if (request.method !== 'post' || headers['x-tokri-social-links'] !== '1' ||
      !['same-origin', 'none'].includes(headers['sec-fetch-site'])) {
    throw new ForbiddenError('Open Social Media Links from the backoffice.')
  }

  const { links, error } = validateSocialLinks(request.payload?.links)
  if (error) return { error }
  return prisma.$transaction(async (db) => {
    const [setting] = await db.$queryRaw`SELECT socialLinks FROM Setting WHERE id = 1 FOR UPDATE`
    if (editorState(setting?.socialLinks).revision !== request.payload?.revision) {
      return { error: 'Social links changed after you opened this page. Reload and try again.' }
    }
    await db.setting.update({ where: { id: 1 }, data: { socialLinks: links } })
    return editorState(links)
  })
}
