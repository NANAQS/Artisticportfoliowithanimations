import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// Função para calcular menções de uma skill baseado nos depoimentos
async function calculateSkillMentions(skillName: string): Promise<number> {
  const testimonials = await prisma.testimonial.findMany({
    where: {
      skillsHighlighted: {
        has: skillName
      }
    }
  })
  return testimonials.length
}

// Função para calcular nível baseado em menções
// Fórmula: min(100, mentions * 10) - cada menção adiciona 10% até máximo de 100%
function calculateSkillLevel(mentions: number): number {
  return Math.min(100, mentions * 10)
}

// Função para recalcular todas as skills baseado nos depoimentos
async function recalculateAllSkills() {
  try {
    // Buscar todas as skills
    const allSkills = await prisma.skill.findMany()
    
    // Para cada skill, recalcular menções e nível
    for (const skill of allSkills) {
      const mentions = await calculateSkillMentions(skill.name)
      const level = calculateSkillLevel(mentions)
      
      await prisma.skill.update({
        where: { id: skill.id },
        data: {
          mentions,
          level,
        }
      })
    }
  } catch (error) {
    console.error('Erro ao recalcular skills:', error)
  }
}

// Função para recalcular skills específicas
async function recalculateSkills(skillNames: string[]) {
  try {
    for (const skillName of skillNames) {
      const skill = await prisma.skill.findUnique({
        where: { name: skillName }
      })
      
      if (skill) {
        const mentions = await calculateSkillMentions(skillName)
        const level = calculateSkillLevel(mentions)
        
        await prisma.skill.update({
          where: { id: skill.id },
          data: {
            mentions,
            level,
          }
        })
      }
    }
  } catch (error) {
    console.error('Erro ao recalcular skills específicas:', error)
  }
}

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

      // Criar skills que não existem automaticamente
      for (const skillName of data.skillsHighlighted) {
        const existingSkill = await prisma.skill.findUnique({
          where: { name: skillName }
        })
        
        if (!existingSkill) {
          // Criar skill automaticamente com nível e menções iniciais
          await prisma.skill.create({
            data: {
              name: skillName,
              level: 0, // Será recalculado abaixo
              mentions: 0, // Será recalculado abaixo
            }
          })
        }
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
      
      // Recalcular menções e níveis das skills mencionadas
      await recalculateSkills(data.skillsHighlighted)
      
      return NextResponse.json({
        message: 'Testimonial criado com sucesso',
        data: newTestimonial,
      }, { status: 201 })
    }

    if (type === 'skills') {
      // Validar campos obrigatórios
      if (!data.name) {
        return NextResponse.json(
          { error: 'Campo obrigatório: name' },
          { status: 400 }
        )
      }

      // Verificar se skill já existe
      const existingSkill = await prisma.skill.findUnique({
        where: { name: data.name }
      })

      if (existingSkill) {
        return NextResponse.json(
          { error: 'Esta skill já existe' },
          { status: 400 }
        )
      }

      // Calcular menções e nível automaticamente
      // Se for uma nova skill criada no contexto de um depoimento, começa com 0
      // Caso contrário, calcula baseado nos depoimentos existentes
      let mentions = 0
      let level = 0

      // Se level e mentions foram fornecidos (criação manual), usar esses valores
      // Caso contrário, calcular automaticamente
      if (data.level !== undefined && data.mentions !== undefined) {
        // Validação se valores foram fornecidos
        if (data.level < 0 || data.level > 100) {
          return NextResponse.json(
            { error: 'Level deve ser entre 0 e 100' },
            { status: 400 }
          )
        }
        if (data.mentions < 0) {
          return NextResponse.json(
            { error: 'Mentions deve ser maior ou igual a 0' },
            { status: 400 }
          )
        }
        mentions = data.mentions
        level = data.level
      } else {
        // Calcular automaticamente baseado nos depoimentos
        mentions = await calculateSkillMentions(data.name)
        level = calculateSkillLevel(mentions)
      }

      const newSkill = await prisma.skill.create({
        data: {
          name: data.name,
          level,
          mentions,
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
      // Buscar testimonial antigo para comparar skills
      const oldTestimonial = await prisma.testimonial.findUnique({
        where: { id }
      })

      // Criar skills que não existem automaticamente (se skillsHighlighted foi fornecido)
      if (data.skillsHighlighted && Array.isArray(data.skillsHighlighted)) {
        for (const skillName of data.skillsHighlighted) {
          const existingSkill = await prisma.skill.findUnique({
            where: { name: skillName }
          })
          
          if (!existingSkill) {
            // Criar skill automaticamente
            await prisma.skill.create({
              data: {
                name: skillName,
                level: 0, // Será recalculado abaixo
                mentions: 0, // Será recalculado abaixo
              }
            })
          }
        }
      }

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

      // Recalcular skills afetadas (antigas e novas)
      if (data.skillsHighlighted && oldTestimonial) {
        const oldSkills = oldTestimonial.skillsHighlighted || []
        const newSkills = data.skillsHighlighted
        const allAffectedSkills = [...new Set([...oldSkills, ...newSkills])]
        await recalculateSkills(allAffectedSkills)
      } else if (data.skillsHighlighted) {
        await recalculateSkills(data.skillsHighlighted)
      }

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
      // Buscar testimonial antes de deletar para recalcular skills
      const testimonial = await prisma.testimonial.findUnique({
        where: { id: itemId }
      })

      await prisma.testimonial.delete({
        where: { id: itemId }
      })

      // Recalcular skills que estavam no depoimento deletado
      if (testimonial && testimonial.skillsHighlighted) {
        await recalculateSkills(testimonial.skillsHighlighted)
      }

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
