# Plan: NestJS Modular Structure

Build a production-ready NestJS application with a modular architecture that separates Admin and Client interfaces while sharing a common core (MySQL + TypeORM).

## 📊 Overview
- **Project Type:** BACKEND
- **Goal:** Implement a scalable NestJS boilerplate with split Admin/Client logic, JWT authentication (including Refresh Tokens), and Role-Based Access Control (RBAC).
- **Target OS:** Windows (PowerShell)

## 🎯 Success Criteria
- [ ] Modular structure as defined in the request.
- [ ] Working MySQL connection via TypeORM.
- [ ] Dual Authentication (Admin/Client) using shared JWT logic.
- [ ] Refresh Token mechanism implementation.
- [ ] RBAC (Admin/User roles) enforced via Guards.
- [ ] Global API Versioning (v1, etc.) active.
- [ ] Swagger documentation for all endpoints.

## 🛠️ Tech Stack
- **Framework:** NestJS (v10+)
- **Database:** MySQL
- **ORM:** TypeORM
- **Auth:** JWT (`@nestjs/jwt`, `passport-jwt`)
- **Validation:** `class-validator`, `class-transformer`
- **Documentation:** `@nestjs/swagger`

## 📁 Proposed File Structure
```plaintext
src/
├── app.module.ts
├── main.ts
├── common/
│   ├── decorators/         # @Roles(), @GetUser()
│   ├── filters/            # Global Exception Filter
│   ├── guards/             # JwtAuthGuard, RolesGuard
│   ├── interceptors/       # TransformInterceptor
│   ├── pipes/              # ValidationPipe
│   └── utils/
├── config/                 # configuration.ts, database.config.ts
├── database/
│   ├── entities/           # user.entity.ts, etc.
│   └── migrations/
├── modules/
│   ├── auth/
│   │   ├── client/         # ClientAuthController, ClientAuthService
│   │   ├── admin/          # AdminAuthController, AdminAuthService
│   │   ├── shared/         # AuthCoreService (JWT logic, Hash)
│   │   └── auth.module.ts
│   ├── users/
│   │   ├── client/
│   │   │   ├── client-users.controller.ts   # GET /api/v1/users/me
│   │   │   └── client-users.service.ts
│   │   ├── admin/
│   │   │   ├── admin-users.controller.ts    # GET /admin/v1/users
│   │   │   └── admin-users.service.ts
│   │   ├── users.module.ts
│   │   ├── users.repository.ts              # Shared repository
│   │   └── entities/
│   │       └── user.entity.ts
│   └── products/
│       ├── client/
│       ├── admin/
│       ├── products.module.ts
│       └── products.repository.ts
```

## 📝 Task Breakdown

### Phase 1: Foundation (Infrastructure)
| Task ID | Name | Agent | Skills | Priority | Dependencies |
|---------|------|-------|--------|----------|--------------|
| F1 | Install Dependencies | `backend-specialist` | nodejs-best-practices | P0 | None |
| F2 | Setup Config & Database | `database-architect` | database-design, prisma-expert | P0 | F1 |
| F3 | Create Shared User Entity | `database-architect` | database-design | P0 | F2 |
| F4 | Enable Global Versioning | `backend-specialist` | nestjs-best-practices | P0 | F1 |

**F2 INPUT→OUTPUT→VERIFY:**
- INPUT: Environment variables (DB_HOST, etc.)
- OUTPUT: `config/` files and TypeORM module initialization in `app.module.ts`
- VERIFY: App starts without DB connection error.

### Phase 2: Auth Core & RBAC
| Task ID | Name | Agent | Skills | Priority | Dependencies |
|---------|------|-------|--------|----------|--------------|
| A1 | Implement AuthCoreService | `security-auditor` | auth-implementation-patterns | P0 | F3 |
| A2 | Setup JWT & Refresh Token | `security-auditor` | auth-implementation-patterns | P0 | A1 |
| A3 | Implement RolesGuard | `security-auditor` | cc-skill-security-review | P1 | A2 |

**A2 INPUT→OUTPUT→VERIFY:**
- INPUT: `AuthCoreService` for hashing/validation.
- OUTPUT: Working JWT issuance and Refresh Token rotation logic.
- VERIFY: Login returns both tokens; Refresh token works to get new Access token.

### Phase 3: Modules Implementation (Admin/Client)
| Task ID | Name | Agent | Skills | Priority | Dependencies |
|---------|------|-------|--------|----------|--------------|
| M1 | Users Module (Admin/Client) | `backend-specialist` | nestjs-expert | P1 | A3 |
| M2 | Auth Controllers (Admin/Client) | `backend-specialist` | nestjs-expert | P1 | A2 |
| M3 | Products Module (Skeleton) | `backend-specialist` | nestjs-expert | P2 | M1 |

**M1 INPUT→OUTPUT→VERIFY:**
- INPUT: `UsersRepository` and dual controllers.
- OUTPUT: `/admin/v1/users` and `/api/v1/users/me` endpoints.
- VERIFY: Admin can see all users; Client can only see self.

### Phase 4: Polish & Documentation
| Task ID | Name | Agent | Skills | Priority | Dependencies |
|---------|------|-------|--------|----------|--------------|
| P1 | Setup Global Pipes/Filters | `backend-specialist` | clean-code | P2 | M3 |
| P2 | Swagger Documentation | `documentation-writer` | documentation-templates | P2 | P1 |

---

## 🛑 Phase X: Final Verification
- [ ] `npm run build` succeeds.
- [ ] `python .agent/scripts/checklist.py .` passes security and lint.
- [ ] Verify Admin endpoints reject User tokens.
- [ ] Verify Client endpoints reject Admin tokens (if specified) or allow based on roles.
- [ ] Check Refresh Token expiry and invalidation.

## ✅ PHASE X COMPLETE
- Lint: [ ]
- Security: [ ]
- Build: [ ]
- Date: [Pending]
