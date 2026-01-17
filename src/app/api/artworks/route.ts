import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

async function resolveCategoryConnect(data: { categoryId?: number; category?: string }) {
  const categoryId = Number(data.categoryId)
  if (Number.isFinite(categoryId) && categoryId > 0) {
    return { category: { connect: { id: categoryId } } }
  }
  if (data.category) {
    const name = String(data.category).trim()
    if (!name) return null
    return {
      category: {
        connectOrCreate: {
          where: { name },
          create: { name },
        },
      },
    }
  }
  return null
}

function mapArtworkCategory<T extends { categoryId: number }>(
  artwork: T & { category?: { id: number; name: string } | null }
) {
  const { category, ...rest } = artwork
  return {
    ...rest,
    categoryId: artwork.categoryId,
    category: category?.name || '',
  }
}

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
          where: { id: artworkId },
          include: { category: true },
        })
        return artwork 
          ? NextResponse.json({ data: mapArtworkCategory(artwork) })
          : NextResponse.json({ error: 'Artwork não encontrado' }, { status: 404 })
      }
      
      if (type === 'carousel') {
        const artwork = await prisma.carouselArtwork.findUnique({
          where: { id: artworkId },
          include: { category: true },
        })
        return artwork 
          ? NextResponse.json({ data: mapArtworkCategory(artwork) })
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
        orderBy: { order: 'asc' },
        include: { category: true },
      })
      return NextResponse.json({ data: artworks.map(mapArtworkCategory) })
    }

    if (type === 'carousel') {
      const artworks = await prisma.carouselArtwork.findMany({
        orderBy: { id: 'asc' },
        include: { category: true },
      })
      return NextResponse.json({ data: artworks.map(mapArtworkCategory) })
    }

    if (type === 'scroll') {
      const content = await prisma.scrollContent.findMany({
        orderBy: { id: 'asc' }
      })
      return NextResponse.json({ data: content })
    }

    // Retorna todos os dados se nenhum tipo específico for solicitado
    const [gallery, carousel, scroll] = await Promise.all([
      prisma.galleryArtwork.findMany({ orderBy: { order: 'asc' }, include: { category: true } }),
      prisma.carouselArtwork.findMany({ orderBy: { id: 'asc' }, include: { category: true } }),
      prisma.scrollContent.findMany({ orderBy: { id: 'asc' } }),
    ])

    return NextResponse.json({
      gallery: gallery.map(mapArtworkCategory),
      carousel: carousel.map(mapArtworkCategory),
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
      if (!data.title || (!data.category && !data.categoryId) || !data.image || !data.description) {
        return NextResponse.json(
          { error: 'Campos obrigatórios: title, category/categoryId, image, description' },
          { status: 400 }
        )
      }

      const categoryConnect = await resolveCategoryConnect(data)
      if (!categoryConnect) {
        return NextResponse.json(
          { error: 'Categoria inválida' },
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
          image: data.image,
          description: data.description,
          gridClass: data.gridClass || 'md:col-span-1 md:row-span-1',
          order: newOrder,
          youtubeUrl: data.youtubeUrl || null,
          ...categoryConnect,
        },
        include: { category: true },
      })
      
      return NextResponse.json({
        message: 'Gallery artwork criado com sucesso',
        data: mapArtworkCategory(newArtwork),
      }, { status: 201 })
    }

    if (type === 'carousel') {
      if (!data.title || (!data.category && !data.categoryId) || !data.url || !data.year) {
        return NextResponse.json(
          { error: 'Campos obrigatórios: title, category/categoryId, url, year' },
          { status: 400 }
        )
      }

      const categoryConnect = await resolveCategoryConnect(data)
      if (!categoryConnect) {
        return NextResponse.json(
          { error: 'Categoria inválida' },
          { status: 400 }
        )
      }

      const newCarouselArtwork = await prisma.carouselArtwork.create({
        data: {
          url: data.url,
          title: data.title,
          year: data.year,
          ...categoryConnect,
        },
        include: { category: true },
      })
      
      return NextResponse.json({
        message: 'Carousel artwork criado com sucesso',
        data: mapArtworkCategory(newCarouselArtwork),
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
      const categoryConnect = await resolveCategoryConnect(data)
      const updatedArtwork = await prisma.galleryArtwork.update({
        where: { id },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.image && { image: data.image }),
          ...(data.description && { description: data.description }),
          ...(data.gridClass && { gridClass: data.gridClass }),
          ...(data.order !== undefined && { order: data.order }),
          ...(data.youtubeUrl !== undefined && { youtubeUrl: data.youtubeUrl || null }),
          ...(categoryConnect || {}),
        },
        include: { category: true },
      })
      return NextResponse.json({
        message: 'Gallery artwork atualizado com sucesso',
        data: mapArtworkCategory(updatedArtwork),
      })
    }

    if (type === 'carousel') {
      const categoryConnect = await resolveCategoryConnect(data)
      const updatedArtwork = await prisma.carouselArtwork.update({
        where: { id },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.url && { url: data.url }),
          ...(data.year && { year: data.year }),
          ...(categoryConnect || {}),
        },
        include: { category: true },
      })
      return NextResponse.json({
        message: 'Carousel artwork atualizado com sucesso',
        data: mapArtworkCategory(updatedArtwork),
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
