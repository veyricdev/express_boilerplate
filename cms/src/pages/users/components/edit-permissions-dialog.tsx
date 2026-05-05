import {
  hasPermission as checkPerm,
  PERM_AUDIT_READ,
  PERM_CANDIDATES_READ,
  PERM_CANDIDATES_UPDATE,
  PERM_CATS_DELETE,
  PERM_CATS_READ,
  PERM_CATS_UPDATE,
  PERM_CATS_WRITE,
  PERM_CONTACTS_DELETE,
  PERM_CONTACTS_READ,
  PERM_DEPARTMENTS_DELETE,
  PERM_DEPARTMENTS_READ,
  PERM_DEPARTMENTS_UPDATE,
  PERM_DEPARTMENTS_WRITE,
  PERM_JOBS_DELETE,
  PERM_JOBS_READ,
  PERM_JOBS_UPDATE,
  PERM_JOBS_WRITE,
  PERM_POSTS_DELETE,
  PERM_POSTS_READ,
  PERM_POSTS_UPDATE,
  PERM_POSTS_WRITE,
  PERM_SETTINGS_READ,
  PERM_SETTINGS_WRITE,
  PERM_TAGS_DELETE,
  PERM_TAGS_READ,
  PERM_TAGS_UPDATE,
  PERM_TAGS_WRITE,
  PERM_USERS_DELETE,
  PERM_USERS_READ,
  PERM_USERS_UPDATE,
  PERM_USERS_WRITE,
} from '@shared/constants/permissions'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { userService } from '@/services/user.service'
import { User } from '@/types'
import { cn } from '@/utils/cn'

// Permission structure mapping
const PERMISSION_GROUPS = [
  {
    entity: 'Bài viết',
    actions: [
      { perm: PERM_POSTS_READ, type: 'READ', label: 'Xem' },
      { perm: PERM_POSTS_WRITE, type: 'CREATE', label: 'Thêm' },
      { perm: PERM_POSTS_UPDATE, type: 'UPDATE', label: 'Sửa' },
      { perm: PERM_POSTS_DELETE, type: 'DELETE', label: 'Xóa' },
    ],
  },
  {
    entity: 'Danh mục',
    actions: [
      { perm: PERM_CATS_READ, type: 'READ', label: 'Xem' },
      { perm: PERM_CATS_WRITE, type: 'CREATE', label: 'Thêm' },
      { perm: PERM_CATS_UPDATE, type: 'UPDATE', label: 'Sửa' },
      { perm: PERM_CATS_DELETE, type: 'DELETE', label: 'Xóa' },
    ],
  },
  {
    entity: 'Thẻ (Tags)',
    actions: [
      { perm: PERM_TAGS_READ, type: 'READ', label: 'Xem' },
      { perm: PERM_TAGS_WRITE, type: 'CREATE', label: 'Thêm' },
      { perm: PERM_TAGS_UPDATE, type: 'UPDATE', label: 'Sửa' },
      { perm: PERM_TAGS_DELETE, type: 'DELETE', label: 'Xóa' },
    ],
  },
  {
    entity: 'Phòng ban',
    actions: [
      { perm: PERM_DEPARTMENTS_READ, type: 'READ', label: 'Xem' },
      { perm: PERM_DEPARTMENTS_WRITE, type: 'CREATE', label: 'Thêm' },
      { perm: PERM_DEPARTMENTS_UPDATE, type: 'UPDATE', label: 'Sửa' },
      { perm: PERM_DEPARTMENTS_DELETE, type: 'DELETE', label: 'Xóa' },
    ],
  },
  {
    entity: 'Tin tuyển dụng',
    actions: [
      { perm: PERM_JOBS_READ, type: 'READ', label: 'Xem' },
      { perm: PERM_JOBS_WRITE, type: 'CREATE', label: 'Thêm' },
      { perm: PERM_JOBS_UPDATE, type: 'UPDATE', label: 'Sửa' },
      { perm: PERM_JOBS_DELETE, type: 'DELETE', label: 'Xóa' },
    ],
  },
  {
    entity: 'Ứng viên',
    actions: [
      { perm: PERM_CANDIDATES_READ, type: 'READ', label: 'Xem' },
      { perm: PERM_CANDIDATES_UPDATE, type: 'UPDATE', label: 'Sửa' },
    ],
  },
  {
    entity: 'Hộp thư',
    actions: [
      { perm: PERM_CONTACTS_READ, type: 'READ', label: 'Xem' },
      { perm: PERM_CONTACTS_DELETE, type: 'DELETE', label: 'Xóa' },
    ],
  },
  {
    entity: 'Người dùng',
    actions: [
      { perm: PERM_USERS_READ, type: 'READ', label: 'Xem' },
      { perm: PERM_USERS_WRITE, type: 'CREATE', label: 'Thêm' },
      { perm: PERM_USERS_UPDATE, type: 'UPDATE', label: 'Sửa' },
      { perm: PERM_USERS_DELETE, type: 'DELETE', label: 'Xóa' },
    ],
  },
  {
    entity: 'Cài đặt',
    actions: [
      { perm: PERM_SETTINGS_READ, type: 'READ', label: 'Xem' },
      { perm: PERM_SETTINGS_WRITE, type: 'UPDATE', label: 'Sửa' },
    ],
  },
  {
    entity: 'Nhật ký',
    actions: [{ perm: PERM_AUDIT_READ, type: 'READ', label: 'Xem' }],
  },
]

const ACTION_TYPES = [
  { type: 'READ', label: 'XEM', color: 'text-blue-600' },
  { type: 'CREATE', label: 'THÊM', color: 'text-emerald-600' },
  { type: 'UPDATE', label: 'SỬA', color: 'text-amber-600' },
  { type: 'DELETE', label: 'XÓA', color: 'text-rose-600' },
]

interface EditPermissionsDialogProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
}

export function EditPermissionsDialog({ user, isOpen, onClose }: EditPermissionsDialogProps) {
  const [localPermissions, setLocalPermissions] = useState<string>('0')
  const queryClient = useQueryClient()

  useEffect(() => {
    if (user && isOpen) {
      setLocalPermissions(user.permissions || '0')
    }
  }, [user, isOpen])

  const mutation = useMutation({
    mutationFn: (permissions: string) => {
      if (!user) throw new Error('No user selected')
      return userService.update(user.id, { permissions })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Cập nhật quyền hạn thành công')
      onClose()
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật quyền hạn')
    },
  })

  const hasPermission = (permissions: string, permVal: bigint) => {
    if (!permissions) return false
    try {
      return checkPerm(permissions, permVal)
    } catch {
      return false
    }
  }

  const togglePermission = (permVal: bigint) => {
    try {
      const p = BigInt(localPermissions)
      const newP = checkPerm(localPermissions, permVal) ? p ^ permVal : p | permVal
      setLocalPermissions(newP.toString())
    } catch {
      // Ignore invalid bigint strings
    }
  }

  const handleSave = () => {
    mutation.mutate(localPermissions)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='sm:max-w-2xl rounded-3xl border-white/10 shadow-2xl overflow-hidden p-0 animate-in zoom-in-95 duration-200'>
        <div className='absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none' />
        <div className='p-6 md:p-8 space-y-6 relative'>
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

          <div className='rounded-2xl border border-muted/50 overflow-hidden bg-card/50'>
            <Table>
              <TableHeader className='bg-muted/30'>
                <TableRow className='hover:bg-transparent border-b border-muted/50'>
                  <TableHead className='px-6 py-4 font-bold text-foreground uppercase text-[11px] tracking-wider w-[200px]'>
                    Chức năng
                  </TableHead>
                  {ACTION_TYPES.map((action) => (
                    <TableHead
                      key={action.type}
                      className={cn(
                        'px-4 py-4 font-bold uppercase text-[11px] tracking-wider text-center',
                        action.color
                      )}
                    >
                      {action.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {PERMISSION_GROUPS.map((group) => (
                  <TableRow
                    key={group.entity}
                    className='hover:bg-primary/5 transition-colors border-b border-muted/50 last:border-0'
                  >
                    <TableCell className='px-6 py-4 font-bold text-foreground/80 text-sm'>{group.entity}</TableCell>
                    {ACTION_TYPES.map((actionType) => {
                      const permission = group.actions.find((a) => a.type === actionType.type)
                      if (!permission) {
                        return (
                          <TableCell key={actionType.type} className='px-4 py-4 text-center'>
                            <div className='flex justify-center'>
                              <div className='h-1 w-4 rounded-full bg-muted/30' />
                            </div>
                          </TableCell>
                        )
                      }
                      return (
                        <TableCell
                          key={actionType.type}
                          className='px-4 py-4 text-center'
                          onClick={() => togglePermission(permission.perm)}
                        >
                          <div className='flex justify-center'>
                            <Checkbox
                              checked={hasPermission(localPermissions, permission.perm)}
                              onCheckedChange={() => togglePermission(permission.perm)}
                              className='rounded-md border-primary/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all duration-200 hover:scale-110'
                            />
                          </div>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <DialogFooter className='gap-2 pt-4'>
            <Button
              variant='ghost'
              onClick={onClose}
              className='rounded-xl px-6 hover:bg-muted font-bold text-muted-foreground'
            >
              Đóng
            </Button>
            <Button
              onClick={handleSave}
              disabled={mutation.isPending}
              className='rounded-xl px-8 shadow-lg shadow-primary/20 font-bold bg-primary hover:scale-[1.02] transition-transform active:scale-95'
            >
              {mutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
