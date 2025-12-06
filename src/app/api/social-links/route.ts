import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

// GET - Buscar todas as redes sociais
export async function GET() {
  try {
    if (!prisma) {
      console.error('Prisma Client não está inicializado')
      return NextResponse.json({ socialLinks: [] })
    }

    const socialLinks = await prisma.socialLink.findMany({
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ socialLinks })
  } catch (error: any) {
    console.error('Erro ao buscar redes sociais:', error)
    // Retornar array vazio em caso de erro
    return NextResponse.json({ socialLinks: [] })
  }
}

// POST - Criar nova rede social
export async function POST(request: Request) {
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
    const { name, url, icon, order } = body

    const socialLink = await prisma.socialLink.create({
      data: {
        name,
        url,
        icon: icon || null,
        order: order || 0,
      }
    })

    return NextResponse.json({ socialLink }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar rede social:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar rede social
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
    const { id, name, url, icon, order } = body

    const socialLink = await prisma.socialLink.update({
      where: { id },
      data: {
        name,
        url,
        icon: icon ?? undefined,
        order: order ?? undefined,
      }
    })

    return NextResponse.json({ socialLink })
  } catch (error) {
    console.error('Erro ao atualizar rede social:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar rede social
export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get('id') || '0')

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      )
    }

    await prisma.socialLink.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar rede social:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}

// PATCH - Atualizar ordem das redes sociais
export async function PATCH(request: Request) {
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
    const { updates } = body // Array de { id, order }

    await Promise.all(
      updates.map((update: { id: number; order: number }) =>
        prisma.socialLink.update({
          where: { id: update.id },
          data: { order: update.order }
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao atualizar ordem das redes sociais:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}

