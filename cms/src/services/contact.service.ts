import { ContactSubmission, PaginatedResponse } from '@/types'
import api from './api'

export interface ContactsParams {
  page?: number
  limit?: number
  isRead?: boolean
}

export const contactService = {
  findAll: async (params?: ContactsParams): Promise<PaginatedResponse<ContactSubmission>> => {
    return api.get('/admin/contacts', { params }) as any
  },

  findOne: async (id: number): Promise<ContactSubmission> => {
    return api.get(`/admin/contacts/${id}`) as any
  },

  toggleRead: async (id: number): Promise<ContactSubmission> => {
    return api.patch(`/admin/contacts/${id}/read`) as any
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/admin/contacts/${id}`)
  },
}
