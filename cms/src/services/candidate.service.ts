import { Candidate, CandidateStatus, PaginatedResponse } from '@/types'
import api from './api'

export interface CandidatesParams {
  page?: number
  limit?: number
  jobId?: number
  departmentId?: number
  status?: CandidateStatus
}

export const candidateService = {
  findAll: async (params?: CandidatesParams): Promise<PaginatedResponse<Candidate>> => {
    return api.get('/admin/candidates', { params }) as any
  },

  findOne: async (id: number): Promise<Candidate> => {
    return api.get(`/admin/candidates/${id}`) as any
  },

  updateStatus: async (id: number, status: CandidateStatus): Promise<Candidate> => {
    return api.patch(`/admin/candidates/${id}/status`, { status }) as any
  },
}
