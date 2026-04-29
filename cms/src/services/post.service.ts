import { PaginatedResponse, PaginationParams, Post } from '@/types'
import api from './api'

export const postService = {
  findAll: async (params?: PaginationParams): Promise<PaginatedResponse<Post>> => {
    return api.get('/admin/posts', { params })
  },

  findOne: async (id: number): Promise<Post> => {
    return api.get(`/admin/posts/${id}`)
  },

  create: async (data: Partial<Post>): Promise<Post> => {
    return api.post('/admin/posts', data)
  },

  update: async (id: number, data: Partial<Post>): Promise<Post> => {
    return api.patch(`/admin/posts/${id}`, data)
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/admin/posts/${id}`)
  },

  restore: async (id: number): Promise<void> => {
    await api.post(`/admin/posts/${id}/restore`)
  },
}
