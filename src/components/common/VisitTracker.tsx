'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function VisitTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Não rastrear no dashboard
    if (pathname?.startsWith('/dashboard')) {
      return
    }

    // Aguardar um pouco para garantir que a página carregou
    const timer = setTimeout(() => {
      trackVisit()
    }, 1000)

    return () => clearTimeout(timer)
  }, [pathname])

  async function trackVisit() {
    try {
      await fetch('/api/visits/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: pathname || '/',
          referer: document.referrer || null,
        })
      })
    } catch (error) {
      // Silenciosamente falhar - não queremos quebrar a experiência do usuário
      console.log('Erro ao rastrear visita:', error)
    }
  }

  return null // Componente invisível
}

