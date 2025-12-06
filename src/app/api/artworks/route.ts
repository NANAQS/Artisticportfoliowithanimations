import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Buscar artworks (público)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const id = searchParams.get('id')

  try {
    // Buscar por ID específico
    if (id) {
      const artworkId = parseInt(id)
      
      if (type === 'gallery') {
        const artwork = await prisma.galleryArtwork.findUnique({
          where: { id: artworkId }
        })
        return artwork 
          ? NextResponse.json({ data: artwork })
          : NextResponse.json({ error: 'Artwork não encontrado' }, { status: 404 })
      }
      
      if (type === 'carousel') {
        const artwork = await prisma.carouselArtwork.findUnique({
          where: { id: artworkId }
        })
        return artwork 
          ? NextResponse.json({ data: artwork })
          : NextResponse.json({ error: 'Artwork não encontrado' }, { status: 404 })
      }
      
      if (type === 'scroll') {
        const content = await prisma.scrollContent.findUnique({
          where: { id: artworkId }
        })
        return content 
          ? NextResponse.json({ data: content })
          : NextResponse.json({ error: 'Content não encontrado' }, { status: 404 })
      }
    }

    // Buscar todos por tipo
    if (type === 'gallery') {
      const artworks = await prisma.galleryArtwork.findMany({
        orderBy: { order: 'asc' }
      })
      return NextResponse.json({ data: artworks })
    }

    if (type === 'carousel') {
      const artworks = await prisma.carouselArtwork.findMany({
        orderBy: { id: 'asc' }
      })
      return NextResponse.json({ data: artworks })
    }

    if (type === 'scroll') {
      const content = await prisma.scrollContent.findMany({
        orderBy: { id: 'asc' }
      })
      return NextResponse.json({ data: content })
    }

    // Retorna todos os dados se nenhum tipo específico for solicitado
    const [gallery, carousel, scroll] = await Promise.all([
      prisma.galleryArtwork.findMany({ orderBy: { order: 'asc' } }),
      prisma.carouselArtwork.findMany({ orderBy: { id: 'asc' } }),
      prisma.scrollContent.findMany({ orderBy: { id: 'asc' } }),
    ])

    return NextResponse.json({
      gallery,
      carousel,
      scroll,
    })
  } catch (error) {
    console.error('Erro ao buscar artworks:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo artwork (protegido)
export async function POST(request: Request) {
  try {
    // Verificar autenticação
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado. Faça login para continuar.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, ...data } = body

    if (type === 'gallery') {
      if (!data.title || !data.category || !data.image || !data.description) {
        return NextResponse.json(
          { error: 'Campos obrigatórios: title, category, image, description' },
          { status: 400 }
        )
      }

      // Buscar o maior order atual para adicionar o novo item no final
      const maxOrder = await prisma.galleryArtwork.aggregate({
        _max: { order: true }
      })
      const newOrder = (maxOrder._max.order ?? -1) + 1

      const newArtwork = await prisma.galleryArtwork.create({
        data: {
          title: data.title,
          category: data.category,
          image: data.image,
          description: data.description,
          gridClass: data.gridClass || 'md:col-span-1 md:row-span-1',
          order: newOrder,
          youtubeUrl: data.youtubeUrl || null,
        }
      })
      
      return NextResponse.json({
        message: 'Gallery artwork criado com sucesso',
        data: newArtwork,
      }, { status: 201 })
    }

    if (type === 'carousel') {
      if (!data.title || !data.category || !data.url || !data.year) {
        return NextResponse.json(
          { error: 'Campos obrigatórios: title, category, url, year' },
          { status: 400 }
        )
      }

      const newCarouselArtwork = await prisma.carouselArtwork.create({
        data: {
          url: data.url,
          title: data.title,
          category: data.category,
          year: data.year,
        }
      })
      
      return NextResponse.json({
        message: 'Carousel artwork criado com sucesso',
        data: newCarouselArtwork,
      }, { status: 201 })
    }

    if (type === 'scroll') {
      if (!data.title || !data.image || !data.description) {
        return NextResponse.json(
          { error: 'Campos obrigatórios: title, image, description' },
          { status: 400 }
        )
      }

      const newScrollContent = await prisma.scrollContent.create({
        data: {
          image: data.image,
          title: data.title,
          description: data.description,
        }
      })
      
      return NextResponse.json({
        message: 'Scroll content criado com sucesso',
        data: newScrollContent,
      }, { status: 201 })
    }

    return NextResponse.json(
      { error: 'Tipo inválido. Use: gallery, carousel ou scroll' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Erro ao criar artwork:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar artwork (protegido)
export async function DELETE(request: Request) {
  try {
    // Verificar autenticação
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

    const artworkId = parseInt(id)

    if (type === 'gallery') {
      await prisma.galleryArtwork.delete({
        where: { id: artworkId }
      })
      return NextResponse.json({ message: 'Gallery artwork deletado com sucesso' })
    }

    if (type === 'carousel') {
      await prisma.carouselArtwork.delete({
        where: { id: artworkId }
      })
      return NextResponse.json({ message: 'Carousel artwork deletado com sucesso' })
    }

    if (type === 'scroll') {
      await prisma.scrollContent.delete({
        where: { id: artworkId }
      })
      return NextResponse.json({ message: 'Scroll content deletado com sucesso' })
    }

    return NextResponse.json(
      { error: 'Tipo inválido' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Erro ao deletar artwork:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar artwork (protegido)
export async function PUT(request: Request) {
  try {
    // Verificar autenticação
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

    if (type === 'gallery') {
      const updatedArtwork = await prisma.galleryArtwork.update({
        where: { id },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.category && { category: data.category }),
          ...(data.image && { image: data.image }),
          ...(data.description && { description: data.description }),
          ...(data.gridClass && { gridClass: data.gridClass }),
          ...(data.order !== undefined && { order: data.order }),
          ...(data.youtubeUrl !== undefined && { youtubeUrl: data.youtubeUrl || null }),
        }
      })
      return NextResponse.json({
        message: 'Gallery artwork atualizado com sucesso',
        data: updatedArtwork,
      })
    }

    if (type === 'carousel') {
      const updatedArtwork = await prisma.carouselArtwork.update({
        where: { id },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.category && { category: data.category }),
          ...(data.url && { url: data.url }),
          ...(data.year && { year: data.year }),
        }
      })
      return NextResponse.json({
        message: 'Carousel artwork atualizado com sucesso',
        data: updatedArtwork,
      })
    }

    if (type === 'scroll') {
      const updatedContent = await prisma.scrollContent.update({
        where: { id },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.image && { image: data.image }),
          ...(data.description && { description: data.description }),
        }
      })
      return NextResponse.json({
        message: 'Scroll content atualizado com sucesso',
        data: updatedContent,
      })
    }

    return NextResponse.json(
      { error: 'Tipo inválido' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Erro ao atualizar artwork:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PATCH - Atualizar ordem de múltiplos artworks (protegido)
export async function PATCH(request: Request) {
  try {
    // Verificar autenticação
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado. Faça login para continuar.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, items } = body

    if (!type || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Campos type e items (array) são obrigatórios' },
        { status: 400 }
      )
    }

    if (type === 'gallery') {
      // Atualizar a ordem de todos os itens de uma vez
      await Promise.all(
        items.map((item: { id: number, order: number }) =>
          prisma.galleryArtwork.update({
            where: { id: item.id },
            data: { order: item.order }
          })
        )
      )
      
      return NextResponse.json({
        message: 'Ordem atualizada com sucesso',
      })
    }

    return NextResponse.json(
      { error: 'Tipo inválido' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Erro ao atualizar ordem:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
