import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Listar todos os anúncios
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'

    const where = activeOnly ? { isActive: true } : {}

    const banners = await prisma.adBanner.findMany({
      where,
      orderBy: [
        { targetElement: 'asc' },
        { position: 'asc' },
        { order: 'asc' },
      ],
    })

    return NextResponse.json({ banners })
  } catch (error) {
    console.error('Error fetching ad banners:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ad banners' },
      { status: 500 }
    )
  }
}

// POST - Criar novo anúncio
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { imageUrl, href, position, targetElement, order, isActive } = body

    if (!imageUrl || !position || !targetElement) {
      return NextResponse.json(
        { error: 'Missing required fields: imageUrl, position, targetElement' },
        { status: 400 }
      )
    }

    const banner = await prisma.adBanner.create({
      data: {
        imageUrl,
        href: href || null,
        position,
        targetElement,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json({ banner }, { status: 201 })
  } catch (error) {
    console.error('Error creating ad banner:', error)
    return NextResponse.json(
      { error: 'Failed to create ad banner' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar anúncio
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, imageUrl, href, position, targetElement, order, isActive } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const updateData: any = {}
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl
    if (href !== undefined) updateData.href = href
    if (position !== undefined) updateData.position = position
    if (targetElement !== undefined) updateData.targetElement = targetElement
    if (order !== undefined) updateData.order = order
    if (isActive !== undefined) updateData.isActive = isActive

    const banner = await prisma.adBanner.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ banner })
  } catch (error) {
    console.error('Error updating ad banner:', error)
    return NextResponse.json(
      { error: 'Failed to update ad banner' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar anúncio
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    await prisma.adBanner.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting ad banner:', error)
    return NextResponse.json(
      { error: 'Failed to delete ad banner' },
      { status: 500 }
    )
  }
}

