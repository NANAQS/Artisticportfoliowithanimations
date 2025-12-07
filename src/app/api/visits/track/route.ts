import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import axios from 'axios'
import { prisma } from '@/lib/prisma'

// Rota para rastrear visita e obter geolocalização
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const headersList = await headers()
    
    // Obter IP do cliente
    const forwarded = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const ip = forwarded?.split(',')[0] || realIp || body.ip || 'unknown'

    // Obter user agent
    const userAgent = headersList.get('user-agent') || null

    // Tentar obter geolocalização por IP usando ipapi.co (gratuito)
    let geoData = {
      country: null as string | null,
      region: null as string | null,
      city: null as string | null,
      latitude: null as number | null,
      longitude: null as number | null,
      timezone: null as string | null,
    }

    // Só tentar geolocalização se não for localhost
    if (ip && ip !== 'unknown' && !ip.startsWith('127.') && !ip.startsWith('::1') && ip !== 'localhost') {
      try {
        // Usar ipapi.co para geolocalização (1000 requisições/dia grátis)
        const response = await axios.get(`https://ipapi.co/${ip}/json/`, {
          timeout: 5000
        })

        if (response.data && !response.data.error) {
          geoData = {
            country: response.data.country_name || null,
            region: response.data.region || null,
            city: response.data.city || null,
            latitude: response.data.latitude || null,
            longitude: response.data.longitude || null,
            timezone: response.data.timezone || null,
          }
        }
      } catch (geoError) {
        // Continuar sem geolocalização
        console.log('Erro ao obter geolocalização (não crítico):', geoError)
      }
    }

    // Registrar visita no banco diretamente
    try {
      const visit = await prisma.visit.create({
        data: {
          ip,
          userAgent,
          path: body.path || '/',
          referer: body.referer || null,
          country: geoData.country,
          region: geoData.region,
          city: geoData.city,
          latitude: geoData.latitude,
          longitude: geoData.longitude,
          timezone: geoData.timezone,
        }
      })
    } catch (dbError: any) {
      // Se o erro for relacionado à inicialização do Prisma, logar mas continuar
      if (dbError?.message?.includes('Prisma Client') || dbError?.message?.includes('DATABASE_URL')) {
        console.error('⚠️  Erro de banco de dados (variável de ambiente não configurada):', dbError.message)
      } else {
        console.error('Erro ao salvar visita no banco:', dbError)
      }
      // Continuar mesmo com erro - não quebrar a experiência do usuário
    }

    return NextResponse.json({ 
      success: true,
      ip,
      geoData 
    })
  } catch (error: any) {
    console.error('Erro ao rastrear visita:', error?.message || error)
    // Retornar sucesso mesmo com erro para não quebrar a experiência do usuário
    return NextResponse.json({ 
      success: true,
      error: 'Erro ao rastrear, mas continuando...'
    })
  }
}

