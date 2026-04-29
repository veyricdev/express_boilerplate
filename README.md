# NestJS & React CMS Boilerplate

Một boilerplate chuyên nghiệp sử dụng **NestJS** làm backend API kết hợp với **React (Vite)** cho phần giao diện CMS. Dự án được thiết kế theo kiến trúc module sạch sẽ (Clean Modular Architecture), phân tách rõ ràng giữa Admin và Client.

## ✨ Tính năng nổi bật

- **Kiến trúc Module hóa**: Cấu trúc thư mục rõ ràng với `modules`, `common`, `config`, `prisma`, và `shared`.
- **Phân tách Admin/Client**: Tách biệt logic và controller cho Client API và Admin API.
- **Monorepo Workspace**: Sử dụng **pnpm workspaces** để tách biệt dependencies giữa Backend (NestJS) và Frontend (React CMS).
- **Authentication**: Xác thực người dùng bằng JWT (Access Token & Refresh Token).
- **Phân quyền (RBAC)**: Quản lý quyền truy cập dựa trên vai trò (`admin`, `user`).
- **Tích hợp React + Vite**: Serve ứng dụng React thông qua Fastify view engine, cho phép chạy song song API và Frontend trên cùng một cổng.
- **Prisma ORM**: Quản lý cơ sở dữ liệu mạnh mẽ, an toàn với MariaDB/MySQL.
- **Tài liệu API**: Tích hợp Scalar API Reference / Swagger (có sẵn tại endpoint `/docs`).
- **Bảo mật & Validate**: Sử dụng `bcrypt` để mã hóa mật khẩu và `class-validator` cho validation tự động.
- **Linting & Formatting**: Tích hợp Biome để đảm bảo chất lượng code.

---

## 📂 Cấu trúc thư mục

```text
/
├── cms/                # Workspace riêng cho React Frontend (Vite)
│   ├── src/            # Mã nguồn giao diện CMS
│   └── package.json    # Quản lý dependencies cho Frontend
├── src/                # NestJS Backend API
│   ├── common/         # Global guards, filters, interceptors, decorators
│   ├── config/         # Cấu hình biến môi trường (.env)
│   ├── modules/        # Chứa các tính năng chính (Auth, Users, CMS Controller)
│   ├── prisma/         # Prisma Module và Service
│   ├── shared/         # Các logic dùng chung (Vite Helper)
│   └── views/          # Handlebars templates để load React app
├── prisma/             # Schema database và migrations
├── pnpm-workspace.yaml # Cấu hình pnpm workspaces
└── package.json        # Cấu hình root và dependencies cho Backend
```

---

## 🚀 Hướng dẫn cài đặt (Setup)

### Yêu cầu hệ thống
- **Node.js**: Phiên bản >= 20
- **Trình quản lý package**: `pnpm` (Khuyên dùng) hoặc `npm`/`yarn`
- **Database**: MariaDB hoặc MySQL

### Các bước khởi chạy

1. **Clone dự án & Cài đặt dependencies**
   ```bash
   pnpm install
   ```

2. **Cấu hình môi trường (.env)**
   Sao chép tệp `.env.example` thành `.env` và cập nhật thông tin chuỗi kết nối Database.
   ```bash
   cp .env.example .env
   ```

3. **Thiết lập Cơ sở dữ liệu (Prisma)**
   Tạo schema và cập nhật Prisma client:
   ```bash
   pnpm prisma:generate      # Sinh mã Prisma Client
   pnpm prisma:migrate-init  # (Chỉ dùng lần đầu) Khởi tạo database
   # Hoặc
   pnpm prisma:migrate       # Cập nhật schema nếu có thay đổi
   ```

4. **Chạy dự án ở chế độ phát triển (Development)**
   Lệnh này sẽ khởi chạy đồng thời **NestJS API** và **Vite Dev Server** (trong workspace `cms`).
   ```bash
   pnpm dev
   ```

5. **Quản lý Dependencies trong Workspace**
   - Thêm package cho **Backend**: `pnpm add <tên-package>` (chạy ở thư mục gốc).
- Thêm package cho **Frontend**: `pnpm --filter cms add <tên-package>`.

---

## 🏗️ Build & Production

Để build và chạy dự án ở môi trường Production:

1. **Build toàn bộ dự án**
   Lệnh này sẽ build ứng dụng React (vào thư mục `public/build`) và NestJS (vào thư mục `dist`).
   ```bash
   pnpm build
   ```

2. **Chạy Production**
   ```bash
   pnpm start:prod
   ```

---

## 🔗 Các đường dẫn quan trọng (Endpoints)

Sau khi server khởi chạy (mặc định ở cổng `3000`), bạn có thể truy cập:

- **API Documentation (Scalar/Swagger)**: [http://localhost:3000/docs](http://localhost:3000/docs)
- **Giao diện quản trị CMS (React)**: [http://localhost:3000/cms](http://localhost:3000/cms)

---

## 👥 Quản lý Role (Vai trò)

- `user`: Role mặc định khi người dùng đăng ký tài khoản qua API client.
- `admin`: Role quản trị viên. Việc cấp quyền admin hiện tại cần được thực hiện qua Database (Prisma Studio) hoặc thông qua tính năng cấp quyền riêng biệt của Admin API.
