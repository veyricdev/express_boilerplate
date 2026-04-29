export enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export interface User {
  id: number
  email: string
  fullName: string
  permissions: string
  isActive: boolean
  lastLoginAt?: string
  deletedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string | null
  metaTitle?: string | null
  metaDescription?: string | null
  postCount?: number
  deletedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface Tag {
  id: number
  name: string
  slug: string
  postCount?: number
  deletedAt?: string | null
  createdAt: string
}

export interface Post {
  id: number
  title: string
  slug: string
  content: string
  excerpt?: string | null
  thumbnail?: string | null
  status: PostStatus
  publishedAt?: string | null
  metaTitle?: string | null
  metaDescription?: string | null
  metaThumbnail?: string | null
  authorId: number
  categoryId?: number | null
  deletedAt?: string | null
  createdAt: string
  updatedAt: string
  author?: User
  category?: Category | null
  tags?: Tag[]
}

export interface AuditLog {
  id: string
  userId?: number | null
  action: string
  entity: string
  entityId?: number | null
  oldData?: any
  newData?: any
  ipAddress?: string | null
  userAgent?: string | null
  createdAt: string
  user?: User | null
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
}

export interface BaseResponse<T> {
  statusCode: number
  timestamp: string
  path: string
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    lastPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}
