// Definir variável de ambiente ANTES de qualquer importação do Prisma
process.env.PRISMA_DATABASE_URL = 'prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19MR1RWWV9zTWhwRnZ0TzB1R3JZeDEiLCJhcGlfa2V5IjoiMDFLQldDN1ozUUE0RlMxV0hFSlZTSlpFS0giLCJ0ZW5hbnRfaWQiOiI4ZGIzODRmMjdlOGUyYjFiMWMwM2YwMWYyYmEzNWM2ZTBmZDIxZjRhODU5ODkxMjM1Y2Y1NmQzMmE0ZmUzMDY5IiwiaW50ZXJuYWxfc2VjcmV0IjoiNTViMjViNTQtYmQ5OS00MzU4LTlmOWQtODZiMjliNWFkNjZhIn0.aFePOLGwNQ2yOtHlBeHByZhtSGa4BwW79rzSFH3vPhQ'
process.env.DATABASE_URL = process.env.PRISMA_DATABASE_URL

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

// URLs dos bancos
const LOCAL_DB_URL = 'postgres://postgres:postgres@localhost:5432/artistic_portfolio?sslmode=disable'

// Criar cliente Prisma para banco local
const localPool = new pg.Pool({ connectionString: LOCAL_DB_URL })
const localAdapter = new PrismaPg(localPool)
const localPrisma = new PrismaClient({ adapter: localAdapter })

// Criar cliente Prisma para banco de produção
const PROD_DB_URL = process.env.PRISMA_DATABASE_URL
if (!PROD_DB_URL) {
  throw new Error('PRISMA_DATABASE_URL não definido')
}
const prodPrisma = new PrismaClient({
  accelerateUrl: PROD_DB_URL,
})

async function migrateData() {
  console.log('🚀 Iniciando migração de dados...\n')

  try {
    // Testar conexão com produção
    await prodPrisma.$connect()
    console.log('✅ Conectado ao banco de produção\n')

    // 1. Users
    console.log('📦 Migrando Users...')
    const users = await localPrisma.user.findMany()
    for (const user of users) {
      await prodPrisma.user.upsert({
        where: { email: user.email },
        update: {
          password: user.password,
          name: user.name,
          role: user.role,
          updatedAt: user.updatedAt,
        },
        create: {
          email: user.email,
          password: user.password,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      })
    }
    console.log(`✅ ${users.length} usuários migrados\n`)

    // 2. Skills
    console.log('📦 Migrando Skills...')
    const skills = await localPrisma.skill.findMany()
    for (const skill of skills) {
      await prodPrisma.skill.upsert({
        where: { name: skill.name },
        update: {
          level: skill.level,
          mentions: skill.mentions,
          updatedAt: skill.updatedAt,
        },
        create: {
          name: skill.name,
          level: skill.level,
          mentions: skill.mentions,
          createdAt: skill.createdAt,
          updatedAt: skill.updatedAt,
        },
      })
    }
    console.log(`✅ ${skills.length} skills migradas\n`)

    // 3. GalleryArtworks
    console.log('📦 Migrando GalleryArtworks...')
    const galleryArtworks = await localPrisma.galleryArtwork.findMany()
    for (const artwork of galleryArtworks) {
      const { id, ...data } = artwork
      await prodPrisma.galleryArtwork.create({
        data,
      })
    }
    console.log(`✅ ${galleryArtworks.length} obras da galeria migradas\n`)

    // 4. CarouselArtworks
    console.log('📦 Migrando CarouselArtworks...')
    const carouselArtworks = await localPrisma.carouselArtwork.findMany()
    for (const artwork of carouselArtworks) {
      const { id, ...data } = artwork
      await prodPrisma.carouselArtwork.create({
        data,
      })
    }
    console.log(`✅ ${carouselArtworks.length} obras do carrossel migradas\n`)

    // 5. ScrollContent
    console.log('📦 Migrando ScrollContent...')
    const scrollContent = await localPrisma.scrollContent.findMany()
    for (const content of scrollContent) {
      const { id, ...data } = content
      await prodPrisma.scrollContent.create({
        data,
      })
    }
    console.log(`✅ ${scrollContent.length} conteúdos de scroll migrados\n`)

    

    // 7. Visits
    console.log('📦 Migrando Visits...')
    const visits = await localPrisma.visit.findMany()
    if (visits.length > 0) {
      const batchSize = 100
      for (let i = 0; i < visits.length; i += batchSize) {
        const batch = visits.slice(i, i + batchSize)
        await prodPrisma.visit.createMany({
          data: batch.map(({ id, ...data }) => data),
          skipDuplicates: true,
        })
      }
      console.log(`✅ ${visits.length} visitas migradas\n`)
    } else {
      console.log('ℹ️  Nenhuma visita para migrar\n')
    }

    // 8. ContactConfig
    console.log('📦 Migrando ContactConfig...')
    const contactConfigs = await localPrisma.contactConfig.findMany()
    for (const config of contactConfigs) {
      const existing = await prodPrisma.contactConfig.findFirst()
      if (existing) {
        await prodPrisma.contactConfig.update({
          where: { id: existing.id },
          data: {
            email: config.email,
            phone: config.phone,
            location: config.location,
            updatedAt: config.updatedAt,
          },
        })
      } else {
        const { id, ...data } = config
        await prodPrisma.contactConfig.create({
          data,
        })
      }
    }
    console.log(`✅ ${contactConfigs.length} configurações de contato migradas\n`)

    // 9. SocialLinks
    console.log('📦 Migrando SocialLinks...')
    const socialLinks = await localPrisma.socialLink.findMany()
    for (const link of socialLinks) {
      const { id, ...data } = link
      await prodPrisma.socialLink.create({
        data,
      })
    }
    console.log(`✅ ${socialLinks.length} links sociais migrados\n`)

    // 10. AboutConfig
    console.log('📦 Migrando AboutConfig...')
    const aboutConfigs = await localPrisma.aboutConfig.findMany()
    for (const config of aboutConfigs) {
      const existing = await prodPrisma.aboutConfig.findFirst()
      if (existing) {
        await prodPrisma.aboutConfig.update({
          where: { id: existing.id },
          data: {
            title: config.title,
            subtitle: config.subtitle,
            description: config.description,
            paragraph2: config.paragraph2,
            image: config.image,
            skills: config.skills as any,
            updatedAt: config.updatedAt,
          },
        })
      } else {
        const { id, ...data } = config
        await prodPrisma.aboutConfig.create({
          data: {
            ...data,
            skills: data.skills as any,
          },
        })
      }
    }
    console.log(`✅ ${aboutConfigs.length} configurações sobre migradas\n`)

    // 11. AdBanners
    console.log('📦 Migrando AdBanners...')
    const adBanners = await localPrisma.adBanner.findMany()
    for (const banner of adBanners) {
      const { id, ...data } = banner
      await prodPrisma.adBanner.create({
        data,
      })
    }
    console.log(`✅ ${adBanners.length} banners de anúncios migrados\n`)

    console.log('🎉 Migração concluída com sucesso!')
  } catch (error) {
    console.error('❌ Erro durante a migração:', error)
    throw error
  } finally {
    await localPrisma.$disconnect()
    await prodPrisma.$disconnect()
    await localPool.end()
  }
}

migrateData()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
