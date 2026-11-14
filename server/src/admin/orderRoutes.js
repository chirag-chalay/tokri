import { Router } from 'express'
import { hasPermission } from './permissions.js'
import { generateOrderInvoicePdf } from '../services/invoice.js'
import { prisma } from '../lib/prisma.js'
import { logDurable } from '../monitoring/index.js'
import { lookupTrackingPurchase } from '../services/trackingLookup.js'

function requireOrderAdmin() {
  return (req, res, next) => {
    const admin = req.session?.adminUser
    if (!hasPermission(admin, 'manageOrders')) {
      return res.status(403).json({ message: 'You do not have permission to view or download invoices.' })
    }
    return next()
  }
}

export function buildOrderRoutes({ db = prisma, audit = logDurable } = {}) {
  const router = Router()

  // Admin session and current database permissions are both required; never expose customer details.
  router.get('/tracking/:transactionId', async (req, res, next) => {
    try {
      const adminId = req.session?.adminUser?.id
      const admin = adminId ? await db.user.findUnique({ where: { id: adminId }, include: { permissions: true } }) : null
      if (!admin?.isActive || !hasPermission(admin, 'manageOrders')) return res.status(403).json({ message: 'Not authorized.' })
      const transactionId = String(req.params.transactionId || '').toLowerCase()
      if (!/^[a-f0-9]{64}$/.test(transactionId)) return res.status(400).json({ message: 'Invalid transaction ID.' })
      const result = await lookupTrackingPurchase(transactionId, db)
      await audit('audit', 'tracking.purchase_lookup', { actorId: admin.id, status: result ? 'success' : 'not_found', ...(result ? { orderNo: result.orderNo } : {}) })
      res.set('Cache-Control', 'no-store')
      return result ? res.json(result) : res.status(404).json({ message: 'Transaction not found.' })
    } catch (error) { return next(error) }
  })

  router.get('/:orderId/invoice', requireOrderAdmin(), async (req, res, next) => {
    try {
      const { buffer, order, invoiceNo } = await generateOrderInvoicePdf(req.params.orderId)
      const filename = `invoice-${order.orderNo}.pdf`

      const disposition = req.query.download === '1' ? 'attachment' : 'inline'
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `${disposition}; filename="${filename}"`)
      res.setHeader('Content-Length', buffer.length)
      return res.send(buffer)
    } catch (error) {
      if (error.status === 404) {
        return res.status(404).json({ message: error.message })
      }
      return next(error)
    }
  })

  return router
}
