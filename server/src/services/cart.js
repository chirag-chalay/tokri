import crypto from 'crypto'
import { prisma } from '../lib/prisma.js'
import { quoteCheckoutDelivery } from './deliveryQuote.js'
import { formatProduct } from '../utils/formatters.js'
import { PRODUCT_CATEGORY_INCLUDE } from '../utils/catalog.js'

function httpError(message, status = 400) {
  return Object.assign(new Error(message), { status })
}

function normalizeQuantity(value, { allowZero = false } = {}) {
  const quantity = Number(value)
  if (!Number.isInteger(quantity)) throw httpError('Quantity must be a whole number.')
  if (allowZero && quantity === 0) return 0
  if (quantity < 1) throw httpError('Quantity must be at least 1.')
  if (quantity > 99) throw httpError('Quantity cannot be more than 99.')
  return quantity
}

function readSlug(raw) {
  const slug = String(raw?.slug || raw?.id || raw?.productId || '').trim()
  if (!slug) throw httpError('Product is required.')
  return slug
}

function newId() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 24)
}

async function loadProduct(slug) {
  const product = await prisma.product.findFirst({
    where: { slug, isActive: true },
    include: PRODUCT_CATEGORY_INCLUDE,
  })
  if (!product) throw httpError('This product is no longer available.', 404)
  return product
}

async function getOrCreateCartId(customerId) {
  if (!customerId) throw httpError('Please log in to continue.', 401)

  const existing = await prisma.$queryRaw`
    SELECT id FROM Cart WHERE customerId = ${customerId} LIMIT 1
  `
  if (existing[0]?.id) return existing[0].id

  const id = newId()
  try {
    await prisma.$executeRaw`
      INSERT INTO Cart (id, customerId, createdAt, updatedAt)
      VALUES (${id}, ${customerId}, NOW(), NOW())
    `
    return id
  } catch (error) {
    const raced = await prisma.$queryRaw`
      SELECT id FROM Cart WHERE customerId = ${customerId} LIMIT 1
    `
    if (raced[0]?.id) return raced[0].id
    throw error
  }
}

async function loadCartRecord(customerId) {
  const cartId = await getOrCreateCartId(customerId)
  const itemRows = await prisma.$queryRaw`
    SELECT id, productId, quantity FROM CartItem WHERE cartId = ${cartId} ORDER BY id ASC
  `

  const productIds = [...new Set(itemRows.map((row) => row.productId).filter(Boolean))]
  const products = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: PRODUCT_CATEGORY_INCLUDE,
      })
    : []
  const productMap = new Map(products.map((product) => [product.id, product]))

  return {
    id: cartId,
    customerId,
    items: itemRows
      .map((row) => ({
        id: row.id,
        quantity: Number(row.quantity) || 0,
        product: productMap.get(row.productId),
      }))
      .filter((item) => item.product),
  }
}

function formatCartItem(item) {
  const product = formatProduct(item.product)
  return {
    ...product,
    quantity: item.quantity,
    isTaxable: Boolean(item.product.isTaxable),
    gstRate: Number(item.product.gstRate || 0),
    hsnCode: item.product.hsnCode || '0808',
    lineTotal: Number(item.product.priceValue) * item.quantity,
  }
}

export async function formatCart(cart) {
  const activeItems = (cart?.items || []).filter((item) => item.product?.isActive)
  const items = activeItems.map((item) => ({
    ...formatCartItem(item),
    priceValue: Number(item.product.priceValue),
  }))
  const { totals } = await quoteCheckoutDelivery(items, cart?.customerId, 'morning')

  return {
    items: items.map(({ id, slug, name, price, priceValue, oldPrice, oldPriceValue, image, weight, quantity, lineTotal, category, stock, isTaxable, gstRate, hsnCode }) => ({
      id,
      slug,
      name,
      price,
      priceValue,
      oldPrice,
      oldPriceValue,
      image,
      weight,
      quantity,
      lineTotal,
      category,
      stock,
      isTaxable,
      gstRate,
      hsnCode,
    })),
    ...totals,
  }
}

export async function getCart(customerId) {
  const cart = await loadCartRecord(customerId)
  return formatCart(cart)
}

export async function getCartCheckoutItems(customerId) {
  const cart = await getCart(customerId)
  if (!cart.items.length) throw httpError('Your cart is empty.')
  return cart.items.map((item) => ({ id: item.slug, quantity: item.quantity }))
}

export async function replaceCart(customerId, rawItems) {
  if (!Array.isArray(rawItems)) throw httpError('Cart items are required.')

  const normalized = rawItems.map((item) => ({
    slug: readSlug(item),
    quantity: normalizeQuantity(item.quantity),
  }))

  const products = await prisma.product.findMany({
    where: { slug: { in: normalized.map((item) => item.slug) }, isActive: true },
  })
  const productMap = new Map(products.map((product) => [product.slug, product]))

  for (const entry of normalized) {
    if (!productMap.has(entry.slug)) {
      throw httpError(`Product "${entry.slug}" is no longer available.`)
    }
  }

  const cartId = await getOrCreateCartId(customerId)
  await prisma.$executeRaw`DELETE FROM CartItem WHERE cartId = ${cartId}`

  for (const entry of normalized) {
    const product = productMap.get(entry.slug)
    await prisma.$executeRaw`
      INSERT INTO CartItem (id, cartId, productId, quantity)
      VALUES (${newId()}, ${cartId}, ${product.id}, ${entry.quantity})
    `
  }

  return getCart(customerId)
}

export async function addCartItem(customerId, rawItem) {
  const slug = readSlug(rawItem)
  const addBy = normalizeQuantity(rawItem.quantity ?? 1)
  const product = await loadProduct(slug)
  const cartId = await getOrCreateCartId(customerId)

  const existing = await prisma.$queryRaw`
    SELECT id, quantity FROM CartItem
    WHERE cartId = ${cartId} AND productId = ${product.id}
    LIMIT 1
  `
  const current = existing[0]
  const nextQuantity = Math.min(99, (Number(current?.quantity) || 0) + addBy)

  if (current) {
    await prisma.$executeRaw`
      UPDATE CartItem SET quantity = ${nextQuantity} WHERE id = ${current.id}
    `
  } else {
    await prisma.$executeRaw`
      INSERT INTO CartItem (id, cartId, productId, quantity)
      VALUES (${newId()}, ${cartId}, ${product.id}, ${nextQuantity})
    `
  }

  await prisma.$executeRaw`UPDATE Cart SET updatedAt = NOW() WHERE id = ${cartId}`
  return getCart(customerId)
}

export async function updateCartItem(customerId, slug, quantity) {
  const nextQuantity = normalizeQuantity(quantity, { allowZero: true })
  if (nextQuantity === 0) return removeCartItem(customerId, slug)

  const product = await loadProduct(slug)
  const cartId = await getOrCreateCartId(customerId)
  const existing = await prisma.$queryRaw`
    SELECT id FROM CartItem
    WHERE cartId = ${cartId} AND productId = ${product.id}
    LIMIT 1
  `
  if (!existing[0]) throw httpError('Item is not in your cart.', 404)

  await prisma.$executeRaw`
    UPDATE CartItem SET quantity = ${nextQuantity} WHERE id = ${existing[0].id}
  `
  await prisma.$executeRaw`UPDATE Cart SET updatedAt = NOW() WHERE id = ${cartId}`
  return getCart(customerId)
}

export async function removeCartItem(customerId, slug) {
  const product = await prisma.product.findFirst({ where: { slug } })
  if (!product) throw httpError('Item is not in your cart.', 404)

  const cartRows = await prisma.$queryRaw`
    SELECT id FROM Cart WHERE customerId = ${customerId} LIMIT 1
  `
  const cartId = cartRows[0]?.id
  if (!cartId) throw httpError('Item is not in your cart.', 404)

  const deleted = Number(
    await prisma.$executeRaw`
      DELETE FROM CartItem WHERE cartId = ${cartId} AND productId = ${product.id}
    `,
  )
  if (!deleted) throw httpError('Item is not in your cart.', 404)

  return getCart(customerId)
}

export async function clearCart(customerId) {
  const cartRows = await prisma.$queryRaw`
    SELECT id FROM Cart WHERE customerId = ${customerId} LIMIT 1
  `
  const cartId = cartRows[0]?.id
  if (cartId) {
    await prisma.$executeRaw`DELETE FROM CartItem WHERE cartId = ${cartId}`
  }
  return getCart(customerId)
}
