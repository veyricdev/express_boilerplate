import { Category, PaginatedResponse, PaginationParams } from '@/types'
import api from './api'

export const categoryService = {
  findAll: async (params?: PaginationParams): Promise<PaginatedResponse<Category>> => {
    const response = (await api.get('/admin/categories', { params })) as unknown as PaginatedResponse<any>
    return {
      ...response,
      data: response.data.map((item) => ({
        ...item,
        postCount: item._count?.posts || 0,
      })),
    }
  },

  findAllPublic: async (params?: PaginationParams): Promise<PaginatedResponse<Category>> => {
    const response = (await api.get('/categories', { params })) as unknown as PaginatedResponse<any>
    return {
      ...response,
      data: response.data.map((item) => ({
        ...item,
        postCount: item._count?.posts || 0,
      })),
    }
  },

  create: async (data: Partial<Category>): Promise<Category> => {
    return api.post('/admin/categories', data)
  },

  update: async (id: number, data: Partial<Category>): Promise<Category> => {
    return api.patch(`/admin/categories/${id}`, data)
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/admin/categories/${id}`)
  },

  restore: async (id: number): Promise<void> => {
    await api.post(`/admin/categories/${id}/restore`)
  },

  permanentRemove: async (id: number): Promise<void> => {
    await api.delete(`/admin/categories/${id}/permanent`)
  },
}
