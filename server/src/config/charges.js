import { prisma } from '../lib/prisma.js'

export const DELIVERY_CHARGE = 25
export const EXPRESS_DELIVERY_CHARGE = 99
export const HANDLING_CHARGE = 2
export const SMALL_CART_CHARGE = 0

export const DEFAULT_DELIVERY = {
  morning: {
    id: 'morning',
    title: 'Flawless Morning Delivery',
    subtitle: 'Freshness Guaranteed',
    fee: DELIVERY_CHARGE,
    freeAbove: 0,
  },
  express: {
    id: 'express',
    title: 'Same day',
    subtitle: 'On-Demand Luxury',
    fee: EXPRESS_DELIVERY_CHARGE,
    freeAbove: 0,
  },
}

function toMoney(value, fallback) {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount < 0) return fallback
  return Math.round(amount * 100) / 100
}

export function normalizeDeliveryOption(value) {
  return String(value || '').toLowerCase() === 'express' ? 'express' : 'morning'
}

export function publicDeliveryConfig(settings) {
  return {
    morning: {
      id: 'morning',
      title: String(settings?.morningDeliveryTitle || DEFAULT_DELIVERY.morning.title).trim() || DEFAULT_DELIVERY.morning.title,
      subtitle: String(settings?.morningDeliverySubtitle || DEFAULT_DELIVERY.morning.subtitle).trim() || DEFAULT_DELIVERY.morning.subtitle,
      fee: toMoney(settings?.morningShippingFee ?? settings?.shippingFee, DELIVERY_CHARGE),
      freeAbove: toMoney(settings?.morningFreeAbove, 0),
      minimumOrderValue: 0,
    },
    express: {
      id: 'express',
      title: String(settings?.expressDeliveryTitle || DEFAULT_DELIVERY.express.title).trim() || DEFAULT_DELIVERY.express.title,
      subtitle: String(settings?.expressDeliverySubtitle || DEFAULT_DELIVERY.express.subtitle).trim() || DEFAULT_DELIVERY.express.subtitle,
      fee: toMoney(settings?.expressShippingFee, EXPRESS_DELIVERY_CHARGE),
      freeAbove: toMoney(settings?.expressFreeAbove, 0),
      minimumOrderValue: toMoney(settings?.expressMinimumOrderValue, 1251),
    },
  }
}

export function deliveryChargeFor(option, itemsTotal, rates = DEFAULT_DELIVERY) {
  const key = normalizeDeliveryOption(option)
  const spec = rates?.[key] || DEFAULT_DELIVERY[key]
  const fee = toMoney(spec?.fee ?? rates?.deliveryCharge, key === 'express' ? EXPRESS_DELIVERY_CHARGE : DELIVERY_CHARGE)
  const freeAbove = toMoney(spec?.freeAbove, 0)
  if (freeAbove > 0 && Number(itemsTotal) >= freeAbove) return 0
  return fee
}

export function defaultChargeRates(option = 'morning') {
  const chosen = normalizeDeliveryOption(option)
  return {
    option: chosen,
    deliveryCharge: DEFAULT_DELIVERY[chosen].fee,
    handlingCharge: HANDLING_CHARGE,
    smallCartCharge: SMALL_CART_CHARGE,
    ...DEFAULT_DELIVERY,
  }
}

export function ratesFromSettings(settings, option = 'morning') {
  const delivery = publicDeliveryConfig(settings)
  const chosen = normalizeDeliveryOption(option)
  return {
    option: chosen,
    deliveryCharge: delivery[chosen].fee,
    handlingCharge: toMoney(settings?.handlingFee, HANDLING_CHARGE),
    firstThreeMorningEnabled: settings?.firstThreeMorningEnabled !== false,
    smallCartCharge: SMALL_CART_CHARGE,
    ...delivery,
  }
}

export async function getChargeRates(option = 'morning') {
  try {
    const settings = await prisma.setting.findUnique({ where: { id: 1 } })
    return ratesFromSettings(settings, option)
  } catch (error) {
    console.error('Failed to load charge settings:', error)
    return defaultChargeRates(option)
  }
}

export function calcItemTax(item, isInterState = false) {
  const isTaxable = Boolean(item.isTaxable ?? item.product?.isTaxable)
  const gstRate = Number(item.gstRate ?? item.product?.gstRate ?? 0)
  const lineTaxableAmount = Math.round(Number(item.priceValue) * Number(item.quantity) * 100) / 100
  const taxAmount = isTaxable && gstRate > 0
    ? Math.round(lineTaxableAmount * (gstRate / 100) * 100) / 100
    : 0

  let cgstAmount = 0
  let sgstAmount = 0
  let igstAmount = 0

  if (taxAmount > 0) {
    if (!isInterState) {
      cgstAmount = Math.round((taxAmount / 2) * 100) / 100
      sgstAmount = Math.round((taxAmount - cgstAmount) * 100) / 100
    } else {
      igstAmount = taxAmount
    }
  }

  return {
    lineTaxableAmount,
    isTaxable,
    gstRate,
    taxAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
  }
}

export function calcCartTotals(items, rates = defaultChargeRates(), discount = 0, taxOptions = {}) {
  const isInterState = typeof taxOptions === 'boolean' ? taxOptions : Boolean(taxOptions?.isInterState)
  const itemsTotal = Math.round(items.reduce((sum, item) => sum + Number(item.priceValue) * Number(item.quantity), 0) * 100) / 100
  const hasItems = items.length > 0
  const deliveryCharge = hasItems ? deliveryChargeFor(rates.option || 'morning', itemsTotal, rates) : 0
  const handlingCharge = hasItems ? toMoney(rates.handlingCharge, HANDLING_CHARGE) : 0
  const smallCartCharge = 0
  const safeDiscount = Math.max(0, toMoney(discount, 0))

  let taxTotal = 0
  let cgstTotal = 0
  let sgstTotal = 0
  let igstTotal = 0

  if (typeof taxOptions?.taxTotal === 'number') {
    taxTotal = Math.round(taxOptions.taxTotal * 100) / 100
    if (!isInterState) {
      cgstTotal = Math.round((taxTotal / 2) * 100) / 100
      sgstTotal = Math.round((taxTotal - cgstTotal) * 100) / 100
    } else {
      igstTotal = taxTotal
    }
  } else {
    for (const item of items) {
      const tax = calcItemTax(item, isInterState)
      taxTotal += tax.taxAmount
      cgstTotal += tax.cgstAmount
      sgstTotal += tax.sgstAmount
      igstTotal += tax.igstAmount
    }
    taxTotal = Math.round(taxTotal * 100) / 100
    cgstTotal = Math.round(cgstTotal * 100) / 100
    sgstTotal = Math.round(sgstTotal * 100) / 100
    igstTotal = Math.round(igstTotal * 100) / 100
  }

  const grandTotal = Math.max(0, Math.round((itemsTotal + deliveryCharge + handlingCharge + taxTotal - safeDiscount) * 100) / 100)

  return {
    itemsTotal,
    deliveryCharge,
    handlingCharge,
    smallCartCharge,
    discount: safeDiscount,
    taxTotal,
    cgstTotal,
    sgstTotal,
    igstTotal,
    isInterState,
    grandTotal,
    totalCount: items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
  }
}

