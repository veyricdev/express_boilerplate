import 'dotenv/config'
import { faker } from '@faker-js/faker'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import * as bcrypt from 'bcrypt'
import { PERM_ADMIN } from '../common/constants/permissions'
import { PostStatus, PrismaClient } from './generated/prisma'

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '3306', 10),
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'nest_boilerplate',
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting seed...')

  // 1. Admin User
  const passwordHash = await bcrypt.hash('Admin@123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cms.com' },
    update: {
      passwordHash,
      permissions: PERM_ADMIN,
      isActive: true,
    },
    create: {
      email: 'admin@cms.com',
      passwordHash,
      fullName: 'System Administrator',
      permissions: PERM_ADMIN,
      isActive: true,
    },
  })
  console.log('✅ Admin user created/updated')

  // 2. Categories (5)
  const categories = []
  const categoryNames = ['Technology', 'Lifestyle', 'Health', 'Business', 'Entertainment']
  for (const name of categoryNames) {
    const cat = await prisma.category.upsert({
      where: { slug: faker.helpers.slugify(name).toLowerCase() },
      update: {},
      create: {
        name,
        slug: faker.helpers.slugify(name).toLowerCase(),
        description: faker.lorem.sentence(),
      },
    })
    categories.push(cat)
  }
  console.log(`✅ ${categories.length} categories created/updated`)

  // 3. Tags (10)
  const tags = []
  for (let i = 0; i < 10; i++) {
    const name = faker.commerce.productAdjective() + i
    const tag = await prisma.tag.upsert({
      where: { slug: faker.helpers.slugify(name).toLowerCase() },
      update: {},
      create: {
        name,
        slug: faker.helpers.slugify(name).toLowerCase(),
      },
    })
    tags.push(tag)
  }
  console.log(`✅ ${tags.length} tags created/updated`)

  // 4. Posts (100)
  console.log('⏳ Generating 100 posts...')
  for (let i = 0; i < 100; i++) {
    const title = faker.lorem.sentence()
    const randomCategory = faker.helpers.arrayElement(categories)
    const randomTags = faker.helpers.arrayElements(tags, { min: 1, max: 3 })

    const status = faker.helpers.arrayElement([PostStatus.PUBLISHED, PostStatus.DRAFT])
    const publishedAt = status === PostStatus.PUBLISHED ? faker.date.past() : null

    await prisma.post.create({
      data: {
        title,
        slug: `${faker.helpers.slugify(title).toLowerCase()}-${i}`,
        content: faker.lorem.paragraphs(3),
        excerpt: faker.lorem.sentence(),
        status,
        publishedAt,
        authorId: admin.id,
        categoryId: randomCategory.id,
        postTags: {
          create: randomTags.map((t) => ({ tagId: t.id })),
        },
      },
    })
  }
  console.log('✅ 100 posts created')
  console.log('🏁 Seed completed successfully')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
