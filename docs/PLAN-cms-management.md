# Kế hoạch triển khai CMS Management Pages

Xây dựng giao diện quản trị (CMS) chuyên nghiệp cho dự án NestJS & React Boilerplate, tập trung vào trải nghiệm UI/UX cao cấp (Premium), sử dụng Tailwind CSS và shadcn/ui.

## User Review Required

> [!IMPORTANT]
> **Tech Stack & Libraries**: 
> - **State Management**: Zustand (Client state), TanStack Query (Server state).
> - **Form Handling**: React Hook Form + Zod.
> - **Rich Text**: CKEditor 5 (tích hợp theo DESIGN_SYSTEM.md).
> - **Icons**: Lucide React.
> - **Auth Storage**: JWT stored in HttpOnly Cookies (Backend handled) & User profile in Zustand.

> [!NOTE]
> **Thiết kế**: Mặc định sử dụng **Dark Mode** làm chủ đạo với hiệu ứng **Glassmorphism** (backdrop-blur, border-white/10).

## Proposed Changes

Hệ thống sẽ được xây dựng trong thư mục `cms/`.

### 🛠️ Phase 1: Foundation & Setup
Thiết lập môi trường và các thành phần cốt lõi.

#### [MODIFY] [package.json](file:///e:/projects/self/nest-react-boilerplate/cms/package.json)
- Cài đặt Tailwind CSS, PostCSS, Autoprefixer.
- Cài đặt shadcn/ui dependencies (lucide-react, radix-ui, clsx, tailwind-merge).
- Cài đặt TanStack Query, Zustand, Axios.

#### [NEW] [tailwind.config.ts](file:///e:/projects/self/nest-react-boilerplate/cms/tailwind.config.ts)
- Cấu hình theme cho shadcn/ui và hiệu ứng Glassmorphism.

#### [NEW] [Design System Components]
- Thiết lập các UI components cơ bản từ shadcn (Button, Input, Table, Dialog, Card, Badge).

---

### 🔐 Phase 2: Layout & Authentication
Xây dựng khung ứng dụng và trang đăng nhập.

#### [NEW] [AuthLayout & AdminLayout]
- `AuthLayout`: Centered container cho trang Login.
- `AdminLayout`: Sidebar (Collapsible), Header (Breadcrumbs, User Menu), Content Area (Scrollable).

#### [NEW] [Login Page](file:///e:/projects/self/nest-react-boilerplate/cms/src/pages/login/index.tsx)
- Giao diện đăng nhập với Glassmorphism card.
- Tích hợp gọi API `/api/auth/login`.

---

### 📊 Phase 3: Core Management Pages
Triển khai các trang quản lý dữ liệu.

#### [NEW] [Dashboard Page](file:///e:/projects/self/nest-react-boilerplate/cms/src/pages/dashboard/index.tsx)
- Stats Cards: Total Posts, Categories, Tags, Users.
- Recent Activity Feed: Danh sách log audit mới nhất.
- Biểu đồ đơn giản (nếu cần).

#### [NEW] [Category & Tag Management]
- Giao diện Table (Data Table với Shadcn).
- CRUD thông qua Modal (Dialog).
- Tích hợp API `/api/categories` và `/api/tags`.

#### [NEW] [Post Management]
- List Page: Table với filter theo category/tag.
- Editor Page: Form chi tiết bài viết, tích hợp CKEditor, quản lý SEO metadata.

---

### 🛡️ Phase 4: System & Security Management
Quản lý người dùng và log hệ thống.

#### [NEW] [User Management]
- Quản lý danh sách người dùng.
- Phân quyền sử dụng **Bitwise Permissions UI** (Checkbox list chuyển đổi thành BigInt).

#### [NEW] [Audit Logs Page]
- Danh sách lịch sử tác động hệ thống.
- View chi tiết thay đổi dữ liệu (Old data vs New data) bằng JSON Viewer.

---

### ✨ Phase 5: Polish & UX Optimization
Tối ưu hóa trải nghiệm.

- **Micro-animations**: Sử dụng Framer Motion cho các transition trang và hover effects.
- **Loading States**: Skeleton screens cho các bảng dữ liệu.
- **Error Handling**: Toast notifications cho mọi phản hồi API.

## Verification Plan

### Automated Tests
- Kiểm tra Build: `npm run build` trong thư mục `cms`.
- Linting: `npm run lint`.

### Manual Verification
1. Kiểm tra luồng Login -> Lưu token -> Redirect về Dashboard.
2. Thử nghiệm tạo/sửa/xóa Category/Tag và kiểm tra dữ liệu thay đổi trong Database.
3. Kiểm tra tính năng phân quyền (Bitwise) có chặn đúng các request không hợp lệ không.
4. Kiểm tra Responsive trên Mobile và Tablet.
5. Kiểm tra log audit có ghi nhận đúng các hành động CRUD vừa thực hiện không.
