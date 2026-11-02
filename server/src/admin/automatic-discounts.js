import * as AdminJSPrisma from '@adminjs/prisma'
import { prisma } from '../lib/prisma.js'
import { canManage, hasPermission } from './permissions.js'
import { validateDiscountConfig, automaticDiscountFor } from '../services/automaticDiscounts.js'

export async function automaticDiscountHandler(request, _response, context) {
  if (!hasPermission(context.currentAdmin, 'manageSettings')) throw Object.assign(new Error('Forbidden'), { status: 403 })
  const record = context.record?.toJSON(context.currentAdmin)
  if (request.method === 'post') {
    try {
      const payload = request.payload || {}
      const config = validateDiscountConfig({ enabled: payload.enabled,
        tiers: typeof payload.tiers === 'string' ? JSON.parse(payload.tiers) : payload.tiers })
      if (payload.intent === 'preview') {
        if (!/^(0|[1-9]\d{0,7})(\.\d{1,2})?$/.test(String(payload.amount))) throw new Error('Enter a valid sample amount.')
        return { record, preview: automaticDiscountFor(payload.amount, config), amount: payload.amount }
      }
      const result = await prisma.automaticDiscount.updateMany({
        where: { id: 1, updatedAt: new Date(payload.updatedAt) }, data: config,
      })
      if (!result.count) throw new Error('Settings changed in another session. Reload before saving.')
    } catch (error) {
      return { notice: { type: 'error', message: error.message } }
    }
  }
  return { record, config: await prisma.automaticDiscount.findUnique({ where: { id: 1 } }),
    ...(request.method === 'post' ? { notice: { type: 'success', message: 'Automatic discounts saved.' } } : {}) }
}

export function getAutomaticDiscountResource(component) {
  const access = canManage('manageSettings')
  return {
    resource: { model: AdminJSPrisma.getModelByName('AutomaticDiscount'), client: prisma },
    options: {
      name: 'Automatic Discounts', navigation: { name: 'Settings', icon: 'Tag' },
      href: ({ h }) => h.recordActionUrl({ resourceId: 'AutomaticDiscount', recordId: '1', actionName: 'edit' }),
      actions: {
        list: { isVisible: false, isAccessible: access, handler: automaticDiscountHandler },
        edit: { isAccessible: access, component, handler: automaticDiscountHandler },
        show: { isAccessible: false, isVisible: false },
        new: { isAccessible: false, isVisible: false },
        delete: { isAccessible: false, isVisible: false },
        bulkDelete: { isAccessible: false, isVisible: false },
        search: { isAccessible: false, isVisible: false },
      },
    },
  }
}
