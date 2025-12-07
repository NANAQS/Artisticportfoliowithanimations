import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  // Detectar ambiente
  const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined
  const isProduction = process.env.NODE_ENV === 'production'
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build'
  
  // Detectar se está usando Prisma Accelerate
  // Priorizar PRISMA_DATABASE_URL, depois DATABASE_URL
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
    } else {
      // Log da URL detectada (sem mostrar a chave completa por segurança)
      const urlPreview = prismaUrl.substring(0, 50) + '...'
      console.log('✅ URL do banco detectada:', urlPreview)
    }
  }

  // SQLite não precisa de adapters ou configurações especiais
  // O Prisma Client lê automaticamente DATABASE_URL do schema.prisma
  // Para SQLite, a URL deve ser: file:./dev.db (local) ou libsql://... (Turso)
  return new PrismaClient()
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
          const errorMsg = 'PRISMA_DATABASE_URL ou DATABASE_URL não está configurada. Configure a variável de ambiente na Vercel: Settings > Environment Variables'
          console.error('❌', errorMsg)
          // Na Vercel/produção, tentar criar mesmo assim (pode falhar em runtime)
          // Mas vamos tentar para não quebrar o build
        } else {
          console.log('✅ Variável de ambiente encontrada, criando Prisma Client...')
        }
        globalForPrisma.prisma = createPrismaClient()
        console.log('✅ Prisma Client criado com sucesso')
      } catch (error: any) {
        console.error('❌ Erro ao criar PrismaClient:', error?.message || error)
        console.error('Stack:', error?.stack)
        // Tentar criar um PrismaClient básico como fallback
        // Ele tentará ler das variáveis de ambiente em runtime
        try {
          console.log('⚠️  Tentando criar PrismaClient fallback...')
          globalForPrisma.prisma = new PrismaClient()
          console.log('✅ Prisma Client fallback criado')
        } catch (fallbackError: any) {
          console.error('❌ Erro ao criar PrismaClient fallback:', fallbackError?.message || fallbackError)
          console.error('Stack:', fallbackError?.stack)
          const errorMsg = 'Não foi possível inicializar o Prisma Client. Verifique se a variável de ambiente DATABASE_URL está configurada na Vercel com o valor: prisma+postgres://accelerate.prisma-data.net/?api_key=...'
          throw new Error(errorMsg)
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
