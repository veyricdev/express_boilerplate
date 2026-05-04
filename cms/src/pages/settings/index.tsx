import { useEffect, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Save, Globe, Search, Share2, Mail, BarChart, Palette, Plus, Trash2, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { bulkUpdateSettings, createSetting, deleteSetting } from '@/services/setting.service'
import type { Setting, SettingGroup, SettingType } from '@/services/setting.service'
import { useSettings } from '@/store/settings'

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

// ─── Single Setting Control ──────────────────────────────────────────────────

function SettingControl({
  setting,
  value,
  onChange,
  onDelete,
}: {
  setting: Setting
  value: string
  onChange: (val: string) => void
  onDelete: (key: string) => void
}) {
  const LabelSection = () => (
    <div className='flex items-center justify-between mb-2'>
      <div className='flex items-center gap-2'>
        <Label htmlFor={setting.key} className='text-sm font-medium'>
          {setting.label}
        </Label>
        {setting.description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className='size-4 text-muted-foreground' />
              </TooltipTrigger>
              <TooltipContent>
                <p className='max-w-xs text-sm'>{setting.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {!setting.isSystem && (
        <Button variant='ghost' size='icon' className='size-6 text-destructive hover:text-destructive hover:bg-destructive/10' onClick={() => onDelete(setting.key)}>
          <Trash2 className='size-4' />
        </Button>
      )}
    </div>
  )

  if (setting.type === 'BOOLEAN') {
    return (
      <div className='space-y-2'>
        <LabelSection />
        <div className='flex items-center'>
          <Switch id={setting.key} checked={value === 'true'} onCheckedChange={(v: boolean) => onChange(v ? 'true' : 'false')} />
          <span className='ml-3 text-sm text-muted-foreground'>{value === 'true' ? 'Bật' : 'Tắt'}</span>
        </div>
      </div>
    )
  }

  if (setting.type === 'IMAGE') {
    return (
      <div className='space-y-2'>
        <LabelSection />
        <Input
          id={setting.key}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder='https://example.com/image.png'
          className='font-mono text-xs'
        />
        {value && (
          <img
            src={value}
            alt={setting.label}
            className='h-16 w-auto rounded-md border object-contain bg-muted/30 p-1'
            onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
          />
        )}
      </div>
    )
  }

  if (setting.type === 'JSON') {
    return (
      <div className='space-y-2'>
        <LabelSection />
        <Textarea id={setting.key} value={value} onChange={(e) => onChange(e.target.value)} rows={4} className='font-mono text-xs' />
      </div>
    )
  }

  // Default: TEXT
  return (
    <div className='space-y-2'>
      <LabelSection />
      <Input id={setting.key} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

// ─── Tab Panel ───────────────────────────────────────────────────────────────

function SettingsTabPanel({
  settings,
  group,
  onSave,
  onDelete,
  isPending,
}: {
  settings: Setting[]
  group: SettingGroup
  onSave: (updates: { key: string; value: string | null }[]) => void
  onDelete: (key: string) => void
  isPending: boolean
}) {
  const { grouped, values, setValue } = useSettingsForm(settings, group)

  const handleSave = () => {
    const updates = grouped.map((s) => ({
      key: s.key,
      value: values[s.key] !== undefined ? (values[s.key] === '' ? null : values[s.key]) : s.value,
    }))
    onSave(updates)
  }

  if (!grouped.length) {
    return (
      <div className='text-center py-8 text-muted-foreground'>
        Chưa có cấu hình nào trong nhóm này.
      </div>
    )
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
      <Button onClick={handleSave} disabled={isPending} className='gap-2'>
        <Save className='size-4' />
        {isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
      </Button>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const TABS = [
  { key: 'GENERAL' as SettingGroup, label: 'Chung', icon: Globe, description: 'Thông tin cơ bản của website' },
  { key: 'SEO' as SettingGroup, label: 'SEO', icon: Search, description: 'Cấu hình tối ưu tìm kiếm' },
  { key: 'SOCIAL' as SettingGroup, label: 'Mạng xã hội', icon: Share2, description: 'Liên kết đến các mạng xã hội' },
  { key: 'MAIL' as SettingGroup, label: 'Email', icon: Mail, description: 'Cấu hình gửi nhận email' },
  { key: 'ANALYTICS' as SettingGroup, label: 'Phân tích', icon: BarChart, description: 'Cấu hình tracking & analytics' },
  { key: 'THEME' as SettingGroup, label: 'Giao diện', icon: Palette, description: 'Tùy chỉnh màu sắc & UI' },
]

export default function SettingsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [deleteKey, setDeleteKey] = useState<string | null>(null)
  
  const [newSetting, setNewSetting] = useState({
    key: '',
    label: '',
    type: 'TEXT' as SettingType,
    group: 'GENERAL' as SettingGroup,
    description: '',
    value: '',
  })

  const settings = useSettings((s) => s.settings)
  const isStoreLoading = useSettings((s) => s.isLoading)
  const isLoaded = useSettings((s) => s.isLoaded)
  
  const isLoading = isStoreLoading || (!isLoaded && settings.length === 0)

  const { mutate: saveSettings, isPending: isSaving } = useMutation({
    mutationFn: bulkUpdateSettings,
    onSuccess: async () => {
      toast.success('Đã lưu cấu hình thành công')
      await useSettings.getState().forceReload()
    },
    onError: () => toast.error('Lưu cấu hình thất bại'),
  })

  const { mutate: createNewSetting, isPending: isCreating } = useMutation({
    mutationFn: createSetting,
    onSuccess: async () => {
      toast.success('Đã thêm cấu hình thành công')
      await useSettings.getState().forceReload()
      setIsAddDialogOpen(false)
      setNewSetting({ key: '', label: '', type: 'TEXT', group: 'GENERAL', description: '', value: '' })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Thêm cấu hình thất bại')
    },
  })

  const { mutate: deleteCustomSetting, isPending: isDeleting } = useMutation({
    mutationFn: deleteSetting,
    onSuccess: async () => {
      toast.success('Đã xóa cấu hình thành công')
      await useSettings.getState().forceReload()
      setDeleteKey(null)
    },
    onError: () => {
      toast.error('Xóa cấu hình thất bại')
      setDeleteKey(null)
    },
  })

  const handleSave = (updates: { key: string; value: string | null }[]) => {
    saveSettings({ settings: updates })
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSetting.key || !newSetting.label) {
      toast.error('Vui lòng nhập Key và Nhãn hiển thị')
      return
    }
    createNewSetting({
      ...newSetting,
      description: newSetting.description || null,
      value: newSetting.value || null,
    })
  }

  return (
    <div className='space-y-6 py-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Cấu hình hệ thống</h1>
          <p className='text-muted-foreground text-sm mt-1'>Quản lý các thông số chung của website</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className='gap-2'>
              <Plus className='size-4' />
              Thêm cấu hình
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm cấu hình mới</DialogTitle>
              <DialogDescription>
                Tạo một cấu hình tùy chỉnh mới cho hệ thống.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className='space-y-4 py-4'>
              <div className='space-y-2'>
                <Label htmlFor='key'>Key (Unique)</Label>
                <Input 
                  id='key' 
                  placeholder='ví dụ: site_announcement' 
                  value={newSetting.key}
                  onChange={(e) => setNewSetting({...newSetting, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_')})}
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='label'>Nhãn hiển thị</Label>
                <Input 
                  id='label' 
                  placeholder='ví dụ: Thông báo hệ thống' 
                  value={newSetting.label}
                  onChange={(e) => setNewSetting({...newSetting, label: e.target.value})}
                  required
                />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label>Loại dữ liệu</Label>
                  <Select value={newSetting.type} onValueChange={(val: SettingType) => setNewSetting({...newSetting, type: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='TEXT'>Văn bản (TEXT)</SelectItem>
                      <SelectItem value='BOOLEAN'>Bật/Tắt (BOOLEAN)</SelectItem>
                      <SelectItem value='IMAGE'>Hình ảnh (IMAGE)</SelectItem>
                      <SelectItem value='JSON'>JSON (JSON)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label>Nhóm cấu hình</Label>
                  <Select value={newSetting.group} onValueChange={(val: SettingGroup) => setNewSetting({...newSetting, group: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TABS.map(t => (
                        <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='description'>Mô tả (Không bắt buộc)</Label>
                <Input 
                  id='description' 
                  placeholder='Giải thích ý nghĩa của cấu hình này' 
                  value={newSetting.description}
                  onChange={(e) => setNewSetting({...newSetting, description: e.target.value})}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='value'>Giá trị mặc định</Label>
                {newSetting.type === 'BOOLEAN' ? (
                  <div className='flex items-center gap-2 pt-2'>
                    <Switch 
                      checked={newSetting.value === 'true'} 
                      onCheckedChange={(c) => setNewSetting({...newSetting, value: c ? 'true' : 'false'})}
                    />
                    <span className='text-sm text-muted-foreground'>
                      {newSetting.value === 'true' ? 'Bật' : 'Tắt'}
                    </span>
                  </div>
                ) : (
                  <Input 
                    id='value' 
                    placeholder={newSetting.type === 'IMAGE' ? 'https://...' : 'Nhập giá trị'} 
                    value={newSetting.value}
                    onChange={(e) => setNewSetting({...newSetting, value: e.target.value})}
                  />
                )}
              </div>
              <DialogFooter className='pt-4'>
                <Button type='button' variant='outline' onClick={() => setIsAddDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type='submit' disabled={isCreating}>
                  {isCreating ? 'Đang thêm...' : 'Thêm cấu hình'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className='space-y-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className='h-14 w-full rounded-xl' />
          ))}
        </div>
      ) : (
        <Tabs defaultValue='GENERAL'>
          <TabsList className='mb-6 h-auto p-1 flex flex-wrap max-w-full overflow-x-auto justify-start gap-1'>
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className='gap-2 data-[state=active]:font-semibold flex-1 min-w-[120px]'
              >
                <tab.icon className='size-4' />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {TABS.map((tab) => (
            <TabsContent key={tab.key} value={tab.key}>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-lg'>
                    <tab.icon className='size-5 text-primary' />
                    {tab.label}
                  </CardTitle>
                  <CardDescription>{tab.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <SettingsTabPanel
                    settings={settings}
                    group={tab.key}
                    onSave={handleSave}
                    onDelete={setDeleteKey}
                    isPending={isSaving}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}

      <AlertDialog open={!!deleteKey} onOpenChange={(open) => !open && setDeleteKey(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa cấu hình?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa cấu hình <strong>{deleteKey}</strong> không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                if (deleteKey) deleteCustomSetting(deleteKey);
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa cấu hình'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
