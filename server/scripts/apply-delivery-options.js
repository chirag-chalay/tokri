import dotenv from 'dotenv'
import { prisma } from '../src/lib/prisma.js'

dotenv.config()

async function columnExists(table, column) {
  const rows = await prisma.$queryRaw`
    SELECT 1 AS ok FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ${table} AND COLUMN_NAME = ${column} LIMIT 1
  `
  return Boolean(rows[0])
}

async function addColumn(table, column, definition) {
  if (await columnExists(table, column)) {
    console.log(`skip ${table}.${column}`)
    return
  }
  await prisma.$executeRawUnsafe(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`)
  console.log(`added ${table}.${column}`)
}

async function main() {
  await addColumn('Setting', 'morningDeliveryTitle', "VARCHAR(191) NULL DEFAULT 'Flawless Morning Delivery'")
  await addColumn('Setting', 'morningDeliverySubtitle', "VARCHAR(191) NULL DEFAULT 'Freshness Guaranteed'")
  await addColumn('Setting', 'morningShippingFee', 'DECIMAL(10, 2) NOT NULL DEFAULT 25')
  await addColumn('Setting', 'morningFreeAbove', 'DECIMAL(10, 2) NOT NULL DEFAULT 0')
  await addColumn('Setting', 'expressDeliveryTitle', "VARCHAR(191) NULL DEFAULT 'Same day'")
  await addColumn('Setting', 'expressDeliverySubtitle', "VARCHAR(191) NULL DEFAULT 'On-Demand Luxury'")
  await addColumn('Setting', 'expressShippingFee', 'DECIMAL(10, 2) NOT NULL DEFAULT 99')
  await addColumn('Setting', 'expressFreeAbove', 'DECIMAL(10, 2) NOT NULL DEFAULT 0')

  await addColumn('ServiceablePincode', 'morningEnabled', 'TINYINT(1) NOT NULL DEFAULT 1')
  await addColumn('ServiceablePincode', 'expressEnabled', 'TINYINT(1) NOT NULL DEFAULT 0')

  await addColumn('Order', 'deliveryOption', 'VARCHAR(32) NULL')

  if (await columnExists('Setting', 'shippingFee')) {
    await prisma.$executeRawUnsafe(`
      UPDATE \`Setting\`
      SET \`morningShippingFee\` = \`shippingFee\`
      WHERE \`id\` = 1 AND \`morningShippingFee\` = 25
    `)
    console.log('copied Setting.shippingFee → morningShippingFee where still default')
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
