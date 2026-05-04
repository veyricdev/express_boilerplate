import axios from 'axios'
import { useAuth } from '@/store/auth'

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  paramsSerializer: {
    indexes: null,
  },
})

// Request interceptor: Attach token
api.interceptors.request.use(
  (config) => {
    const token = useAuth.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: Handle 401 and refresh token
api.interceptors.response.use(
  (response) => response.data.data,
  async (error) => {
    const originalRequest = error.config

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const { refreshToken, updateToken, logout } = useAuth.getState()

      if (refreshToken) {
        try {
          // Attempt to refresh
          const response = await axios.post(
            '/api/v1/admin/auth/refresh',
            {},
            {
              headers: { Authorization: `Bearer ${refreshToken}` },
            }
          )

          const { accessToken, refreshToken: newRefreshToken } = response.data.data
          updateToken(accessToken, newRefreshToken)

          // Update original request header and retry
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        } catch (refreshError) {
          // Refresh failed, logout
          logout()
          if (window.location.pathname !== '/cms/login') {
            window.location.href = '/cms/login'
          }
          return Promise.reject(refreshError)
        }
      } else {
        // No refresh token, logout
        logout()
        if (window.location.pathname !== '/cms/login') {
          window.location.href = '/cms/login'
        }
      }
    }

    return Promise.reject(error)
  }
)

export default api
