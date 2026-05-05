# PLAN-hybrid-dashboard.md - Hybrid Performance Dashboard

Thiết kế và triển khai trang Dashboard tổng hợp cho Quản trị viên (Content) và Nhân sự (HR).

## 🎯 Mục tiêu
- Cung cấp cái nhìn 360 độ về hệ thống (Content + Recruitment).
- Giao diện hiện đại, cao cấp với hiệu ứng Bento Grid.
- Tích hợp biểu đồ thống kê xu hướng.
- Hỗ trợ các hành động nhanh để tăng hiệu suất làm việc.

## 🏗️ Kiến trúc đề xuất

### 1. Backend (NestJS)
- **Module mới:** `src/modules/dashboard`
- **Service:** `DashboardService` truy vấn dữ liệu từ `PrismaService`.
- **Endpoints:**
    - `GET /dashboard/summary`: Thống kê tổng quát (Counts).
    - `GET /dashboard/analytics`: Dữ liệu biểu đồ (Trend).
    - `GET /dashboard/activities`: Hoạt động gần đây (Audit Logs).

### 2. Frontend (React + Shadcn UI)
- **Layout:** Bento Grid.
- **Thư viện biểu đồ:** `Recharts`.
- **Components:** `StatCard`, `MainChart`, `RecruitmentFunnel`, `QuickActions`, `RecentActivity`.

## 📋 Danh sách công việc (Task Breakdown)

### Phase 1: Backend Implementation
- [ ] Tạo module, controller, service cho `Dashboard`.
- [ ] Triển khai logic tính toán `summary`.
- [ ] Triển khai logic thống kê theo thời gian (Analytics).
- [ ] API lấy hoạt động gần nhất từ Audit Logs.

### Phase 2: Frontend Foundation
- [ ] Cài đặt `recharts` và cấu trúc thư mục Dashboard.
- [ ] Khai báo route mới `/dashboard`.

### Phase 3: UI/UX Pro Max Implementation
- [ ] Xây dựng Bento Grid & Stat Cards.
- [ ] Tích hợp biểu đồ Analytics & Charts.
- [ ] Hoàn thiện Recent Activities & Quick Actions.

### Phase 4: Verification
- [ ] Kiểm tra dữ liệu và Responsive UI.
