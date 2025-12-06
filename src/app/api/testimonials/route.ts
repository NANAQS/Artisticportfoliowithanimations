import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Buscar testimonials e skills
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const id = searchParams.get('id')

  try {
    // Buscar por ID específico
    if (id) {
      const itemId = parseInt(id)
      
      if (type === 'testimonials') {
        const testimonial = await prisma.testimonial.findUnique({
          where: { id: itemId }
        })
        return testimonial 
          ? NextResponse.json({ data: testimonial })
          : NextResponse.json({ error: 'Testimonial não encontrado' }, { status: 404 })
      }
      
      if (type === 'skills') {
        const skill = await prisma.skill.findUnique({
          where: { id: itemId }
        })
        return skill 
          ? NextResponse.json({ data: skill })
          : NextResponse.json({ error: 'Skill não encontrada' }, { status: 404 })
      }
    }

    // Buscar todos por tipo
    if (type === 'testimonials') {
      const testimonials = await prisma.testimonial.findMany({
        orderBy: { id: 'asc' }
      })
      return NextResponse.json({ data: testimonials })
    }

    if (type === 'skills') {
      const skills = await prisma.skill.findMany({
        orderBy: { id: 'asc' }
      })
      return NextResponse.json({ data: skills })
    }

    // Retorna todos os dados se nenhum tipo específico for solicitado
    const [testimonials, skills] = await Promise.all([
      prisma.testimonial.findMany({ orderBy: { id: 'asc' } }),
      prisma.skill.findMany({ orderBy: { id: 'asc' } }),
    ])

    return NextResponse.json({
      testimonials,
      skills,
    })
  } catch (error) {
    console.error('Erro ao buscar dados:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo testimonial ou skill (protegido)
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado. Faça login para continuar.' },
        { status: 401 }
      )
    }
    const body = await request.json()
    const { type, ...data } = body

    if (type === 'testimonials') {
      // Validar campos obrigatórios
      if (!data.name || !data.role || !data.image || !data.text || data.rating === undefined || !data.skillsHighlighted) {
        return NextResponse.json(
          { error: 'Campos obrigatórios: name, role, image, text, rating, skillsHighlighted' },
          { status: 400 }
        )
      }

      // Validar rating
      if (data.rating < 1 || data.rating > 5) {
        return NextResponse.json(
          { error: 'Rating deve ser entre 1 e 5' },
          { status: 400 }
        )
      }

      // Validar skillsHighlighted é array
      if (!Array.isArray(data.skillsHighlighted)) {
        return NextResponse.json(
          { error: 'skillsHighlighted deve ser um array de strings' },
          { status: 400 }
        )
      }

      const newTestimonial = await prisma.testimonial.create({
        data: {
          name: data.name,
          role: data.role,
          image: data.image,
          text: data.text,
          rating: data.rating,
          skillsHighlighted: data.skillsHighlighted,
        }
      })
      
      return NextResponse.json({
        message: 'Testimonial criado com sucesso',
        data: newTestimonial,
      }, { status: 201 })
    }

    if (type === 'skills') {
      // Validar campos obrigatórios
      if (!data.name || data.level === undefined || data.mentions === undefined) {
        return NextResponse.json(
          { error: 'Campos obrigatórios: name, level, mentions' },
          { status: 400 }
        )
      }

      // Validar level
      if (data.level < 0 || data.level > 100) {
        return NextResponse.json(
          { error: 'Level deve ser entre 0 e 100' },
          { status: 400 }
        )
      }

      // Validar mentions
      if (data.mentions < 0) {
        return NextResponse.json(
          { error: 'Mentions deve ser maior ou igual a 0' },
          { status: 400 }
        )
      }

      const newSkill = await prisma.skill.create({
        data: {
          name: data.name,
          level: data.level,
          mentions: data.mentions,
        }
      })
      
      return NextResponse.json({
        message: 'Skill criada com sucesso',
        data: newSkill,
      }, { status: 201 })
    }

    return NextResponse.json(
      { error: 'Tipo inválido. Use: testimonials ou skills' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Erro ao criar item:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar testimonial ou skill (protegido)
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
    const { type, id, ...data } = body

    if (!type || !id) {
      return NextResponse.json(
        { error: 'Campos type e id são obrigatórios' },
        { status: 400 }
      )
    }

    if (type === 'testimonials') {
      const updatedTestimonial = await prisma.testimonial.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.role && { role: data.role }),
          ...(data.image && { image: data.image }),
          ...(data.text && { text: data.text }),
          ...(data.rating !== undefined && { rating: data.rating }),
          ...(data.skillsHighlighted && { skillsHighlighted: data.skillsHighlighted }),
        }
      })
      return NextResponse.json({
        message: 'Testimonial atualizado com sucesso',
        data: updatedTestimonial,
      })
    }

    if (type === 'skills') {
      const updatedSkill = await prisma.skill.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.level !== undefined && { level: data.level }),
          ...(data.mentions !== undefined && { mentions: data.mentions }),
        }
      })
      return NextResponse.json({
        message: 'Skill atualizada com sucesso',
        data: updatedSkill,
      })
    }

    return NextResponse.json(
      { error: 'Tipo inválido' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Erro ao atualizar item:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar testimonial ou skill (protegido)
export async function DELETE(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado. Faça login para continuar.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    if (!type || !id) {
      return NextResponse.json(
        { error: 'Parâmetros type e id são obrigatórios' },
        { status: 400 }
      )
    }

    const itemId = parseInt(id)

    if (type === 'testimonials') {
      await prisma.testimonial.delete({
        where: { id: itemId }
      })
      return NextResponse.json({ message: 'Testimonial deletado com sucesso' })
    }

    if (type === 'skills') {
      await prisma.skill.delete({
        where: { id: itemId }
      })
      return NextResponse.json({ message: 'Skill deletada com sucesso' })
    }

    return NextResponse.json(
      { error: 'Tipo inválido' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Erro ao deletar item:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
