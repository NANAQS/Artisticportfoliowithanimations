import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// SQLite não precisa de adapters ou configurações especiais
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  const isProduction = process.env.NODE_ENV === 'production'
  const shouldReset = process.env.RESET_DB === 'true'

  // Limpar dados existentes apenas se RESET_DB=true ou em desenvolvimento
  if (shouldReset || !isProduction) {
    console.log('⚠️  Limpando dados existentes...')
    await prisma.user.deleteMany()
    await prisma.galleryArtwork.deleteMany()
    await prisma.carouselArtwork.deleteMany()
    await prisma.scrollContent.deleteMany()
    await prisma.testimonial.deleteMany()
    await prisma.skill.deleteMany()
  } else {
    console.log('ℹ️  Modo produção: verificando se dados já existem...')
  }

  // Criar usuário admin (apenas se não existir)
  const existingUser = await prisma.user.findUnique({
    where: { email: 'admin@portfolio.com' }
  })

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash('admin123', 12)
    await prisma.user.create({
      data: {
        email: 'admin@portfolio.com',
        password: hashedPassword,
        name: 'Admin',
        role: 'admin'
      }
    })
    console.log('✅ Usuário admin criado (admin@portfolio.com / admin123)')
  } else {
    console.log('ℹ️  Usuário admin já existe')
  }

  // Gallery Artworks
  const galleryArtworks = [
    {
      title: 'Digital Dreams',
      category: 'illustrations',
      image: 'https://images.unsplash.com/photo-1725347740942-c5306e3c970f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwaWxsdXN0cmF0aW9uJTIwYXJ0fGVufDF8fHx8MTc2MTY2NTg0Mnww&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'A vibrant digital illustration exploring color and form',
      gridClass: 'md:col-span-2 md:row-span-2',
    },
    {
      title: 'Watercolor Fantasy',
      category: 'landscapes',
      image: 'https://images.unsplash.com/photo-1713815539197-78db123d8f3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlcmNvbG9yJTIwcGFpbnRpbmd8ZW58MXx8fHwxNzYxNjE0NjE0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Soft watercolor landscape with dreamy atmosphere',
      gridClass: 'md:col-span-1 md:row-span-1',
    },
    {
      title: 'Character Study',
      category: 'character design',
      image: 'https://images.unsplash.com/photo-1630207831419-3532bcb828d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGFyYWN0ZXIlMjBkZXNpZ24lMjBza2V0Y2h8ZW58MXx8fHwxNzYxNzA4MzEyfDA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Detailed character design sketches and concepts',
      gridClass: 'md:col-span-1 md:row-span-1',
    },
    {
      title: 'Concept Vision',
      category: 'concept art',
      image: 'https://images.unsplash.com/photo-1758973602156-1e3d6473b87d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXB0JTIwYXJ0JTIwaWxsdXN0cmF0aW9ufGVufDF8fHx8MTc2MTcwODMxMnww&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Environmental concept art for fantasy world',
      gridClass: 'md:col-span-2 md:row-span-1',
    },
    {
      title: 'Fantasy Realm',
      category: 'concept art',
      image: 'https://images.unsplash.com/photo-1732996909435-f1918cd4bf8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW50YXN5JTIwYXJ0d29ya3xlbnwxfHx8fDE3NjE3MDM5Njd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Magical fantasy world illustration',
      gridClass: 'md:col-span-2 md:row-span-1',
    },
    {
      title: 'Ink & Emotion',
      category: 'illustrations',
      image: 'https://images.unsplash.com/photo-1567333860476-cd5fff1d92f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmslMjBkcmF3aW5nJTIwYXJ0fGVufDF8fHx8MTc2MTcwODMxM3ww&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Expressive ink drawing with bold strokes',
      gridClass: 'md:col-span-1 md:row-span-1',
    },
    {
      title: 'Portrait Study',
      category: 'portraits',
      image: 'https://images.unsplash.com/photo-1701958213864-2307a737e853?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHBhaW50aW5nJTIwYXJ0aXN0aWN8ZW58MXx8fHwxNzYxNzA4MzEzfDA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Artistic portrait with dramatic lighting',
      gridClass: 'md:col-span-1 md:row-span-1',
    },
    {
      title: 'Anime Inspiration',
      category: 'character design',
      image: 'https://images.unsplash.com/photo-1760113671986-63ccb46ae202?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMG1hbmdhJTIwYXJ0fGVufDF8fHx8MTc2MTcwODMxM3ww&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Character design with anime aesthetics',
      gridClass: 'md:col-span-2 md:row-span-2',
    },
    {
      title: 'Scenic Vista',
      category: 'landscapes',
      image: 'https://images.unsplash.com/photo-1700404837925-ad013953a624?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW5kc2NhcGUlMjBwYWludGluZyUyMGFydHxlbnwxfHx8fDE3NjE2NjM5ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Peaceful landscape painting with rich colors',
      gridClass: 'md:col-span-1 md:row-span-1',
    },
    {
      title: 'Urban Expression',
      category: 'illustrations',
      image: 'https://images.unsplash.com/photo-1581688110074-5c8116f97a63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJlZXQlMjBhcnQlMjBtdXJhbHxlbnwxfHx8fDE3NjE2MzEwNTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Street art inspired illustration',
      gridClass: 'md:col-span-1 md:row-span-1',
    },
    {
      title: 'Abstract Composition',
      category: 'illustrations',
      image: 'https://images.unsplash.com/photo-1699568542323-ff98aca8ea6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGNvbG9yZnVsJTIwYXJ0fGVufDF8fHx8MTc2MTY1MjYwMHww&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Bold abstract digital artwork',
      gridClass: 'md:col-span-2 md:row-span-1',
    },
    {
      title: 'Creative Workflow',
      category: 'portraits',
      image: 'https://images.unsplash.com/photo-1692859532235-c93fa73bd5d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMGFydGlzdGljJTIwcGFpbnRpbmd8ZW58MXx8fHwxNzYxNzA4NzM3fDA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Colorful digital portrait exploration',
      gridClass: 'md:col-span-1 md:row-span-1',
    },
    {
      title: 'Modern Illustration',
      category: 'illustrations',
      image: 'https://images.unsplash.com/photo-1672220377691-336b03b8bb66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBpbGx1c3RyYXRpb24lMjBkZXNpZ258ZW58MXx8fHwxNzYxNzA4NzM4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Contemporary design aesthetics',
      gridClass: 'md:col-span-1 md:row-span-1',
    },
    {
      title: 'Vibrant Dreams',
      category: 'concept art',
      image: 'https://images.unsplash.com/photo-1741114056860-8e0e96fa60f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWJyYW50JTIwZGlnaXRhbCUyMGFydHdvcmt8ZW58MXx8fHwxNzYxNzA4NzM4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Colorful digital art expression',
      gridClass: 'md:col-span-1 md:row-span-1',
    },
    {
      title: 'Artistic Vision',
      category: 'portraits',
      image: 'https://images.unsplash.com/photo-1741335661631-439871f2b3b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc3RpYyUyMGNvbXBvc2l0aW9uJTIwY29sb3JzfGVufDF8fHx8MTc2MTcwODczOHww&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Bold artistic composition',
      gridClass: 'md:col-span-2 md:row-span-1',
    },
  ]

  // Criar gallery artworks com ordem (apenas se não existirem)
  const existingGalleryCount = await prisma.galleryArtwork.count()
  if (existingGalleryCount === 0) {
    for (let i = 0; i < galleryArtworks.length; i++) {
      await prisma.galleryArtwork.create({
        data: {
          ...galleryArtworks[i],
          order: i,
        }
      })
    }
    console.log(`✅ ${galleryArtworks.length} gallery artworks criados`)
  } else {
    console.log(`ℹ️  ${existingGalleryCount} gallery artworks já existem`)
  }

  // Carousel Artworks
  const carouselArtworks = [
    {
      url: 'https://images.unsplash.com/photo-1682446857262-9232e0c9c3c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwcGFpbnRpbmclMjBhcnR3b3JrfGVufDF8fHx8MTc2MTc5NDc5MXww&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Sonhos Digitais',
      category: 'Pintura Digital',
      year: '2024',
    },
    {
      url: 'https://images.unsplash.com/photo-1581023701827-b50cbca3cb18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW50YXN5JTIwaWxsdXN0cmF0aW9uJTIwYXJ0fGVufDF8fHx8MTc2MTcxNzU3NXww&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Fantasia Épica',
      category: 'Ilustração',
      year: '2024',
    },
    {
      url: 'https://images.unsplash.com/photo-1753775298240-9f734661cd2e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBkaWdpdGFsJTIwYXJ0fGVufDF8fHx8MTc2MTc5MTg1OHww&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Arte Moderna',
      category: 'Design Digital',
      year: '2024',
    },
    {
      url: 'https://images.unsplash.com/photo-1603378596501-8bbfc7059d5e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMGNvbmNlcHQlMjBhcnR8ZW58MXx8fHwxNzYxNzk0NzkyfDA&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Conceito Criativo',
      category: 'Concept Art',
      year: '2025',
    },
    {
      url: 'https://images.unsplash.com/photo-1744055858618-3ba98cfe08b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc3RpYyUyMGlsbHVzdHJhdGlvbiUyMGRlc2lnbnxlbnwxfHx8fDE3NjE3OTQ3OTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Ilustração Artística',
      category: 'Arte Digital',
      year: '2025',
    },
  ]

  const existingCarouselCount = await prisma.carouselArtwork.count()
  if (existingCarouselCount === 0) {
    await prisma.carouselArtwork.createMany({ data: carouselArtworks })
    console.log(`✅ ${carouselArtworks.length} carousel artworks criados`)
  } else {
    console.log(`ℹ️  ${existingCarouselCount} carousel artworks já existem`)
  }

  // Scroll Content
  const scrollContent = [
    {
      image: 'https://lh3.googleusercontent.com/d/1PPYfshmd73_aDD63TCDGsUt2O6rkX5ps',
      title: 'Design de Personagens',
      description: 'Criando personagens únicos e memoráveis que ganham vida através de formas expressivas, cores marcantes e personalidades distintas.',
    },
    {
      image: 'https://lh3.googleusercontent.com/d/1AV_2nQBMXqAvNz8UfVG8E_EJaRuZBI3j',
      title: 'Arte Abstrata',
      description: 'Mergulhando em texturas, formas e cores para criar experiências visuais que transcendem a representação literal e despertam emoções profundas.',
    },
    {
      image: 'https://lh3.googleusercontent.com/d/1jlDfdj1NeW5u9rdgzxnWtFP_ZbrTudy8',
      title: 'Arte Digital Contemporânea',
      description: 'Explorando as fronteiras da criatividade digital através de composições vibrantes e narrativas visuais que capturam a essência da arte moderna.',
    },
  ]

  const existingScrollCount = await prisma.scrollContent.count()
  if (existingScrollCount === 0) {
    await prisma.scrollContent.createMany({ data: scrollContent })
    console.log(`✅ ${scrollContent.length} scroll content criados`)
  } else {
    console.log(`ℹ️  ${existingScrollCount} scroll content já existem`)
  }

  // Testimonials
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Game Developer',
      image: 'https://images.unsplash.com/photo-1701958213864-2307a737e853?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHBhaW50aW5nJTIwYXJ0aXN0aWN8ZW58MXx8fHwxNzYxNzA4MzEzfDA&ixlib=rb-4.1.0&q=80&w=1080',
      text: 'The character designs exceeded all expectations. The attention to detail, anatomy knowledge, and unique artistic style brought our game to life!',
      rating: 5,
      skillsHighlighted: ['Character Design', 'Digital Painting', 'Anatomy & Form'] as any,
    },
    {
      name: 'Marcus Chen',
      role: 'Author & Publisher',
      image: 'https://images.unsplash.com/photo-1630207831419-3532bcb828d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGFyYWN0ZXIlMjBkZXNpZ24lMjBza2V0Y2h8ZW58MXx8fHwxNzYxNzA4MzEyfDA&ixlib=rb-4.1.0&q=80&w=1080',
      text: 'Beautiful book cover illustrations with exceptional composition and color theory. The visual storytelling perfectly captured the essence of my story!',
      rating: 5,
      skillsHighlighted: ['Illustration Styles', 'Composition', 'Color Theory'] as any,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Animation Studio Director',
      image: 'https://images.unsplash.com/photo-1725347740942-c5306e3c970f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwaWxsdXN0cmF0aW9uJTIwYXJ0fGVufDF8fHx8MTc2MTY2NTg0Mnww&ixlib=rb-4.1.0&q=80&w=1080',
      text: 'Outstanding concept art and storyboarding that helped us visualize our animated series. Professional workflow with amazing background art!',
      rating: 5,
      skillsHighlighted: ['Concept Art', 'Storyboarding', 'Background Art'] as any,
    },
  ]

  const existingTestimonialsCount = await prisma.testimonial.count()
  if (existingTestimonialsCount === 0) {
    for (const testimonial of testimonials) {
      await prisma.testimonial.create({ data: testimonial })
    }
    console.log(`✅ ${testimonials.length} testimonials criados`)
  } else {
    console.log(`ℹ️  ${existingTestimonialsCount} testimonials já existem`)
  }

  // Skills
  const skills = [
    { name: 'Character Design', level: 95, mentions: 2 },
    { name: 'Digital Painting', level: 98, mentions: 3 },
    { name: 'Color Theory', level: 90, mentions: 2 },
    { name: 'Composition', level: 92, mentions: 2 },
    { name: 'Anatomy & Form', level: 88, mentions: 2 },
    { name: 'Concept Art', level: 93, mentions: 2 },
    { name: 'Illustration Styles', level: 94, mentions: 3 },
    { name: 'Background Art', level: 87, mentions: 1 },
    { name: 'Storyboarding', level: 85, mentions: 1 },
  ]

  const existingSkillsCount = await prisma.skill.count()
  if (existingSkillsCount === 0) {
    await prisma.skill.createMany({ data: skills })
    console.log(`✅ ${skills.length} skills criadas`)
  } else {
    console.log(`ℹ️  ${existingSkillsCount} skills já existem`)
  }

  console.log('🎉 Seed concluído com sucesso!')
}

// Exportar a função main para uso em outros lugares
export { main }

// Executar apenas se for chamado diretamente (não quando importado)
// Verificar se está sendo executado como script
const isMainModule = typeof require !== 'undefined' && require.main === module

if (isMainModule) {
  main()
    .catch((e) => {
      console.error('❌ Erro no seed:', e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
