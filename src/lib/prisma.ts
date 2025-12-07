import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  // Detectar ambiente
  const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined
  const isProduction = process.env.NODE_ENV === 'production'
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build'
  
  // Detectar se está usando Prisma Accelerate
  const prismaUrl = process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL
  
  // Durante o build, não validar URL (ela pode não estar disponível)
  if (!isBuild) {
    // Verificar se há uma URL válida apenas em runtime
    if (!prismaUrl || prismaUrl.trim() === '') {
      const errorMsg = 'DATABASE_URL ou PRISMA_DATABASE_URL não está configurada. Configure a variável de ambiente na Vercel.'
      console.error('❌', errorMsg)
      // Em produção/Vercel, apenas avisar (não lançar erro para não quebrar o app)
      if (isProduction || isVercel) {
        console.error('⚠️  Continuando sem DATABASE_URL - o Prisma Client tentará ler das variáveis de ambiente em runtime')
      }
    }
  }

  const isAccelerate = prismaUrl?.startsWith('prisma+') || false

  if (isAccelerate) {
    // Usar Prisma Accelerate (não precisa de adapter)
    // O Prisma Client detecta automaticamente a URL do Accelerate via PRISMA_DATABASE_URL ou DATABASE_URL
    return new PrismaClient()
  } else if (process.env.DATABASE_URL && !isVercel && !isProduction) {
    // Usar conexão direta com PostgreSQL apenas em desenvolvimento local
    try {
      const connectionString = process.env.DATABASE_URL
      if (!connectionString || connectionString.trim() === '') {
        throw new Error('DATABASE_URL está vazia')
      }
      const pool = new pg.Pool({ connectionString })
      const adapter = new PrismaPg(pool)
      return new PrismaClient({ adapter })
    } catch (error) {
      console.warn('⚠️  Erro ao criar pool PostgreSQL, usando PrismaClient padrão:', error)
      return new PrismaClient()
    }
  } else {
    // Na Vercel, produção ou quando não há DATABASE_URL, criar PrismaClient padrão
    // O Prisma Client lerá a URL das variáveis de ambiente automaticamente
    // Ele validará a URL quando tentar conectar em runtime
    return new PrismaClient()
  }
}

// Proxy para inicialização verdadeiramente lazy
// O Prisma Client só será criado quando uma propriedade for acessada
const prismaProxy = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!globalForPrisma.prisma) {
      try {
        globalForPrisma.prisma = createPrismaClient()
      } catch (error) {
        console.error('❌ Erro ao criar PrismaClient:', error)
        // Tentar criar um PrismaClient básico como fallback
        globalForPrisma.prisma = new PrismaClient()
      }
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
