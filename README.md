# NestJS & React CMS Boilerplate

Một boilerplate chuyên nghiệp sử dụng **NestJS (Fastify)** làm backend API kết hợp với **React (Vite)** cho phần giao diện CMS. Dự án được thiết kế theo kiến trúc module sạch sẽ (Clean Modular Architecture), tối ưu hiệu năng và bảo mật.

---

## ✨ Tính năng nổi bật

- **⚡ Fastify Framework**: Sử dụng Fastify cho tốc độ xử lý nhanh hơn 2-3 lần so với Express truyền thống.
- **🏗️ Kiến trúc Module hóa**: Phân tách rõ ràng giữa `modules`, `common`, `config`, `prisma`, và `shared`.
- **🔐 Authentication & Security**:
  - Xác thực JWT kép (Access Token & Refresh Token).
  - Phân quyền theo vai trò (Admin/User) và quản lý Permission.
  - Decorator `@CurrentUser()` tùy chỉnh để lấy thông tin user một cách type-safe.
- **📦 Monorepo Workspace**: Quản lý Backend và Frontend (`/cms`) trong một repository duy nhất bằng **pnpm workspaces**.
- **🗃️ Prisma ORM**: 
  - Quản lý database MariaDB/MySQL.
  - **Soft Delete System**: Cơ chế xóa mềm hệ thống cho Post, User, Category, Tag (tự động lọc bản ghi đã xóa).
  - Hệ thống Seed dữ liệu mẫu mạnh mẽ với **Faker.js** (tự động tạo 100+ bài viết, danh mục, tags).
- **📝 CMS Content Management**: 
  - Quản lý bài viết với trạng thái **Scheduled Publishing** (hẹn giờ đăng bài).
  - **Pagination Engine**: Hệ thống phân trang đồng nhất (`limit=20`) cho tất cả Admin API.
- **📚 API Documentation**: Tích hợp **Scalar API Reference / Swagger** tại `/docs`.
- **🛠️ Developer Experience**:
  - **Path Aliases**: Sử dụng `~/` thay cho `../../` cho import code sạch hơn.
  - **Bitwise Permissions**: Hệ thống phân quyền nâng cao sử dụng Bit Flags (BigInt) cho hiệu năng tối ưu.
- **🎨 UI/UX**: Tích hợp React Vite được serve trực tiếp qua Fastify engine.

---

## 📂 Cấu trúc thư mục

```text
/
├── cms/                # Workspace riêng cho React Frontend (Vite)
│   ├── src/            # Mã nguồn giao diện CMS
│   └── package.json    # Quản lý dependencies cho Frontend
├── src/                # NestJS Backend API
│   ├── common/         # Decorators, Guards, Filters, Interceptors, Helpers (Pagination)
│   ├── modules/        # Các tính năng chính (Auth, Users, Posts, Categories, Tags)
│   ├── prisma/         # Prisma Module, Service, Schema, và Seed logic
│   ├── shared/         # Logic dùng chung giữa các module
│   └── views/          # Handlebars templates để load React app
├── pnpm-workspace.yaml # Cấu hình pnpm workspaces
└── package.json        # Cấu hình root, dependencies và scripts
```

---

## 🚀 Hướng dẫn cài đặt (Setup)

### Yêu cầu hệ thống
- **Node.js**: Phiên bản >= 20
- **Trình quản lý package**: `pnpm` (Bắt buộc)
- **Database**: MariaDB hoặc MySQL

### Các bước khởi chạy

1. **Clone dự án & Cài đặt dependencies**
   ```bash
   pnpm install
   ```

2. **Cấu hình môi trường (.env)**
   Sao chép tệp `.env.example` thành `.env` và cập nhật thông tin chuỗi kết nối Database.

3. **Quản lý Cơ sở dữ liệu (Prisma)**
   Chúng tôi đã chuẩn hóa các lệnh database qua tiền tố `db:`:
   ```bash
   pnpm db:gen      # Sinh mã Prisma Client
   pnpm db:push     # Đồng bộ schema trực tiếp (khuyên dùng cho PlanetScale/Dev)
   pnpm db:migrate  # Tạo và chạy migration
   pnpm db:seed     # Đổ dữ liệu mẫu (100 bài viết, 5 danh mục, 10 tags)
   pnpm db:reset    # Reset toàn bộ dữ liệu và chạy lại seed
   pnpm db:studio   # Mở giao diện quản lý DB trực quan
   ```

4. **Chạy dự án ở chế độ phát triển (Development)**
   Khởi chạy đồng thời NestJS API và Vite Dev Server:
   ```bash
   pnpm dev
   ```

---

## 🏗️ Build & Production

1. **Build toàn bộ dự án** (React CMS + NestJS Backend)
   ```bash
   pnpm build
   ```

2. **Chạy Production**
   ```bash
   pnpm start:prod
   ```

---

## 🔗 Các đường dẫn quan trọng (Endpoints)

Sau khi server khởi chạy (mặc định ở cổng `3000`):

- **API Documentation**: [http://localhost:3000/docs](http://localhost:3000/docs)
- **Giao diện CMS (Admin)**: [http://localhost:3000/cms](http://localhost:3000/cms)
- **Database Studio**: `pnpm db:studio`

---

## 🛠️ Công nghệ sử dụng

- **Backend**: NestJS, Fastify, Passport, JWT.
- **ORM**: Prisma.
- **Frontend**: React, Vite.
- **Tooling**: pnpm, Biome, Faker.js, Handlebars.
