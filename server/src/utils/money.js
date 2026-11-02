import { Prisma } from '@prisma/client'

export const Decimal = Prisma.Decimal
export const decimal = (value = 0) => new Decimal(String(value ?? 0))
export const money = (value) => decimal(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber()
export const subtotal = (items) => money(items.reduce((sum, item) => sum.plus(decimal(item.priceValue).times(item.quantity)), decimal(0)))

// Allocate whole paise by largest remainder so line discounts sum exactly to the order discount.
export function allocateDiscount(items, amount, eligibleIndexes = items.map((_, i) => i)) {
  const bases = items.map((item, i) => eligibleIndexes.includes(i) ? decimal(money(decimal(item.priceValue).times(item.quantity))).times(100) : decimal(0))
  const base = bases.reduce((sum, value) => sum.plus(value), decimal(0))
  if (base.isZero()) return items.map(() => 0)
  const paise = Decimal.min(decimal(money(amount)).times(100), base)
  const shares = bases.map((value) => paise.times(value).div(base))
  const allocated = shares.map((value) => value.floor().toNumber())
  let remaining = paise.minus(allocated.reduce((sum, value) => sum + value, 0)).toNumber()
  const rank = shares.map((value, i) => ({ i, remainder: value.minus(value.floor()) }))
    .sort((a, b) => b.remainder.cmp(a.remainder) || a.i - b.i)
  for (const { i } of rank) { if (remaining-- <= 0) break; allocated[i]++ }
  return allocated.map((value) => value / 100)
}
