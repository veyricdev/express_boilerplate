import { Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

export interface DeptFormState {
  name: string
  description: string
  isActive: boolean
}

interface DepartmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingId: number | null
  formData: DeptFormState
  setFormData: (data: DeptFormState) => void
  onSubmit: () => void
  isPending: boolean
}

export function DepartmentDialog({
  open,
  onOpenChange,
  editingId,
  formData,
  setFormData,
  onSubmit,
  isPending,
}: DepartmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px] rounded-3xl border-white/10 shadow-2xl overflow-hidden p-0'>
        <div className='absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none' />
        <div className='p-6 md:p-8 space-y-6 relative'>
          <DialogHeader>
            <DialogTitle className='text-2xl font-bold flex items-center gap-3'>
              <div className='h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary'>
                <Building2 className='h-6 w-6' />
              </div>
              {editingId ? 'Chỉnh sửa phòng ban' : 'Thêm phòng ban mới'}
            </DialogTitle>
            <DialogDescription className='text-muted-foreground/80 font-medium pt-2'>
              Điền thông tin chi tiết của phòng ban bên dưới.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-5 py-2'>
            <div className='grid gap-2.5'>
              <Label htmlFor='name' className='ml-1 font-bold text-sm text-foreground/80'>
                Tên phòng ban <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='name'
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder='Ví dụ: Phòng Kỹ thuật'
                autoFocus
                className='bg-muted/20 border-muted-foreground/10 focus-visible:ring-primary/20 rounded-xl h-11 transition-all'
              />
            </div>
            <div className='grid gap-2.5'>
              <Label htmlFor='description' className='ml-1 font-bold text-sm text-foreground/80'>
                Mô tả
              </Label>
              <Textarea
                id='description'
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder='Mô tả chức năng/nhiệm vụ (không bắt buộc)'
                rows={3}
                className='bg-muted/20 border-muted-foreground/10 focus-visible:ring-primary/20 rounded-xl transition-all'
              />
            </div>
            <div className='flex items-center space-x-2 mt-2 ml-1'>
              <Switch
                id='isActive'
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor='isActive' className='cursor-pointer font-bold text-sm text-foreground/80'>
                Đang hoạt động
              </Label>
            </div>
          </div>
          <DialogFooter className='gap-2 pt-4'>
            <Button
              variant='ghost'
              onClick={() => onOpenChange(false)}
              className='rounded-xl px-6 hover:bg-muted font-bold text-muted-foreground'
            >
              Hủy
            </Button>
            <Button
              onClick={onSubmit}
              disabled={!formData.name.trim() || isPending}
              className='rounded-xl px-8 shadow-lg shadow-primary/20 font-bold bg-primary hover:scale-[1.02] transition-transform active:scale-95'
            >
              {isPending ? 'Đang xử lý...' : editingId ? 'Lưu thay đổi' : 'Thêm mới'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
