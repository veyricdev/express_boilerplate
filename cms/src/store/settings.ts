import { create } from 'zustand'
import type { Setting } from '@/services/setting.service'
import { getSettings } from '@/services/setting.service'

interface SettingsState {
  settings: Setting[]
  isLoaded: boolean
  isLoading: boolean
  loadSettings: () => Promise<void>
  forceReload: () => Promise<void>
  getSetting: (key: string) => string | null
  getBoolean: (key: string) => boolean
}

export const useSettings = create<SettingsState>((set, get) => ({
  settings: [],
  isLoaded: false,
  isLoading: false,

  loadSettings: async () => {
    if (get().isLoaded || get().isLoading) return
    set({ isLoading: true })
    try {
      const data = await getSettings()
      set({ settings: data, isLoaded: true })
    } catch {
      // Silently fail — app still works without settings
    } finally {
      set({ isLoading: false })
    }
  },

  forceReload: async () => {
    set({ isLoading: true })
    try {
      const data = await getSettings()
      set({ settings: data, isLoaded: true })
    } catch {
      // Silently fail
    } finally {
      set({ isLoading: false })
    }
  },

  /** Get raw string value of a setting by key */
  getSetting: (key: string) => {
    return get().settings.find((s) => s.key === key)?.value ?? null
  },

  /** Get a BOOLEAN setting parsed as boolean (stored as "true"/"false" string) */
  getBoolean: (key: string) => {
    return get().settings.find((s) => s.key === key)?.value === 'true'
  },
}))
