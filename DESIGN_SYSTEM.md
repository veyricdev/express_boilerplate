# Design System & Architecture Specification

Tài liệu này mô tả chi tiết về tư duy thiết kế, kiến trúc hệ thống và các tiêu chuẩn kỹ thuật được áp dụng trong dự án **NestJS & React CMS Boilerplate**.

---

## 🏗️ 1. Kiến trúc Hệ thống (Architecture)

### 1.1. Modular Design
Hệ thống được xây dựng theo mô hình **Modular Architecture** của NestJS. Mỗi module (User, Post, Category,...) là một đơn vị độc lập chứa:
- **Controller**: Xử lý HTTP Request/Response.
- **Service**: Chứa logic nghiệp vụ (Business Logic).
- **DTO (Data Transfer Object)**: Định nghĩa cấu trúc dữ liệu đầu vào và validation.
- **Provider**: Các dependency được inject qua Constructor.

### 1.2. Shared & Common Layers
- **Common**: Chứa các thành phần dùng chung cho toàn bộ ứng dụng như Decorators, Guards, Interceptors và Filters.
- **Shared**: Chứa các service dùng chung cho nhiều module nhưng không mang tính global (ví dụ: ViteService).

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
- Cấu hình **Content Security Policy (CSP)** chặt chẽ, chỉ cho phép các nguồn tin cậy (CDN của CKEditor, Google Fonts, v.v.).

---

## 🗃️ 3. Quản lý Dữ liệu (Data Management)

### 3.1. Soft Delete System
Sử dụng **Prisma Client Extensions** để can thiệp vào vòng đời của query:
- **Tự động lọc**: Mọi truy vấn `findMany`, `findFirst`, `count` đều tự động thêm điều kiện `deletedAt: null`.
- **Chuyển đổi Delete**: Lệnh `delete` được chuyển thành `update` để set trường `deletedAt`.
- **Bypass**: Cung cấp thuộc tính `prisma.unfiltered` để admin có thể truy cập dữ liệu đã xóa (thùng rác).

### 3.2. Audit Logs
Mọi thay đổi dữ liệu từ phía Admin đều được ghi lại thông qua `AuditLogInterceptor`:
- Lưu trữ: Người thực hiện, Hành động, Thực thể, ID thực thể, Dữ liệu cũ, Dữ liệu mới, IP, User Agent.

---

## 🎨 4. Ngôn ngữ Thiết kế UI/UX (Frontend Design)

### 4.1. Triết lý Thiết kế (Design Philosophy)
Hướng tới sự **Sang trọng (Premium)** và **Hiện đại (Modern)**:
- **Giao diện**: Ưu tiên Dark Mode với hiệu ứng Glassmorphism.
- **Màu sắc**: Sử dụng các tông màu rực rỡ (Vibrant) nhưng hài hòa, tránh các màu cơ bản nhàm chán.
- **Typography**: Sử dụng font chữ hiện đại từ Google Fonts (Inter, Outfit).

### 4.2. Trải nghiệm Người dùng
- **Micro-animations**: Các hiệu ứng hover, transition mượt mà giúp giao diện sống động.
- **Responsive**: Tối ưu hóa cho mọi thiết bị (Desktop, Tablet, Mobile).
- **Unified Feedback**: Mọi phản hồi từ API đều được chuẩn hóa qua `TransformInterceptor`.

---

## 🛠️ 5. Quy trình Phát triển (Workflow)

1. **Phân tích**: Xác định yêu cầu và thiết kế Schema.
2. **Triển khai Backend**: Tạo Module, Schema, DTO, Service, Controller.
3. **Kiểm thử**: Chạy Unit Test và kiểm tra Swagger docs.
4. **Tích hợp Frontend**: Xây dựng UI bằng React và kết nối API.
5. **Đóng gói**: Build và tối ưu hóa bundle size.

---
*Tài liệu này được cập nhật liên tục theo sự phát triển của dự án.*
