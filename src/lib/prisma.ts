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

  if (isAccelerate && prismaUrl) {
    // Usar Prisma Accelerate
    // O Prisma Client lê automaticamente PRISMA_DATABASE_URL ou DATABASE_URL quando começa com 'prisma+'
    // Garantir que a variável esteja definida
    if (!process.env.PRISMA_DATABASE_URL && !process.env.DATABASE_URL) {
      process.env.PRISMA_DATABASE_URL = prismaUrl
    }
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
    // Na Vercel, produção ou quando não há DATABASE_URL
    // Se houver uma URL disponível, garantir que esteja nas variáveis de ambiente
    if (prismaUrl) {
      // Se for Accelerate, garantir que PRISMA_DATABASE_URL esteja definida
      if (prismaUrl.startsWith('prisma+')) {
        if (!process.env.PRISMA_DATABASE_URL && !process.env.DATABASE_URL) {
          process.env.PRISMA_DATABASE_URL = prismaUrl
        }
      }
      // O Prisma Client lerá a URL das variáveis de ambiente automaticamente
      return new PrismaClient()
    }
    // Se não houver URL, tentar criar mesmo assim (pode falhar em runtime, mas não quebra o build)
    // O Prisma Client tentará ler das variáveis de ambiente em runtime
    return new PrismaClient()
  }
}

// Proxy para inicialização verdadeiramente lazy
// O Prisma Client só será criado quando uma propriedade for acessada
const prismaProxy = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!globalForPrisma.prisma) {
      try {
        // Verificar se as variáveis de ambiente estão disponíveis
        const prismaUrl = process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL
        if (!prismaUrl || prismaUrl.trim() === '') {
          console.error('❌ PRISMA_DATABASE_URL ou DATABASE_URL não está configurada')
          console.error('⚠️  Configure a variável de ambiente na Vercel: Settings > Environment Variables')
        }
        globalForPrisma.prisma = createPrismaClient()
      } catch (error: any) {
        console.error('❌ Erro ao criar PrismaClient:', error?.message || error)
        // Tentar criar um PrismaClient básico como fallback
        // Ele tentará ler das variáveis de ambiente em runtime
        try {
          globalForPrisma.prisma = new PrismaClient()
        } catch (fallbackError: any) {
          console.error('❌ Erro ao criar PrismaClient fallback:', fallbackError?.message || fallbackError)
          throw new Error('Não foi possível inicializar o Prisma Client. Verifique as variáveis de ambiente PRISMA_DATABASE_URL ou DATABASE_URL na Vercel.')
        }
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
