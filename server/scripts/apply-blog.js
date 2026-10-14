import dotenv from 'dotenv'
import { prisma } from '../src/lib/prisma.js'

dotenv.config()

async function tableExists(name) {
  const rows = await prisma.$queryRaw`
    SELECT 1 AS ok FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ${name} LIMIT 1
  `
  return Boolean(rows[0])
}

async function main() {
  if (await tableExists('BlogPost')) {
    const columns = await prisma.$queryRaw`
      SELECT 1 AS ok FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'BlogPost' AND COLUMN_NAME = 'category' LIMIT 1
    `
    if (!columns[0]) {
      await prisma.$executeRawUnsafe('ALTER TABLE `BlogPost` ADD COLUMN `category` VARCHAR(191) NULL')
      console.log('added BlogPost.category')
    } else {
      console.log('BlogPost table already exists.')
    }
    return
  }

  await prisma.$executeRawUnsafe(`
    CREATE TABLE \`BlogPost\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`slug\` VARCHAR(191) NOT NULL,
      \`title\` VARCHAR(191) NOT NULL,
      \`excerpt\` TEXT NULL,
      \`body\` LONGTEXT NULL,
      \`coverImage\` TEXT NULL,
      \`author\` VARCHAR(191) NULL DEFAULT 'Tokriii',
      \`category\` VARCHAR(191) NULL,
      \`isPublished\` BOOLEAN NOT NULL DEFAULT true,
      \`publishedAt\` DATETIME(3) NULL,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`BlogPost_slug_key\` (\`slug\`),
      KEY \`BlogPost_isPublished_publishedAt_idx\` (\`isPublished\`, \`publishedAt\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `)
  console.log('BlogPost table is ready.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
