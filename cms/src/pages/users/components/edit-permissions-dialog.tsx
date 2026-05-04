import { ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { User } from '@/types'
import { cn } from '@/utils/cn'

// Bitwise Permissions (Mapping from src/common/constants/permissions.ts)
const PERMISSIONS = [
  { bit: 0, label: 'POSTS_READ', description: 'Xem bài viết' },
  { bit: 1, label: 'POSTS_WRITE', description: 'Tạo bài viết' },
  { bit: 2, label: 'POSTS_UPDATE', description: 'Sửa bài viết' },
  { bit: 3, label: 'POSTS_DELETE', description: 'Xóa bài viết' },
  { bit: 4, label: 'CATS_READ', description: 'Xem danh mục' },
  { bit: 5, label: 'CATS_WRITE', description: 'Tạo danh mục' },
  { bit: 6, label: 'CATS_UPDATE', description: 'Sửa danh mục' },
  { bit: 7, label: 'CATS_DELETE', description: 'Xóa danh mục' },
  { bit: 8, label: 'TAGS_READ', description: 'Xem thẻ' },
  { bit: 9, label: 'TAGS_WRITE', description: 'Tạo thẻ' },
  { bit: 10, label: 'TAGS_UPDATE', description: 'Sửa thẻ' },
  { bit: 11, label: 'TAGS_DELETE', description: 'Xóa thẻ' },
  { bit: 12, label: 'USERS_READ', description: 'Xem người dùng' },
  { bit: 13, label: 'USERS_WRITE', description: 'Tạo người dùng' },
  { bit: 14, label: 'USERS_UPDATE', description: 'Sửa người dùng' },
  { bit: 15, label: 'USERS_DELETE', description: 'Xóa người dùng' },
  { bit: 16, label: 'AUDIT_READ', description: 'Xem nhật ký hệ thống' },
  { bit: 17, label: 'SETTINGS_READ', description: 'Xem cài đặt' },
  { bit: 18, label: 'SETTINGS_WRITE', description: 'Cập nhật cài đặt' },
]

interface EditPermissionsDialogProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
}

export function EditPermissionsDialog({ user, isOpen, onClose }: EditPermissionsDialogProps) {
  const hasPermission = (permissions: string | undefined | null, bit: number) => {
    if (!permissions) return false
    try {
      const p = BigInt(permissions)
      return (p & (1n << BigInt(bit))) !== 0n
    } catch {
      return false
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-2xl rounded-3xl border-white/10 shadow-2xl overflow-hidden p-0 animate-in zoom-in-95 duration-200'>
        <div className='absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none' />
        <div className='p-8 space-y-6 relative'>
          <DialogHeader>
            <DialogTitle className='text-2xl font-bold flex items-center gap-3'>
              <div className='h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary'>
                <ShieldCheck className='h-6 w-6' />
              </div>
              Phân quyền hệ thống
            </DialogTitle>
            <DialogDescription className='text-muted-foreground font-medium pt-2'>
              Cập nhật quyền hạn cho tài khoản{' '}
              <span className='text-foreground font-bold underline decoration-primary/30 underline-offset-4'>
                {user?.fullName}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-3 py-2 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar'>
            {PERMISSIONS.map((perm) => (
              <div
                key={perm.bit}
                className={cn(
                  'flex flex-row items-start space-x-3 space-y-0 rounded-2xl border p-4 transition-all cursor-pointer group hover:shadow-sm',
                  hasPermission(user?.permissions, perm.bit)
                    ? 'bg-primary/5 border-primary/20 shadow-xs'
                    : 'bg-card border-muted/50 hover:bg-muted/30'
                )}
                onClick={() => {
                  // TODO: Toggle permission logic
                }}
              >
                <Checkbox
                  id={`perm-${perm.bit}`}
                  checked={user ? hasPermission(user.permissions, perm.bit) : false}
                  className='mt-0.5 rounded-md border-primary/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary'
                />
                <div className='space-y-1.5 leading-none'>
                  <Label
                    htmlFor={`perm-${perm.bit}`}
                    className='text-sm font-bold text-foreground/80 group-hover:text-primary transition-colors cursor-pointer'
                  >
                    {perm.label}
                  </Label>
                  <p className='text-[11px] text-muted-foreground font-medium leading-tight'>{perm.description}</p>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className='gap-2 pt-4'>
            <Button
              variant='ghost'
              onClick={onClose}
              className='rounded-xl px-6 hover:bg-muted font-bold text-muted-foreground'
            >
              Đóng
            </Button>
            <Button className='rounded-xl px-8 shadow-lg shadow-primary/20 font-bold bg-primary hover:scale-[1.02] transition-transform active:scale-95'>
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
