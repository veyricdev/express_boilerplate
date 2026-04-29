import { PaginatedResponse, PaginationParams, Tag } from '@/types'
import api from './api'

export const tagService = {
  findAll: async (params?: PaginationParams): Promise<PaginatedResponse<Tag>> => {
    const response = (await api.get('/admin/tags', { params })) as unknown as PaginatedResponse<any>
    return {
      ...response,
      data: response.data.map((item) => ({
        ...item,
        postCount: item._count?.postTags || 0,
      })),
    }
  },

  create: async (data: Partial<Tag>): Promise<Tag> => {
    return api.post('/admin/tags', data)
  },

  update: async (id: number, data: Partial<Tag>): Promise<Tag> => {
    return api.patch(`/admin/tags/${id}`, data)
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/admin/tags/${id}`)
  },
}
