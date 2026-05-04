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
      { bit: 0, type: 'READ', label: 'Xem' },
      { bit: 1, type: 'CREATE', label: 'Thêm' },
      { bit: 2, type: 'UPDATE', label: 'Sửa' },
      { bit: 3, type: 'DELETE', label: 'Xóa' },
    ],
  },
  {
    entity: 'Danh mục',
    actions: [
      { bit: 4, type: 'READ', label: 'Xem' },
      { bit: 5, type: 'CREATE', label: 'Thêm' },
      { bit: 6, type: 'UPDATE', label: 'Sửa' },
      { bit: 7, type: 'DELETE', label: 'Xóa' },
    ],
  },
  {
    entity: 'Thẻ (Tags)',
    actions: [
      { bit: 8, type: 'READ', label: 'Xem' },
      { bit: 9, type: 'CREATE', label: 'Thêm' },
      { bit: 10, type: 'UPDATE', label: 'Sửa' },
      { bit: 11, type: 'DELETE', label: 'Xóa' },
    ],
  },
  {
    entity: 'Người dùng',
    actions: [
      { bit: 12, type: 'READ', label: 'Xem' },
      { bit: 13, type: 'CREATE', label: 'Thêm' },
      { bit: 14, type: 'UPDATE', label: 'Sửa' },
      { bit: 15, type: 'DELETE', label: 'Xóa' },
    ],
  },
  {
    entity: 'Cài đặt',
    actions: [
      { bit: 17, type: 'READ', label: 'Xem' },
      { bit: 18, type: 'UPDATE', label: 'Sửa' },
    ],
  },
  {
    entity: 'Nhật ký',
    actions: [{ bit: 16, type: 'READ', label: 'Xem' }],
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

  const hasPermission = (permissions: string, bit: number) => {
    if (!permissions) return false
    try {
      const p = BigInt(permissions)
      return (p & (1n << BigInt(bit))) !== 0n
    } catch {
      return false
    }
  }

  const togglePermission = (bit: number) => {
    try {
      const p = BigInt(localPermissions)
      const bitVal = 1n << BigInt(bit)
      const newP = (p & bitVal) !== 0n ? p ^ bitVal : p | bitVal
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
                          onClick={() => togglePermission(permission.bit)}
                        >
                          <div className='flex justify-center'>
                            <Checkbox
                              checked={hasPermission(localPermissions, permission.bit)}
                              onCheckedChange={() => togglePermission(permission.bit)}
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
