import assert from 'node:assert/strict'
import test from 'node:test'
import { calcCartTotals, calcItemTax, ratesFromSettings } from '../src/config/charges.js'
import { orderPricesIncludeGst } from '../src/utils/tax.js'

const noExtraCharges = {
  option: 'morning',
  deliveryCharge: 0,
  handlingCharge: 0,
  morning: { fee: 0, freeAbove: 0 },
}

test('small cart fee uses the option, pre-coupon subtotal, minimum, and exact threshold', () => {
  const settings = {
    morningSmallCartEnabled: true, morningSmallCartBelow: 299, morningSmallCartFee: 20,
    expressSmallCartEnabled: true, expressSmallCartBelow: 599, expressSmallCartFee: 30,
    expressMinimumOrderValue: 399, expressFreeAbove: 500,
  }
  const item = (priceValue) => [{ priceValue, quantity: 1, isTaxable: true, gstRate: 5 }]
  const morning = ratesFromSettings(settings, 'morning', true)
  const express = ratesFromSettings(settings, 'express', true)
  assert.equal(calcCartTotals([], morning).smallCartCharge, 0)
  assert.equal(calcCartTotals(item(298.99), morning).smallCartCharge, 20)
  assert.equal(calcCartTotals(item(299), morning, 30).smallCartCharge, 0)
  assert.equal(calcCartTotals(item(299.01), morning).smallCartCharge, 0)
  assert.equal(calcCartTotals(item(398.99), express).smallCartCharge, 0)
  assert.equal(calcCartTotals(item(399), express).smallCartCharge, 30)
  assert.equal(calcCartTotals(item(599), express).smallCartCharge, 0)
  const current = calcCartTotals(item(500), express)
  const legacy = calcCartTotals(item(500), ratesFromSettings(settings, 'express'))
  assert.equal(current.deliveryCharge, 0)
  assert.equal(current.smallCartCharge, 30)
  assert.equal(current.taxTotal, legacy.taxTotal)
  assert.equal(current.grandTotal - legacy.grandTotal, 30)
})

test('extracts GST from an inclusive product price without increasing invoice total', () => {
  const item = { priceValue: 300, quantity: 1, isTaxable: true, gstRate: 5 }
  const tax = calcItemTax(item)
  const totals = calcCartTotals([item], noExtraCharges)

  assert.equal(tax.lineTaxableAmount, 285.71)
  assert.equal(tax.taxAmount, 14.29)
  assert.equal(tax.cgstAmount, 7.15)
  assert.equal(tax.sgstAmount, 7.14)
  assert.equal(totals.itemsTotal, 300)
  assert.equal(totals.taxTotal, 14.29)
  assert.equal(totals.grandTotal, 300)
})

test('calculates GST for a five-digit inclusive price to two decimal places', () => {
  const tax = calcItemTax({ priceValue: 12345.67, quantity: 1, isTaxable: true, gstRate: 5 })

  assert.equal(tax.lineTaxableAmount, 11757.78)
  assert.equal(tax.taxAmount, 587.89)
  assert.equal(tax.cgstAmount, 293.95)
  assert.equal(tax.sgstAmount, 293.94)
  assert.equal(tax.lineTaxableAmount + tax.taxAmount, 12345.67)
})

test('extracts GST after discount and preserves the discounted inclusive total', () => {
  const totals = calcCartTotals(
    [{ priceValue: 300, quantity: 1, isTaxable: true, gstRate: 5 }],
    noExtraCharges,
    30,
  )

  assert.equal(totals.lineItems[0].lineTotal, 270)
  assert.equal(totals.lineItems[0].lineTaxableAmount, 257.14)
  assert.equal(totals.taxTotal, 12.86)
  assert.equal(totals.grandTotal, 270)
})

test('retains the inclusive amount for non-taxable products and reports interstate GST as IGST', () => {
  const nonTaxable = calcItemTax({ priceValue: 300, quantity: 1, isTaxable: false, gstRate: 5 })
  const interstate = calcItemTax({ priceValue: 300, quantity: 1, isTaxable: true, gstRate: 5 }, true)

  assert.equal(nonTaxable.lineTaxableAmount, 300)
  assert.equal(nonTaxable.taxAmount, 0)
  assert.equal(interstate.igstAmount, 14.29)
  assert.equal(interstate.cgstAmount, 0)
  assert.equal(interstate.sgstAmount, 0)
})

test('identifies inclusive orders without reclassifying historical tax-added totals', () => {
  const included = {
    itemsTotal: 300,
    deliveryCharge: 10,
    handlingCharge: 2,
    discount: 0,
    grandTotal: 312,
  }
  const historical = { ...included, grandTotal: 326.29 }
  const historicalOnePaiseTax = {
    itemsTotal: 0.2,
    deliveryCharge: 0,
    handlingCharge: 0,
    smallCartCharge: 0,
    discount: 0,
    grandTotal: 0.21,
  }

  assert.equal(orderPricesIncludeGst(included), true)
  assert.equal(orderPricesIncludeGst(historical), false)
  assert.equal(orderPricesIncludeGst(historicalOnePaiseTax), false)
})
