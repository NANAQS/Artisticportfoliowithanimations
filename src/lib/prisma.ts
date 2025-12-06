import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  // Detectar se está usando Prisma Accelerate
  const prismaUrl = process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL
  const isAccelerate = prismaUrl?.startsWith('prisma+')

  if (isAccelerate) {
    // Usar Prisma Accelerate (não precisa de adapter)
    return new PrismaClient()
  } else if (process.env.DATABASE_URL && !process.env.VERCEL && process.env.NODE_ENV !== 'production') {
    // Usar conexão direta com PostgreSQL apenas em desenvolvimento local
    try {
      const connectionString = process.env.DATABASE_URL
      const pool = new pg.Pool({ connectionString })
      const adapter = new PrismaPg(pool)
      return new PrismaClient({ adapter })
    } catch (error) {
      return new PrismaClient()
    }
  } else {
    // Na Vercel, produção ou quando não há DATABASE_URL, criar PrismaClient padrão
    // O Prisma Client lerá a URL das variáveis de ambiente automaticamente
    return new PrismaClient()
  }
}

// Proxy para inicialização verdadeiramente lazy
// O Prisma Client só será criado quando uma propriedade for acessada
const prismaProxy = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient()
    }
    const prisma = globalForPrisma.prisma
    const value = (prisma as any)[prop]
    if (typeof value === 'function') {
      return value.bind(prisma)
    }
    return value
  },
})

export const prisma = prismaProxy as PrismaClient
