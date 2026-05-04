import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type { SettingGroup, SettingType } from '@/services/setting.service'

interface AddSettingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (setting: {
    key: string
    label: string
    type: SettingType
    group: SettingGroup
    description: string
    value: string
  }) => void
  isPending: boolean
  tabs: { key: SettingGroup; label: string }[]
}

export function AddSettingDialog({ open, onOpenChange, onSave, isPending, tabs }: AddSettingDialogProps) {
  const [form, setForm] = useState({
    key: '',
    label: '',
    type: 'TEXT' as SettingType,
    group: 'GENERAL' as SettingGroup,
    description: '',
    value: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
  }

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setForm({
        key: '',
        label: '',
        type: 'TEXT' as SettingType,
        group: 'GENERAL' as SettingGroup,
        description: '',
        value: '',
      })
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className='h-10 shadow-lg shadow-primary/20 rounded-xl px-5 gap-2'>
          <Plus className='size-4' />
          Thêm cấu hình
        </Button>
      </DialogTrigger>
      <DialogContent className='rounded-2xl'>
        <DialogHeader>
          <DialogTitle>Thêm cấu hình mới</DialogTitle>
          <DialogDescription>Tạo một cấu hình tùy chỉnh mới cho hệ thống.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='key'>Key (Unique)</Label>
            <Input
              id='key'
              placeholder='ví dụ: site_announcement'
              value={form.key}
              onChange={(e) => setForm({ ...form, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
              className='h-10! rounded-xl'
              required
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='label'>Nhãn hiển thị</Label>
            <Input
              id='label'
              placeholder='ví dụ: Thông báo hệ thống'
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              className='h-10! rounded-xl'
              required
            />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Loại dữ liệu</Label>
              <Select value={form.type} onValueChange={(val: SettingType) => setForm({ ...form, type: val })}>
                <SelectTrigger className='h-10! rounded-xl'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='rounded-xl'>
                  <SelectItem value='TEXT'>Văn bản (TEXT)</SelectItem>
                  <SelectItem value='BOOLEAN'>Bật/Tắt (BOOLEAN)</SelectItem>
                  <SelectItem value='IMAGE'>Hình ảnh (IMAGE)</SelectItem>
                  <SelectItem value='JSON'>JSON (JSON)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label>Nhóm cấu hình</Label>
              <Select value={form.group} onValueChange={(val: SettingGroup) => setForm({ ...form, group: val })}>
                <SelectTrigger className='h-10! rounded-xl'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='rounded-xl'>
                  {tabs.map((t) => (
                    <SelectItem key={t.key} value={t.key}>
                      {t.label}
                    </SelectItem>
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
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className='h-10! rounded-xl'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='value'>Giá trị mặc định</Label>
            {form.type === 'BOOLEAN' ? (
              <div className='flex items-center gap-2 pt-2'>
                <Switch
                  checked={form.value === 'true'}
                  onCheckedChange={(c) => setForm({ ...form, value: c ? 'true' : 'false' })}
                />
                <span className='text-sm text-muted-foreground'>{form.value === 'true' ? 'Bật' : 'Tắt'}</span>
              </div>
            ) : (
              <Input
                id='value'
                placeholder={form.type === 'IMAGE' ? 'https://...' : 'Nhập giá trị'}
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                className='h-10! rounded-xl'
              />
            )}
          </div>
          <DialogFooter className='pt-4'>
            <Button type='button' variant='outline' className='rounded-xl h-10' onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type='submit' className='rounded-xl h-10 px-6' disabled={isPending}>
              {isPending ? 'Đang thêm...' : 'Thêm cấu hình'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
