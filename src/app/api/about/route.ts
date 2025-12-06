import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

// GET - Buscar configurações do About
export async function GET() {
  try {
    if (!prisma) {
      console.error('Prisma Client não está inicializado')
      return NextResponse.json({
        about: {
          id: 0,
          title: 'Passion for Visual Storytelling',
          subtitle: 'About Me',
          description: "I'm a professional 2D artist and illustrator with over 5 years of experience creating captivating artwork across various styles and mediums. From character design to landscapes, my work brings stories and emotions to life through color, composition, and creativity.",
          paragraph2: 'Every piece I create is a journey of imagination and technique. I specialize in digital illustration, concept art, and character design, working with clients worldwide to transform their visions into stunning visual narratives.',
          image: 'https://images.unsplash.com/photo-1610206349499-c932c3b3aacb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHdvcmtzcGFjZSUyMHN0dWRpb3xlbnwxfHx8fDE3NjE2NzkyMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
          skills: [
            { icon: 'Palette', title: 'Digital Illustration', description: 'Creating vibrant digital artwork with depth and emotion' },
            { icon: 'Code', title: 'Character Design', description: 'Bringing unique characters to life with personality and detail' },
            { icon: 'Sparkles', title: 'Concept Art', description: 'Developing visual concepts for games, films, and stories' }
          ]
        }
      })
    }

    let aboutConfig
    try {
      aboutConfig = await prisma.aboutConfig.findFirst()
    } catch (prismaError: any) {
      console.error('Erro ao acessar aboutConfig:', prismaError)
      return NextResponse.json({
        about: {
          id: 0,
          title: 'Passion for Visual Storytelling',
          subtitle: 'About Me',
          description: "I'm a professional 2D artist and illustrator with over 5 years of experience creating captivating artwork across various styles and mediums. From character design to landscapes, my work brings stories and emotions to life through color, composition, and creativity.",
          paragraph2: 'Every piece I create is a journey of imagination and technique. I specialize in digital illustration, concept art, and character design, working with clients worldwide to transform their visions into stunning visual narratives.',
          image: 'https://images.unsplash.com/photo-1610206349499-c932c3b3aacb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHdvcmtzcGFjZSUyMHN0dWRpb3xlbnwxfHx8fDE3NjE2NzkyMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
          skills: [
            { icon: 'Palette', title: 'Digital Illustration', description: 'Creating vibrant digital artwork with depth and emotion' },
            { icon: 'Code', title: 'Character Design', description: 'Bringing unique characters to life with personality and detail' },
            { icon: 'Sparkles', title: 'Concept Art', description: 'Developing visual concepts for games, films, and stories' }
          ]
        }
      })
    }

    // Se não existir, criar uma configuração padrão
    if (!aboutConfig) {
      try {
        aboutConfig = await prisma.aboutConfig.create({
          data: {
            title: 'Passion for Visual Storytelling',
            subtitle: 'About Me',
            description: "I'm a professional 2D artist and illustrator with over 5 years of experience creating captivating artwork across various styles and mediums. From character design to landscapes, my work brings stories and emotions to life through color, composition, and creativity.",
            paragraph2: 'Every piece I create is a journey of imagination and technique. I specialize in digital illustration, concept art, and character design, working with clients worldwide to transform their visions into stunning visual narratives.',
            image: 'https://images.unsplash.com/photo-1610206349499-c932c3b3aacb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHdvcmtzcGFjZSUyMHN0dWRpb3xlbnwxfHx8fDE3NjE2NzkyMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
            skills: [
              { icon: 'Palette', title: 'Digital Illustration', description: 'Creating vibrant digital artwork with depth and emotion' },
              { icon: 'Code', title: 'Character Design', description: 'Bringing unique characters to life with personality and detail' },
              { icon: 'Sparkles', title: 'Concept Art', description: 'Developing visual concepts for games, films, and stories' }
            ]
          }
        })
      } catch (createError) {
        console.error('Erro ao criar configuração padrão:', createError)
        return NextResponse.json({
          about: {
            id: 0,
            title: 'Passion for Visual Storytelling',
            subtitle: 'About Me',
            description: "I'm a professional 2D artist and illustrator with over 5 years of experience creating captivating artwork across various styles and mediums. From character design to landscapes, my work brings stories and emotions to life through color, composition, and creativity.",
            paragraph2: 'Every piece I create is a journey of imagination and technique. I specialize in digital illustration, concept art, and character design, working with clients worldwide to transform their visions into stunning visual narratives.',
            image: 'https://images.unsplash.com/photo-1610206349499-c932c3b3aacb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHdvcmtzcGFjZSUyMHN0dWRpb3xlbnwxfHx8fDE3NjE2NzkyMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
            skills: [
              { icon: 'Palette', title: 'Digital Illustration', description: 'Creating vibrant digital artwork with depth and emotion' },
              { icon: 'Code', title: 'Character Design', description: 'Bringing unique characters to life with personality and detail' },
              { icon: 'Sparkles', title: 'Concept Art', description: 'Developing visual concepts for games, films, and stories' }
            ]
          }
        })
      }
    }

    return NextResponse.json({ about: aboutConfig })
  } catch (error) {
    console.error('Erro ao buscar configurações do About:', error)
    return NextResponse.json({
      about: {
        id: 0,
        title: 'Passion for Visual Storytelling',
        subtitle: 'About Me',
        description: "I'm a professional 2D artist and illustrator with over 5 years of experience creating captivating artwork across various styles and mediums. From character design to landscapes, my work brings stories and emotions to life through color, composition, and creativity.",
        paragraph2: 'Every piece I create is a journey of imagination and technique. I specialize in digital illustration, concept art, and character design, working with clients worldwide to transform their visions into stunning visual narratives.',
        image: 'https://images.unsplash.com/photo-1610206349499-c932c3b3aacb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHdvcmtzcGFjZSUyMHN0dWRpb3xlbnwxfHx8fDE3NjE2NzkyMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
        skills: [
          { icon: 'Palette', title: 'Digital Illustration', description: 'Creating vibrant digital artwork with depth and emotion' },
          { icon: 'Code', title: 'Character Design', description: 'Bringing unique characters to life with personality and detail' },
          { icon: 'Sparkles', title: 'Concept Art', description: 'Developing visual concepts for games, films, and stories' }
        ]
      }
    })
  }
}

// PUT - Atualizar configurações do About
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
    const { title, subtitle, description, paragraph2, image, skills } = body

    let aboutConfig
    try {
      aboutConfig = await prisma.aboutConfig.findFirst()
    } catch (prismaError: any) {
      console.error('Erro ao acessar aboutConfig:', prismaError)
      return NextResponse.json(
        { error: 'Erro ao acessar banco de dados', details: prismaError?.message || 'Erro desconhecido' },
        { status: 500 }
      )
    }

    if (aboutConfig) {
      aboutConfig = await prisma.aboutConfig.update({
        where: { id: aboutConfig.id },
        data: {
          title: title || aboutConfig.title,
          subtitle: subtitle || aboutConfig.subtitle,
          description: description || aboutConfig.description,
          paragraph2: paragraph2 ?? aboutConfig.paragraph2,
          image: image || aboutConfig.image,
          skills: skills || aboutConfig.skills,
        }
      })
    } else {
      aboutConfig = await prisma.aboutConfig.create({
        data: {
          title: title || 'Passion for Visual Storytelling',
          subtitle: subtitle || 'About Me',
          description: description || '',
          paragraph2: paragraph2 || null,
          image: image || '',
          skills: skills || [],
        }
      })
    }

    return NextResponse.json({ about: aboutConfig })
  } catch (error) {
    console.error('Erro ao atualizar configurações do About:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}

