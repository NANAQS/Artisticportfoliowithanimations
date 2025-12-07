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

  const isAccelerate = prismaUrl?.startsWith('prisma+') || false
  const isLocalDev = !isVercel && !isProduction && process.env.DATABASE_URL && !isAccelerate

  if (isLocalDev) {
    // Usar conexão direta com PostgreSQL apenas em desenvolvimento local (sem Accelerate)
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
    // Na Vercel, produção ou com Prisma Accelerate
    if (isAccelerate) {
      // Para Prisma Accelerate, o Prisma Client lê automaticamente PRISMA_DATABASE_URL
      return new PrismaClient()
    } else if (prismaUrl) {
      // Para PostgreSQL direto na Vercel, usar adapter com pool configurado para serverless
      // Isso evita problemas de conexão em ambientes serverless
      try {
        const connectionString = prismaUrl.trim()
        // Configurar pool para serverless: conexões efêmeras, sem manter pool
        const pool = new pg.Pool({
          connectionString,
          max: 1, // Máximo de 1 conexão por função serverless
          idleTimeoutMillis: 0, // Não manter conexões idle
          connectionTimeoutMillis: 10000, // Timeout de 10s
        })
        const adapter = new PrismaPg(pool)
        return new PrismaClient({ adapter })
      } catch (error) {
        console.warn('⚠️  Erro ao criar pool PostgreSQL, tentando PrismaClient padrão:', error)
        // Fallback: tentar sem adapter (pode não funcionar em serverless)
        return new PrismaClient()
      }
    } else {
      // Sem URL, tentar criar mesmo assim (pode falhar em runtime)
      return new PrismaClient()
    }
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
          const errorMsg = 'PRISMA_DATABASE_URL ou DATABASE_URL não está configurada. Configure a variável de ambiente na Vercel: Settings > Environment Variables'
          console.error('❌', errorMsg)
          // Criar um objeto mock que retorna promises rejeitadas quando métodos são chamados
          // Mas não lança erro imediatamente - apenas quando o método é chamado
          const mockPrisma = {} as any
          // Criar um handler que retorna funções que lançam erro apenas quando chamadas
          const handler = {
            get: (_target: any, propName: string) => {
              // Para propriedades especiais, retornar valores padrão
              if (propName === '$connect' || propName === '$disconnect') {
                return async () => {}
              }
              // Para modelos (visit, user, etc), retornar um objeto com métodos que lançam erro
              return new Proxy({}, {
                get: () => {
                  return () => Promise.reject(new Error('Prisma Client não inicializado. Configure DATABASE_URL na Vercel: Settings > Environment Variables'))
                }
              })
            }
          }
          globalForPrisma.prisma = new Proxy(mockPrisma, handler) as PrismaClient
          // Retornar o valor do proxy mock
          const mockValue = (globalForPrisma.prisma as any)[prop]
          if (typeof mockValue === 'function') {
            return mockValue.bind(globalForPrisma.prisma)
          }
          return mockValue
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
          // Criar um objeto mock que retorna promises rejeitadas quando métodos são chamados
          const createMockPrisma = () => {
            const mockError = new Error('Prisma Client não inicializado. Configure DATABASE_URL na Vercel: Settings > Environment Variables')
            return new Proxy({} as PrismaClient, {
              get: (_target, propName) => {
                if (propName === '$connect' || propName === '$disconnect') {
                  return async () => {}
                }
                // Para modelos, retornar um objeto com métodos que retornam promises rejeitadas
                return new Proxy({}, {
                  get: () => () => Promise.reject(mockError)
                })
              }
            })
          }
          globalForPrisma.prisma = createMockPrisma()
          console.warn('⚠️  Prisma Client não inicializado. As operações de banco falharão até que DATABASE_URL seja configurada.')
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
