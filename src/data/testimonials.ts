// Tipos para os dados da API
export interface Testimonial {
  id: number
  name: string
  role: string
  image: string
  text: string
  rating: number
  skillsHighlighted: string[]
}

export interface Skill {
  id: number
  name: string
  level: number
  mentions: number
}

// Funções helper para buscar dados da API
export async function fetchTestimonials(): Promise<Testimonial[]> {
  const res = await fetch('/api/testimonials?type=testimonials')
  const json = await res.json()
  return json.data
}

export async function fetchSkills(): Promise<Skill[]> {
  const res = await fetch('/api/testimonials?type=skills')
  const json = await res.json()
  return json.data
}
