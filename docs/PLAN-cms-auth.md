# PLAN: CMS & Admin Auth System (Detailed Execution)

> **Trạng thái**: 🔨 In Progress  
> **Stack**: NestJS · Prisma · MySQL · JWT (Access + Refresh Token) · Bit Flags Permissions

---

## 🎯 Project Overview

Xây dựng CMS backend chuẩn SEO với hệ thống xác thực Admin sử dụng **Bit Flags** thay vì Role Enum.
Hiện tại `schema.prisma` đang có `enum Role` — **Phase 1 sẽ migrate sang `permissions: Int`**.

**Pattern kiến trúc module** (theo chuẩn project):
```
modules/{name}/
├── admin/    → admin-{name}.controller.ts  → prefix: admin/{name}  (protected)
├── client/   → client-{name}.controller.ts → prefix: {name}        (public/user)
├── dto/      → shared DTOs
└── {name}.service.ts → shared service logic
```

---

## 🔐 Bit Flags Permission Design

```
PERM_READ    = 1  (0001) — Xem bài viết / danh mục / tags
PERM_WRITE   = 2  (0010) — Tạo bài viết / danh mục / tags
PERM_UPDATE  = 4  (0100) — Sửa bài viết / danh mục / tags
PERM_DELETE  = 8  (1000) — Xóa bài viết / danh mục / tags
PERM_ADMIN   = 15 (1111) — Full access (tất cả quyền)
```

**Kiểm tra**: `(user.permissions & PERM_DELETE) !== 0`  
**Seed account**: `admin@cms.com` / `Admin@123` → `permissions = 15`

---

## 🏗️ Database Schema (Prisma — Full)

### ⚠️ Breaking Change so với schema hiện tại

- **Xóa** `enum Role { SUPER_ADMIN, SITE_ADMIN, EDITOR }`
- **Xóa** field `role Role` trong `User`
- **Thêm** field `permissions Int @default(0)` vào `User`
- **Thêm** 4 models mới: `Category`, `Tag`, `Post`, `PostTag`

```prisma
// Users — thay role bằng permissions (Bit Flags)
model User {
  id           Int       @id @default(autoincrement()) @db.UnsignedInt
  email        String    @unique @db.VarChar(255)
  passwordHash String    @map("password_hash") @db.VarChar(255)
  fullName     String    @map("full_name") @db.VarChar(150)
  avatarUrl    String?   @map("avatar_url") @db.VarChar(500)
  permissions  Int       @default(0)  // Bit Flags: 1=READ, 2=WRITE, 4=UPDATE, 8=DELETE
  isActive     Boolean   @default(true) @map("is_active")
  lastLoginAt  DateTime? @map("last_login_at")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  refreshTokens RefreshToken[]
  posts         Post[]

  @@index([email])
  @@index([isActive])
  @@map("users")
}

// RefreshTokens — giữ nguyên
model RefreshToken {
  id        Int      @id @default(autoincrement()) @db.UnsignedInt
  userId    Int      @map("user_id") @db.UnsignedInt
  tokenHash String   @unique @map("token_hash") @db.VarChar(255)
  expiresAt DateTime @map("expires_at")
  ipAddress String?  @map("ip_address") @db.VarChar(45)
  userAgent String?  @map("user_agent") @db.VarChar(255)
  revoked   Boolean  @default(false)
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
  @@map("refresh_tokens")
}

// CMS: Categories
model Category {
  id              Int      @id @default(autoincrement()) @db.UnsignedInt
  name            String   @db.VarChar(150)
  slug            String   @unique @db.VarChar(200)
  description     String?  @db.Text
  metaTitle       String?  @map("meta_title") @db.VarChar(255)
  metaDescription String?  @map("meta_description") @db.VarChar(500)
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  posts Post[]

  @@index([slug])
  @@map("categories")
}

// CMS: Tags
model Tag {
  id        Int      @id @default(autoincrement()) @db.UnsignedInt
  name      String   @unique @db.VarChar(100)
  slug      String   @unique @db.VarChar(120)
  createdAt DateTime @default(now()) @map("created_at")

  postTags PostTag[]

  @@index([slug])
  @@map("tags")
}

// CMS: Posts
enum PostStatus {
  DRAFT
  PUBLISHED
}

model Post {
  id              Int        @id @default(autoincrement()) @db.UnsignedInt
  title           String     @db.VarChar(255)
  slug            String     @unique @db.VarChar(300)
  content         String     @db.LongText
  excerpt         String?    @db.VarChar(500)
  thumbnail       String?    @db.VarChar(500)
  status          PostStatus @default(DRAFT)
  publishedAt     DateTime?  @map("published_at")
  metaTitle       String?    @map("meta_title") @db.VarChar(255)
  metaDescription String?    @map("meta_description") @db.VarChar(500)
  metaThumbnail   String?    @map("meta_thumbnail") @db.VarChar(500)
  authorId        Int        @map("author_id") @db.UnsignedInt
  categoryId      Int?       @map("category_id") @db.UnsignedInt
  createdAt       DateTime   @default(now()) @map("created_at")
  updatedAt       DateTime   @updatedAt @map("updated_at")

  author   User      @relation(fields: [authorId], references: [id])
  category Category? @relation(fields: [categoryId], references: [id])
  postTags PostTag[]

  @@index([slug])
  @@index([status])
  @@index([categoryId])
  @@index([publishedAt])
  @@map("posts")
}

// Pivot Table
model PostTag {
  postId Int @map("post_id") @db.UnsignedInt
  tagId  Int @map("tag_id") @db.UnsignedInt

  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag  Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([postId, tagId])
  @@map("post_tags")
}
```

---

## 🛠️ Step-by-Step Task List

### Phase 1: Database Migration

- [ ] **Cập nhật `schema.prisma`**: xóa `enum Role`, thêm `permissions Int`, thêm 4 models CMS
- [ ] **Migration**: `npx prisma migrate dev --name migrate_bitflags_and_cms`
- [ ] **Tạo `src/common/constants/permissions.ts`**:
  ```ts
  export const PERM_READ   = 1
  export const PERM_WRITE  = 2
  export const PERM_UPDATE = 4
  export const PERM_DELETE = 8
  export const PERM_ADMIN  = 15
  ```
- [ ] **Seed** (`src/prisma/seed.ts`): tạo admin `admin@cms.com` / `Admin@123` / `permissions=15`

---

### Phase 2: Refactor Auth Module (Bit Flags)

> **Hiện trạng cần sửa:**
> - `AdminAuthService.login()` check `user.role === Role.SUPER_ADMIN` → đổi sang check `permissions`
> - `RolesGuard` + `roles.decorator.ts` dùng enum → thay bằng `PermissionsGuard` + `@RequirePermissions()`
> - `AdminAuthController` chỉ có `POST login` → thiếu `refresh` và `logout`
> - `AdminAuthService` chưa lưu `ipAddress` / `userAgent` khi tạo RefreshToken
> - `ClientAuthService` đã có `register` và `login` → cần xem lại payload JWT (đổi `role` → `permissions`)

#### Common (Guards & Decorators)

- [ ] **Xóa** `src/common/guards/roles.guard.ts`
- [ ] **Xóa** `src/common/decorators/roles.decorator.ts`
- [ ] **Tạo** `src/common/guards/permissions.guard.ts`:
  - Lấy required permission từ metadata
  - Check: `(user.permissions & requiredPermission) !== 0`
- [ ] **Tạo** `src/common/decorators/require-permissions.decorator.ts`:
  - `@RequirePermissions(PERM_DELETE)` → gắn lên route/controller

#### Auth Shared

- [ ] **Cập nhật `auth-core.service.ts`**: đổi payload `{ sub, email, role }` → `{ sub, email, permissions }`
- [ ] **Cập nhật `jwt.strategy.ts`**: đổi `role` → `permissions` trong user object
- [ ] **Cập nhật `refresh-token.strategy.ts`**: đổi `role` → `permissions`

#### Admin Auth (`modules/auth/admin/`)

- [ ] **Cập nhật `admin-auth.service.ts`**:
  - `login()`: đổi check → `(user.permissions & PERM_ADMIN) === PERM_ADMIN` (chỉ full-admin được login); lưu `ipAddress` + `userAgent`
  - **Thêm** `refreshToken(token: string)`: verify RT, tìm DB, revoke cũ, cấp cặp token mới
  - **Thêm** `logout(userId, token)`: tìm RefreshToken theo hash, set `revoked = true`
- [ ] **Tạo** `src/modules/auth/dto/refresh-token.dto.ts`
- [ ] **Cập nhật `admin-auth.controller.ts`**:
  - `POST admin/auth/login` — public
  - `POST admin/auth/refresh` — dùng `RefreshTokenGuard`
  - `POST admin/auth/logout` — dùng `JwtAuthGuard`

#### Client Auth (`modules/auth/client/`)

- [ ] **Xem lại `client-auth.service.ts`**: đảm bảo payload JWT dùng `permissions` (không còn `role`)
- [ ] **Xem lại `client-auth.controller.ts`**: đảm bảo không import gì từ `enum Role`

---

### Phase 3: Posts Module

**Cấu trúc**: `src/modules/posts/`

```
posts/
├── admin/
│   └── admin-posts.controller.ts   → prefix: admin/posts  (cần JwtAuthGuard + PermissionsGuard)
├── client/
│   └── client-posts.controller.ts  → prefix: posts        (public)
├── dto/
│   ├── create-post.dto.ts
│   └── update-post.dto.ts
└── posts.service.ts
```

**Admin routes** (`admin/posts`) — yêu cầu `JwtAuthGuard + @RequirePermissions(...)`:

| Method | Route | Permission | Mô tả |
|--------|-------|------------|-------|
| `POST` | `admin/posts` | `PERM_WRITE` | Tạo bài, liên kết categoryId + tagIds[] |
| `GET` | `admin/posts` | `PERM_READ` | Danh sách + pagination + filter (category, tag, status) |
| `GET` | `admin/posts/:id` | `PERM_READ` | Chi tiết theo ID |
| `PATCH` | `admin/posts/:id` | `PERM_UPDATE` | Cập nhật nội dung / status / SEO meta |
| `DELETE` | `admin/posts/:id` | `PERM_DELETE` | Xóa bài |

**Client routes** (`posts`) — public, chỉ trả PUBLISHED:

| Method | Route | Mô tả |
|--------|-------|-------|
| `GET` | `posts` | Danh sách bài PUBLISHED + pagination + filter |
| `GET` | `posts/s/:slug` | Chi tiết theo slug + category + tags + SEO metadata |

---

### Phase 4: Categories Module

**Cấu trúc**: `src/modules/categories/`

```
categories/
├── admin/
│   └── admin-categories.controller.ts  → prefix: admin/categories
├── client/
│   └── client-categories.controller.ts → prefix: categories
├── dto/
│   ├── create-category.dto.ts
│   └── update-category.dto.ts
└── categories.service.ts
```

**Admin routes** (`admin/categories`):

| Method | Route | Permission | Mô tả |
|--------|-------|------------|-------|
| `POST` | `admin/categories` | `PERM_WRITE` | Tạo, tự sinh slug, lưu SEO meta |
| `GET` | `admin/categories` | `PERM_READ` | Danh sách + count bài viết |
| `PATCH` | `admin/categories/:id` | `PERM_UPDATE` | Cập nhật |
| `DELETE` | `admin/categories/:id` | `PERM_DELETE` | Xóa |

**Client routes** (`categories`) — public:

| Method | Route | Mô tả |
|--------|-------|-------|
| `GET` | `categories` | Danh sách category |
| `GET` | `categories/s/:slug` | Chi tiết + danh sách bài PUBLISHED thuộc danh mục |

---

### Phase 5: Tags Module

**Cấu trúc**: `src/modules/tags/`

```
tags/
├── admin/
│   └── admin-tags.controller.ts   → prefix: admin/tags
├── client/
│   └── client-tags.controller.ts  → prefix: tags
├── dto/
│   ├── create-tag.dto.ts
│   └── update-tag.dto.ts
└── tags.service.ts
```

**Admin routes** (`admin/tags`):

| Method | Route | Permission | Mô tả |
|--------|-------|------------|-------|
| `POST` | `admin/tags` | `PERM_WRITE` | Tạo tag, tự sinh slug |
| `GET` | `admin/tags` | `PERM_READ` | Danh sách |
| `PATCH` | `admin/tags/:id` | `PERM_UPDATE` | Cập nhật |
| `DELETE` | `admin/tags/:id` | `PERM_DELETE` | Xóa |

**Client routes** (`tags`) — public:

| Method | Route | Mô tả |
|--------|-------|-------|
| `GET` | `tags` | Danh sách tất cả tags |

---

### Phase 6: Users Module (Update)

> Module `users` đã có skeleton — cần bổ sung và đổi sang Bit Flags.

**Admin routes** (`admin/users`) — `PERM_ADMIN`:

| Method | Route | Mô tả |
|--------|-------|-------|
| `POST` | `admin/users` | Tạo user mới, assign `permissions` |
| `GET` | `admin/users` | Danh sách *(đã có)* |
| `GET` | `admin/users/:id` | Chi tiết user |
| `PATCH` | `admin/users/:id` | Cập nhật thông tin + permissions |
| `DELETE` | `admin/users/:id` | Xóa (không cho xóa chính mình) |
| `PATCH` | `admin/users/:id/toggle-active` | Bật/tắt tài khoản |

**Client routes** (`users`) — `JwtAuthGuard`:

| Method | Route | Mô tả |
|--------|-------|-------|
| `GET` | `users/me` | Lấy profile *(đã có)* |
| `PATCH` | `users/me` | Cập nhật profile (fullName, avatarUrl) |

---

### Phase 7: Utilities & Slug

- [ ] **Tạo `src/utils/slug.util.ts`**:
  - Chuyển Unicode/Tiếng Việt → ASCII (xóa dấu)
  - Replace khoảng trắng → `-`, lowercase
  - Ví dụ: `"Hướng Dẫn NestJS"` → `"huong-dan-nestjs"`
  - Dùng chung cho Posts, Categories, Tags

---

### Phase 8: Security & Polish

- [ ] **Rate Limiting** (`@nestjs/throttler`): max 10 req/phút cho `POST admin/auth/login`
- [ ] **Swagger**: `@ApiTags`, `@ApiBearerAuth`, `@ApiOperation`, `@ApiResponse` cho tất cả controllers mới
- [ ] **ipAddress + userAgent**: lưu khi tạo RefreshToken trong `AdminAuthService.login()`
- [ ] **Sitemap** *(Optional)*: `GET /api/sitemap` → list `{ slug, updatedAt }` cho Posts + Categories

---

## 🧪 Verification & Final Checks

- [ ] **Bit Flags**: `permissions=3` (READ+WRITE) bị từ chối khi gọi `DELETE admin/posts/:id`
- [ ] **Revoke**: Refresh Token cũ sau `logout`/`refresh` phải trả `401` khi dùng lại
- [ ] **Slug unique**: Tạo 2 bài cùng tiêu đề → báo lỗi rõ ràng hoặc tự thêm suffix
- [ ] **SEO API**: `GET posts/s/:slug` trả đủ `metaTitle`, `metaDescription`, `metaThumbnail`
- [ ] **Rate Limit**: Gọi login > 10 lần/phút → `429 Too Many Requests`
- [ ] **Build clean**: `npm run lint && npm run build` không lỗi

---

## 📁 File Structure Sau Khi Hoàn Thành

```
src/
├── common/
│   ├── constants/
│   │   └── permissions.ts                      ← [NEW]
│   ├── decorators/
│   │   └── require-permissions.decorator.ts    ← [NEW] thay roles.decorator.ts
│   └── guards/
│       ├── jwt-auth.guard.ts                   ← giữ nguyên
│       └── permissions.guard.ts                ← [NEW] thay roles.guard.ts
├── modules/
│   ├── auth/
│   │   ├── admin/
│   │   │   ├── admin-auth.controller.ts        ← [UPDATE] thêm /refresh, /logout
│   │   │   └── admin-auth.service.ts           ← [UPDATE] login + refresh + logout
│   │   ├── client/
│   │   │   ├── client-auth.controller.ts       ← [UPDATE] đổi payload permissions
│   │   │   └── client-auth.service.ts          ← [UPDATE] đổi payload permissions
│   │   ├── shared/
│   │   │   ├── auth-core.service.ts            ← [UPDATE] payload: permissions
│   │   │   └── strategies/
│   │   │       ├── jwt.strategy.ts             ← [UPDATE]
│   │   │       └── refresh-token.strategy.ts   ← [UPDATE]
│   │   └── dto/
│   │       └── refresh-token.dto.ts            ← [NEW]
│   ├── posts/                                  ← [NEW MODULE]
│   │   ├── admin/
│   │   │   └── admin-posts.controller.ts
│   │   ├── client/
│   │   │   └── client-posts.controller.ts
│   │   ├── dto/
│   │   └── posts.service.ts
│   ├── categories/                             ← [NEW MODULE]
│   │   ├── admin/
│   │   │   └── admin-categories.controller.ts
│   │   ├── client/
│   │   │   └── client-categories.controller.ts
│   │   ├── dto/
│   │   └── categories.service.ts
│   ├── tags/                                   ← [NEW MODULE]
│   │   ├── admin/
│   │   │   └── admin-tags.controller.ts
│   │   ├── client/
│   │   │   └── client-tags.controller.ts
│   │   ├── dto/
│   │   └── tags.service.ts
│   └── users/
│       ├── admin/
│       │   └── admin-users.controller.ts       ← [UPDATE] full CRUD + toggle-active
│       ├── client/
│       │   └── client-users.controller.ts      ← [UPDATE] thêm PATCH /me
│       ├── dto/
│       └── users.service.ts                    ← [UPDATE] thêm methods
└── prisma/
    ├── schema.prisma                           ← [UPDATE] Bit Flags + CMS tables
    └── seed.ts                                 ← [NEW] seed admin user
```
