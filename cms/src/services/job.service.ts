import { Job, JobLevel, JobStatus, JobType, PaginatedResponse } from '@/types'
import api from './api'

export interface JobsParams {
  page?: number
  limit?: number
  status?: JobStatus
  type?: JobType
  level?: JobLevel
  departmentId?: number
}

export interface CreateJobData {
  title: string
  departmentId?: number | null
  description: string
  requirements?: string
  benefits?: string
  salaryRange?: string
  location?: string
  type?: JobType
  level?: JobLevel
  status?: JobStatus
  deadline?: string | null
}

export const jobService = {
  findAll: async (params?: JobsParams): Promise<PaginatedResponse<Job>> => {
    return api.get('/admin/jobs', { params }) as any
  },

  findOne: async (id: number): Promise<Job> => {
    return api.get(`/admin/jobs/${id}`) as any
  },

  create: async (data: CreateJobData): Promise<Job> => {
    return api.post('/admin/jobs', data) as any
  },

  update: async (id: number, data: Partial<CreateJobData>): Promise<Job> => {
    return api.patch(`/admin/jobs/${id}`, data) as any
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/admin/jobs/${id}`)
  },

  restore: async (id: number): Promise<Job> => {
    return api.post(`/admin/jobs/${id}/restore`) as any
  },

  permanentRemove: async (id: number): Promise<void> => {
    await api.delete(`/admin/jobs/${id}/permanent`)
  },
}
