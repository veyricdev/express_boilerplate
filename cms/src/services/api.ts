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

let globalRetryCount = 0

// Response interceptor: Handle 401 and refresh token
api.interceptors.response.use(
  (response) => {
    globalRetryCount = 0
    return response.data.data
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401) {
      if (globalRetryCount < 5) {
        globalRetryCount += 1

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
            // Navigation is handled by ProtectedRoute
            return Promise.reject(refreshError)
          }
        } else {
          // No refresh token, logout
          logout()
          // Navigation is handled by ProtectedRoute
        }
      } else {
        // Reached retry limit
        const { logout } = useAuth.getState()
        logout()
        globalRetryCount = 0 // Reset for future interactions after re-login
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      if (window.location.pathname !== '/cms/403') {
        window.location.href = '/cms/403'
      }
    }

    return Promise.reject(error)
  }
)

export default api
