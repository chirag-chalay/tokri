import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'
import { signPartnerToken } from '../services/jwt.js'
import { requestPartnerPasswordReset } from '../services/partnerPassword.js'
import { requirePartner } from '../middleware/partnerAuth.js'
import {
  collectCashForOrder,
  createOrderPaymentQr,
  formatPartnerOrder,
  getPartnerOrder,
  listPartnerOrders,
} from '../services/partnerOrders.js'

const router = Router()

function publicPartner(partner) {
  return {
    id: partner.id,
    name: partner.name,
    email: partner.email,
    phone: partner.phone,
    isActive: partner.isActive,
    hasPassword: Boolean(partner.password),
  }
}

router.post('/auth/login', async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase()
    const password = String(req.body?.password || '')
    if (!email || !password) {
      throw Object.assign(new Error('Enter your email and password.'), { status: 400 })
    }

    const partner = await prisma.deliveryPartner.findUnique({ where: { email } })
    if (!partner?.password) {
      throw Object.assign(new Error('Invalid email or password.'), { status: 401 })
    }
    if (!partner.isActive) {
      throw Object.assign(new Error('This account is not activated yet. Ask your manager to turn it on in admin.'), {
        status: 403,
      })
    }

    const ok = await bcrypt.compare(password, partner.password)
    if (!ok) {
      throw Object.assign(new Error('Invalid email or password.'), { status: 401 })
    }

    res.json({
      token: signPartnerToken(partner),
      partner: publicPartner(partner),
    })
  } catch (error) {
    next(error)
  }
})

router.post('/auth/forgot', async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase()
    if (email) await requestPartnerPasswordReset(email)
    res.json({
      ok: true,
      message: 'If that email is an active partner account, a password link has been sent.',
    })
  } catch (error) {
    next(error)
  }
})

router.get('/me', requirePartner, (req, res) => {
  res.json({ partner: publicPartner(req.partner) })
})

router.get('/orders', requirePartner, async (req, res, next) => {
  try {
    const orders = await listPartnerOrders(req.partner.id)
    res.json({ orders })
  } catch (error) {
    next(error)
  }
})

router.get('/orders/:id', requirePartner, async (req, res, next) => {
  try {
    const order = await getPartnerOrder(req.params.id, req.partner.id)
    res.json({ order })
  } catch (error) {
    next(error)
  }
})

router.post('/orders/:id/collect-cash', requirePartner, async (req, res, next) => {
  try {
    const order = await collectCashForOrder(req.params.id, { partnerId: req.partner.id })
    res.json({ order: formatPartnerOrder(order) })
  } catch (error) {
    next(error)
  }
})

router.post('/orders/:id/payment-qr', requirePartner, async (req, res, next) => {
  try {
    const order = await createOrderPaymentQr(req.params.id, { partnerId: req.partner.id })
    res.json({ order: formatPartnerOrder(order) })
  } catch (error) {
    next(error)
  }
})

router.post('/device-token', requirePartner, async (req, res, next) => {
  try {
    const token = String(req.body?.token || '').trim()
    const platform = String(req.body?.platform || 'unknown')
    if (!token) throw Object.assign(new Error('Device token is required.'), { status: 400 })

    await prisma.partnerDeviceToken.upsert({
      where: { token },
      update: { partnerId: req.partner.id, platform },
      create: { token, partnerId: req.partner.id, platform },
    })
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})

export default router
