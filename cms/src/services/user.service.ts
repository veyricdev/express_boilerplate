import { PaginatedResponse, PaginationParams, User } from '@/types'
import api from './api'

export const userService = {
  findAll: async (params?: PaginationParams): Promise<PaginatedResponse<User>> => {
    return api.get('/admin/users', { params })
  },

  findOne: async (id: number): Promise<User> => {
    return api.get(`/admin/users/${id}`)
  },

  create: async (data: Partial<User>): Promise<User> => {
    return api.post('/admin/users', data)
  },

  update: async (id: number, data: Partial<User>): Promise<User> => {
    return api.patch(`/admin/users/${id}`, data)
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/admin/users/${id}`)
  },

  restore: async (id: number): Promise<void> => {
    await api.post(`/admin/users/${id}/restore`)
  },

  permanentRemove: async (id: number): Promise<void> => {
    await api.delete(`/admin/users/${id}/permanent`)
  },

  setStatus: async (id: number, isActive: boolean): Promise<User> => {
    return api.patch(`/admin/users/${id}/toggle-active`, { isActive })
  },
}
