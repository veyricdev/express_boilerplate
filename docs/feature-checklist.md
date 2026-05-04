# Checklist Bổ sung & Nâng cấp Tính năng CMS (Chi tiết)

Tài liệu này lưu trữ danh sách các tính năng cần được phát triển để hoàn thiện hệ thống **NestJS & React CMS Boilerplate**, bao gồm phân rã chi tiết công việc cho cả Backend và Frontend.

---

## 🎯 Giai đoạn 1: Các Tính năng Cốt lõi Cần Bổ Sung (Priority: High)

### 1. Quản lý Thư viện Media (Media/File Manager)
Tính năng cho phép upload, lưu trữ, và tái sử dụng hình ảnh/tài liệu trong toàn bộ CMS thay vì upload rời rạc bằng cách paste URL.

- [ ] **Backend (NestJS & Prisma):**
  - [ ] Thêm Prisma Model `Media`: `id`, `url`, `fileName`, `mimeType`, `sizeBytes`, `altText`, `uploaderId` (liên kết khóa ngoại với `User`), `createdAt`.
  - [ ] Tích hợp provider lưu trữ: Cấu hình `Multer` (để lưu file local) hoặc tích hợp AWS S3 / Cloudinary.
  - [ ] Xây dựng `MediaController`: Cung cấp các API `POST /media/upload`, `GET /media` (có phân trang, filter theo loại file), `DELETE /media/:id`.
- [ ] **Frontend (React CMS):**
  - [ ] UI Component `MediaGallery`: Giao diện hiển thị danh sách ảnh dạng Grid/List, có thanh tìm kiếm và bộ lọc.
  - [ ] UI Component `MediaUploader`: Khu vực kéo thả file (Drag & Drop) tích hợp preview ảnh và hiển thị tiến trình upload (Progress bar).
  - [ ] **Tích hợp Input:** Xây dựng Component `MediaPicker`. Thay thế các ô nhập URL thông thường (như `avatarUrl` trong form User, `thumbnail` trong form Post) bằng nút "Chọn ảnh từ thư viện" sẽ bật popup `MediaGallery` lên.

### 2. Quản lý Cấu hình Chung (Global Settings)
Hệ thống cho phép Admin cấu hình linh hoạt các thông số của website mà không cần sửa code hay can thiệp file `.env`.

- [x] **Backend (NestJS & Prisma):**
  - [x] Thêm Prisma Model `Setting`: `id`, `key` (unique string, vd: `site_name`), `value` (chuỗi hoặc JSON), `type` (TEXT, BOOLEAN, JSON, IMAGE), `group` (GENERAL, SEO, SOCIAL).
  - [x] Xây dựng `SettingController`: Cung cấp API `GET /settings` và `PATCH /admin/settings/bulk` để cập nhật nhiều cấu hình cùng lúc.
  - [x] Tính năng Cache: **Tự động dùng Redis nếu `REDIS_URL` được set**, fallback sang in-memory Map nếu không có Redis.
- [x] **Frontend (React CMS):**
  - [x] Trang UI Quản trị Cấu hình: 3 tab (General, SEO, Social). Tùy `type` mà render Form Control phù hợp (Text input, Switch toggle, Image URL với preview).
  - [x] Global Store: Zustand store `useSettings` — tự động load khi vào Admin Layout, expose `getSetting()` và `getBoolean()`.
  - [x] Route `/settings` và link trong Sidebar.
- [x] ⚠️ **Cần thực hiện thủ công:** Đã cấu hình chạy `pnpm db:migrate` và seed `settings` qua file `seed.ts`.

### 3. Quản lý Vai trò (Roles & Groups)
Thay thế việc gán quyền Bitwise trực tiếp trên từng User bằng hệ thống Role, giúp quản trị viên quản lý phân quyền quy mô lớn dễ dàng hơn.

- [ ] **Backend (NestJS & Prisma):**
  - [ ] Thêm Prisma Model `Role`: `id`, `name` (vd: Admin, Editor, Viewer), `description`, `permissions` (trường BigInt chứa giá trị bitwise).
  - [ ] Cập nhật Prisma Model `User`: Thêm `roleId` (thay vì lưu `permissions` trực tiếp ở User).
  - [ ] Refactor Guard: Sửa đổi `PermissionsGuard` hiện tại để tính toán quyền bằng cách lookup từ Role của User.
  - [ ] Xây dựng `RoleController`: API CRUD cho bảng Role.
- [ ] **Frontend (React CMS):**
  - [ ] Trang Quản lý Role: Form tạo/sửa Role sẽ parse trường BigInt thành một ma trận Checkbox. Theo hàng dọc là Resource (Post, User, Category), hàng ngang là 4 quyền: Read, Write, Update, Delete.
  - [ ] Cập nhật Form User: Xóa ô nhập Bitwise tĩnh, thay bằng Select box thả xuống để chọn `Role`.

---

## 🚀 Giai đoạn 2: Nâng cấp CMS Mở rộng (Priority: Medium)

### 4. Quản lý Menu (Dynamic Navigation)
Cho phép Admin tự định nghĩa thanh điều hướng (Header/Footer) theo ý muốn để xuất ra cho Client App.

- [ ] **Backend:**
  - [ ] Prisma Model `Menu` (chứa vị trí hiển thị - vd: `HEADER_NAV`, `FOOTER_NAV`).
  - [ ] Prisma Model `MenuItem` (`id`, `menuId`, `parentId` cho đệ quy, `title`, `url`, `order`).
  - [ ] Xây dựng service để tự động nhóm dữ liệu thành cây (Tree structure) để trả về JSON dạng nested array.
- [ ] **Frontend:**
  - [ ] Xây dựng giao diện kéo thả (Sử dụng thư viện như `@dnd-kit`) để Admin có thể sắp xếp thứ tự và di chuyển menu con vào trong menu cha trực quan.

### 5. Lịch sử Phiên bản Bài viết (Post Revisions)
Theo dõi thay đổi nội dung của bài viết và cho phép tác giả hoàn tác nếu nhập sai.

- [ ] **Backend:**
  - [ ] Prisma Model `PostRevision`: `id`, `postId`, `title`, `content` (bản sao lưu), `authorId` (người sửa), `createdAt`.
  - [ ] Sửa đổi `PostService`: Mỗi lần gọi phương thức `update` thành công, nếu nội dung khác với bản cũ, tự động insert 1 record vào `PostRevision`.
  - [ ] API `GET /posts/:id/revisions` và API `POST /posts/:id/revisions/:revId/restore`.
- [ ] **Frontend:**
  - [ ] Trang sửa bài viết: Bổ sung Sidebar "Lịch sử phiên bản".
  - [ ] Tính năng Diff Viewer: Sử dụng thư viện như `react-diff-viewer` hiển thị cửa sổ so sánh bản nháp cũ và bản hiện tại (bôi đỏ/xanh text thay đổi) trước khi user bấm "Khôi phục".

### 6. Quản lý Trang tĩnh (Pages)
Tách biệt nội dung Bài viết dạng Blog với các Trang có nội dung cố định (Giới thiệu, Liên hệ, Chính sách).

- [ ] **Backend:** Không cần model mới. Thêm trường enum `type: 'POST' | 'PAGE'` vào bảng `Post` hiện tại. Trang tĩnh thì API không bắt buộc validate trường `categoryId` và `tags`.
- [ ] **Frontend:** Tạo một màn hình riêng ở Navigation tên là "Trang tĩnh". Dùng chung Form Component với Post nhưng ẩn đi cột Sidebar nhập Category và Tag.

---

## 🌟 Giai đoạn 3: Tương lai (Priority: Low)

### 7. Hệ thống Đa ngôn ngữ (i18n / Multilingual)
- [ ] **Cấu trúc Database:** Bóc tách các trường có khả năng dịch thuật (title, content, description) ra bảng Translation mới (`PostTranslation`). Bảng `Post` chỉ giữ meta chung (status, viewCount, authorId).
- [ ] **Backend API:** Hỗ trợ query params `?lang=vi` hoặc Header `Accept-Language` để truy xuất bản dịch tương ứng.
- [ ] **CMS UI:** Tích hợp tính năng Tab (Tiếng Anh | Tiếng Việt) ngay phía trên form soạn thảo để tác giả nhập nội dung tương ứng.

### 8. Thống kê & Báo cáo (Analytics Dashboard)
- [ ] **Backend:**
  - [ ] Tích hợp theo dõi lượt đọc (Thêm cột `viewCount` trong bảng Post hoặc bảng `PostView` chi tiết theo IP).
  - [ ] Viết API `/analytics/summary` trả về các chỉ số đếm bằng raw query (Group by thời gian, Sum total).
- [ ] **Frontend:**
  - [ ] Sử dụng thư viện `recharts` để vẽ biểu đồ đường biểu diễn sự tăng trưởng traffic trên Dashboard.
  - [ ] Hiển thị danh sách Top 5 bài viết được đọc nhiều nhất.
