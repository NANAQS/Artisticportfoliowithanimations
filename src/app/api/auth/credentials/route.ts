import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { hashPassword, verifyPassword } from '@/lib/auth'

// GET - Buscar credenciais do usuário atual
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Erro ao buscar credenciais:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar credenciais
export async function PUT(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { currentPassword, newEmail, newPassword, newName } = body

    const user = await prisma.user.findUnique({
      where: { id: session.userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar senha atual se estiver alterando senha ou email
    if ((newPassword || newEmail) && currentPassword) {
      const isValid = await verifyPassword(currentPassword, user.password)
      if (!isValid) {
        return NextResponse.json(
          { error: 'Senha atual incorreta' },
          { status: 401 }
        )
      }
    }

    // Verificar se o novo email já existe (se estiver mudando)
    if (newEmail && newEmail !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: newEmail }
      })
      if (existingUser) {
        return NextResponse.json(
          { error: 'Este email já está em uso' },
          { status: 400 }
        )
      }
    }

    // Preparar dados para atualização
    const updateData: any = {}
    if (newName) updateData.name = newName
    if (newEmail) updateData.email = newEmail
    if (newPassword) updateData.password = await hashPassword(newPassword)

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      }
    })

    return NextResponse.json({
      message: 'Credenciais atualizadas com sucesso',
      user: updatedUser
    })
  } catch (error) {
    console.error('Erro ao atualizar credenciais:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}





