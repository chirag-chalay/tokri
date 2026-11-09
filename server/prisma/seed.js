import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { readFile } from 'node:fs/promises'

dotenv.config()

const prisma = new PrismaClient()

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
