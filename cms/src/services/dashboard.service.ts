import { DashboardActivity, DashboardAnalytics, DashboardSummary } from '@/types'
import api from './api'

export const dashboardService = {
  getSummary: () => api.get<DashboardSummary>('/admin/dashboard/summary') as unknown as Promise<DashboardSummary>,
  getAnalytics: () =>
    api.get<DashboardAnalytics>('/admin/dashboard/analytics') as unknown as Promise<DashboardAnalytics>,
  getRecentActivities: () =>
    api.get<DashboardActivity[]>('/admin/dashboard/activities') as unknown as Promise<DashboardActivity[]>,
}
