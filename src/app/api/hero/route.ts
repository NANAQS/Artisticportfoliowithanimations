import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Buscar configuração do Hero
export async function GET() {
  try {
    let config = await prisma.heroConfig.findFirst()

    // Se não existir, retornar valores padrão
    if (!config) {
      return NextResponse.json({
        subtitle: '2D Artist & Illustrator',
        title: 'Bringing Stories to Life',
        titleHighlight: 'Through Art',
        description: 'Creating vibrant illustrations, character designs, and digital paintings that capture emotion and imagination',
        stats: [
          { number: '500+', label: 'Artworks' },
          { number: '200+', label: 'Happy Clients' },
          { number: '5+', label: 'Years' },
        ],
        button1Text: 'View Gallery',
        button2Text: 'Commission Work',
      })
    }

    return NextResponse.json({
      id: config.id,
      subtitle: config.subtitle,
      title: config.title,
      titleHighlight: config.titleHighlight,
      description: config.description,
      stats: config.stats as Array<{ number: string; label: string }>,
      button1Text: config.button1Text,
      button2Text: config.button2Text,
    })
  } catch (error) {
    console.error('Erro ao buscar configuração do Hero:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar configuração do Hero (protegido)
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
    const { subtitle, title, titleHighlight, description, stats, button1Text, button2Text } = body

    // Validar campos obrigatórios
    if (!subtitle || !title || !titleHighlight || !description || !stats || !button1Text || !button2Text) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se já existe configuração
    const existing = await prisma.heroConfig.findFirst()

    let config
    if (existing) {
      config = await prisma.heroConfig.update({
        where: { id: existing.id },
        data: {
          subtitle,
          title,
          titleHighlight,
          description,
          stats,
          button1Text,
          button2Text,
        },
      })
    } else {
      config = await prisma.heroConfig.create({
        data: {
          subtitle,
          title,
          titleHighlight,
          description,
          stats,
          button1Text,
          button2Text,
        },
      })
    }

    return NextResponse.json({
      message: 'Configuração do Hero atualizada com sucesso',
      data: config,
    })
  } catch (error) {
    console.error('Erro ao atualizar configuração do Hero:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}


