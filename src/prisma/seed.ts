import 'dotenv/config'
import { faker } from '@faker-js/faker'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import * as bcrypt from 'bcrypt'
import { PERM_ADMIN } from '../common/constants/permissions'
import { PostStatus, PrismaClient } from './generated/prisma'

const adapter = new PrismaMariaDb(process.env.DATABASE_URL || '')

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting seed...')

  // 1. Owner User (super admin, bypasses all permission checks)
  const passwordHash = await bcrypt.hash('Admin@123', 10)
  const owner = await prisma.user.upsert({
    where: { email: 'owner@cms.com' },
    update: {
      passwordHash,
      isOwner: true,
      isActive: true,
    },
    create: {
      email: 'owner@cms.com',
      username: 'owner',
      passwordHash,
      fullName: 'System Owner',
      permissions: 0n,
      isOwner: true,
      isActive: true,
    },
  })
  console.log('✅ Owner user created/updated')

  // 2. Admin User (regular admin with bit-flag permissions)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cms.com' },
    update: {
      passwordHash,
      permissions: PERM_ADMIN,
      isActive: true,
    },
    create: {
      email: 'admin@cms.com',
      username: 'admin',
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

  // 5. Global Settings
  const defaultSettings = [
    // GENERAL
    {
      key: 'site_name',
      label: 'Tên Website',
      description: 'Tên chính của website, hiển thị ở tiêu đề và các vị trí nổi bật',
      type: 'TEXT' as const,
      group: 'GENERAL' as const,
      value: 'NEST CMS',
      isSystem: true,
    },
    {
      key: 'site_description',
      label: 'Mô tả ngắn',
      description: 'Mô tả chung về website (hiển thị footer, giới thiệu)',
      type: 'TEXT' as const,
      group: 'GENERAL' as const,
      value: 'A powerful CMS built with NestJS & React',
      isSystem: true,
    },
    {
      key: 'site_logo',
      label: 'Logo Website',
      description: 'Logo chính (nên dùng nền trong suốt PNG/SVG)',
      type: 'IMAGE' as const,
      group: 'GENERAL' as const,
      value: null,
      isSystem: true,
    },
    {
      key: 'site_favicon',
      label: 'Favicon',
      description: 'Biểu tượng nhỏ hiển thị trên tab trình duyệt (kích thước chuẩn 32x32 hoặc 64x64)',
      type: 'IMAGE' as const,
      group: 'GENERAL' as const,
      value: null,
      isSystem: true,
    },
    {
      key: 'maintenance_mode',
      label: 'Chế độ bảo trì',
      description: 'Bật chế độ bảo trì. Người dùng bình thường sẽ thấy trang thông báo bảo trì',
      type: 'BOOLEAN' as const,
      group: 'GENERAL' as const,
      value: 'false',
      isSystem: true,
    },

    // SEO
    {
      key: 'seo_default_title',
      label: 'SEO Title mặc định',
      description: 'Tiêu đề mặc định nếu trang không được thiết lập tiêu đề riêng',
      type: 'TEXT' as const,
      group: 'SEO' as const,
      value: 'NEST CMS - Content Management System',
      isSystem: true,
    },
    {
      key: 'seo_default_description',
      label: 'SEO Description mặc định',
      description: 'Mô tả ngắn gọn dành cho các công cụ tìm kiếm',
      type: 'TEXT' as const,
      group: 'SEO' as const,
      value: 'Nền tảng quản trị nội dung mạnh mẽ, tối ưu hóa cho tốc độ và khả năng mở rộng.',
      isSystem: true,
    },
    {
      key: 'seo_default_keywords',
      label: 'SEO Keywords',
      description: 'Các từ khóa chính của website (cách nhau bằng dấu phẩy)',
      type: 'TEXT' as const,
      group: 'SEO' as const,
      value: 'cms, nestjs, react, admin',
      isSystem: true,
    },
    {
      key: 'seo_default_og_image',
      label: 'OG Image mặc định',
      description: 'Hình ảnh hiển thị khi chia sẻ link lên mạng xã hội (Facebook, Zalo...)',
      type: 'IMAGE' as const,
      group: 'SEO' as const,
      value: null,
      isSystem: true,
    },

    // SOCIAL
    {
      key: 'social_facebook',
      label: 'URL Facebook',
      description: 'Đường dẫn đến trang Fanpage hoặc trang cá nhân Facebook',
      type: 'TEXT' as const,
      group: 'SOCIAL' as const,
      value: '',
      isSystem: true,
    },
    {
      key: 'social_twitter',
      label: 'URL X (Twitter)',
      description: 'Đường dẫn đến hồ sơ X (Twitter)',
      type: 'TEXT' as const,
      group: 'SOCIAL' as const,
      value: '',
      isSystem: true,
    },
    {
      key: 'social_instagram',
      label: 'URL Instagram',
      description: 'Đường dẫn đến hồ sơ Instagram',
      type: 'TEXT' as const,
      group: 'SOCIAL' as const,
      value: '',
      isSystem: true,
    },
    {
      key: 'social_linkedin',
      label: 'URL LinkedIn',
      description: 'Đường dẫn đến hồ sơ công ty trên LinkedIn',
      type: 'TEXT' as const,
      group: 'SOCIAL' as const,
      value: '',
      isSystem: true,
    },
    {
      key: 'social_youtube',
      label: 'URL Youtube',
      description: 'Đường dẫn đến kênh Youtube',
      type: 'TEXT' as const,
      group: 'SOCIAL' as const,
      value: '',
      isSystem: true,
    },

    // MAIL (SMTP)
    {
      key: 'smtp_host',
      label: 'SMTP Host',
      description: 'Địa chỉ máy chủ gửi email (VD: smtp.gmail.com)',
      type: 'TEXT' as const,
      group: 'MAIL' as const,
      value: '',
      isSystem: true,
    },
    {
      key: 'smtp_port',
      label: 'SMTP Port',
      description: 'Cổng kết nối SMTP (thường là 465, 587)',
      type: 'TEXT' as const,
      group: 'MAIL' as const,
      value: '587',
      isSystem: true,
    },
    {
      key: 'smtp_user',
      label: 'SMTP User',
      description: 'Tên đăng nhập hoặc địa chỉ email gửi đi',
      type: 'TEXT' as const,
      group: 'MAIL' as const,
      value: '',
      isSystem: true,
    },
    {
      key: 'smtp_from_address',
      label: 'From Address',
      description: 'Địa chỉ người gửi mặc định (VD: noreply@domain.com)',
      type: 'TEXT' as const,
      group: 'MAIL' as const,
      value: '',
      isSystem: true,
    },

    // ANALYTICS
    {
      key: 'analytics_ga_id',
      label: 'Google Analytics ID',
      description: 'Mã theo dõi Google Analytics (Định dạng: G-XXXXXXXXXX)',
      type: 'TEXT' as const,
      group: 'ANALYTICS' as const,
      value: '',
      isSystem: true,
    },
    {
      key: 'analytics_fb_pixel',
      label: 'Facebook Pixel ID',
      description: 'Mã Facebook Pixel dùng để theo dõi chuyển đổi',
      type: 'TEXT' as const,
      group: 'ANALYTICS' as const,
      value: '',
      isSystem: true,
    },

    // THEME
    {
      key: 'theme_primary_color',
      label: 'Màu chủ đạo (Primary Color)',
      description: 'Mã màu Hex cho các thành phần chính (VD: #3b82f6)',
      type: 'TEXT' as const,
      group: 'THEME' as const,
      value: '#0f172a',
      isSystem: true,
    },
    {
      key: 'theme_font_family',
      label: 'Font Family',
      description: 'Tên font chữ chính sử dụng trên website (VD: Inter, Roboto)',
      type: 'TEXT' as const,
      group: 'THEME' as const,
      value: 'Inter',
      isSystem: true,
    },
    {
      key: 'theme_default_dark_mode',
      label: 'Dark Mode mặc định',
      description: 'Website hiển thị giao diện tối mặc định khi truy cập lần đầu',
      type: 'BOOLEAN' as const,
      group: 'THEME' as const,
      value: 'false',
      isSystem: true,
    },
  ]
  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      create: setting,
      update: {},
    })
  }
  console.log('✅ Default settings seeded')

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
