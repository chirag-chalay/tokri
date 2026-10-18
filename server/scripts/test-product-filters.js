import { prisma } from '../src/lib/prisma.js'
import {
  dateRangeWhere,
  productFilterWhere,
  productListWhere,
  readRequestFilters,
} from '../src/admin/product-filters.js'

function assert(condition, message) {
  if (!condition) throw new Error(`ASSERTION FAILED: ${message}`)
  console.log(`  ✓ ${message}`)
}

function dayStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
}

function dayEnd(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
}

async function idsFor(where, page, perPage) {
  const rows = await prisma.product.findMany({
    where,
    skip: (page - 1) * perPage,
    take: perPage,
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  })
  return rows.map((row) => row.id)
}

async function run() {
  console.log('\n=== Product sidebar filters ===\n')

  const titleWhere = productFilterWhere({ name: 'some test' })
  assert(
    titleWhere.AND?.[0]?.name?.contains === 'some test',
    "title search is contains, same as LIKE '%some test%'",
  )

  const combined = productFilterWhere({ priceValue: '199', isActive: 'true' })
  assert(combined.AND?.length === 2, 'price and active are two AND clauses')
  assert(combined.AND[0].priceValue.equals === 199, 'price 199 is an exact match')
  assert(combined.AND[1].isActive === true, 'active yes is true')

  const ignored = productFilterWhere({
    description: 'fruit',
    currency: 'INR',
    oldPriceValue: '10',
    weight: '1 kg',
    sortOrder: '2',
    name: 'apple',
  })
  assert(ignored.AND.length === 1 && ignored.AND[0].name.contains === 'apple', 'removed filter fields are ignored')

  const parsed = readRequestFilters({
    'filters.name': 'papaya',
    'filters.priceValue': '80',
    'filters.isActive': 'false',
    'filters.createdAt~~from': '2026-10-01',
    'filters.createdAt~~to': '2026-10-19',
  })
  assert(parsed.name === 'papaya' && parsed.priceValue === '80', 'dotted filter query is read')
  assert(parsed.createdAt.from === '2026-10-01' && parsed.createdAt.to === '2026-10-19', 'created date from/to is read')

  const from = new Date(2026, 9, 1, 15, 30, 0)
  const to = new Date(2026, 9, 19, 8, 0, 0)
  const range = dateRangeWhere({ from: from.toISOString(), to: to.toISOString() })
  assert(range.gte.getTime() === dayStart(from).getTime(), 'created from includes the whole start day')
  assert(range.lte.getTime() === dayEnd(to).getTime(), 'created to includes the whole end day')

  const queryWhere = productListWhere({
    'filters.name': 'some test',
    'filters.priceValue': '199',
    'filters.isActive': 'true',
  })
  assert(queryWhere.AND.length === 3, 'a request with three filters becomes one AND query')

  const sample = await prisma.product.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, priceValue: true, isActive: true, createdAt: true, updatedAt: true },
  })
  assert(sample, 'there is at least one product to test against')

  const price = Number(sample.priceValue)
  const priceWhere = productListWhere({ 'filters.priceValue': String(price) })
  const priceIds = await prisma.product.findMany({ where: priceWhere, select: { id: true, priceValue: true } })
  assert(priceIds.some((row) => row.id === sample.id), 'price filter finds the sample product')
  assert(
    priceIds.every((row) => Number(row.priceValue) === price),
    `every price result is ${price}, including products beyond one page`,
  )

  const andWhere = productListWhere({
    'filters.priceValue': String(price),
    'filters.isActive': String(sample.isActive),
  })
  const andIds = await prisma.product.findMany({ where: andWhere, select: { id: true, isActive: true, priceValue: true } })
  assert(andIds.some((row) => row.id === sample.id), 'price AND active includes the sample')
  assert(
    andIds.every((row) => Number(row.priceValue) === price && row.isActive === sample.isActive),
    'price AND active excludes products that fail either condition',
  )

  const oppositeWhere = productListWhere({
    'filters.priceValue': String(price),
    'filters.isActive': String(!sample.isActive),
  })
  const opposite = await prisma.product.findMany({ where: oppositeWhere, select: { id: true } })
  assert(!opposite.some((row) => row.id === sample.id), 'the opposite active flag excludes the sample')

  const needle = sample.name.trim().slice(0, Math.min(6, sample.name.trim().length))
  assert(needle.length >= 2, 'sample title is long enough for a partial search')
  const likeWhere = productListWhere({ 'filters.name': needle })
  const likeRows = await prisma.product.findMany({ where: likeWhere, select: { id: true, name: true } })
  assert(likeRows.some((row) => row.id === sample.id), `title LIKE '%${needle}%' finds the sample`)
  assert(
    likeRows.every((row) => row.name.toLowerCase().includes(needle.toLowerCase())),
    'every title result contains the typed text',
  )
  const missing = await prisma.product.count({
    where: productListWhere({ 'filters.name': 'zz-no-such-product-title' }),
  })
  assert(missing === 0, 'a title that matches nothing returns no products')

  const createdDay = productListWhere({
    'filters.createdAt~~from': sample.createdAt.toISOString(),
    'filters.createdAt~~to': sample.createdAt.toISOString(),
  })
  const createdRows = await prisma.product.findMany({ where: createdDay, select: { id: true, createdAt: true } })
  assert(createdRows.some((row) => row.id === sample.id), 'created date matches the sample day')
  assert(
    createdRows.every((row) => row.createdAt >= dayStart(sample.createdAt) && row.createdAt <= dayEnd(sample.createdAt)),
    'created date results stay inside that day',
  )

  const afterCreated = new Date(sample.createdAt.getTime() + 2 * 24 * 60 * 60 * 1000)
  const futureCreated = await prisma.product.count({
    where: productListWhere({ 'filters.createdAt~~from': afterCreated.toISOString() }),
  })
  const rawFuture = await prisma.product.count({ where: { createdAt: { gte: dayStart(afterCreated) } } })
  assert(futureCreated === rawFuture, 'created from-date matches the same range across the whole table')

  const updatedDay = productListWhere({
    'filters.updatedAt~~from': sample.updatedAt.toISOString(),
    'filters.updatedAt~~to': sample.updatedAt.toISOString(),
  })
  const updatedRows = await prisma.product.findMany({ where: updatedDay, select: { id: true, updatedAt: true } })
  assert(updatedRows.some((row) => row.id === sample.id), 'updated date matches the sample day')
  assert(
    updatedRows.every((row) => row.updatedAt >= dayStart(sample.updatedAt) && row.updatedAt <= dayEnd(sample.updatedAt)),
    'updated date results stay inside that day',
  )

  const broad = productListWhere({ 'filters.isActive': 'true' })
  const total = await prisma.product.count({ where: broad })
  const pageSize = 2
  const pageOne = await idsFor(broad, 1, pageSize)
  const pageTwo = await idsFor(broad, 2, pageSize)
  assert(total >= pageOne.length, 'filtered total counts every matching product, not one page')
  assert(new Set([...pageOne, ...pageTwo]).size === pageOne.length + pageTwo.length, 'page 1 and page 2 do not repeat records')
  if (total > pageSize) {
    assert(pageTwo.length > 0, 'page 2 still returns matches when more than one page exists')
  }

  console.log('\nAll product filter checks passed.\n')
}

run()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
