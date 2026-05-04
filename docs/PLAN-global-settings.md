# PLAN: Quản lý Cấu hình Chung (Global Settings)

> **Task slug:** `global-settings`
> **Type:** FULLSTACK — WEB (Backend NestJS + Frontend React CMS)
> **Priority:** High
> **Từ checklist:** Feature Checklist #2

---

## 📋 Tổng quan

Xây dựng hệ thống **Global Settings** (Hybrid) cho phép Admin cấu hình linh hoạt các thông số của website (tên site, logo, SEO mặc định, v.v.) qua giao diện CMS mà không cần sửa code hay can thiệp file `.env`. 
Hệ thống kết hợp giữa Core Settings (không thể xóa) và Custom Settings (Admin tự định nghĩa thêm). Settings được lưu DB dạng Key-Value và được cache để tối ưu performance.

---

## ✅ Success Criteria

- [x] Admin có thể xem, chỉnh sửa, thêm mới và xóa (với custom settings) qua giao diện CMS.
- [x] Settings được nhóm theo tab: **Chung**, **SEO**, **Mạng xã hội**, **Email**, **Phân tích**, **Giao diện**.
- [x] Mỗi loại setting (`TEXT`, `BOOLEAN`, `IMAGE`, `JSON`) render đúng Form Control tương ứng.
- [x] API CRUD đầy đủ: `GET /settings`, `POST /admin/settings`, `PATCH /admin/settings/:key`, `DELETE /admin/settings/:key`, `PATCH /admin/settings/bulk`.
- [x] Settings được cache bằng Redis (ưu tiên) hoặc In-memory Map; bộ nhớ cache tự động invalidate khi cập nhật.
- [x] Zustand store trên Frontend nạp settings đồng bộ khi app khởi động mà không bị double-fetch.

---

## 🛠️ Tech Stack

| Layer | Công nghệ | Lý do |
|---|---|---|
| Backend Framework | NestJS 11 + Fastify | Đã có sẵn |
| ORM | Prisma 7 | Đã có sẵn |
| Cache | `@nestjs/cache-manager` (In-memory) | Nhẹ, không cần thêm Redis |
| Frontend | React 19 + Vite | Đã có sẵn |
| State | Zustand | Đã dùng cho auth store |
| Forms | react-hook-form + zod | Đã có sẵn |
| UI | Shadcn UI + Tailwind CSS v4 | Đã có sẵn |
| HTTP | Axios (qua `api.ts`) | Đã có sẵn |

---

## 📁 File Structure

```
# BACKEND
src/
└── modules/
    └── settings/                     [NEW module]
        ├── settings.module.ts
        ├── settings.controller.ts
        ├── settings.service.ts
        └── dto/
            └── update-settings.dto.ts

src/prisma/
└── schema.prisma                     [MODIFY - thêm model Setting]

# FRONTEND (CMS)
cms/src/
├── services/
│   └── setting.service.ts            [NEW]
├── store/
│   └── settings.ts                   [NEW Zustand store]
├── pages/
│   └── settings/                     [NEW page]
│       └── index.tsx
└── routes.tsx                        [MODIFY - thêm route /settings]
```

---

## 📊 Task Breakdown

### P0 — Nền tảng Database

#### Task 01 · Thêm Prisma Model `Setting`
- **Agent:** `database-architect` / `backend-specialist`
- **Skill:** `database-design`, `nestjs-best-practices`
- **Dependencies:** Không có
- **INPUT:** `schema.prisma` hiện tại
- **OUTPUT:** Thêm model `Setting` + Enum `SettingType` + Enum `SettingGroup` vào `schema.prisma`
- **VERIFY:** `pnpm db:migrate` chạy thành công, bảng `settings` xuất hiện trong DB.

```prisma
// Thêm vào schema.prisma

enum SettingType {
  TEXT
  BOOLEAN
  IMAGE
  JSON
}

enum SettingGroup {
  GENERAL
  SEO
  SOCIAL
  MAIL
  ANALYTICS
  THEME
}

model Setting {
  id          Int          @id @default(autoincrement()) @db.UnsignedInt
  key         String       @unique @db.VarChar(100)      // vd: "site_name"
  value       String?      @db.Text                       // lưu JSON.stringify nếu type = JSON
  type        SettingType  @default(TEXT)
  group       SettingGroup @default(GENERAL)
  label       String       @db.VarChar(150)               // label hiển thị trên UI
  description String?      @db.Text                       // Tooltip hiển thị gợi ý
  isSystem    Boolean      @default(false)                // Core setting không được xóa
  createdAt   DateTime     @default(now()) @map("created_at")
  updatedAt   DateTime     @updatedAt @map("updated_at")

  @@index([group])
  @@map("settings")
}
```

---

### P1 — Backend NestJS

#### Task 02 · Seed dữ liệu Settings mặc định
- **Agent:** `backend-specialist`
- **Skill:** `nestjs-best-practices`
- **Dependencies:** Task 01
- **INPUT:** Migration đã xong
- **OUTPUT:** File seed hoặc service `seedDefaultSettings()` chèn các key mặc định vào DB.
- **VERIFY:** Chạy `pnpm db:seed`, bảng `settings` có đầy đủ các key mặc định.

**Keys cần seed:**

| Group | Key | Type | Label |
|---|---|---|---|
| GENERAL | `site_name` | TEXT | Tên Website |
| GENERAL | `site_description` | TEXT | Mô tả ngắn |
| GENERAL | `site_logo` | IMAGE | Logo Website |
| GENERAL | `maintenance_mode` | BOOLEAN | Chế độ bảo trì |
| SEO | `default_seo_title` | TEXT | SEO Title mặc định |
| SEO | `default_seo_description` | TEXT | SEO Description mặc định |
| SEO | `default_seo_thumbnail` | IMAGE | SEO Thumbnail mặc định |
| SOCIAL | `social_facebook` | TEXT | URL Facebook |
| SOCIAL | `social_twitter` | TEXT | URL X (Twitter) |
| SOCIAL | `social_instagram` | TEXT | URL Instagram |

---

#### Task 03 · Xây dựng `SettingsModule` (Service + Controller)
- **Agent:** `backend-specialist`
- **Skill:** `nestjs-expert`, `nestjs-best-practices`
- **Dependencies:** Task 01, Task 02
- **INPUT:** Module users/ và posts/ làm tham chiếu cấu trúc.
- **OUTPUT:** `settings.module.ts`, `settings.service.ts`, `settings.controller.ts`, `dto/update-settings.dto.ts`
- **VERIFY:** Swagger docs hiển thị đầy đủ 2 endpoint. Gọi API bằng curl hoặc REST client thành công.

**API Contract:**

```
# Endpoint công khai (không cần auth) - frontend public có thể dùng
GET  /api/v1/settings              → Trả về mảng tất cả settings

# Endpoint Admin (yêu cầu JWT Admin)
PATCH /api/v1/admin/settings/bulk  → Body: { settings: [{key, value}] }
                                   → Cập nhật nhiều key cùng lúc
```

**Logic SettingsService:**

```typescript
// Pseudo-code của service
class SettingsService {
  // In-memory cache đơn giản
  private cache: Map<string, Setting> | null = null

  async getAll(): Promise<Setting[]> {
    if (this.cache) return Array.from(this.cache.values())
    const settings = await this.prisma.db.setting.findMany()
    this.cache = new Map(settings.map(s => [s.key, s]))
    return settings
  }

  async bulkUpdate(updates: {key: string, value: string}[]): Promise<void> {
    await Promise.all(
      updates.map(({ key, value }) =>
        this.prisma.db.setting.update({ where: { key }, data: { value } })
      )
    )
    this.cache = null // Invalidate cache
  }
}
```

---

#### Task 04 · Đăng ký SettingsModule vào AppModule
- **Agent:** `backend-specialist`
- **Skill:** `nestjs-best-practices`
- **Dependencies:** Task 03
- **INPUT:** `src/app.module.ts`
- **OUTPUT:** `SettingsModule` được import vào `AppModule`.
- **VERIFY:** `pnpm dev` không có lỗi khởi động.

---

### P2 — Frontend React CMS

#### Task 05 · Xây dựng `setting.service.ts` (API calls)
- **Agent:** `frontend-specialist`
- **Skill:** `frontend-developer`, `react-best-practices`
- **Dependencies:** Task 03
- **INPUT:** `cms/src/services/api.ts`, `cms/src/services/post.service.ts` (làm mẫu)
- **OUTPUT:** `cms/src/services/setting.service.ts` chứa hàm `getSettings()` và `bulkUpdateSettings()`.
- **VERIFY:** Import vào console test, gọi `getSettings()` trả về đúng mảng settings.

---

#### Task 06 · Tạo Zustand Store `settings.ts`
- **Agent:** `frontend-specialist`
- **Skill:** `react-patterns`, `react-best-practices`
- **Dependencies:** Task 05
- **INPUT:** `cms/src/store/auth.ts` (làm mẫu pattern Zustand)
- **OUTPUT:** `cms/src/store/settings.ts` chứa state `settings: Setting[]` + action `loadSettings()` + helper `getSettingValue(key)`.
- **VERIFY:** Store khởi động, `getSettingValue('site_name')` trả về đúng giá trị.

**Nạp settings khi app khởi động:**

```typescript
// Thêm vào cms/src/app.tsx (bên trong ProtectedRoute hoặc component khởi tạo)
// Đảm bảo settings luôn được fetch 1 lần duy nhất sau khi user đăng nhập.
```

---

#### Task 07 · Xây dựng trang `/settings` với UI đa tab
- **Agent:** `frontend-specialist`
- **Skill:** `frontend-design`, `ui-ux-pro-max`
- **Dependencies:** Task 05, Task 06
- **INPUT:** Pattern của trang `cms/src/pages/users/` làm tham chiếu.
- **OUTPUT:** `cms/src/pages/settings/index.tsx` hoàn chỉnh với 3 tab: General, SEO, Social.
- **VERIFY:** Trang render đúng, form load giá trị hiện tại từ store, bấm Save cập nhật API thành công.

**Thiết kế UI:**

```
Trang Settings:
┌─────────────────────────────────────────┐
│ ⚙️  Cấu hình hệ thống                  │
├──────────┬──────────────────────────────┤
│ General  │  [Tab content area]          │
│ SEO      │  - site_name: [Text Input]   │
│ Social   │  - site_logo: [Image picker] │
│          │  - maintenance: [Toggle]     │
│          │                              │
│          │       [💾 Lưu thay đổi]     │
└──────────┴──────────────────────────────┘
```

**Quy tắc render Form Control theo `type`:**
- `TEXT` → `<Input>` (Shadcn)
- `BOOLEAN` → `<Switch>` (Shadcn)
- `IMAGE` → `<Input>` hiển thị URL + preview ảnh nhỏ (tạm thời, sau tích hợp MediaPicker ở checklist #1)
- `JSON` → `<Textarea>` cho phép nhập JSON thô

---

#### Task 08 · Đăng ký Route `/settings` trong `routes.tsx`
- **Agent:** `frontend-specialist`
- **Skill:** `react-best-practices`
- **Dependencies:** Task 07
- **INPUT:** `cms/src/routes.tsx`
- **OUTPUT:** Thêm route `settings` vào AdminLayout children + thêm link vào Sidebar navigation.
- **VERIFY:** Truy cập `/cms/settings` render đúng trang. Link sidebar active state đúng.

---

## ⚡ Dependency Graph

```
Task 01 (Prisma Schema)
    │
    └──► Task 02 (Seed Data)
              │
              └──► Task 03 (NestJS Module)
                        │
                        └──► Task 04 (AppModule)
                        │
                        └──► Task 05 (Frontend Service)
                                  │
                                  └──► Task 06 (Zustand Store)
                                  │
                                  └──► Task 07 (Settings Page)
                                            │
                                            └──► Task 08 (Route)
```

---

## 🚀 Execution Order

| Giai đoạn | Tasks | Có thể song song? |
|---|---|---|
| Phase 1 - DB | Task 01 | Không |
| Phase 1 - Seed | Task 02 | Không (phụ thuộc 01) |
| Phase 2 - Backend | Task 03, Task 04 | Nối tiếp |
| Phase 3 - Frontend | Task 05, 06, 07, 08 | Task 05 + 06 song song được |

---

## ⚠️ Risk & Rollback

| Rủi ro | Xác suất | Biện pháp |
|---|---|---|
| Prisma Migration conflict | Thấp | Backup DB, chạy `pnpm db:reset` nếu fail |
| Cache stale sau update | Trung bình | Đảm bảo `bulkUpdate` luôn invalidate `this.cache = null` |
| Kiểu dữ liệu BOOLEAN không nhất quán | Trung bình | Chuẩn hóa: lưu `"true"`/`"false"` dạng string; parse ở frontend |

---

## 📋 Phase X: Verification Checklist

- [ ] `pnpm lint` — Không có lỗi Biome/TypeScript
- [ ] `pnpm build` — Backend và CMS build thành công
- [ ] API `GET /api/v1/settings` trả về 200 với đầy đủ keys mặc định
- [ ] API `PATCH /api/v1/admin/settings/bulk` cập nhật và invalidate cache đúng
- [ ] Trang `/cms/settings` render đúng 3 tab
- [ ] Form load đúng giá trị hiện tại từ DB
- [ ] Sau khi lưu, giá trị được cập nhật trên UI (không cần refresh trang)
- [ ] Route `/cms/settings` có trong Sidebar và active state đúng
