import api from './api'

export type SettingType = 'TEXT' | 'BOOLEAN' | 'IMAGE' | 'JSON'
export type SettingGroup = 'GENERAL' | 'SEO' | 'SOCIAL' | 'MAIL' | 'ANALYTICS' | 'THEME'

export interface Setting {
  id: number
  key: string
  value: string | null
  type: SettingType
  group: SettingGroup
  label: string
  description: string | null
  isSystem: boolean
}

export interface BulkUpdatePayload {
  settings: { key: string; value: string | null }[]
}

/** Fetch all settings (public endpoint, no auth required) */
export const getSettings = (): Promise<Setting[]> => api.get('/settings')

/** Create a new custom setting (admin only) */
export const createSetting = (
  payload: Omit<Setting, 'id' | 'value' | 'isSystem'> & { value?: string | null }
): Promise<Setting> => api.post('/admin/settings', payload)

/** Update setting metadata (admin only) */
export const updateSettingMetadata = (key: string, payload: Partial<Setting>): Promise<Setting> =>
  api.patch(`/admin/settings/${key}`, payload)

/** Delete a custom setting (admin only) */
export const deleteSetting = (key: string): Promise<void> => api.delete(`/admin/settings/${key}`)

/** Bulk update settings (admin only) */
export const bulkUpdateSettings = (payload: BulkUpdatePayload): Promise<void> =>
  api.patch('/admin/settings/bulk', payload)
