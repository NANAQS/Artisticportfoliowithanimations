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

  // Configuração de log
  const logConfig = process.env.NODE_ENV === 'development' 
    ? ['error', 'warn'] as const
    : ['error'] as const

  if (isAccelerate) {
    // Usar Prisma Accelerate (não precisa de adapter)
    // O Prisma Client detecta automaticamente a URL do Accelerate via PRISMA_DATABASE_URL ou DATABASE_URL
    return new PrismaClient({ log: logConfig })
  } else if (process.env.DATABASE_URL && !process.env.VERCEL) {
    // Usar conexão direta com PostgreSQL apenas em ambientes não-Vercel
    // Na Vercel, usar Prisma Accelerate ou conexão padrão
    try {
      const connectionString = process.env.DATABASE_URL
      const pool = new pg.Pool({ connectionString })
      const adapter = new PrismaPg(pool)
      return new PrismaClient({ adapter, log: logConfig })
    } catch (error) {
      // Se falhar, usar PrismaClient padrão
      return new PrismaClient({ log: logConfig })
    }
  } else {
    // Na Vercel ou quando não há DATABASE_URL, criar PrismaClient padrão
    // O Prisma Client lerá a URL das variáveis de ambiente automaticamente
    return new PrismaClient({ log: logConfig })
  }
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
