# NestJS & React CMS Boilerplate

Một boilerplate chuyên nghiệp sử dụng **NestJS (Fastify)** làm backend API kết hợp với **React (Vite)** cho phần giao diện CMS. Dự án được thiết kế theo kiến trúc module sạch sẽ (Clean Modular Architecture), tối ưu hiệu năng và bảo mật.

---

## ✨ Tính năng nổi bật

- **⚡ Fastify Framework**: Sử dụng Fastify cho tốc độ xử lý nhanh hơn 2-3 lần so với Express truyền thống.
- **🏗️ Kiến trúc Module hóa**: Phân tách rõ ràng giữa `modules`, `common`, `config`, `prisma`, và `shared`.
- **🔐 Authentication & Security**:
  - Xác thực JWT kép (Access Token & Refresh Token) với cơ chế **Rotation**.
  - **Security Headers**: Tích hợp **Helmet** với cấu hình CSP chặt chẽ.
  - **CORS Configuration**: Quản lý danh sách domain cho phép qua biến môi trường `CORS_ORIGINS`.
- **📦 Monorepo Workspace**: Quản lý Backend và Frontend (`/cms`) trong một repository duy nhất bằng **pnpm workspaces**.
- **🗃️ Prisma ORM**: 
  - Quản lý database MariaDB/MySQL.
  - **Soft Delete System**: Tự động lọc bản ghi đã xóa, hỗ trợ `Restore` và `Hard Delete` cho Admin.
  - Hệ thống Seed dữ liệu mẫu mạnh mẽ với **Faker.js**.
- **📝 CMS & User Management**: 
  - Quản lý bài viết với trạng thái **Scheduled Publishing** (hẹn giờ đăng bài).
  - Quản lý người dùng nâng cao (Tạo mới, phân quyền, trạng thái hoạt động).
  - **Recruitment Module**: Quản lý tuyển dụng chuyên nghiệp (Jobs, Candidates, Departments).
  - **Contacts Module**: Tiếp nhận và quản lý thông tin liên hệ từ khách hàng.
  - **Hybrid Global Settings**: Quản lý cấu hình chung linh hoạt, chia thành Core Settings (cố định) và Custom Settings (tùy chỉnh), hỗ trợ đa dạng kiểu dữ liệu. Tối ưu caching với Redis hoặc In-memory.
- **🕵️ Audit Logging System**: 
  - Tự động ghi lại mọi thao tác thay đổi dữ liệu (`POST`, `PATCH`, `DELETE`) của Admin.
  - Xem lịch sử hoạt động, chi tiết dữ liệu cũ và mới, IP người thực hiện.
- **📚 API Documentation**: Tích hợp **Scalar API Reference / Swagger** tại `/docs`.
- **🛠️ Developer Experience**:
  - **Bitwise Permissions**: Hệ thống phân quyền nâng cao sử dụng Bit Flags (BigInt). Đặc biệt hỗ trợ cờ `isOwner` giúp bypass mọi kiểm tra quyền cho tài khoản quản trị tối cao.
  - **Unified Pagination**: Engine phân trang đồng nhất cho toàn bộ hệ thống Admin, hỗ trợ thay đổi số bản ghi mỗi trang.

---

## 📂 Cấu trúc thư mục

```text
/
├── cms/                # Workspace riêng cho React Frontend (Vite)
├── src/                # NestJS Backend API
│   ├── common/         # Decorators, Guards, Filters, Interceptors, Helpers
│   ├── config/         # Cấu hình hệ thống & Validation môi trường
│   ├── modules/        # Các tính năng (Auth, Users, Posts, Recruitment, Contacts,...)
│   ├── prisma/         # Prisma Module, Service, Schema, và Seed logic
│   └── shared/         # Logic dùng chung & Vite Integration
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
   Sao chép tệp `.env.example` thành `.env` và cập nhật các thông tin:
   - `DATABASE_URL`: Kết nối DB.
   - `JWT_SECRET` & `JWT_REFRESH_SECRET`: Khóa bảo mật.
   - `CORS_ORIGINS`: Danh sách domain (cách nhau bởi dấu phẩy).

3. **Quản lý Cơ sở dữ liệu (Prisma)**
   ```bash
   pnpm db:gen      # Sinh mã Prisma Client
   pnpm db:migrate  # Tạo và chạy migration
   pnpm db:seed     # Đổ dữ liệu mẫu
   pnpm db:studio   # Giao diện quản lý DB trực quan
   ```

4. **Chạy dự án ở chế độ phát triển (Development)**
   ```bash
   pnpm dev
   ```

---
## 🐳 Triển khai với Docker (Production)

Dự án đã được tối ưu hóa Multi-stage Build cho Docker, giúp dung lượng image siêu nhẹ và loại bỏ hoàn toàn các package thừa của frontend ở runtime.

### 1. Build Docker Image
```bash
docker build -t nest-react-app .
```

### 2. Cấu hình biến môi trường
Tạo file `.env` (nếu chưa có). **Lưu ý quan trọng khi dùng Docker:**
- **Không dùng dấu ngoặc kép** `""` để bọc giá trị các biến (ví dụ: `REDIS_URL=rediss://...` thay vì `REDIS_URL="rediss://..."`). Docker `--env-file` không tự loại bỏ dấu ngoặc kép, sẽ gây lỗi Invalid URL.
- Nếu Database/Redis nằm ở máy Host (máy thật của bạn) chứ không phải trong container, bạn **không thể dùng `localhost` hay `127.0.0.1`**. Hãy đổi thành IP của máy thật (thường là `172.17.0.1` trên Linux) hoặc dùng `host.docker.internal` (trên Windows/Mac).
  Ví dụ: `DATABASE_URL=mysql://root:@172.17.0.1:3306/nest_boilerplate`

### 3. Chạy Container
```bash
docker run -d -p 3000:3000 --env-file .env --restart unless-stopped --name nest-react-app nest-react-app
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
- **Security**: Helmet, CORS.
- **Tooling**: pnpm, Biome, Faker.js, Handlebars.
