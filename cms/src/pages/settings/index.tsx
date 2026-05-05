import { PERM_SETTINGS_WRITE } from '@shared/constants/permissions'
import { useMutation } from '@tanstack/react-query'
import { BarChart, Globe, Mail, Palette, Search, Share2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePermission } from '@/hooks/use-permission'
import type { SettingGroup } from '@/services/setting.service'
import { bulkUpdateSettings, createSetting, deleteSetting } from '@/services/setting.service'
import { useSettings } from '@/store/settings'
import { AddSettingDialog } from './components/add-setting-dialog'
import { SettingsTabPanel } from './components/settings-tab-panel'

// ─── Constants ───────────────────────────────────────────────────────────────

const TABS = [
  { key: 'GENERAL' as SettingGroup, label: 'Chung', icon: Globe, description: 'Thông tin cơ bản của website' },
  { key: 'SEO' as SettingGroup, label: 'SEO', description: 'Cấu hình tối ưu tìm kiếm', icon: Search },
  { key: 'SOCIAL' as SettingGroup, label: 'Mạng xã hội', icon: Share2, description: 'Liên kết đến các mạng xã hội' },
  { key: 'MAIL' as SettingGroup, label: 'Email', icon: Mail, description: 'Cấu hình gửi nhận email' },
  {
    key: 'ANALYTICS' as SettingGroup,
    label: 'Phân tích',
    icon: BarChart,
    description: 'Cấu hình tracking & analytics',
  },
  { key: 'THEME' as SettingGroup, label: 'Giao diện', icon: Palette, description: 'Tùy chỉnh màu sắc & UI' },
]

export default function SettingsPage() {
  const [deleteKey, setDeleteKey] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const permission = usePermission()

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

  const handleCreate = (data: any) => {
    createNewSetting({
      ...data,
      description: data.description || null,
      value: data.value || null,
    })
  }

  return (
    <div className='p-4 md:p-8 space-y-8 max-w-(--breakpoint-2xl) w-full mx-auto animate-in fade-in duration-500'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent'>
            Cấu hình hệ thống
          </h1>
          <p className='text-muted-foreground mt-1'>Quản lý các thông số chung của website</p>
        </div>

        {permission.has(PERM_SETTINGS_WRITE) && (
          <AddSettingDialog
            open={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onSave={handleCreate}
            isPending={isCreating}
            tabs={TABS}
          />
        )}
      </div>

      {isLoading ? (
        <div className='space-y-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className='h-14 w-full rounded-xl' />
          ))}
        </div>
      ) : (
        <Tabs defaultValue='GENERAL' className='space-y-6'>
          <TabsList className='bg-muted/50 border h-10! p-1 gap-1 rounded-xl shrink-0 w-fit flex-wrap md:flex-nowrap'>
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className='px-4 rounded-lg transition-all data-[state=active]:shadow-sm gap-2 h-full text-sm font-medium'
              >
                <tab.icon className='size-4' />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {TABS.map((tab) => (
            <TabsContent key={tab.key} value={tab.key}>
              <Card className='border shadow-sm rounded-2xl overflow-hidden'>
                <CardHeader className='bg-muted/10 border-b py-5'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-primary/10 rounded-xl'>
                      <tab.icon className='size-5 text-primary' />
                    </div>
                    <div>
                      <CardTitle className='text-lg font-bold'>{tab.label}</CardTitle>
                      <CardDescription className='text-xs mt-0.5'>{tab.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='pt-6'>
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
        <AlertDialogContent className='rounded-2xl'>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa cấu hình?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa cấu hình <strong>{deleteKey}</strong> không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className='rounded-xl'>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                if (deleteKey) deleteCustomSetting(deleteKey)
              }}
              disabled={isDeleting}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl'
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa cấu hình'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
