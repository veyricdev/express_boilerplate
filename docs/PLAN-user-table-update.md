# PLAN: Cập nhật bảng User & Hệ thống Auth

> **Trạng thái**: 📝 Chờ phê duyệt  
> **Dự án**: NestJS + Prisma + MySQL  
> **Mục tiêu**: Hỗ trợ đăng nhập bằng Email/Username, phân biệt quyền Owner, thêm Phone (VN) và Address.

---

## 🎯 Tổng quan thay đổi

Chúng ta sẽ thực hiện 5 thay đổi chính:
1. **Database**: Thêm các trường `username`, `isOwner`, `phone`, `address`.
2. **Auth Logic**: Cho phép tìm kiếm người dùng bằng `email` hoặc `username` khi đăng nhập.
3. **Auth Gate**: Bypass permission check trong `login()` nếu `user.isOwner === true`.
4. **Permissions**: Ưu tiên quyền `isOwner` tối cao trước khi kiểm tra Bit Flags.
5. **Validation**: Kiểm tra định dạng số điện thoại Việt Nam.

---

## 🛠️ Tech Stack & Constraints

- **NestJS**: Backend framework.
- **Prisma**: ORM (MySQL).
- **class-validator**: Validation DTO.
- **VN Phone Regex**: `/(0[3|5|7|8|9])+([0-9]{8})\b/`

> ⚠️ **Lưu ý**: `username` là `@unique` non-nullable → **Yêu cầu reset DB hoàn toàn** trước khi migrate để tránh lỗi constraint trên data cũ.

---

## 🏗️ Cấu trúc File Thay đổi

```
src/
├── prisma/
│   ├── schema.prisma                  ← [UPDATE] Thêm fields mới
│   └── seed.ts                        ← [UPDATE] Seed Owner + username
├── modules/
│   ├── auth/
│   │   ├── dto/
│   │   │   └── login.dto.ts           ← [UPDATE] Thay email bằng identifier
│   │   └── admin/
│   │       └── admin-auth.service.ts  ← [UPDATE] Bypass perm check nếu isOwner
│   ├── users/
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts     ← [UPDATE] Thêm username, phone, address
│   │   │   └── update-user.dto.ts     ← [UPDATE] Thêm username, phone, address
│   │   └── users.service.ts           ← [UPDATE] findForAuth, userSelect, findAll search
│   └── common/
│       └── guards/
│           └── permissions.guard.ts   ← [UPDATE] Bypass nếu là Owner
```

---

## 🛠️ Danh sách nhiệm vụ (Task List)

### Phase 1: Database & Schema
- [ ] **Cập nhật `schema.prisma`**:
  - `username String @unique @db.VarChar(50)`
  - `isOwner Boolean @default(false) @map("is_owner")`
  - `phone String? @db.VarChar(20)`
  - `address String? @db.Text`
- [ ] **Reset & Migrate**:
  - Chạy `pnpm run db:push` (reset DB hoàn toàn trước).

---

### Phase 2: DTO & Validation
- [ ] **Cập nhật `LoginDto`**:
  - Đổi `email` → `identifier`.
  - Dùng `@IsString()` thay `@IsEmail()`.
- [ ] **Cập nhật `CreateUserDto` / `UpdateUserDto`**:
  - Thêm `username` (required cho create, optional cho update).
  - Thêm `phone` với `@Matches(/(0[3|5|7|8|9])+([0-9]{8})\b/)`.
  - Thêm `address` (optional).

---

### Phase 3: Business Logic (Backend)
- [ ] **Cập nhật `UsersService.findForAuth()`**:
  - Đổi tham số `email: string` → `identifier: string`.
  - Tìm bằng `email` **HOẶC** `username` (dùng `OR` condition).
- [ ] **Cập nhật `userSelect` trong `UsersService`**:
  - Thêm `username`, `isOwner`, `phone`, `address` vào select object.
- [ ] **Cập nhật `findAll()` search trong `UsersService`**:
  - Thêm `{ username: { contains: search } }` vào mảng `OR`.
- [ ] **Cập nhật `AdminAuthService.login()`** _(quan trọng - đang bị thiếu)_:
  - Sau khi `findForAuth`, nếu `user.isOwner === true` → **skip** kiểm tra `permissions === 0n`.
  - Đảm bảo Owner không bị chặn ở bước "No administrative permissions".
- [ ] **Cập nhật `AdminAuthService`**:
  - Truyền `dto.identifier` vào `usersService.findForAuth()`.
- [ ] **Cập nhật `PermissionsGuard`**:
  - Nếu `user.isOwner === true` → `return true` ngay lập tức (bypass bit flags).

---

### Phase 4: Seeding & Verification
- [ ] **Cập nhật `seed.ts`**:
  - Tạo Owner: `owner@cms.com` / `username: 'owner'` / `Admin@123` / `isOwner: true` / `permissions: 0n`.
  - Cập nhật Admin cũ: thêm `username: 'admin'` vào upsert (vì `username` là required).
- [ ] **Chạy Seed**: `pnpm run db:seed`.
- [ ] **Kiểm tra**:
  - Đăng nhập bằng Email (`owner@cms.com`) → thành công.
  - Đăng nhập bằng Username (`owner`) → thành công.
  - Owner (`permissions = 0`) vẫn vào được CMS (không bị chặn ở bước permission gate).
  - Owner truy cập mọi route mà không cần gán bit flags.
  - User thường (`permissions = 0`, `isOwner = false`) → bị từ chối.
  - Phone sai định dạng VN → báo lỗi validation.

---

## 🧪 Kế hoạch kiểm thử (Verification)

### Automated Tests
- `npm run test` (nếu có unit test).
- Kiểm tra validation DTO thủ công qua Swagger UI (`/api-docs`).

### Manual Verification

| Test Case | Input | Expected |
|---|---|---|
| Login by email | `owner@cms.com` / `Admin@123` | ✅ Token issued |
| Login by username | `owner` / `Admin@123` | ✅ Token issued |
| Owner access | `isOwner=true`, `permissions=0` | ✅ Full access |
| Regular user, no perms | `isOwner=false`, `permissions=0` | ❌ 401 Unauthorized |
| Invalid VN phone | `0123456789` (11 số) | ❌ Validation error |
| Valid VN phone | `0912345678` | ✅ Pass |

---

## ✅ PHASE X: FINAL CHECKS
- [ ] Lint: Pass
- [ ] Build: Success
- [ ] DB Integrity: OK
