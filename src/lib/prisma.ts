import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

// Detectar se está usando Prisma Accelerate
const isAccelerate = 
  process.env.PRISMA_DATABASE_URL?.startsWith('prisma+') ||
  process.env.DATABASE_URL?.startsWith('prisma+')

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let prismaInstance: PrismaClient

if (isAccelerate) {
  // Usar Prisma Accelerate (não precisa de adapter)
  // O Prisma Client detecta automaticamente a URL do Accelerate via PRISMA_DATABASE_URL ou DATABASE_URL
  prismaInstance = new PrismaClient()
} else {
  // Usar conexão direta com PostgreSQL
  const connectionString = process.env.DATABASE_URL!
  const pool = new pg.Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  prismaInstance = new PrismaClient({ adapter })
}

export const prisma =
  globalForPrisma.prisma ?? prismaInstance

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
