# Plan: Integrate CMS with NestJS Admin APIs

This plan outlines the steps to align the CMS frontend with the actual NestJS Admin APIs as defined in the `api-1.json` documentation.

## User Review Required

> [!IMPORTANT]
> **Endpoint Prefix Change**: All API calls will be updated from `/api/...` to `/api/v1/admin/...` (or `/api/v1/...` for shared endpoints).
> **Auth Response Structure**: The login response currently only returns `accessToken` and `refreshToken`. We need to call `/api/v1/users/me` separately to get user details after login.
> **Refresh Token Implementation**: We will implement automatic token rotation using the `/api/v1/admin/auth/refresh` endpoint.

## Proposed Changes

### Core API Infrastructure

#### [MODIFY] [api.ts](file:///e:/projects/self/nest-react-boilerplate/cms/src/services/api.ts)
- Update `baseURL` to `/api/v1`.
- Add request interceptor to attach `Authorization: Bearer <token>` header.
- Add response interceptor to handle `401 Unauthorized`:
    - Attempt to refresh token using `refreshToken`.
    - If successful, retry the original request.
    - If failed, logout and redirect to login page.

#### [MODIFY] [auth.ts](file:///e:/projects/self/nest-react-boilerplate/cms/src/store/auth.ts)
- Add `refreshToken` to `AuthState`.
- Update `setAuth` to store both tokens.

---

### Service Layer Implementation [NEW]

Create a structured service layer to encapsulate API calls.

#### [NEW] [auth.service.ts](file:///e:/projects/self/nest-react-boilerplate/cms/src/services/auth.service.ts)
- `login(credentials: LoginDto)`: POST `/admin/auth/login`
- `refresh(token: string)`: POST `/admin/auth/refresh`
- `logout()`: POST `/admin/auth/logout`
- `getProfile()`: GET `/users/me`

#### [NEW] [user.service.ts](file:///e:/projects/self/nest-react-boilerplate/cms/src/services/user.service.ts)
- `findAll(params: PaginationParams)`: GET `/admin/users`
- `findOne(id: number)`: GET `/admin/users/{id}`
- `create(data: CreateUserDto)`: POST `/admin/users`
- `update(id: number, data: UpdateUserDto)`: PATCH `/admin/users/{id}`
- `remove(id: number)`: DELETE `/admin/users/{id}`

#### [NEW] [post.service.ts](file:///e:/projects/self/nest-react-boilerplate/cms/src/services/post.service.ts)
- `findAll(params: PostQueryParams)`: GET `/admin/posts`
- `findOne(id: number)`: GET `/admin/posts/{id}`
- `create(data: CreatePostDto)`: POST `/admin/posts`
- `update(id: number, data: UpdatePostDto)`: PATCH `/admin/posts/{id}`
- `remove(id: number)`: DELETE `/admin/posts/{id}`

#### [NEW] [category.service.ts](file:///e:/projects/self/nest-react-boilerplate/cms/src/services/category.service.ts)
- `findAll()`: GET `/admin/categories`
- `create(data: CreateCategoryDto)`: POST `/admin/categories`
- `update(id: number, data: UpdateCategoryDto)`: PATCH `/admin/categories/{id}`
- `remove(id: number)`: DELETE `/admin/categories/{id}`

#### [NEW] [tag.service.ts](file:///e:/projects/self/nest-react-boilerplate/cms/src/services/tag.service.ts)
- `findAll()`: GET `/admin/tags`
- `create(data: CreateTagDto)`: POST `/admin/tags`
- `remove(id: number)`: DELETE `/admin/tags/{id}`

---

### Page Refactoring

#### [MODIFY] [login.tsx](file:///e:/projects/self/nest-react-boilerplate/cms/src/pages/auth/login.tsx)
- Update `onSubmit` to use `authService.login`.
- After successful login, call `authService.getProfile()` to populate user state.

#### [MODIFY] [Posts index.tsx](file:///e:/projects/self/nest-react-boilerplate/cms/src/pages/posts/index.tsx)
- Update `useQuery` to use `postService.findAll`.

#### [MODIFY] [Users/Categories/Tags Pages]
- Update existing CRUD pages to use the new services.

## Verification Plan

### Automated Tests
- Run CMS dev server: `pnpm --filter cms dev`.
- Verify login flow with Mock/Real API.
- Verify token refresh by manually expiring `accessToken` in dev tools.

### Manual Verification
- Test all CRUD operations for Posts, Categories, and Tags.
- Check if permissions (BigInt) are correctly handled in the UI.
