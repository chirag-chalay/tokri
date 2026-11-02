import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis
const CLIENT_GEN = 5

function createPrisma() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
  client.__tokriClientGen = CLIENT_GEN
  return client
}

function getPrisma() {
  const existing = globalForPrisma.prisma
  if (
    existing?.__tokriClientGen === CLIENT_GEN &&
    existing?.cart &&
    existing?.cartItem &&
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
