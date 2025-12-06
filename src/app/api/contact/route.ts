import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

// GET - Buscar configurações de contato
export async function GET() {
  try {
    if (!prisma) {
      console.error('Prisma Client não está inicializado')
      return NextResponse.json({
        contact: {
          id: 0,
          email: 'hello@portfolio.com',
          phone: '+1 (555) 123-4567',
          location: 'San Francisco, CA',
        },
        socialLinks: []
      })
    }

    let contactConfig
    try {
      contactConfig = await prisma.contactConfig.findFirst()
    } catch (prismaError: any) {
      console.error('Erro ao acessar contactConfig:', prismaError)
      // Se o modelo não existe ainda, retornar valores padrão
      if (prismaError?.message?.includes('contactConfig') || prismaError?.code === 'P2001') {
        return NextResponse.json({
          contact: {
            id: 0,
            email: 'hello@portfolio.com',
            phone: '+1 (555) 123-4567',
            location: 'San Francisco, CA',
          },
          socialLinks: []
        })
      }
      throw prismaError
    }

    // Se não existir, criar uma configuração padrão
    if (!contactConfig) {
      try {
        contactConfig = await prisma.contactConfig.create({
          data: {
            email: 'hello@portfolio.com',
            phone: '+1 (555) 123-4567',
            location: 'San Francisco, CA',
          }
        })
      } catch (createError) {
        console.error('Erro ao criar configuração padrão:', createError)
        // Retornar valores padrão se não conseguir criar
        contactConfig = {
          id: 0,
          email: 'hello@portfolio.com',
          phone: '+1 (555) 123-4567',
          location: 'San Francisco, CA',
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any
      }
    }

    let socialLinks: any[] = []
    try {
      socialLinks = await prisma.socialLink.findMany({
        orderBy: { order: 'asc' }
      })
    } catch (socialError: any) {
      console.error('Erro ao buscar redes sociais:', socialError)
      // Continuar com array vazio se houver erro
      socialLinks = []
    }

    return NextResponse.json({
      contact: contactConfig,
      socialLinks
    })
  } catch (error) {
    console.error('Erro ao buscar configurações de contato:', error)
    // Retornar valores padrão em caso de erro
    return NextResponse.json({
      contact: {
        id: 0,
        email: 'hello@portfolio.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
      },
      socialLinks: []
    })
  }
}

// PUT - Atualizar configurações de contato
export async function PUT(request: Request) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    if (!prisma) {
      console.error('Prisma Client não está inicializado')
      return NextResponse.json(
        { error: 'Erro de configuração do banco de dados' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { email, phone, location } = body

    let contactConfig
    try {
      contactConfig = await prisma.contactConfig.findFirst()
    } catch (prismaError: any) {
      console.error('Erro ao acessar contactConfig:', prismaError)
      return NextResponse.json(
        { error: 'Erro ao acessar banco de dados', details: prismaError?.message || 'Erro desconhecido' },
        { status: 500 }
      )
    }

    if (contactConfig) {
      contactConfig = await prisma.contactConfig.update({
        where: { id: contactConfig.id },
        data: {
          email: email || contactConfig.email,
          phone: phone ?? contactConfig.phone,
          location: location ?? contactConfig.location,
        }
      })
    } else {
      contactConfig = await prisma.contactConfig.create({
        data: {
          email: email || 'hello@portfolio.com',
          phone: phone || null,
          location: location || null,
        }
      })
    }

    return NextResponse.json({ contact: contactConfig })
  } catch (error) {
    console.error('Erro ao atualizar configurações de contato:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}

