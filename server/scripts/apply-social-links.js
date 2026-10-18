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

async function main() {
  if (await columnExists('Setting', 'socialLinks')) {
    console.log('skip Setting.socialLinks')
  } else {
    await prisma.$executeRawUnsafe('ALTER TABLE `Setting` ADD COLUMN `socialLinks` JSON NULL')
    console.log('added Setting.socialLinks')
  }

  console.log('Social link column is ready.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
