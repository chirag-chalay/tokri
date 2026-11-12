import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { Prisma, PrismaClient } from '@prisma/client'

// Read-only: run after generating the intended release's Prisma client and
// applying its reviewed migrations, before restarting the backend.
dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) })
const client = new PrismaClient({ log: [] })
try {
  const actual = await client.$queryRaw`
    SELECT TABLE_NAME, COLUMN_NAME FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
  `
  const columns = new Set(actual.map((column) => `${column.TABLE_NAME}.${column.COLUMN_NAME}`))
  const missing = []
  for (const model of Prisma.dmmf.datamodel.models) {
    for (const field of model.fields) {
      if (field.kind === 'object') continue
      if (!columns.has(`${model.dbName || model.name}.${field.dbName || field.name}`)) {
        missing.push(`${model.name}.${field.name}`)
      }
    }
  }
  if (missing.length) {
    console.error('Deployment blocked: required database columns are missing:')
    for (const column of missing) console.error(`- ${column}`)
    process.exitCode = 1
  } else {
    console.log('Schema column preflight passed: all generated Prisma fields exist.')
  }
} finally {
  await client.$disconnect()
}
