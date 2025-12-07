import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Buscar configuração do Footer
export async function GET() {
  try {
    let config = await prisma.footerConfig.findFirst()

    // Se não existir, retornar valores padrão
    if (!config) {
      return NextResponse.json({
        authorName: 'Nanak',
        copyrightText: '© 2025 Artist Portfolio. All rights reserved',
        href: null,
      })
    }

    return NextResponse.json({
      id: config.id,
      authorName: config.authorName,
      copyrightText: config.copyrightText,
      href: config.href,
    })
  } catch (error) {
    console.error('Erro ao buscar configuração do Footer:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar configuração do Footer (protegido)
export async function PUT(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado. Faça login para continuar.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { authorName, copyrightText, href } = body

    // Validar campos obrigatórios
    if (!authorName || !copyrightText) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se já existe configuração
    const existing = await prisma.footerConfig.findFirst()

    let config
    if (existing) {
      config = await prisma.footerConfig.update({
        where: { id: existing.id },
        data: {
          authorName,
          copyrightText,
          href: href || null,
        },
      })
    } else {
      config = await prisma.footerConfig.create({
        data: {
          authorName,
          copyrightText,
          href: href || null,
        },
      })
    }

    return NextResponse.json({
      message: 'Configuração do Footer atualizada com sucesso',
      data: config,
    })
  } catch (error) {
    console.error('Erro ao atualizar configuração do Footer:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}


