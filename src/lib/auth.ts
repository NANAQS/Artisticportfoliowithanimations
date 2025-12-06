import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'artistic-portfolio-secret-key-2024'

export interface JWTPayload {
  userId: number
  email: string
  name: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  
  if (!token) return null
  
  return verifyToken(token)
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return session !== null
}

export async function verifyAuth(request: Request): Promise<{ authenticated: boolean; user?: JWTPayload }> {
  const session = await getSession()
  
  if (!session) {
    return { authenticated: false }
  }
  
  return { authenticated: true, user: session }
}

