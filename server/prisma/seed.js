import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import path from 'path'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'url'

dotenv.config()

const prisma = new PrismaClient()
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const { categories, categoryDetails } = await import(
  path.join(__dirname, '../../src/data/categories.js')
)
const { bestSellers } = await import(path.join(__dirname, '../../src/data/bestSellers.js'))

function parsePrice(price) {
  const match = String(price).replace(/,/g, '').match(/(\d+(?:\.\d+)?)/)
  return match ? Number(match[1]) : 0
}

async function main() {
  console.log('Seeding Tokriii database...')

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@tokriii.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  const passwordHash = await bcrypt.hash(adminPassword, 10)

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: passwordHash,
      role: 'admin',
      name: 'Tokriii Admin',
      username: 'tokriadmin',
      isActive: true,
    },
    create: {
      email: adminEmail,
      username: 'tokriadmin',
      password: passwordHash,
      role: 'admin',
      name: 'Tokriii Admin',
      isActive: true,
    },
  })

  const superAdmin = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (superAdmin) {
    await prisma.adminPermission.upsert({
      where: { userId: superAdmin.id },
      update: {
        manageProducts: true,
        manageCatalog: true,
        manageMedia: true,
        manageOrders: true,
        manageCoupons: true,
        manageContent: true,
        manageSettings: true,
        manageUsers: true,
      },
      create: {
        userId: superAdmin.id,
        manageProducts: true,
        manageCatalog: true,
        manageMedia: true,
        manageOrders: true,
        manageCoupons: true,
        manageContent: true,
        manageSettings: true,
        manageUsers: true,
      },
    })
  }

  const categoryIdBySlug = {}

  for (const [index, category] of categories.entries()) {
    const details = categoryDetails[category.id] || {}

    const record = await prisma.category.upsert({
      where: { slug: category.id },
      update: {
        label: category.label,
        title: details.title || category.label,
        subtitle: details.subtitle || null,
        description: details.description || null,
        image: category.image,
        sortOrder: index,
        isActive: true,
      },
      create: {
        slug: category.id,
        label: category.label,
        title: details.title || category.label,
        subtitle: details.subtitle || null,
        description: details.description || null,
        image: category.image,
        sortOrder: index,
        isActive: true,
      },
    })

    categoryIdBySlug[category.id] = record.id
  }

  const bestSellerSlugs = new Set(bestSellers.map((p) => p.id))

  for (const product of bestSellers) {
    await prisma.product.upsert({
      where: { slug: product.id },
      update: {
        name: product.name,
        priceValue: parsePrice(product.price),
        badge: product.description || 'Best Seller',
        image: product.image,
        isBestSeller: true,
        isActive: true,
      },
      create: {
        slug: product.id,
        name: product.name,
        priceValue: parsePrice(product.price),
        badge: product.description || 'Best Seller',
        image: product.image,
        isBestSeller: true,
        isActive: true,
        stock: 100,
      },
    })
  }

  for (const [slug, details] of Object.entries(categoryDetails)) {
    const categoryId = categoryIdBySlug[slug]
    if (!categoryId || !details.products) continue

    for (const [index, product] of details.products.entries()) {
      const isImported = slug === 'imported'
      const isBestSeller = bestSellerSlugs.has(product.id)

      const saved = await prisma.product.upsert({
        where: { slug: product.id },
        update: {
          name: product.name,
          priceValue: parsePrice(product.price),
          oldPriceValue: product.oldPrice ? parsePrice(product.oldPrice) : null,
          weight: product.weight || null,
          image: product.image,
          categoryId,
          isImported,
          isBestSeller: isBestSeller || undefined,
          isActive: true,
          sortOrder: index,
        },
        create: {
          slug: product.id,
          name: product.name,
          priceValue: parsePrice(product.price),
          oldPriceValue: product.oldPrice ? parsePrice(product.oldPrice) : null,
          weight: product.weight || null,
          image: product.image,
          categoryId,
          isImported,
          isBestSeller,
          isActive: true,
          sortOrder: index,
          stock: 100,
        },
      })
      if (categoryId) {
        await prisma.productCategory.upsert({
          where: { productId_categoryId: { productId: saved.id, categoryId } },
          create: { productId: saved.id, categoryId },
          update: {},
        })
      }
    }
  }

  const importedProducts = [
    {
      slug: 'imported-dragon-fruit-red',
      name: 'Dragon Fruit - Red (1KG)',
      priceValue: 899,
      isImported: true,
    },
    {
      slug: 'imported-kesar-mango',
      name: 'Kesar Mango - 1 Dozen (12 PCS)',
      priceValue: 699,
      isImported: true,
    },
    {
      slug: 'imported-strawberry-belgium',
      name: 'Strawberry - Imported (Belgium)',
      priceValue: 700,
      isImported: true,
    },
  ]

  const importedCategoryId = categoryIdBySlug.imported

  for (const [index, product] of importedProducts.entries()) {
    const saved = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        priceValue: product.priceValue,
        categoryId: importedCategoryId,
        isImported: true,
        isActive: true,
        sortOrder: index,
      },
      create: {
        slug: product.slug,
        name: product.name,
        priceValue: product.priceValue,
        categoryId: importedCategoryId,
        isImported: true,
        isActive: true,
        sortOrder: index,
        stock: 100,
      },
    })
    if (importedCategoryId) {
      await prisma.productCategory.upsert({
        where: { productId_categoryId: { productId: saved.id, categoryId: importedCategoryId } },
        create: { productId: saved.id, categoryId: importedCategoryId },
        update: {},
      })
    }
  }

  const reviews = [
    {
      title: 'Super fresh fruits',
      content: 'Super fresh fruits. Always fresh and delivered right on time.',
      name: 'Tina McDonnell',
      rating: 5,
      isApproved: true,
    },
    {
      title: 'Excellent quality produce',
      content: 'Excellent quality produce. Clean packaging and great consistency.',
      name: 'Priya Sharma',
      rating: 5,
      isApproved: true,
    },
    {
      title: 'Tasty and juicy fruits',
      content: 'Tasty and juicy fruits. Better taste than local market options.',
      name: 'Rahul Verma',
      rating: 5,
      isApproved: true,
    },
  ]

  await prisma.review.deleteMany()
  await prisma.review.createMany({ data: reviews })

  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {
      type: 'percent',
      value: 10,
      minCart: 0,
      applyOn: 'cart',
      targetType: 'all',
      usageType: 'unlimited',
      isActive: true,
    },
    create: {
      code: 'WELCOME10',
      type: 'percent',
      value: 10,
      minCart: 0,
      applyOn: 'cart',
      targetType: 'all',
      usageType: 'unlimited',
      isActive: true,
    },
  })

  const pages = [
    { slug: 'about', title: 'About Us' },
    { slug: 'privacy-policy', title: 'Privacy Policy' },
    { slug: 'terms-and-conditions', title: 'Terms & Conditions' },
    { slug: 'help-faqs', title: 'Help & FAQs' },
    { slug: 'returns-policy', title: 'Returns Policy' },
    { slug: 'support-center', title: 'Support Center' },
    { slug: 'careers', title: 'Careers' },
  ]

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: { title: page.title, isPublished: true },
      create: { slug: page.slug, title: page.title, isPublished: true },
    })
  }

  await prisma.setting.upsert({
    where: { id: 1 },
    update: {
      storeName: 'Tokriii',
      storeTagline: 'Premium Fruits for Discerning Tastes',
      storeEmail: 'support@tokriii.com',
      storePhone1: '9580280280',
      storePhone2: '9958697427',
      storeAddress: 'C 617 Azadpur Fruit Market, New Delhi 110033',
      promoBanner: 'Get 10% OFF Your First Order - Use Code: WELCOME10',
      earlyDelivery: 'Get your Tokriii before 7:00 AM',
      shippingFee: 25,
      handlingFee: 2,
      morningDeliveryTitle: 'Flawless Morning Delivery',
      morningDeliverySubtitle: 'Freshness Guaranteed',
      morningShippingFee: 25,
      morningFreeAbove: 0,
      expressDeliveryTitle: 'Same day',
      expressDeliverySubtitle: 'On-Demand Luxury',
      expressShippingFee: 99,
      expressFreeAbove: 0,
      razorpayEnabled: false,
      msg91Enabled: false,
    },
    create: {
      id: 1,
      storeName: 'Tokriii',
      storeTagline: 'Premium Fruits for Discerning Tastes',
      storeEmail: 'support@tokriii.com',
      storePhone1: '9580280280',
      storePhone2: '9958697427',
      storeAddress: 'C 617 Azadpur Fruit Market, New Delhi 110033',
      promoBanner: 'Get 10% OFF Your First Order - Use Code: WELCOME10',
      earlyDelivery: 'Get your Tokriii before 7:00 AM',
      shippingFee: 25,
      handlingFee: 2,
      morningDeliveryTitle: 'Flawless Morning Delivery',
      morningDeliverySubtitle: 'Freshness Guaranteed',
      morningShippingFee: 25,
      morningFreeAbove: 0,
      expressDeliveryTitle: 'Same day',
      expressDeliverySubtitle: 'On-Demand Luxury',
      expressShippingFee: 99,
      expressFreeAbove: 0,
      razorpayEnabled: false,
      msg91Enabled: false,
    },
  })

  // Initialize only: reseeding must never overwrite administrator-approved rules.
  await prisma.automaticDiscount.upsert({
    where: { id: 1 }, update: {},
    create: { id: 1, enabled: false, tiers: JSON.parse(await readFile(new URL('./data/automatic-discounts.json', import.meta.url), 'utf8')) },
  })

  console.log('Seed complete.')
  console.log(`Admin login: ${adminEmail} or username tokriadmin / ${adminPassword}`)
}

main()
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
