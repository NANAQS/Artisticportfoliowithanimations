import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Chave secreta para proteger o endpoint de inicialização
const INIT_SECRET = process.env.INIT_SECRET || 'change-me-in-production'

export async function POST(request: Request) {
  try {
    // Verificar se há uma chave secreta
    const { secret } = await request.json()

    if (secret !== INIT_SECRET) {
      return NextResponse.json(
        { error: 'Não autorizado. Forneça a chave secreta correta.' },
        { status: 401 }
      )
    }

    // Verificar se já foi inicializado (verificando se há usuário admin)
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@portfolio.com' }
    })

    if (existingUser) {
      return NextResponse.json({
        message: 'Banco de dados já foi inicializado',
        alreadyInitialized: true
      })
    }

    // Executar o seed diretamente importando a função main
    console.log('🌱 Executando seed do banco de dados...')
    
    try {
      // Importar dinamicamente o seed
      const seedModule = await import('../../../../prisma/seed')
      if (seedModule.main) {
        await seedModule.main()
      } else {
        throw new Error('Função main não encontrada no seed')
      }
      
      return NextResponse.json({
        message: 'Banco de dados inicializado com sucesso!'
      })
    } catch (seedError: any) {
      // Se o import falhar, tentar executar via exec
      console.log('Tentando executar seed via script...')
      const { exec } = await import('child_process')
      const { promisify } = await import('util')
      const execAsync = promisify(exec)
      
      try {
        await execAsync('npx tsx prisma/seed.ts')
        return NextResponse.json({
          message: 'Banco de dados inicializado com sucesso!'
        })
      } catch (execError: any) {
        throw new Error(`Erro ao executar seed: ${execError.message}`)
      }
    }
  } catch (error: any) {
    console.error('Erro na inicialização:', error)
    return NextResponse.json(
      { error: 'Erro ao inicializar banco de dados', details: error.message },
      { status: 500 }
    )
  }
}

// GET para verificar status
export async function GET() {
  try {
    const { prisma } = await import('@/lib/prisma')
    
    const userCount = await prisma.user.count()
    const galleryCount = await prisma.galleryArtwork.count()
    const carouselCount = await prisma.carouselArtwork.count()
    const testimonialCount = await prisma.testimonial.count()
    const skillCount = await prisma.skill.count()

    return NextResponse.json({
      initialized: userCount > 0,
      counts: {
        users: userCount,
        galleryArtworks: galleryCount,
        carouselArtworks: carouselCount,
        testimonials: testimonialCount,
        skills: skillCount
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro ao verificar status', details: error.message },
      { status: 500 }
    )
  }
}

