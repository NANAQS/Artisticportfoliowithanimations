import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'
import { cookies, headers } from 'next/headers'

export async function POST(request: Request) {
  let loginSuccess = false
  let userId: number | null = null
  let loginEmail = ''

  try {
    const { email, password } = await request.json()
    loginEmail = email || ''

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Registrar tentativa de login falhada
      await registerLoginAttempt(loginEmail, false)
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    userId = user.id

    const isValid = await verifyPassword(password, user.password)

    if (!isValid) {
      // Registrar tentativa de login falhada
      await registerLoginAttempt(loginEmail, false, userId)
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    loginSuccess = true

    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    })

    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 dias
    })

    // Registrar login bem-sucedido
    await registerLoginAttempt(loginEmail, true, userId)

    return NextResponse.json({
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Erro no login:', error)
    // Registrar tentativa de login falhada em caso de erro
    if (!loginSuccess) {
      await registerLoginAttempt(loginEmail, false, userId)
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function registerLoginAttempt(email: string, success: boolean, userId: number | null = null) {
  try {
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 
               headersList.get('x-real-ip') || 
               'unknown'
    const userAgent = headersList.get('user-agent') || null

    await prisma.loginHistory.create({
      data: {
        userId: userId || 0,
        email,
        ip,
        userAgent,
        success,
      }
    })
  } catch (error) {
    // Não quebrar o fluxo de login se houver erro ao registrar histórico
    console.error('Erro ao registrar histórico de login:', error)
  }
}

