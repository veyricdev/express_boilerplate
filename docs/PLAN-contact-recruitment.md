# Implementation Plan — Contact Form & Recruitment System

Thêm 2 module vào NestJS-React boilerplate hiện có: **Form Liên hệ** (Contact) và **Hệ thống Tuyển dụng** (Recruitment: Departments, Jobs, Candidates).

---

## User Review Required

> [!IMPORTANT]
> **File Upload (Fastify):** Backend dùng `@nestjs/platform-fastify`. Cần cài thêm `@fastify/multipart` để xử lý upload CV. Không thể dùng `multer` vì đó là middleware Express.

> [!IMPORTANT]
> **Public APIs:** `POST /api/v1/contacts` và `POST /api/v1/jobs/:id/apply` là các endpoint **không cần xác thực** (public). Cần đảm bảo không đặt `JwtAuthGuard` trên các route này.

> [!NOTE]
> **File Storage:** CV ứng viên sẽ được lưu cục bộ tại `public/uploads/cvs/`. Có thể migrate lên S3/Cloudinary ở giai đoạn sau.

---

## Proposed Changes

---

### 1. Dependencies

#### [MODIFY] package.json (root)
- `@fastify/multipart` — xử lý `multipart/form-data` upload trên Fastify.

---

### 2. Database & Schema

#### [MODIFY] [schema.prisma](file:///e:/projects/self/nest-react-boilerplate/src/prisma/schema.prisma)

**Enums mới:**

```prisma
enum JobType    { FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, REMOTE }
enum JobStatus  { DRAFT, OPEN, CLOSED }
enum JobLevel   { INTERN, JUNIOR, MID, SENIOR, LEAD, MANAGER }
enum CandidateStatus { RECEIVED, INTERVIEWING, REJECTED, HIRED }
```

**Models mới:**

```prisma
// ── Phòng ban ─────────────────────────────────
model Department {
  id          Int       @id @default(autoincrement()) @db.UnsignedInt
  name        String    @unique @db.VarChar(150)
  description String?   @db.Text
  isActive    Boolean   @default(true) @map("is_active")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  jobs        Job[]

  @@index([isActive])
  @@map("departments")
}

// ── Form Liên hệ ──────────────────────────────
model ContactSubmission {
  id        Int      @id @default(autoincrement()) @db.UnsignedInt
  fullName  String   @map("full_name") @db.VarChar(150)
  email     String   @db.VarChar(255)
  phone     String?  @db.VarChar(20)
  subject   String   @db.VarChar(255)
  message   String   @db.Text
  isRead    Boolean  @default(false) @map("is_read")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([isRead])
  @@map("contact_submissions")
}

// ── Tin tuyển dụng ────────────────────────────
model Job {
  id           Int        @id @default(autoincrement()) @db.UnsignedInt
  title        String     @db.VarChar(255)
  slug         String     @unique @db.VarChar(300)
  departmentId Int?       @map("department_id") @db.UnsignedInt
  description  String     @db.LongText
  requirements String?    @db.LongText
  benefits     String?    @db.LongText
  salaryRange  String?    @map("salary_range") @db.VarChar(100)
  location     String?    @db.VarChar(255)
  type         JobType    @default(FULL_TIME)
  level        JobLevel   @default(MID)
  status       JobStatus  @default(DRAFT)
  deadline     DateTime?
  deletedAt    DateTime?  @map("deleted_at")
  createdAt    DateTime   @default(now()) @map("created_at")
  updatedAt    DateTime   @updatedAt @map("updated_at")

  department   Department? @relation(fields: [departmentId], references: [id], onDelete: SetNull)
  candidates   Candidate[]

  @@index([status])
  @@index([departmentId])
  @@index([level])
  @@index([deletedAt])
  @@map("jobs")
}

// ── Ứng viên ──────────────────────────────────
model Candidate {
  id          Int             @id @default(autoincrement()) @db.UnsignedInt
  jobId       Int             @map("job_id") @db.UnsignedInt
  fullName    String          @map("full_name") @db.VarChar(150)
  email       String          @db.VarChar(255)
  phone       String?         @db.VarChar(20)
  cvUrl       String          @map("cv_url") @db.VarChar(500)
  coverLetter String?         @map("cover_letter") @db.Text
  status      CandidateStatus @default(RECEIVED)
  createdAt   DateTime        @default(now()) @map("created_at")
  updatedAt   DateTime        @updatedAt @map("updated_at")

  job         Job             @relation(fields: [jobId], references: [id])

  @@index([jobId])
  @@index([status])
  @@map("candidates")
}
```

> **Quan hệ:** `Department 1 → N Job`, `Job 1 → N Candidate`. `departmentId` là nullable (SetNull khi xóa department).

---

### 3. Permissions

#### [MODIFY] [permissions.ts](file:///e:/projects/self/nest-react-boilerplate/src/common/constants/permissions.ts)

```ts
// ── Contacts ──────────────────────────────────
export const PERM_CONTACTS_READ   = 1n << 19n  // 524288
export const PERM_CONTACTS_DELETE = 1n << 20n  // 1048576

// ── Jobs ──────────────────────────────────────
export const PERM_JOBS_READ   = 1n << 21n  // 2097152
export const PERM_JOBS_WRITE  = 1n << 22n  // 4194304
export const PERM_JOBS_UPDATE = 1n << 23n  // 8388608
export const PERM_JOBS_DELETE = 1n << 24n  // 16777216

// ── Candidates ────────────────────────────────
export const PERM_CANDIDATES_READ   = 1n << 25n  // 33554432
export const PERM_CANDIDATES_UPDATE = 1n << 26n  // 67108864

// ── Departments ───────────────────────────────
export const PERM_DEPARTMENTS_READ   = 1n << 27n  // 134217728
export const PERM_DEPARTMENTS_WRITE  = 1n << 28n  // 268435456
export const PERM_DEPARTMENTS_UPDATE = 1n << 29n  // 536870912
export const PERM_DEPARTMENTS_DELETE = 1n << 30n  // 1073741824
```

Cập nhật `PERM_ADMIN` composite để bao gồm tất cả permissions mới.

---

### 4. Backend — NestJS

#### [MODIFY] [main.ts](file:///e:/projects/self/nest-react-boilerplate/src/main.ts)
- Đăng ký `@fastify/multipart` với giới hạn file size 5MB.
- Tạo thư mục `public/uploads/cvs/` nếu chưa tồn tại.

#### [MODIFY] [app.module.ts](file:///e:/projects/self/nest-react-boilerplate/src/app.module.ts)
- Import `ContactsModule` và `RecruitmentModule`.

---

#### [NEW] Contacts Module — `src/modules/contacts/`

```
contacts/
  dto/
    create-contact.dto.ts
    find-contacts.dto.ts
    contact-response.dto.ts
  admin/admin-contacts.controller.ts
  client/client-contacts.controller.ts
  contacts.service.ts
  contacts.module.ts
```

| Method | Path | Auth | Mô tả |
|--------|------|------|-------|
| `POST` | `/api/v1/contacts` | Public | Gửi form liên hệ |
| `GET` | `/api/v1/admin/contacts` | `PERM_CONTACTS_READ` | Danh sách (filter `isRead`) |
| `GET` | `/api/v1/admin/contacts/:id` | `PERM_CONTACTS_READ` | Chi tiết + auto mark read |
| `PATCH` | `/api/v1/admin/contacts/:id/read` | `PERM_CONTACTS_READ` | Toggle đã đọc |
| `DELETE` | `/api/v1/admin/contacts/:id` | `PERM_CONTACTS_DELETE` | Xóa |

---

#### [NEW] Recruitment Module — `src/modules/recruitment/`

```
recruitment/
  dto/
    department-response.dto.ts / create-department.dto.ts / update-department.dto.ts
    job-response.dto.ts / create-job.dto.ts / update-job.dto.ts / find-jobs.dto.ts
    candidate-response.dto.ts / apply-job.dto.ts / update-candidate-status.dto.ts
  admin/
    admin-departments.controller.ts
    admin-jobs.controller.ts
    admin-candidates.controller.ts
  client/
    client-jobs.controller.ts         ← public
    client-candidates.controller.ts   ← public (apply)
  recruitment.service.ts              ← departments + jobs + candidates
  upload.service.ts                   ← CV file handling
  recruitment.module.ts
```

**Departments:**

| Method | Path | Auth | Mô tả |
|--------|------|------|-------|
| `GET` | `/api/v1/admin/departments` | `PERM_DEPARTMENTS_READ` | Danh sách phòng ban |
| `POST` | `/api/v1/admin/departments` | `PERM_DEPARTMENTS_WRITE` | Tạo phòng ban |
| `PATCH` | `/api/v1/admin/departments/:id` | `PERM_DEPARTMENTS_UPDATE` | Cập nhật |
| `DELETE` | `/api/v1/admin/departments/:id` | `PERM_DEPARTMENTS_DELETE` | Xóa (job giữ lại, departmentId → null) |

**Jobs:**

| Method | Path | Auth | Mô tả |
|--------|------|------|-------|
| `GET` | `/api/v1/jobs` | Public | Jobs OPEN (filter: departmentId, type, level) |
| `GET` | `/api/v1/jobs/:slug` | Public | Chi tiết job |
| `GET` | `/api/v1/admin/jobs` | `PERM_JOBS_READ` | Tất cả jobs |
| `GET` | `/api/v1/admin/jobs/:id` | `PERM_JOBS_READ` | Chi tiết |
| `POST` | `/api/v1/admin/jobs` | `PERM_JOBS_WRITE` | Tạo job |
| `PATCH` | `/api/v1/admin/jobs/:id` | `PERM_JOBS_UPDATE` | Cập nhật |
| `DELETE` | `/api/v1/admin/jobs/:id` | `PERM_JOBS_DELETE` | Soft delete |
| `POST` | `/api/v1/admin/jobs/:id/restore` | `PERM_JOBS_UPDATE` | Khôi phục |
| `DELETE` | `/api/v1/admin/jobs/:id/permanent` | `PERM_JOBS_DELETE` | Hard delete |

**Candidates:**

| Method | Path | Auth | Mô tả |
|--------|------|------|-------|
| `POST` | `/api/v1/jobs/:id/apply` | Public | Nộp hồ sơ + upload CV |
| `GET` | `/api/v1/admin/candidates` | `PERM_CANDIDATES_READ` | Danh sách (filter: jobId, status, departmentId) |
| `GET` | `/api/v1/admin/candidates/:id` | `PERM_CANDIDATES_READ` | Chi tiết |
| `PATCH` | `/api/v1/admin/candidates/:id/status` | `PERM_CANDIDATES_UPDATE` | Đổi trạng thái |

---

### 5. Audit Log

Entity names: `CONTACT`, `DEPARTMENT`, `JOB`, `CANDIDATE`.
`AuditLogInterceptor` tự ghi log — không cần thêm code.

---

### 6. Frontend (CMS)

#### [MODIFY] [routes.tsx](file:///e:/projects/self/nest-react-boilerplate/cms/src/routes.tsx)

```
/contacts              → ContactsPage
/contacts/:id          → ContactDetailPage
/departments           → DepartmentsPage (list + inline CRUD)
/jobs                  → JobsPage
/jobs/create           → JobEditorPage
/jobs/:id/edit         → JobEditorPage
/candidates            → CandidatesPage
/candidates/:id        → CandidateDetailPage
```

#### [MODIFY] Sidebar Navigation

```
📧 Liên hệ               → /contacts       (PERM_CONTACTS_READ)
💼 Tuyển dụng (nhóm)
  ├─ 🏢 Phòng ban        → /departments    (PERM_DEPARTMENTS_READ)
  ├─ 📋 Tin tuyển dụng   → /jobs           (PERM_JOBS_READ)
  └─ 👤 Ứng viên         → /candidates     (PERM_CANDIDATES_READ)
```

#### [NEW] CMS Pages

| File | Mô tả |
|------|-------|
| `pages/contacts/index.tsx` | Table: tên, email, chủ đề, ngày gửi, badge **Chưa đọc** |
| `pages/contacts/detail.tsx` | Nội dung đầy đủ + mark read |
| `pages/departments/index.tsx` | Table + inline form tạo/sửa/xóa phòng ban |
| `pages/jobs/index.tsx` | Table: filter status, department, level; soft delete |
| `pages/jobs/editor.tsx` | Form: title, **department** (select), type, level, location, deadline, salary, description |
| `pages/candidates/index.tsx` | Table: filter job, department, status |
| `pages/candidates/detail.tsx` | Link download CV, cover letter, dropdown đổi trạng thái |

#### [NEW] CMS Services

```
cms/src/services/contact.service.ts
cms/src/services/department.service.ts
cms/src/services/job.service.ts
cms/src/services/candidate.service.ts
```

---

## Entity Relationship

```
Department 1 ──── N Job 1 ──── N Candidate
```

---

## Verification Plan

### Automated
- `pnpm test` — không có regression.
- Swagger `/docs`:
  - Contact: gửi form → badge Chưa đọc → mark read → xóa.
  - Department: CRUD, xóa department → job giữ lại với `departmentId = null`.
  - Job: tạo với department → DRAFT → OPEN → xuất hiện Public API, filter được theo department.
  - Candidate: nộp hồ sơ + file → file tồn tại `public/uploads/cvs/` → đổi status.
  - AuditLog: ghi nhận CONTACT / DEPARTMENT / JOB / CANDIDATE.

### Manual
- Sidebar hiển thị đúng theo permission.
- Job editor: dropdown department load đúng danh sách active.
- Candidate list: filter theo department (thông qua job).
