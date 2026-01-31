import 'dotenv/config'
import { PrismaClient, type Prisma } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const isAccelerate = 
  process.env.PRISMA_DATABASE_URL?.startsWith('prisma+') ||
  process.env.DATABASE_URL?.startsWith('prisma+')

let prisma: PrismaClient
let pool: pg.Pool | null = null

if (isAccelerate) {
  prisma = new PrismaClient()
} else {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL não está definido. Verifique o arquivo .env')
  }
  pool = new pg.Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  prisma = new PrismaClient({ adapter })
}

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  const isProduction = process.env.NODE_ENV === 'production'
  const shouldReset = process.env.RESET_DB === 'true'

  if (shouldReset || !isProduction) {
    console.log('⚠️  Limpando dados existentes...')
    await prisma.adBanner.deleteMany()
    await prisma.footerConfig.deleteMany()
    await prisma.artProcessConfig.deleteMany()
    await prisma.heroConfig.deleteMany()
    await prisma.aboutConfig.deleteMany()
    await prisma.socialLink.deleteMany()
    await prisma.contactConfig.deleteMany()
    await prisma.loginHistory.deleteMany()
    await prisma.visit.deleteMany()
    await prisma.testimonial.deleteMany()
    await prisma.skill.deleteMany()
    await prisma.galleryArtwork.deleteMany()
    await prisma.carouselArtwork.deleteMany()
    await prisma.scrollContent.deleteMany()
    await prisma.category.deleteMany()
    await prisma.user.deleteMany()
  } else {
    console.log('ℹ️  Modo produção: verificando se dados já existem...')
  }

  const users = [
  {
    "email": "sweets.wppi@gmail.com",
    "password": "$2b$12$4/cdNBJTMTo59hyWpxoo4ut7SFSkrLbJuxvUwOx3uZ9DoV1JZOs.m",
    "name": "Sweet",
    "role": "admin"
  }
]

  const existingUserCount = await prisma.user.count()
  if (existingUserCount === 0 && users.length > 0) {
    await prisma.user.createMany({ data: users })
    console.log('✅ ' + users.length + ' usuários criados')
  } else {
    console.log('ℹ️  ' + existingUserCount + ' usuários já existem')
  }

  const categories = [
  {
    "name": "Illustrations"
  },
  {
    "name": "landscapes"
  },
  {
    "name": "Character Design"
  },
  {
    "name": "Concept Art"
  },
  {
    "name": "Digital Art"
  }
]

  const existingCategoryCount = await prisma.category.count()
  if (existingCategoryCount === 0 && categories.length > 0) {
    await prisma.category.createMany({ data: categories })
    console.log('✅ ' + categories.length + ' categorias criadas')
  } else {
    console.log('ℹ️  ' + existingCategoryCount + ' categorias já existem')
  }

  const categoryRows = await prisma.category.findMany()
  const categoryMap = new Map(categoryRows.map((category) => [category.name, category.id]))

  const galleryArtworks = [
  {
    "title": "Funny DTIYS character",
    "category": "Illustrations",
    "image": "https://instagram.fplu24-1.fna.fbcdn.net/v/t51.82787-15/619273609_17915922561266940_8199185089957339100_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=107&ig_cache_key=MzgxMzk1NzU4NDk3MDIwMTA4Nw%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE4MDB4MTQ0MC5zZHIuQzMifQ%3D%3D&_nc_ohc=B4pKd3OypuQQ7kNvwFUHWtV&_nc_oc=Adm-CSJMEUiMpkFBHIfoyHgapAnxQwdxPUdVqLDF73uIkpY4eYQj73NdhgCyNLZqUmHOiCKruPglfrSpXI-8mjHk&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.fplu24-1.fna&_nc_gid=CpQuzu2QYRQsBQ0V4X302A&oh=00_AfqSC5i-BlGEIbJ5PJ-cKnpnCyFdqC5dzNVubr5gBgw3Hg&oe=6975B3B1",
    "description": "Other version of DTIYS 2026",
    "gridClass": "md:col-span-1 md:row-span-1",
    "order": 0,
    "youtubeUrl": null
  },
  {
    "title": "Sweet",
    "category": "Character Design",
    "image": "https://instagram.fplu24-1.fna.fbcdn.net/v/t51.82787-15/617221855_17915511942266940_5615726569308142637_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=100&ig_cache_key=MzgxMTQ4MjIwNTM1NzQ5MTQ5Nw%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTQ0MC5zZHIuQzMifQ%3D%3D&_nc_ohc=XjZU-tAXdl0Q7kNvwGHXh8h&_nc_oc=AdnDlGK14RMO3eRq5M89HhixshtXnpXKSquGsFCjnt_efbcrPQGukYBkhfAyKol0996sgVFdG5-mrG81KDrr9eNy&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.fplu24-1.fna&_nc_gid=-5zQOoBlDUtpYN_rS8E8vw&oh=00_AfrfJytZuJ5uJNU0tuTHJnF4Dn9uRnyf_cRxmhbTm90c7g&oe=6970B0F1",
    "description": "My oc to interact with my followers",
    "gridClass": "md:col-span-1 md:row-span-1",
    "order": 1,
    "youtubeUrl": "https://www.instagram.com/reel/DTlIv-pCbN5/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
  },
  {
    "title": "Bora Ali Bot",
    "category": "Illustrations",
    "image": "https://instagram.fplu24-1.fna.fbcdn.net/v/t51.82787-15/616407613_17915441454266940_2079845868247794409_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=104&ig_cache_key=MzgxMTAyNDM2NzY0MDI0NTY4OQ%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTQ0MC5zZHIuQzMifQ%3D%3D&_nc_ohc=XrGWtipnsIUQ7kNvwHPPUuw&_nc_oc=AdnvxrEPIr2I4HyfcHFWLD9wTqotEFnaFHSAsT3VMmNSPFVPf_14vx4otlGzgh3meYmqRedQcLiCzgp2Cx6sssNX&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.fplu24-1.fna&_nc_gid=-5zQOoBlDUtpYN_rS8E8vw&oh=00_AfrznbvLm1qpOQxbhgRkT1lcPnmoqYiwxgpYIRrwn26c2A&oe=6970AB80",
    "description": "First art of 2026!",
    "gridClass": "md:col-span-1 md:row-span-1",
    "order": 2,
    "youtubeUrl": "https://www.instagram.com/reel/DTjgcPfEtmQ/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
  },
  {
    "title": "Guinevere",
    "category": "Illustrations",
    "image": "https://instagram.fplu24-1.fna.fbcdn.net/v/t51.82787-15/573331681_17907129639266940_5595589708719335332_n.jpg?stp=dst-jpg_e35_s1080x1080_tt6&_nc_cat=104&ig_cache_key=Mzc1NTc2OTEwMzUwMTA0NDA0OA%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE3OTl4MTQzOS5zZHIuQzMifQ%3D%3D&_nc_ohc=NSTlDTUjwf8Q7kNvwFzILkb&_nc_oc=Adk-VEUAZkTYlWo5YWKB3h8mBNafMhe4y9V9Ju66EtoXZXWlq3BZy8LGPq_9w7j6vDQN9B-KW5r_gRthIweKQMlB&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.fplu24-1.fna&_nc_gid=-5zQOoBlDUtpYN_rS8E8vw&oh=00_AfqZYN0VZ-UoEaSUvilHqI_Lvda4Sc1kW-YuJI2dUBmjqw&oe=6970BFD7",
    "description": "A fanart of Guinevere from glitch productions",
    "gridClass": "md:col-span-2 md:row-span-1",
    "order": 3,
    "youtubeUrl": null
  },
  {
    "title": "Vocaloid Deathlight",
    "category": "Character Design",
    "image": "https://instagram.fplu24-1.fna.fbcdn.net/v/t51.82787-15/603841025_17912424822266940_5667779538063834528_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=109&ig_cache_key=Mzc5MTkyNTUwMDcwMTY0MjUwNw%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTQ0MC5zZHIuQzMifQ%3D%3D&_nc_ohc=bnYsD_scaRgQ7kNvwEGvOBL&_nc_oc=AdlsMMeT77U277fQMyVvSD0dEVGr2SPvW04Mip3Kvsq88v_PnSWk60cWFAhQ5sVt2-zbq6WEyawPPlXTtTS8qtc_&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.fplu24-1.fna&_nc_gid=-5zQOoBlDUtpYN_rS8E8vw&oh=00_AfpqeYxug_-vyHVZCKblghkdaEZpwk5Mf0jUclwzSEH3pg&oe=6970DA70",
    "description": "A challenge mixing vocaloids and deathlights",
    "gridClass": "md:col-span-1 md:row-span-2",
    "order": 4,
    "youtubeUrl": "https://www.instagram.com/reel/DSfn1ALDovf/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
  },
  {
    "title": "Vampire Miku",
    "category": "Digital Art",
    "image": "https://instagram.fplu24-1.fna.fbcdn.net/v/t51.82787-15/583190928_17909202570266940_7650637833883395294_n.jpg?stp=dst-jpg_e35_s1080x1080_tt6&_nc_cat=100&ig_cache_key=Mzc3MDUxNzc4MjQxMzUxNDE4Ng%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE3OTl4MTQ0MC5zZHIuQzMifQ%3D%3D&_nc_ohc=Q93kF4MlNRAQ7kNvwGRRT1D&_nc_oc=AdlOgMXb2nEepjnroVNsPsWL32uGiPJOKhyOnxDT-J5uQRW0PRUozNDME1QACAU6C0vOTiyc-kRGZ0NY9Y3byDna&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.fplu24-1.fna&_nc_gid=-5zQOoBlDUtpYN_rS8E8vw&oh=00_Afq6iA6UyF0Et1NwTGZPLx_tHoBVvaBDL5fQ7Cqr2LUleQ&oe=6970B9D3",
    "description": "A vampire miku fanart",
    "gridClass": "md:col-span-1 md:row-span-1",
    "order": 5,
    "youtubeUrl": null
  },
  {
    "title": "Christimas Sweet",
    "category": "Digital Art",
    "image": "https://instagram.fplu24-1.fna.fbcdn.net/v/t51.82787-15/606708933_17912916990266940_2850003361429504004_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=108&ig_cache_key=Mzc5NTEwODM1NTYyMzQ0OTMxMw%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTQ0MC5zZHIuQzMifQ%3D%3D&_nc_ohc=xXlLis0QHtEQ7kNvwFEhE3Q&_nc_oc=AdmnZXa-a5yjjjwBkySIgvsqcL9FZVpmiQGxl7du9Wcp8nChSbr6PH9h-xbBsTVIMwnR1IPYLpKfNwZytpX7ktim&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.fplu24-1.fna&_nc_gid=-5zQOoBlDUtpYN_rS8E8vw&oh=00_AfqVORTpowoa0Sq0CREvn1m1TJbx2zkeXz0NGqChTF3qhQ&oe=6970C439",
    "description": "Merry Christimas!!",
    "gridClass": "md:col-span-1 md:row-span-1",
    "order": 6,
    "youtubeUrl": null
  },
  {
    "title": "DTIYS Challenge 2026",
    "category": "Illustrations",
    "image": "https://instagram.fplu24-1.fna.fbcdn.net/v/t51.82787-15/619110047_17915922552266940_5758068292164151835_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=102&ig_cache_key=MzgxMzk1NzU4NDkyODI5OTA1Ng%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE4MDB4MTQ0MC5zZHIuQzMifQ%3D%3D&_nc_ohc=rwXZ72it2pAQ7kNvwF6w13i&_nc_oc=AdlPSZxsqCobeUGswUJ0bKWEI3Qpbve5baMOHRLZ5wcadYCI1wSpoaIFmlOrenz0Yj-0rN-JNB_EEnXF829_Adwj&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.fplu24-1.fna&_nc_gid=CpQuzu2QYRQsBQ0V4X302A&oh=00_AfqgGI1gNmET5xHF7yhZ4px4WFMmcgj4Y94wEoECPlW6cg&oe=69757CC8",
    "description": "A challenge to draw a character in my style.",
    "gridClass": "md:col-span-2 md:row-span-1",
    "order": 7,
    "youtubeUrl": null
  },
  {
    "title": "Coquette Vampire",
    "category": "Character Design",
    "image": "https://instagram.fplu24-1.fna.fbcdn.net/v/t51.82787-15/568652366_17905871265266940_5280783584999965193_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=100&ig_cache_key=Mzc0NzEwMTYyMzMyNDg2MDkxNQ%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTQ0MC5zZHIuQzMifQ%3D%3D&_nc_ohc=zvRhfga1-ZYQ7kNvwFVgSmz&_nc_oc=AdmlefdSzDykhZhvRjpAa6BJg3xDktV-up5Z2wVbtoG9DBRR9Jbg8etWwT4BAYREujaMUvFJBfV_NTJt87xVSckc&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.fplu24-1.fna&_nc_gid=RLejhNkkA9GVMHOJZODuFA&oh=00_AfpK17ZBbnSIMu4iq4VmQIISOfKb--14AJSODR6-58GTcA&oe=6970D1FC",
    "description": "A challenge of internet",
    "gridClass": "md:col-span-1 md:row-span-2",
    "order": 8,
    "youtubeUrl": null
  },
  {
    "title": "Dev Banner",
    "category": "Illustrations",
    "image": "https://instagram.fplu24-1.fna.fbcdn.net/v/t51.82787-15/611791907_17915333172266940_2666153473966218561_n.jpg?stp=dst-jpg_e35_s1080x1080_tt6&_nc_cat=105&ig_cache_key=MzgxMDI4ODUxMjU0NjIxMTQ5MQ%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjIxNjB4MTEyMC5zZHIuQzMifQ%3D%3D&_nc_ohc=3E8iKB4z9XIQ7kNvwFFcVEe&_nc_oc=Admn_6EivZ_LglHxXZ65rB2J_u8ijmvUDpVTRUyW-c-Ng5X-t-Ihjc0kd0hcRUCMdheI0iQtcEj4sz5iW1NBO8Qy&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.fplu24-1.fna&_nc_gid=-5zQOoBlDUtpYN_rS8E8vw&oh=00_AfoGBFlL7xMXIRodmrBFg4hpxFpTmABnafk6HgDoxSuTbw&oe=6970AAB6",
    "description": "A banner for my dev friend",
    "gridClass": "md:col-span-2 md:row-span-1",
    "order": 9,
    "youtubeUrl": null
  },
  {
    "title": "Hatsune Miku",
    "category": "Digital Art",
    "image": "https://instagram.fplu24-1.fna.fbcdn.net/v/t51.82787-15/572080899_17906530734266940_4163520078490419415_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=109&ig_cache_key=Mzc1MTY0MTk1ODA1MDU1Njk2Mw%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE3OTl4MTQzOS5zZHIuQzMifQ%3D%3D&_nc_ohc=nfFCApMmDQ4Q7kNvwGW26OG&_nc_oc=AdkjNKLHoQxxPIS9hDMmEq3G2wyXGV1genwEUn12RfqZAkUkcH150R-PK5JloQsvOjViNmT0CYTbAnQgjzQYRLgJ&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.fplu24-1.fna&_nc_gid=RLejhNkkA9GVMHOJZODuFA&oh=00_Afo2xfjQNKFEXWBKVtBW8-xXNp4JGicQiZHMgBc9LSjGAQ&oe=6970D401",
    "description": "My first drawing",
    "gridClass": "md:col-span-1 md:row-span-1",
    "order": 10,
    "youtubeUrl": null
  }
]

  const existingGalleryCount = await prisma.galleryArtwork.count()
  if (existingGalleryCount === 0 && galleryArtworks.length > 0) {
    for (const artwork of galleryArtworks) {
      await prisma.galleryArtwork.create({
        data: {
          title: artwork.title,
          categoryId: categoryMap.get(artwork.category) ?? categoryRows[0]?.id,
          image: artwork.image,
          description: artwork.description,
          gridClass: artwork.gridClass,
          order: artwork.order,
          youtubeUrl: artwork.youtubeUrl ?? null,
        }
      })
    }
    console.log('✅ ' + galleryArtworks.length + ' gallery artworks criados')
  } else {
    console.log('ℹ️  ' + existingGalleryCount + ' gallery artworks já existem')
  }

  const carouselArtworks = [
  {
    "url": "https://instagram.fplu24-1.fna.fbcdn.net/v/t51.82787-15/617221855_17915511942266940_5615726569308142637_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=100&ig_cache_key=MzgxMTQ4MjIwNTM1NzQ5MTQ5Nw%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTQ0MC5zZHIuQzMifQ%3D%3D&_nc_ohc=XjZU-tAXdl0Q7kNvwGHXh8h&_nc_oc=AdnDlGK14RMO3eRq5M89HhixshtXnpXKSquGsFCjnt_efbcrPQGukYBkhfAyKol0996sgVFdG5-mrG81KDrr9eNy&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.fplu24-1.fna&_nc_gid=-5zQOoBlDUtpYN_rS8E8vw&oh=00_AfrfJytZuJ5uJNU0tuTHJnF4Dn9uRnyf_cRxmhbTm90c7g&oe=6970B0F1",
    "title": "Sweet",
    "category": "Character Design",
    "year": "2026"
  },
  {
    "url": "https://instagram.fplu24-1.fna.fbcdn.net/v/t51.82787-15/573331681_17907129639266940_5595589708719335332_n.jpg?stp=dst-jpg_e35_s1080x1080_tt6&_nc_cat=104&ig_cache_key=Mzc1NTc2OTEwMzUwMTA0NDA0OA%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE3OTl4MTQzOS5zZHIuQzMifQ%3D%3D&_nc_ohc=NSTlDTUjwf8Q7kNvwFzILkb&_nc_oc=Adk-VEUAZkTYlWo5YWKB3h8mBNafMhe4y9V9Ju66EtoXZXWlq3BZy8LGPq_9w7j6vDQN9B-KW5r_gRthIweKQMlB&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.fplu24-1.fna&_nc_gid=-5zQOoBlDUtpYN_rS8E8vw&oh=00_AfqZYN0VZ-UoEaSUvilHqI_Lvda4Sc1kW-YuJI2dUBmjqw&oe=6970BFD7",
    "title": "Guinevere",
    "category": "Illustrations",
    "year": "2025"
  },
  {
    "url": "https://instagram.fplu24-1.fna.fbcdn.net/v/t51.82787-15/603841025_17912424822266940_5667779538063834528_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=109&ig_cache_key=Mzc5MTkyNTUwMDcwMTY0MjUwNw%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTQ0MC5zZHIuQzMifQ%3D%3D&_nc_ohc=bnYsD_scaRgQ7kNvwEGvOBL&_nc_oc=AdlsMMeT77U277fQMyVvSD0dEVGr2SPvW04Mip3Kvsq88v_PnSWk60cWFAhQ5sVt2-zbq6WEyawPPlXTtTS8qtc_&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.fplu24-1.fna&_nc_gid=-5zQOoBlDUtpYN_rS8E8vw&oh=00_AfpqeYxug_-vyHVZCKblghkdaEZpwk5Mf0jUclwzSEH3pg&oe=6970DA70",
    "title": "Vocaloid Deathlight",
    "category": "Character Design",
    "year": "2025"
  },
  {
    "url": "https://instagram.fplu24-1.fna.fbcdn.net/v/t51.82787-15/611791907_17915333172266940_2666153473966218561_n.jpg?stp=dst-jpg_e35_s1080x1080_tt6&_nc_cat=105&ig_cache_key=MzgxMDI4ODUxMjU0NjIxMTQ5MQ%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjIxNjB4MTEyMC5zZHIuQzMifQ%3D%3D&_nc_ohc=3E8iKB4z9XIQ7kNvwFFcVEe&_nc_oc=Admn_6EivZ_LglHxXZ65rB2J_u8ijmvUDpVTRUyW-c-Ng5X-t-Ihjc0kd0hcRUCMdheI0iQtcEj4sz5iW1NBO8Qy&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.fplu24-1.fna&_nc_gid=-5zQOoBlDUtpYN_rS8E8vw&oh=00_AfoGBFlL7xMXIRodmrBFg4hpxFpTmABnafk6HgDoxSuTbw&oe=6970AAB6",
    "title": "Dev Banner",
    "category": "Illustrations",
    "year": "2024"
  }
]

  const existingCarouselCount = await prisma.carouselArtwork.count()
  if (existingCarouselCount === 0 && carouselArtworks.length > 0) {
    for (const artwork of carouselArtworks) {
      await prisma.carouselArtwork.create({
        data: {
          url: artwork.url,
          title: artwork.title,
          categoryId: categoryMap.get(artwork.category) ?? categoryRows[0]?.id,
          year: artwork.year,
        }
      })
    }
    console.log('✅ ' + carouselArtworks.length + ' carousel artworks criados')
  } else {
    console.log('ℹ️  ' + existingCarouselCount + ' carousel artworks já existem')
  }

  const scrollContent = [
  {
    "image": "https://lh3.googleusercontent.com/d/1PPYfshmd73_aDD63TCDGsUt2O6rkX5ps",
    "title": "SKETCH CLEAN – Description",
    "description": "Sketch Clean is a clean and refined sketch, focused on clear lines and solid structure.\nThis option is ideal for concepts, character studies, or clients who prefer a simpler and more expressive look.\nThe sketch keeps visible construction and line variation, without colors or heavy rendering.\nPrices vary depending on the body cut selected. <br> <br>  Bust (US $5,00) __ ( BRL R$15,00) | Half-body (US $8,00) __ ( BRL R$20,00) | Thigh-up (US $12,00) __ ( BRL R$30,00) | Full-body (US $18,00) __ ( BRL R$40,00) "
  },
  {
    "image": "https://lh3.googleusercontent.com/d/1AV_2nQBMXqAvNz8UfVG8E_EJaRuZBI3j",
    "title": "FLAT COLOR – Description",
    "description": "Flat Color includes clean line art with solid base colors.\nThis style has no complex shading, focusing on clear shapes and color harmony.\nIt is a great choice for characters, references, and simple illustrations with a polished look.\nPrices vary depending on the body cut selected. <br> <br> Bust (US $7,00) __ ( BRL R$25,00) | Half-body (US $11,00) __ ( BRL R$30,00) | Thigh-up (US $16,00) __ ( BRL R$45,00) | Full-body (US $20,00) __ ( BRL R$60,00)"
  },
  {
    "image": "https://lh3.googleusercontent.com/d/1jlDfdj1NeW5u9rdgzxnWtFP_ZbrTudy8",
    "title": "FULL RENDER – Description",
    "description": "Full Render is a fully finished illustration with detailed shading, lighting, and color rendering.\nThis option focuses on depth, atmosphere, and visual impact, bringing the character to life.\nIt is ideal for final artworks, commissions, and showcase pieces.\nPrices vary depending on the body cut selected. <br> <br> Bust (US $12,00) __ ( BRL R$45,00) | Half-body (US $18,00) __ ( BRL R$65,00) | Thigh-up (US $24,00) __ ( BRL R$85,00) | Full-body (US $30,00) __ ( BRL R$120,00)"
  }
]

  const existingScrollCount = await prisma.scrollContent.count()
  if (existingScrollCount === 0 && scrollContent.length > 0) {
    await prisma.scrollContent.createMany({ data: scrollContent })
    console.log('✅ ' + scrollContent.length + ' scroll content criados')
  } else {
    console.log('ℹ️  ' + existingScrollCount + ' scroll content já existem')
  }

  const testimonials = [
  {
    "name": "Dutra",
    "role": "Game Dev",
    "image": "https://i.imgur.com/iRu1ejt.png",
    "text": "Cuuuuteeee :3",
    "rating": 5,
    "skillsHighlighted": [
      "Character Design",
      "Digital Painting",
      "Color Theory",
      "Composition",
      "Anatomy & Form",
      "Concept Art",
      "Illustration Styles",
      "Background Art",
      "Storyboarding"
    ],
    "skillLevels": {
      "Character Design": 100,
      "Digital Painting": 80,
      "Color Theory": 60,
      "Composition": 100,
      "Anatomy & Form": 60,
      "Concept Art": 100,
      "Illustration Styles": 100,
      "Background Art": 40,
      "Storyboarding": 80
    }
  },
  {
    "name": "Dutra",
    "role": "Game Dev",
    "image": "https://i.imgur.com/iRu1ejt.png",
    "text": "Nice",
    "rating": 4,
    "skillsHighlighted": [
      "Character Design",
      "Digital Painting",
      "Color Theory",
      "Composition",
      "Anatomy & Form",
      "Concept Art",
      "Illustration Styles",
      "Background Art",
      "Storyboarding"
    ],
    "skillLevels": {
      "Character Design": 100,
      "Digital Painting": 80,
      "Color Theory": 60,
      "Composition": 100,
      "Anatomy & Form": 60,
      "Concept Art": 100,
      "Illustration Styles": 100,
      "Background Art": 40,
      "Storyboarding": 80
    }
  }
]

  const existingTestimonialsCount = await prisma.testimonial.count()
  if (existingTestimonialsCount === 0 && testimonials.length > 0) {
    for (const testimonial of testimonials) {
      await prisma.testimonial.create({ data: testimonial })
    }
    console.log('✅ ' + testimonials.length + ' testimonials criados')
  } else {
    console.log('ℹ️  ' + existingTestimonialsCount + ' testimonials já existem')
  }

  const skills = [
  {
    "name": "Character Design",
    "level": 100,
    "mentions": 2
  },
  {
    "name": "Digital Painting",
    "level": 80,
    "mentions": 2
  },
  {
    "name": "Color Theory",
    "level": 60,
    "mentions": 2
  },
  {
    "name": "Composition",
    "level": 100,
    "mentions": 2
  },
  {
    "name": "Anatomy & Form",
    "level": 60,
    "mentions": 2
  },
  {
    "name": "Concept Art",
    "level": 100,
    "mentions": 2
  },
  {
    "name": "Illustration Styles",
    "level": 100,
    "mentions": 2
  },
  {
    "name": "Background Art",
    "level": 40,
    "mentions": 2
  },
  {
    "name": "Storyboarding",
    "level": 80,
    "mentions": 2
  }
]

  const existingSkillsCount = await prisma.skill.count()
  if (existingSkillsCount === 0 && skills.length > 0) {
    await prisma.skill.createMany({ data: skills })
    console.log('✅ ' + skills.length + ' skills criadas')
  } else {
    console.log('ℹ️  ' + existingSkillsCount + ' skills já existem')
  }

  const aboutConfig = {
  "title": "Who's Sweet?",
  "subtitle": "About Me",
  "description": " Hi, I'm Sweet, a digital artist who likes drawing, animation, games, RPGs, cats, sewing, and many other things. I plan to work with art and become a VTuber one day — maybe you’ll see me on the air, who knows?\n\nMy art style isn’t defined yet, but I always try to deliver my best work and create art you won’t be able to look away from… or at least, I hope so! I’m currently working in a semi-realistic anime style, but I’m open to other styles if my clients ask for them.",
  "paragraph2": "Every piece I create is a journey of imagination and learning. I work with digital illustration, concept art, and character design, constantly studying and improving while transforming ideas into expressive visual pieces.",
  "image": "https://lh3.googleusercontent.com/d/1GTLzt6uDvwcg8rNMuRguJfllZk89RoSS",
  "skills": [
    {
      "icon": "Palette",
      "title": "Digital Illustration",
      "description": "Creating vibrant digital artwork with depth and emotion"
    },
    {
      "icon": "Code",
      "title": "Character Design",
      "description": "Bringing unique characters to life with personality and detail"
    },
    {
      "icon": "Sparkles",
      "title": "Concept Art",
      "description": "Developing visual concepts for games, films, and stories"
    }
  ]
}
  if (aboutConfig) {
    const existingAbout = await prisma.aboutConfig.findFirst()
    if (!existingAbout) {
      await prisma.aboutConfig.create({ data: aboutConfig })
      console.log('✅ About config criado')
    } else {
      console.log('ℹ️  About config já existe')
    }
  }

  const heroConfig = {
  "heroImageUrl": "https://lh3.googleusercontent.com/d/1JrktvhrY8CCl6Cdlx1CUhv4Ng7wyE4a6",
  "welcomeText": "Hello! Welcome! ✨",
  "subtitle": "2D Artist & Illustrator",
  "title": "Bringing Stories to Life",
  "titleHighlight": "Through Art",
  "description": "Creating vibrant illustrations, character designs, and digital paintings that capture emotion and imagination",
  "stats": [
    {
      "label": "Artworks",
      "number": "10+"
    },
    {
      "label": "Happy Clients",
      "number": "5+"
    },
    {
      "label": "Years",
      "number": "1+"
    }
  ],
  "button1Text": "View Gallery",
  "button2Text": "Commission Work"
}
  if (heroConfig) {
    const existingHero = await prisma.heroConfig.findFirst()
    if (!existingHero) {
      await prisma.heroConfig.create({ data: heroConfig })
      console.log('✅ Hero config criado')
    } else {
      console.log('ℹ️  Hero config já existe')
    }
  }

  const artProcessConfig = {
  "subtitle": "My Process",
  "title": "From idea to life",
  "description": "Every artwork I create follows a simple process. First, I gather inspiration or receive my client’s request, then I collect references — lots of references! After that, I work on the concept and line art, think about the situation and the setting of the scene or character, choose a color palette that fits well or that I like the most, apply the base colors, render everything, and finally finish the scene.\nOh, and I never forget my signature — there are always two or more in every artwork made by me!",
  "steps": [
    {
      "icon": "Lightbulb",
      "title": "Inspiration",
      "description": "My inspiration comes from everywhere — videos, photos, Pinterest, studies, daily life, trips, and client requests. With that in mind, I put my laziness aside and get to work."
    },
    {
      "icon": "Sparkles",
      "title": "References",
      "description": "References are the most fun — and most dangerous — part! I gather them from Pinterest, Google Images, and sometimes Instagram, keeping them nearby to guide my ideas. The danger? Getting lost admiring them and forgetting I have work to do."
    },
    {
      "icon": "Pencil",
      "title": "Concept Art",
      "description": "Concept art is the most important step for me. I start with simple shapes, refine the forms, and build details step by step until the sketch is ready for line art."
    },
    {
      "icon": "PenTool",
      "title": "Line Art",
      "description": "The scary part. Line art is a precision job and requires attention to brush size. I like to use line techniques to make it more pleasing to my eyes."
    },
    {
      "icon": "Palette",
      "title": "Base color and Render",
      "description": "That’s my favorite part. I try to study the mood of the artwork and pick colors that match — or I just choose what I like, heh. Then I do the rendering. I don’t have a fixed method yet; I’m still working on it."
    },
    {
      "icon": "Camera",
      "title": "Scene",
      "description": "Well, this part is a bit harder. I’m not a professional in scenery yet, so I keep things simple for now — but I plan to study scenes more in the future."
    },
    {
      "icon": "Zap",
      "title": "Signature",
      "description": "That’s also the funniest part for me. When I finish the artwork, I like to hide my signature in it, just to prove that I made that beautiful masterpiece… or at least a good drawing."
    }
  ],
  "ctaText": "Start Your Commission"
}
  if (artProcessConfig) {
    const existingArtProcess = await prisma.artProcessConfig.findFirst()
    if (!existingArtProcess) {
      await prisma.artProcessConfig.create({ data: artProcessConfig })
      console.log('✅ Art process config criado')
    } else {
      console.log('ℹ️  Art process config já existe')
    }
  }

  const contactConfig = {
  "email": "sweets.wppi@gmail.com",
  "phone": "",
  "location": "Brazil, Minas Gerais"
}
  if (contactConfig) {
    const existingContact = await prisma.contactConfig.findFirst()
    if (!existingContact) {
      await prisma.contactConfig.create({ data: contactConfig })
      console.log('✅ Contact config criado')
    } else {
      console.log('ℹ️  Contact config já existe')
    }
  }

  const socialLinks = [
  {
    "name": "sweet.wppi",
    "url": "https://www.instagram.com/sweet.wppi/",
    "icon": "Instagram",
    "order": 0
  }
]
  const existingSocialCount = await prisma.socialLink.count()
  if (existingSocialCount === 0 && socialLinks.length > 0) {
    await prisma.socialLink.createMany({ data: socialLinks })
    console.log('✅ ' + socialLinks.length + ' social links criados')
  } else {
    console.log('ℹ️  ' + existingSocialCount + ' social links já existem')
  }

  const footerConfig = null
  if (footerConfig) {
    const existingFooter = await prisma.footerConfig.findFirst()
    if (!existingFooter) {
      await prisma.footerConfig.create({ data: footerConfig })
      console.log('✅ Footer config criado')
    } else {
      console.log('ℹ️  Footer config já existe')
    }
  }

  const adBanners: Prisma.AdBannerCreateManyInput[] = []
  const existingBanners = await prisma.adBanner.count()
  if (existingBanners === 0 && adBanners.length > 0) {
    await prisma.adBanner.createMany({ data: adBanners })
    console.log('✅ ' + adBanners.length + ' ad banners criados')
  } else {
    console.log('ℹ️  ' + existingBanners + ' ad banners já existem')
  }

  console.log('🎉 Seed concluído com sucesso!')
}

export { main }

const isMainModule = typeof require !== 'undefined' && require.main === module

if (isMainModule) {
  main()
    .catch((e) => {
      console.error('❌ Erro no seed:', e)
      process.exit(1)
    })
    .finally(async () => {
      if (pool) {
        await pool.end()
      }
      await prisma.$disconnect()
    })
}
