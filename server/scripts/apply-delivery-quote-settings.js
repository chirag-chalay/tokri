import 'dotenv/config'
import { prisma } from '../src/lib/prisma.js'

async function addColumnIfMissing(column, definition) {
  const rows = await prisma.$queryRaw`
    SELECT 1 AS ok FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Setting' AND COLUMN_NAME = ${column} LIMIT 1
  `
  if (rows.length) return
  await prisma.$executeRawUnsafe(`ALTER TABLE \`Setting\` ADD COLUMN \`${column}\` ${definition}`)
}

try {
  await addColumnIfMissing('expressMinimumOrderValue', 'DECIMAL(10,2) NOT NULL DEFAULT 1251.00')
  await addColumnIfMissing('firstThreeMorningEnabled', 'TINYINT(1) NOT NULL DEFAULT 1')
} finally {
  await prisma.$disconnect()
}
