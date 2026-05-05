import { Department } from '@/types'
import api from './api'

export const departmentService = {
  findAll: async (): Promise<Department[]> => {
    return api.get('/admin/departments') as any
  },

  create: async (data: { name: string; description?: string; isActive?: boolean }): Promise<Department> => {
    return api.post('/admin/departments', data) as any
  },

  update: async (
    id: number,
    data: Partial<{ name: string; description?: string; isActive?: boolean }>
  ): Promise<Department> => {
    return api.patch(`/admin/departments/${id}`, data) as any
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/admin/departments/${id}`)
  },
}
