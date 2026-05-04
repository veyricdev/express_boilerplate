# Design System & Architecture Specification

Tài liệu này mô tả chi tiết về tư duy thiết kế, kiến trúc hệ thống và các tiêu chuẩn kỹ thuật được áp dụng trong dự án **NestJS & React CMS Boilerplate**.

---

## 🏗️ 1. Kiến trúc Hệ thống (Architecture)

### 1.1. Backend (NestJS)
Hệ thống được xây dựng theo mô hình **Modular Architecture** của NestJS kết hợp Fastify. Mỗi module (User, Post, Category,...) là một đơn vị độc lập chứa:
- **Controller**: Xử lý HTTP Request/Response.
- **Service**: Chứa logic nghiệp vụ (Business Logic).
- **DTO (Data Transfer Object)**: Định nghĩa cấu trúc dữ liệu đầu vào và validation (sử dụng zod hoặc class-validator).
- **Provider**: Các dependency được inject qua Constructor.

**Shared & Common Layers:**
- **Common**: Chứa các thành phần dùng chung cho toàn bộ ứng dụng như Decorators, Guards, Interceptors và Filters.
- **Shared**: Chứa các service dùng chung cho nhiều module nhưng không mang tính global.

### 1.2. Frontend (React)
Ứng dụng CMS được xây dựng trên **React 19** và **Vite** với cấu trúc thư mục rõ ràng:
- **`components/`**: Các UI components tái sử dụng (chủ yếu là Shadcn UI).
- **`layouts/`**: Layout chung của ứng dụng (Admin Layout, Auth Layout).
- **`pages/`**: Chứa nội dung chính của các màn hình tương ứng với route.
- **`hooks/`**: Custom React hooks.
- **`services/`**: Chứa các hàm gọi API (sử dụng Axios) và cấu hình liên quan.
- **`store/`**: Quản lý Global State.

**Core Stack:**
- **Routing**: `react-router` (v7) để quản lý luồng điều hướng, bao gồm bảo vệ các Private/Protected Routes.
- **Server State**: `@tanstack/react-query` (v5) để fetch, cache, và cập nhật dữ liệu từ API một cách tối ưu.
- **Client State**: `zustand` để quản lý các state cục bộ gọn nhẹ (ví dụ: sidebar open state).
- **Form & Validation**: `react-hook-form` kết hợp với `zod` schema validation.

---

## 🔐 2. Hệ thống Bảo mật & Phân quyền (Security & Auth)

### 2.1. JWT Strategy
- **Access Token**: Thời hạn ngắn (mặc định 1h), dùng để xác thực các request.
- **Refresh Token**: Thời hạn dài (mặc định 7 ngày), dùng để lấy Access Token mới.
- **Rotation**: Refresh Token sẽ bị thu hồi (revoked) sau khi sử dụng để ngăn chặn tấn công replay.

### 2.2. Bitwise Permissions (BigInt)
Thay vì sử dụng các chuỗi string hay bảng role trung gian phức tạp, dự án sử dụng **Bit Flags** trên một trường `BigInt`:
- Mỗi resource có 4 bit: `READ (1)`, `WRITE (2)`, `UPDATE (4)`, `DELETE (8)`.
- Ví dụ: Quyền quản lý Post hoàn toàn là `15` (1+2+4+8).
- Hiệu suất cực cao khi kiểm tra quyền bằng toán tử bitwise (`&`).

### 2.3. Security Headers
- Tích hợp **Helmet** cho Fastify.
- Cấu hình **Content Security Policy (CSP)** chặt chẽ.

---

## 🗃️ 3. Quản lý Dữ liệu (Data Management)

### 3.1. Database Convention
Dự án sử dụng **Prisma ORM**.
- **Naming**: Các model trong schema viết dưới dạng `PascalCase`.
- **Relations**: Thiết lập Foreign Keys và quan hệ chặt chẽ giữa các bảng để tối ưu truy vấn.

### 3.2. Soft Delete System
Sử dụng **Prisma Client Extensions** để can thiệp vào vòng đời của query:
- **Tự động lọc**: Mọi truy vấn `findMany`, `findFirst`, `count` đều tự động thêm điều kiện `deletedAt: null`.
- **Chuyển đổi Delete**: Lệnh `delete` được chuyển thành `update` để set trường `deletedAt`.
- **Bypass**: Cung cấp thuộc tính `prisma.unfiltered` để admin có thể truy cập dữ liệu đã xóa (thùng rác).

### 3.3. Audit Logs
Mọi thay đổi dữ liệu từ phía Admin đều được ghi lại thông qua `AuditLogInterceptor`:
- Lưu trữ: Người thực hiện, Hành động, Thực thể, ID thực thể, Dữ liệu cũ, Dữ liệu mới, IP, User Agent.

### 3.4. Global Settings (Hybrid)
Hệ thống cấu hình được chia thành hai luồng để đảm bảo an toàn và linh hoạt:
- **Core Settings (`isSystem: true`)**: Được seed từ mã nguồn, không thể xóa, chỉ có thể cập nhật giá trị.
- **Custom Settings (`isSystem: false`)**: Admin có thể tạo, chỉnh sửa và xóa qua giao diện CMS.
- **Caching**: Dữ liệu Settings ưu tiên lưu qua `ioredis` (Redis) giúp các Request cực kỳ nhanh, có cơ chế tự động xoay vòng (invalidate) khi có cập nhật.
- **Frontend Sync**: Sử dụng `Zustand` kết hợp Server Side Cache để khởi tạo initial data, tránh tình trạng Double-Fetching trên React Query.

---

## 🎨 4. Ngôn ngữ Thiết kế UI/UX (Frontend Design)

### 4.1. Triết lý Thiết kế (Design Philosophy)
Hướng tới sự **Sang trọng (Premium)** và **Hiện đại (Modern)**:
- **Giao diện**: Ưu tiên Dark Mode với hiệu ứng Glassmorphism.
- **Font chữ**: Sử dụng Font `@fontsource-variable/geist` hiện đại và tối ưu cho giao diện app.
- **Animation**: Dùng `framer-motion` cho các hiệu ứng chuyển động, hover mượt mà giúp giao diện sống động và có chiều sâu.

### 4.2. UI Framework & Design Tokens
- **CSS Framework**: **Tailwind CSS v4** cho tốc độ và khả năng tùy biến cao.
- **Component Library**: Xây dựng dựa trên **Shadcn UI** và **Radix UI** để đảm bảo khả năng truy cập (Accessibility) và tuỳ biến thiết kế triệt để.
- **Tiện ích UI**: Sử dụng `clsx` và `tailwind-merge` để nối chuỗi class động một cách gọn gàng.

### 4.3. Quản lý Trải nghiệm (UX)
- Mọi thao tác đều có Loading State rõ ràng (được quản lý tự động bởi React Query).
- Hệ thống thông báo **Toast Notification** tinh tế và nhanh gọn sử dụng thư viện `sonner`.

---

## 🛑 5. Quản lý Lỗi (Error Handling) & Logging

### 5.1. Backend (NestJS)
- **Response Chuẩn hóa**: Mọi response (thành công hay lỗi) đều đi qua hệ thống `TransformInterceptor` và `GlobalExceptionFilter` (nếu có) để trả về một cấu trúc JSON đồng nhất cho Frontend.
- **Logging**: Tích hợp thư viện `winston` và `winston-daily-rotate-file` để ghi log chi tiết các level (Info, Warn, Error) vào thư mục `/logs`, tự động xoay vòng file theo ngày để tránh quá tải dung lượng.

### 5.2. Frontend (React)
- **API Errors**: Xử lý tập trung qua Axios Interceptor để tự động trigger Refresh Token nếu hết hạn, hoặc hiển thị lỗi qua Toast notification.

---

## 🛠️ 6. Tiêu chuẩn Mã nguồn (Coding Standards) & Workflow

### 6.1. Coding Standards
- **Linter & Formatter**: 
  - Backend tích hợp **Biome** (`biome check`) cho tốc độ linting/formatting cực nhanh, cùng **Prettier** cho các file khác.
  - Strict mode của TypeScript được bật xuyên suốt.
- **Naming Conventions**:
  - Tên file/folder: `kebab-case` (vd: `post.controller.ts`, `auth-layout.tsx`).
  - Class, Component, Type, Interface: `PascalCase`.
  - Biến, Hàm: `camelCase`.

### 6.2. Workflow
1. **Phân tích**: Xác định yêu cầu và thiết kế Prisma Schema.
2. **Backend**: Tạo module, viết DTO, Service, Controller, Unit Test bằng **Jest**.
3. **Frontend**: Khởi tạo query fetch dữ liệu, viết custom hooks, thiết kế component theo Shadcn/Tailwind, gắn form (react-hook-form).
4. **Build/Deploy**: Tối ưu hoá với Vite (Frontend) và SWC Compiler (Backend).

---
*Tài liệu này được cập nhật liên tục theo sự phát triển của dự án.*
