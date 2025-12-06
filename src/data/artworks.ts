// Tipos para os dados da API
export interface GalleryArtwork {
  id: number
  title: string
  category: string
  image: string
  description: string
  gridClass: string
  order?: number
  youtubeUrl?: string | null
}

export interface CarouselArtwork {
  id: number
  url: string
  title: string
  category: string
  year: string
}

export interface ScrollContent {
  id: number
  image: string
  title: string
  description: string
}

// Configurações do cliente - categorias da galeria
export const GALLERY_CATEGORIES = [
  'all',
  'illustrations',
  'character design',
  'landscapes',
  'portraits',
  'concept art',
] as const

// Funções helper para buscar dados da API
export async function fetchGalleryArtworks(): Promise<GalleryArtwork[]> {
  try {
    const res = await fetch('/api/artworks?type=gallery', {
      cache: 'no-store', // Evitar problemas de cache durante desenvolvimento
    })
    
    if (!res.ok) {
      console.error('Erro na resposta da API:', res.status, res.statusText)
      return []
    }
    
    const json = await res.json()
    
    // Garantir que retornamos um array válido
    if (Array.isArray(json.data)) {
      return json.data
    }
    
    // Se json.data não for um array, retornar array vazio
    console.warn('Resposta da API não contém um array válido:', json)
    return []
  } catch (error) {
    console.error('Erro ao buscar artworks:', error)
    return []
  }
}

export async function fetchCarouselArtworks(): Promise<CarouselArtwork[]> {
  const res = await fetch('/api/artworks?type=carousel')
  const json = await res.json()
  return json.data
}

export async function fetchScrollContent(): Promise<ScrollContent[]> {
  const res = await fetch('/api/artworks?type=scroll')
  const json = await res.json()
  return json.data
}
