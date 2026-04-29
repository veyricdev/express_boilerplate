# PLAN: System-Wide Soft Delete & Scheduled Posts

Implementation of a robust soft-delete system across all main entities (User, Post, Category, Tag) and a time-based visibility system for Posts.

## User Review Required

> [!IMPORTANT]
> **`publishedAt` Logic Conflict**: Schema already has `publishedAt` in `Post`. Current service (`posts.service.ts` line 68) **auto-sets** `publishedAt = new Date()` when status = PUBLISHED. We must decide:
> - **Option A**: Manual `publishedAt` from DTO takes priority (allows scheduling). If not provided and status = PUBLISHED, auto-set to now.
> - **Option B**: Keep auto-set behavior, `publishedAt` DTO field is ignored.
> **Recommendation: Option A** — enables future scheduling.

> [!IMPORTANT]
> **Bypass Mechanism for Admin**: Prisma Client Extension will auto-filter `deletedAt: null` on all queries. Admin methods (`findOneAdmin`, `findAllAdmin`) must be able to **bypass this filter** to show soft-deleted records in a trash/recycle bin view. This requires a clearly defined bypass pattern (e.g., a separate `prismaRaw` client instance or a query option flag).

> [!WARNING]
> **Database Migration**: This requires a database migration to add `deletedAt` columns to `users`, `posts`, `categories`, and `tags` tables.

> [!WARNING]
> **Prisma Extension + MariaDB Adapter Compatibility**: `prisma.service.ts` currently uses `PrismaMariaDb` driver adapter. Prisma Client Extensions must be applied **after** the adapter is passed via `$extends()`. The extended client must be stored separately (e.g., `this.db = super({ adapter }).$extends(softDeleteExtension)`). Verify compatibility before implementation.

> [!CAUTION]
> **User Soft Delete → Revoke RefreshTokens**: Soft-deleting a User must **immediately revoke all their active RefreshTokens** (`RefreshToken.revoked = true` for all records with `userId`). Failure to do this allows deleted users to continue using the system via existing tokens.

---

## Proposed Changes

### Database & Core Layer

#### [MODIFY] [schema.prisma](file:///e:/projects/self/nest-react-boilerplate/src/prisma/schema.prisma)
- Add `deletedAt DateTime? @map("deleted_at")` to `User`, `Category`, `Tag`, and `Post` models.
- Add `@@index([deletedAt])` on all affected models for query performance.
- **Note**: `publishedAt` already exists on `Post` — no change needed for the field itself.

#### [MODIFY] [prisma.service.ts](file:///e:/projects/self/nest-react-boilerplate/src/prisma/prisma.service.ts)
- Apply Prisma Client Extension **via `$extends()`** after constructing the client with the MariaDB adapter.
- Store the extended client as `this.db` (or similar) for use in services.
- Extension must:
  - Intercept `delete` / `deleteMany` → convert to `update` with `deletedAt = now()`.
  - Auto-inject `where: { deletedAt: null }` into `findMany`, `findFirst`, `findUnique`, `count`.
  - Expose a **bypass mechanism** for Admin use: e.g., `prisma.$extends` query with `omitSoftDelete: true` flag, or a separate `prismaUnfiltered` property on the service.

---

### CMS Module (Posts, Categories, Tags)

#### [MODIFY] [posts.service.ts](file:///e:/projects/self/nest-react-boilerplate/src/modules/posts/posts.service.ts)
- **`remove(id)`**: Convert to soft delete (`update { deletedAt: now() }`). Log to `AuditLog`.
- **`restore(id)`**: New method — set `deletedAt = null`. Use bypass mechanism to find the record. Log to `AuditLog`.
- **`hardDelete(id)`**: New method — permanently delete with `prisma.post.delete()`. Use bypass mechanism. Log to `AuditLog`.
- **`findAllAdmin()`**: Add optional `includeDeleted` param. When true, use bypass mechanism to return soft-deleted records (for trash/recycle bin view).
- **`findOneAdmin(id)`**: By default, should use bypass mechanism so Admin can retrieve a soft-deleted post's details (needed before restore/hardDelete).
- **`findAllPublished()`**: Add filter `publishedAt: { lte: new Date() }` — only show posts whose `publishedAt` is in the past.
- **`findBySlug()`**: Add `publishedAt: { lte: new Date() }` to the not-found check.
- **`create()`**: Update `publishedAt` logic:
  - If `dto.publishedAt` is explicitly provided → use it.
  - Else if `status = PUBLISHED` → auto-set to `new Date()`.
  - Else → `null`.
- **Slug conflict fix**: The slug uniqueness check (`findUnique({ where: { slug } })`) currently catches soft-deleted records too. Update to check only non-deleted records via the bypass mechanism, or append a timestamp suffix when slug conflicts with a deleted record.

#### [MODIFY] [create-post.dto.ts](file:///e:/projects/self/nest-react-boilerplate/src/modules/posts/dto/create-post.dto.ts)
- Add `publishedAt` as an optional `IsISO8601()` / `IsDate()` field with `@ApiPropertyOptional`.

#### [MODIFY] [update-post.dto.ts](file:///e:/projects/self/nest-react-boilerplate/src/modules/posts/dto/update-post.dto.ts)
- Add `publishedAt` as an optional field (same as create DTO).

#### [MODIFY] Admin Post Controller (`src/modules/posts/admin/`)
- `DELETE /admin/posts/:id` → triggers soft delete (behavior change, was hard delete).
- `POST /admin/posts/:id/restore` → new endpoint, calls `restore(id)`.
- `DELETE /admin/posts/:id/permanent` → new endpoint, calls `hardDelete(id)`.
- `GET /admin/posts?includeDeleted=true` → pass flag to `findAllAdmin()`.

#### [MODIFY] Categories Service & Controller
- Add `remove(id)` → soft delete. Log to `AuditLog`.
- Add `restore(id)` and `hardDelete(id)`.
- **Cascade behavior**: When a Category is soft-deleted, Posts that reference it are **not** automatically affected. Public queries for Posts will still include `categoryId` pointing to a soft-deleted category. Decision needed:
  - **Option A**: When fetching public posts, filter `category: { deletedAt: null }`.
  - **Option B**: When soft-deleting a Category, set `categoryId = null` on all linked Posts (safe, no data loss).
  - **Recommendation: Option B** — cleaner public output.
- Add new admin routes: `POST /admin/categories/:id/restore`, `DELETE /admin/categories/:id/permanent`.

#### [MODIFY] Tags Service & Controller
- Same pattern as Categories (soft delete / restore / hard delete).
- Add new admin routes: `POST /admin/tags/:id/restore`, `DELETE /admin/tags/:id/permanent`.

---

### User Module

#### [MODIFY] [users.service.ts](file:///e:/projects/self/nest-react-boilerplate/src/modules/users/users.service.ts)
- **`remove(id)` → soft delete**:
  1. Set `deletedAt = now()` on User.
  2. **Immediately revoke all active RefreshTokens**: `prisma.refreshToken.updateMany({ where: { userId: id, revoked: false }, data: { revoked: true } })`.
  3. Log to `AuditLog`.
- **`restore(id)`**: Set `deletedAt = null` via bypass mechanism. Log to `AuditLog`. Note: `isActive` should also be reviewed on restore.
- **`hardDelete(id)`**: Permanently delete. Cascade on DB level handles RefreshTokens (already configured with `onDelete: Cascade`). Log to `AuditLog`.
- Add new admin routes: `POST /admin/users/:id/restore`, `DELETE /admin/users/:id/permanent`.

---

### AuditLog Integration

> [!NOTE]
> The project already has `AuditLog` model. All soft delete, restore, and hard delete operations **must** write an audit log entry.

Every destructive/restorative action should call an `AuditLogService.log()` (or inline Prisma write) with:
- `action`: `"SOFT_DELETE"` | `"RESTORE"` | `"HARD_DELETE"`
- `entity`: `"POST"` | `"USER"` | `"CATEGORY"` | `"TAG"`
- `entityId`: the record's ID
- `userId`: the admin performing the action
- `oldData`: snapshot of the record before action (for restore context)

---

## Verification Plan

### Automated Tests

**Soft Delete Tests:**
- Delete a post → verify it's NOT returned in `findMany` (public & admin default), but exists in DB with `deletedAt` set.
- Restore a deleted post → verify it's visible again in `findMany`.
- Hard delete a record → verify it's gone from DB entirely.

**Bypass Mechanism Tests:**
- Call `findOneAdmin(id)` on a soft-deleted post → verify it IS returned (admin needs it for restore UI).
- Call `findAllAdmin({ includeDeleted: true })` → verify soft-deleted records appear.

**Scheduling Tests:**
- Create a post with `publishedAt` = 1 hour in the future, `status = PUBLISHED` → verify NOT returned in `findAllPublished()`.
- Create a post with `publishedAt` = 1 hour in the past, `status = PUBLISHED` → verify IS returned in `findAllPublished()`.
- Update a scheduled post to `publishedAt = now()` → verify it becomes visible.

**User Soft Delete Tests:**
- Soft delete a user → verify their existing RefreshTokens are all `revoked = true`.
- Attempt to use a revoked refresh token → verify `401 Unauthorized`.

**Slug Conflict Tests:**
- Soft delete a post with slug `"test-slug"`.
- Create a new post with the same title → verify slug is either `"test-slug"` (reused, since old is deleted) or a suffixed version, but does NOT conflict.

**AuditLog Tests:**
- Perform soft delete, restore, hard delete → verify correct `AuditLog` entries are created for each.

**Category Cascade Tests:**
- Soft delete a Category → verify linked Posts have `categoryId = null` (if Option B chosen).
- Verify public post listing does not return posts with soft-deleted categories (if Option A chosen).

### Manual Verification
- Check Swagger UI to ensure `publishedAt` is available in Create/Update Post DTOs.
- Verify Admin API returns soft-deleted items when `includeDeleted=true` query param is passed.
- Verify new restore/permanent-delete endpoints appear correctly in Swagger.
- Test full flow in Swagger: Create post (scheduled) → verify not public → time passes (or manually set past date) → verify public.
