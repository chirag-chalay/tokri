import { prisma } from '../lib/prisma.js'
import { calcCartTotals, deliveryChargeFor, ratesFromSettings } from '../config/charges.js'
import { applyFreeDeliveryRates, getCustomerFreeDeliveryStatus } from './freeDelivery.js'

export function deliveryDecision(settings, freeDelivery, option, itemsTotal) {
  const configuredRates = ratesFromSettings(settings, option)
  const freeDeliveryApplied = option === 'morning' &&
    configuredRates.firstThreeMorningEnabled && Boolean(freeDelivery?.isEligible)
  const rates = freeDeliveryApplied ? applyFreeDeliveryRates(configuredRates) : configuredRates
  const minimumOrderValue = option === 'express'
    ? Number(settings?.expressMinimumOrderValue ?? 1251)
    : 0
  const minimumMet = itemsTotal >= minimumOrderValue
  const deliveryFee = deliveryChargeFor(option, itemsTotal, rates)

  return {
    rates,
    deliveryFee,
    minimumOrderValue,
    minimumMet,
    minimumMessage: minimumMet ? null : `Same Day Delivery requires an order of at least ₹${minimumOrderValue}.`,
    freeDeliveryApplied,
    offerRemaining: freeDelivery?.remaining ?? 0,
    offerMessage: freeDeliveryApplied
      ? `🎉 First 3 Orders Offer: Free delivery applied (${freeDelivery.remaining} left)`
      : null,
  }
}

export async function getDeliveryDecision(customerId, option, itemsTotal) {
  const [settings, freeDelivery] = await Promise.all([
    prisma.setting.findUnique({ where: { id: 1 } }),
    customerId ? getCustomerFreeDeliveryStatus(customerId) : null,
  ])
  return deliveryDecision(settings, freeDelivery, option, itemsTotal)
}

export async function quoteCheckoutDelivery(items, customerId, selectedOption, discount = 0) {
  const [settings, freeDelivery] = await Promise.all([
    prisma.setting.findUnique({ where: { id: 1 } }),
    customerId ? getCustomerFreeDeliveryStatus(customerId) : null,
  ])
  const itemsTotal = Math.round(items.reduce((sum, item) => sum + Number(item.priceValue) * Number(item.quantity), 0) * 100) / 100
  const options = {}
  for (const option of ['morning', 'express']) {
    const decision = deliveryDecision(settings, freeDelivery, option, itemsTotal)
    const totals = calcCartTotals(items, decision.rates, discount)
    options[option] = {
      title: decision.rates[option].title,
      subtitle: decision.rates[option].subtitle,
      deliveryFee: totals.deliveryCharge,
      deliverySavings: Math.max(0, decision.rates[option].fee - totals.deliveryCharge),
      minimumOrderValue: decision.minimumOrderValue,
      minimumMet: decision.minimumMet,
      minimumMessage: decision.minimumMessage,
      freeDeliveryApplied: decision.freeDeliveryApplied,
      offerRemaining: decision.offerRemaining,
      offerMessage: decision.offerMessage,
      deliveryMessage: decision.offerMessage || (totals.deliveryCharge === 0 ? '🎉 Free delivery applied' : null),
      freeAboveMessage: !decision.freeDeliveryApplied &&
        decision.rates[option].freeAbove > itemsTotal
        ? `Add ₹${Math.round((decision.rates[option].freeAbove - itemsTotal) * 100) / 100} more for free delivery`
        : null,
      freeAbove: decision.rates[option].freeAbove,
    }
    if (option === selectedOption) options[option].totals = totals
  }
  return {
    deliveryType: selectedOption,
    options,
    totals: options[selectedOption].totals,
  }
}
