# NestJS & React CMS Boilerplate

Một boilerplate chuyên nghiệp sử dụng **NestJS** làm backend API kết hợp với **React (Vite)** cho phần giao diện CMS. Dự án được thiết kế theo kiến trúc module sạch sẽ (Clean Modular Architecture), phân tách rõ ràng giữa Admin và Client.

## ✨ Tính năng nổi bật

- **Kiến trúc Module hóa**: Cấu trúc thư mục rõ ràng với `common`, `config`, `modules`, `prisma`, `resources`, và `views`.
- **Phân tách Admin/Client**: Tách biệt logic và controller cho Client API và Admin API.
- **Authentication**: Xác thực người dùng bằng JWT (Access Token & Refresh Token).
- **Phân quyền (RBAC)**: Quản lý quyền truy cập dựa trên vai trò (`admin`, `user`).
- **Tích hợp React + Vite**: Chạy song song và render trực tiếp ứng dụng React (CMS) thông qua Fastify view engine (Handlebars).
- **Prisma ORM**: Quản lý cơ sở dữ liệu mạnh mẽ, an toàn với MariaDB/MySQL.
- **Tài liệu API**: Tích hợp Scalar API Reference / Swagger (có sẵn tại endpoint `/docs`).
- **Bảo mật & Validate**: Sử dụng `bcrypt` để mã hóa mật khẩu và `class-validator` cho validation tự động.
- **Linting & Formatting**: Tích hợp Biome để đảm bảo chất lượng code và Prettier.

---

## 📂 Cấu trúc thư mục

```text
src/
├── common/         # Global guards, filters, interceptors, decorators
├── config/         # Cấu hình biến môi trường (.env)
├── modules/        # Chứa các tính năng chính của hệ thống
│   ├── auth/       # Xác thực người dùng (tách biệt Admin & Client)
│   ├── cms/        # Controller để phục vụ giao diện React CMS
│   └── users/      # Quản lý người dùng
├── prisma/         # Prisma Module, Service và schema database
├── resources/      # Source code Frontend
│   └── js/cms/     # Ứng dụng React chạy trên Vite
├── shared/         # Các service/module dùng chung (ví dụ: Vite Helper)
└── views/          # Handlebars templates (ví dụ: app.hbs để load Vite script)
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
   Lệnh này sẽ khởi chạy đồng thời **NestJS API** và **Vite Dev Server**.
   ```bash
   pnpm dev
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
