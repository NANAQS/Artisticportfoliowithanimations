import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

// POST - Registrar nova visita
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const headersList = await headers()
    
    // Obter IP do cliente
    const forwarded = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const ip = forwarded?.split(',')[0] || realIp || 'unknown'

    // Obter user agent
    const userAgent = headersList.get('user-agent') || null

    // Criar visita
    const visit = await prisma.visit.create({
      data: {
        ip,
        userAgent,
        path: body.path || '/',
        country: body.country || null,
        region: body.region || null,
        city: body.city || null,
        latitude: body.latitude || null,
        longitude: body.longitude || null,
        timezone: body.timezone || null,
        referer: body.referer || null,
      }
    })

    return NextResponse.json({ success: true, visit }, { status: 201 })
  } catch (error) {
    console.error('Erro ao registrar visita:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET - Buscar dados de analytics
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7d' // 7d, 30d, 1y, all

    // Calcular data inicial baseado no período
    let startDate = new Date()
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
      case 'all':
        startDate = new Date(0) // Desde o início
        break
    }

    // Buscar visitas no período
    const visits = await prisma.visit.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Estatísticas gerais
    const totalVisits = visits.length
    const uniqueIPs = new Set(visits.map(v => v.ip)).size
    const countries = visits.filter(v => v.country).map(v => v.country!)
    const uniqueCountries = new Set(countries).size

    // Visitas por país
    const visitsByCountry: Record<string, number> = {}
    countries.forEach(country => {
      visitsByCountry[country] = (visitsByCountry[country] || 0) + 1
    })

    // Visitas por dia
    const visitsByDay: Record<string, number> = {}
    visits.forEach(visit => {
      const date = visit.createdAt.toISOString().split('T')[0]
      visitsByDay[date] = (visitsByDay[date] || 0) + 1
    })

    // Visitas por página
    const visitsByPath: Record<string, number> = {}
    visits.forEach(visit => {
      visitsByPath[visit.path] = (visitsByPath[visit.path] || 0) + 1
    })

    // Top países
    const topCountries = Object.entries(visitsByCountry)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([country, count]) => ({ country, count }))

    // Gráfico de linha (visitas por dia)
    const dailyVisits = Object.entries(visitsByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, visits: count }))

    // Top páginas
    const topPages = Object.entries(visitsByPath)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }))

    return NextResponse.json({
      totalVisits,
      uniqueIPs,
      uniqueCountries,
      topCountries,
      dailyVisits,
      topPages,
      period
    })
  } catch (error) {
    console.error('Erro ao buscar analytics:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

