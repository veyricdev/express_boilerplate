import { PERM_SETTINGS_WRITE } from '@shared/constants/permissions'
import { Save } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { usePermission } from '@/hooks/use-permission'
import type { Setting, SettingGroup } from '@/services/setting.service'
import { SettingControl } from './setting-control'

// ─── Form Value Helpers ──────────────────────────────────────────────────────

function useSettingsForm(settings: Setting[], group: SettingGroup) {
  const grouped = settings.filter((s) => s.group === group)
  const [values, setValues] = useState<Record<string, string>>({})
  const initialized = useRef(false)

  useEffect(() => {
    if (grouped.length && !initialized.current) {
      const initial: Record<string, string> = {}
      for (const s of grouped) initial[s.key] = s.value ?? ''
      setValues(initial)
      initialized.current = true
    }
  }, [grouped])

  const setValue = (key: string, val: string) => setValues((prev) => ({ ...prev, [key]: val }))

  return { grouped, values, setValue }
}

interface SettingsTabPanelProps {
  settings: Setting[]
  group: SettingGroup
  onSave: (updates: { key: string; value: string | null }[]) => void
  onDelete: (key: string) => void
  isPending: boolean
}

export function SettingsTabPanel({ settings, group, onSave, onDelete, isPending }: SettingsTabPanelProps) {
  const permission = usePermission()
  const { grouped, values, setValue } = useSettingsForm(settings, group)

  const handleSave = () => {
    const updates = grouped.map((s) => ({
      key: s.key,
      value: values[s.key] !== undefined ? (values[s.key] === '' ? null : values[s.key]) : s.value,
    }))
    onSave(updates)
  }

  if (!grouped.length) {
    return <div className='text-center py-8 text-muted-foreground'>Chưa có cấu hình nào trong nhóm này.</div>
  }

  return (
    <div className='space-y-6'>
      <div className='space-y-6'>
        {grouped.map((setting) => (
          <div key={setting.key} className='border-b border-border/50 pb-6 last:border-0 last:pb-0'>
            <SettingControl
              setting={setting}
              value={values[setting.key] ?? ''}
              onChange={(val) => setValue(setting.key, val)}
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>
      {permission.has(PERM_SETTINGS_WRITE) && (
        <Button
          onClick={handleSave}
          disabled={isPending}
          className='h-10 rounded-xl px-6 shadow-lg shadow-primary/20 gap-2 font-semibold'
        >
          <Save className='size-4' />
          {isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      )}
    </div>
  )
}
