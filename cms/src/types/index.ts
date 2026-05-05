export enum PostStatus {
  PUBLISHED = 'PUBLISHED',
  DRAFT = 'DRAFT',
}

export enum TrashMode {
  ACTIVE = 'active',
  TRASH = 'trash',
  ALL = 'all',
}

export interface User {
  id: number
  email: string
  username: string
  fullName: string
  phone?: string | null
  address?: string | null
  permissions: string
  isOwner: boolean
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
  metaKeywords?: string | null
  metaThumbnail?: string | null
  authorId: number
  categoryId?: number | null
  deletedAt?: string | null
  createdAt: string
  updatedAt: string
  author?: User
  category?: Category | null
  tags?: Tag[]
  postTags?: { tagId: number; tag: Tag }[]
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
  status?: string
  trashMode?: TrashMode
  categoryId?: number
  tagIds?: number[]
  author?: string
  fromDate?: string
  toDate?: string
  isActive?: boolean
  userId?: number
  entity?: string
  action?: string
  entityId?: number
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

// ── Contacts ─────────────────────────────────────────────────────────────────

export interface ContactSubmission {
  id: number
  fullName: string
  email: string
  phone?: string | null
  subject: string
  message: string
  isRead: boolean
  createdAt: string
  updatedAt: string
}

// ── Recruitment ───────────────────────────────────────────────────────────────

export enum JobType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
  REMOTE = 'REMOTE',
}

export enum JobStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export enum JobLevel {
  INTERN = 'INTERN',
  JUNIOR = 'JUNIOR',
  MID = 'MID',
  SENIOR = 'SENIOR',
  LEAD = 'LEAD',
  MANAGER = 'MANAGER',
}

export enum CandidateStatus {
  RECEIVED = 'RECEIVED',
  INTERVIEWING = 'INTERVIEWING',
  REJECTED = 'REJECTED',
  HIRED = 'HIRED',
}

export interface Department {
  id: number
  name: string
  description?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Job {
  id: number
  title: string
  slug: string
  departmentId?: number | null
  department?: Department | null
  description: string
  requirements?: string | null
  benefits?: string | null
  salaryRange?: string | null
  location?: string | null
  type: JobType
  level: JobLevel
  status: JobStatus
  deadline?: string | null
  deletedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface Candidate {
  id: number
  jobId: number
  job?: Job | null
  fullName: string
  email: string
  phone?: string | null
  cvUrl: string
  coverLetter?: string | null
  status: CandidateStatus
  createdAt: string
  updatedAt: string
}
