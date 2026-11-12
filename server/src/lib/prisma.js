import { PrismaClient } from '@prisma/client'
import { instrumentPrisma } from '../monitoring/database.js'

const globalForPrisma = globalThis
const CLIENT_GEN = 7

function createPrisma() {
  const client = instrumentPrisma(new PrismaClient({ log: [] }))
  client.__tokriClientGen = CLIENT_GEN
  return client
}

function getPrisma() {
  const existing = globalForPrisma.prisma
  if (
    existing?.__tokriClientGen === CLIENT_GEN &&
    existing?.cart &&
    existing?.cartItem &&
    existing?.trackingDelivery &&
    existing?.monitoringOutbox &&
    existing?.monitoringOutboxBudget &&
    existing?.deviceToken
  ) {
    return existing
  }
  if (existing?.$disconnect) {
    existing.$disconnect().catch(() => {})
  }
  return createPrisma()
}

export const prisma = getPrisma()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
