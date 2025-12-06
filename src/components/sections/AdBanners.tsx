'use client'

import { useState, useEffect } from 'react'

interface AdBanner {
  id: number
  imageUrl: string
  href: string | null
  position: 'before' | 'after'
  targetElement: string
  order: number
  isActive: boolean
}

interface AdBannersProps {
  targetElement: string
  position: 'before' | 'after'
}

export function AdBanners({ targetElement, position }: AdBannersProps) {
  const [banners, setBanners] = useState<AdBanner[]>([])

  useEffect(() => {
    async function loadBanners() {
      try {
        const res = await fetch('/api/ad-banners?active=true')
        const data = await res.json()
        
        // Filtrar apenas os banners para este elemento e posição
        const filtered = (data.banners || []).filter(
          (banner: AdBanner) => 
            banner.targetElement === targetElement && 
            banner.position === position &&
            banner.isActive
        )
        
        // Ordenar por ordem
        filtered.sort((a: AdBanner, b: AdBanner) => a.order - b.order)
        
        setBanners(filtered)
      } catch (error) {
        console.error('Error loading ad banners:', error)
      }
    }

    loadBanners()
  }, [targetElement, position])

  if (banners.length === 0) return null

  return (
    <>
      {banners.map((banner) => (
        <div key={banner.id} className="w-full my-8 flex justify-center">
          <div className="w-full max-w-7xl px-4">
            {banner.href ? (
              <a
                href={banner.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                <img
                  src={banner.imageUrl}
                  alt="Advertisement"
                  className="w-full h-auto object-contain"
                  loading="lazy"
                />
              </a>
            ) : (
              <img
                src={banner.imageUrl}
                alt="Advertisement"
                className="w-full h-auto object-contain"
                loading="lazy"
              />
            )}
          </div>
        </div>
      ))}
    </>
  )
}

