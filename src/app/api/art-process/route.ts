import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Buscar configuração do Art Process
export async function GET() {
  try {
    let config = await prisma.artProcessConfig.findFirst()

    // Se não existir, retornar valores padrão
    if (!config) {
      return NextResponse.json({
        subtitle: 'My Process',
        title: 'From Idea to Artwork',
        description: 'Every piece I create follows a thoughtful journey from initial concept to final masterpiece',
        steps: [
          {
            icon: 'Lightbulb',
            title: 'Concept',
            description: 'Every piece starts with inspiration and careful planning',
          },
          {
            icon: 'Pencil',
            title: 'Sketch',
            description: 'Rough sketches bring ideas to life on the canvas',
          },
          {
            icon: 'Palette',
            title: 'Color',
            description: 'Adding vibrant colors and depth to create mood',
          },
          {
            icon: 'Sparkles',
            title: 'Final Touch',
            description: 'Refining details and adding the finishing touches',
          },
        ],
        ctaText: 'Start Your Commission',
      })
    }

    return NextResponse.json({
      id: config.id,
      subtitle: config.subtitle,
      title: config.title,
      description: config.description,
      steps: config.steps as Array<{ icon: string; title: string; description: string }>,
      ctaText: config.ctaText,
    })
  } catch (error) {
    console.error('Erro ao buscar configuração do Art Process:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar configuração do Art Process (protegido)
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
    const { subtitle, title, description, steps, ctaText } = body

    // Validar campos obrigatórios
    if (!subtitle || !title || !description || !steps || !ctaText) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se já existe configuração
    const existing = await prisma.artProcessConfig.findFirst()

    let config
    if (existing) {
      config = await prisma.artProcessConfig.update({
        where: { id: existing.id },
        data: {
          subtitle,
          title,
          description,
          steps,
          ctaText,
        },
      })
    } else {
      config = await prisma.artProcessConfig.create({
        data: {
          subtitle,
          title,
          description,
          steps,
          ctaText,
        },
      })
    }

    return NextResponse.json({
      message: 'Configuração do Art Process atualizada com sucesso',
      data: config,
    })
  } catch (error) {
    console.error('Erro ao atualizar configuração do Art Process:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}


