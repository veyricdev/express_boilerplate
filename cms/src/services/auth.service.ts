import { LoginResponse, User } from '@/types'
import api from './api'

export const authService = {
  login: async (data: any): Promise<LoginResponse> => {
    const response = await api.post('/admin/auth/login', data)
    return response as any
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/me')
    return response as any
  },

  logout: async () => {
    return api.post('/admin/auth/logout')
  },

  logoutAll: async () => {
    return api.post('/admin/auth/logout-all')
  },
}
