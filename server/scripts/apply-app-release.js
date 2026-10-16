import dotenv from 'dotenv'
import { prisma } from '../src/lib/prisma.js'

dotenv.config()

const ROWS = [
  {
    platform: 'android',
    title: 'Update Tokriii',
    message: 'A new version of Tokriii is available.',
    maintenanceTitle: 'Tokriii is paused',
    maintenanceMessage: 'Ordering is paused for a short time. Please try again soon.',
  },
  {
    platform: 'ios',
    title: 'Update Tokriii',
    message: 'A new version of Tokriii is available.',
    maintenanceTitle: 'Tokriii is paused',
    maintenanceMessage: 'Ordering is paused for a short time. Please try again soon.',
  },
]

async function tableExists(name) {
  const rows = await prisma.$queryRaw`
    SELECT 1 AS ok FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ${name} LIMIT 1
  `
  return Boolean(rows[0])
}

async function main() {
  if (!(await tableExists('AppReleasePolicy'))) {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE \`AppReleasePolicy\` (
        \`platform\` VARCHAR(191) NOT NULL,
        \`enabled\` BOOLEAN NOT NULL DEFAULT false,
        \`latestBuild\` INTEGER NOT NULL DEFAULT 0,
        \`minimumBuild\` INTEGER NOT NULL DEFAULT 0,
        \`blockedBuilds\` TEXT NULL,
        \`title\` VARCHAR(191) NULL DEFAULT 'Update Tokriii',
        \`message\` TEXT NULL,
        \`remindAfterHours\` INTEGER NOT NULL DEFAULT 24,
        \`maintenance\` BOOLEAN NOT NULL DEFAULT false,
        \`maintenanceTitle\` VARCHAR(191) NULL DEFAULT 'Tokriii is paused',
        \`maintenanceMessage\` TEXT NULL,
        \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`platform\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `)
    console.log('AppReleasePolicy table is ready.')
  } else {
    console.log('AppReleasePolicy table already exists.')
  }

  for (const row of ROWS) {
    await prisma.$executeRaw`
      INSERT INTO \`AppReleasePolicy\`
        (\`platform\`, \`enabled\`, \`latestBuild\`, \`minimumBuild\`, \`title\`, \`message\`, \`remindAfterHours\`, \`maintenance\`, \`maintenanceTitle\`, \`maintenanceMessage\`, \`updatedAt\`)
      SELECT
        ${row.platform}, false, 0, 0, ${row.title}, ${row.message}, 24, false, ${row.maintenanceTitle}, ${row.maintenanceMessage}, CURRENT_TIMESTAMP(3)
      FROM DUAL
      WHERE NOT EXISTS (
        SELECT 1 FROM \`AppReleasePolicy\` WHERE \`platform\` = ${row.platform}
      )
    `
  }
  console.log('Android and iOS rows are ready. Both start turned off.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
