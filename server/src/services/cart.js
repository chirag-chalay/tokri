import crypto from 'crypto'
import { prisma } from '../lib/prisma.js'
import { quoteCheckoutDelivery } from './deliveryQuote.js'
import { formatProduct, toPublicAssetUrl } from '../utils/formatters.js'
import { PRODUCT_CATEGORY_INCLUDE, productCategoryList } from '../utils/catalog.js'

function httpError(message, status = 400) {
  return Object.assign(new Error(message), { status })
}

export function normalizeQuantity(value, { allowZero = false } = {}) {
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

async function loadCartItems(cartId, customerId, db = prisma) {
  const cart = await db.cart.findUnique({ where: { id: cartId }, select: { revision: true } })
  const itemRows = await db.$queryRaw`
    SELECT id, productId, quantity FROM CartItem WHERE cartId = ${cartId} ORDER BY id ASC
  `

  const productIds = [...new Set(itemRows.map((row) => row.productId).filter(Boolean))]
  const products = productIds.length
    ? await db.product.findMany({
        where: { id: { in: productIds } },
        include: PRODUCT_CATEGORY_INCLUDE,
      })
    : []
  const productMap = new Map(products.map((product) => [product.id, product]))

  return {
    id: cartId,
    customerId,
    revision: cart?.revision || 0,
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

function formatUnavailableFromCartRow(item) {
  const product = item.product
  const categories = productCategoryList(product)
  const primary = categories[0] || null
  return {
    slug: product.slug,
    id: product.slug,
    name: product.name,
    image: toPublicAssetUrl(product.image),
    weight: product.weight || null,
    quantity: item.quantity,
    categoryId: primary?.slug || null,
  }
}

export async function formatCart(cart) {
  const rows = cart?.items || []
  const activeItems = rows.filter((item) => item.product?.isActive)
  const unavailableItems = rows
    .filter((item) => item.product && !item.product.isActive)
    .map(formatUnavailableFromCartRow)
  const items = activeItems.map((item) => ({
    ...formatCartItem(item),
    priceValue: Number(item.product.priceValue),
  }))
  const { totals } = items.length
    ? await quoteCheckoutDelivery(items, cart?.customerId, 'morning')
    : {
        totals: {
          itemsTotal: 0,
          taxTotal: 0,
          deliveryCharge: 0,
          handlingCharge: 0,
          discount: 0,
          grandTotal: 0,
        },
      }

  return {
    revision: cart?.revision || 0,
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
    unavailableItems,
    ...totals,
  }
}

export async function getCart(customerId) {
  const cartId = await getOrCreateCartId(customerId)
  const cart = await prisma.$transaction((tx) => loadCartItems(cartId, customerId, tx))
  return formatCart(cart)
}

export async function getCartReadOnly(customerId) {
  if (!customerId) throw httpError('Customer is required.', 400)

  const existing = await prisma.$queryRaw`
    SELECT id, updatedAt FROM Cart WHERE customerId = ${customerId} LIMIT 1
  `
  const row = existing[0]
  if (!row?.id) {
    const empty = await formatCart({ customerId, items: [] })
    return {
      ...empty,
      updatedAt: null,
      exists: false,
    }
  }

  const record = await loadCartItems(row.id, customerId)
  const formatted = await formatCart(record)
  return {
    ...formatted,
    updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : null,
    exists: true,
  }
}

export async function getCartCheckoutItems(customerId) {
  const cart = await getCart(customerId)
  if (!cart.items.length) throw httpError('Your cart is empty.')
  return cart.items.map((item) => ({ id: item.slug, quantity: item.quantity }))
}

async function lockCart(tx, customerId) {
  const [cart] = await tx.$queryRaw`
    SELECT id, revision FROM Cart WHERE customerId = ${customerId} FOR UPDATE
  `
  return cart
}

async function touchCart(tx, cartId) {
  await tx.cart.update({ where: { id: cartId }, data: { revision: { increment: 1 } } })
}

async function writeCart(customerId, write) {
  await getOrCreateCartId(customerId)
  const record = await prisma.$transaction(async (tx) => {
    const cart = await lockCart(tx, customerId)
    await write(tx, cart)
    await touchCart(tx, cart.id)
    return loadCartItems(cart.id, customerId, tx)
  })
  return formatCart(record)
}

export async function checkoutCartLines(tx, customerId, items) {
  const cart = await lockCart(tx, customerId)
  if (!cart) return []
  const quantities = new Map(items.map((item) => [item.productId, item.quantity]))
  const rows = await tx.cartItem.findMany({
    where: { cartId: cart.id, productId: { in: [...quantities.keys()] } },
    select: { id: true, quantity: true, productId: true },
  })
  return rows.map(({ id, quantity, productId }) => ({ id, quantity, purchased: quantities.get(productId) }))
}

export async function consumeCheckoutCart(tx, order) {
  if (!order.customerId || !order.checkoutSnapshot?.cartLines?.length) return
  const cart = await lockCart(tx, order.customerId)
  if (!cart) return
  let changes = 0
  for (const line of order.checkoutSnapshot.cartLines) {
    const where = { id: line.id, cartId: cart.id, quantity: line.quantity }
    const result = line.purchased >= line.quantity
      ? await tx.cartItem.deleteMany({ where })
      : await tx.cartItem.updateMany({ where, data: { quantity: { decrement: line.purchased } } })
    changes += result.count
  }
  if (changes) await touchCart(tx, cart.id)
}

export async function replaceCart(customerId, rawItems, { revision, merge = false } = {}) {
  if (!Array.isArray(rawItems)) throw httpError('Cart items are required.')

  const normalized = rawItems.map((item) => ({
    slug: readSlug(item),
    quantity: normalizeQuantity(item.quantity),
  }))
  if (new Set(normalized.map((item) => item.slug)).size !== normalized.length) {
    throw httpError('Duplicate products in cart.')
  }
  if (revision !== undefined && (!Number.isSafeInteger(revision) || revision < 0)) {
    throw httpError('Invalid cart revision.')
  }

  const products = await prisma.product.findMany({
    where: { slug: { in: normalized.map((item) => item.slug) } },
    include: PRODUCT_CATEGORY_INCLUDE,
  })
  const productMap = new Map(products.map((product) => [product.slug, product]))

  // Soft-skip inactive/missing lines so sync stays clean; callers read unavailableItems.
  const activeEntries = []
  const skippedUnavailable = []
  for (const entry of normalized) {
    const product = productMap.get(entry.slug)
    if (product?.isActive) {
      activeEntries.push({ entry, product })
      continue
    }
    if (product) {
      skippedUnavailable.push(formatUnavailableFromCartRow({ product, quantity: entry.quantity }))
    } else {
      skippedUnavailable.push({
        slug: entry.slug,
        id: entry.slug,
        name: entry.slug,
        image: null,
        weight: null,
        quantity: entry.quantity,
        categoryId: null,
      })
    }
  }

  const cart = await writeCart(customerId, async (tx, { id: cartId, revision: currentRevision }) => {
    if (revision !== undefined && revision !== currentRevision) {
      throw Object.assign(httpError('Your cart changed on another device. Please refresh it.', 409), { code: 'CART_CHANGED' })
    }
    const rows = await tx.cartItem.findMany({ where: { cartId } })
    const existing = new Map(rows.map((row) => [row.productId, row]))
    const wanted = new Set(activeEntries.map(({ product }) => product.id))
    const remove = merge ? [] : rows.filter((row) => !wanted.has(row.productId)).map((row) => row.id)
    for (const { entry, product } of activeEntries) {
      const row = existing.get(product.id)
      // A repeated guest merge must not increase quantities after a lost response.
      const quantity = merge ? Math.max(entry.quantity, row?.quantity || 0) : entry.quantity
      if (row?.quantity === quantity) continue
      if (row) await tx.cartItem.delete({ where: { id: row.id } })
      await tx.cartItem.create({ data: { cartId, productId: product.id, quantity } })
    }
    if (remove.length) await tx.cartItem.deleteMany({ where: { id: { in: remove } } })
  })
  if (!skippedUnavailable.length) return cart
  const seen = new Set((cart.unavailableItems || []).map((item) => item.slug))
  return {
    ...cart,
    unavailableItems: [
      ...(cart.unavailableItems || []),
      ...skippedUnavailable.filter((item) => !seen.has(item.slug)),
    ],
  }
}

export async function addCartItem(customerId, rawItem) {
  const addBy = normalizeQuantity(rawItem.quantity ?? 1)
  const product = await loadProduct(readSlug(rawItem))
  return writeCart(customerId, async (tx, { id: cartId }) => {
    const where = { cartId, productId: product.id }
    const current = await tx.cartItem.findUnique({ where: { cartId_productId: where } })
    const quantity = Math.min(99, (current?.quantity || 0) + addBy)
    if (current?.quantity === quantity) return
    if (current) await tx.cartItem.delete({ where: { id: current.id } })
    await tx.cartItem.create({ data: { ...where, quantity } })
  })
}

export async function updateCartItem(customerId, slug, quantity) {
  const nextQuantity = normalizeQuantity(quantity, { allowZero: true })
  if (nextQuantity === 0) return removeCartItem(customerId, slug)

  const product = await loadProduct(slug)
  return writeCart(customerId, async (tx, { id: cartId }) => {
    const where = { cartId, productId: product.id }
    const current = await tx.cartItem.findUnique({ where: { cartId_productId: where } })
    if (!current) throw httpError('Item is not in your cart.', 404)
    if (current.quantity === nextQuantity) return
    await tx.cartItem.delete({ where: { id: current.id } })
    await tx.cartItem.create({ data: { ...where, quantity: nextQuantity } })
  })
}

export async function removeCartItem(customerId, slug) {
  const product = await prisma.product.findFirst({ where: { slug } })
  if (!product) throw httpError('Item is not in your cart.', 404)

  return writeCart(customerId, async (tx, { id: cartId }) => {
    const removed = await tx.cartItem.deleteMany({ where: { cartId, productId: product.id } })
    if (!removed.count) throw httpError('Item is not in your cart.', 404)
  })
}

export async function clearCart(customerId) {
  return writeCart(customerId, (tx, { id: cartId }) => tx.cartItem.deleteMany({ where: { cartId } }))
}
