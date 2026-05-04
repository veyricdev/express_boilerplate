import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Edit, Lock, RotateCcw, Shield, Trash2, Unlock, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { usePermission } from '@/hooks/use-permission'
import { PERM_USERS_DELETE, PERM_USERS_UPDATE } from '@shared/constants/permissions'
import { userService } from '@/services/user.service'
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

interface UserTableProps {
  users: User[]
  isLoading: boolean
  onEdit: (user: User) => void
  onEditPermissions: (user: User) => void
}

export function UserTable({ users, isLoading, onEdit, onEditPermissions }: UserTableProps) {
  const queryClient = useQueryClient()
  const permission = usePermission()

  const deleteMutation = useMutation({
    mutationFn: (id: number) => userService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Xóa người dùng thành công')
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi xóa người dùng')
    },
  })

  const restoreMutation = useMutation({
    mutationFn: (id: number) => userService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Khôi phục người dùng thành công')
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi khôi phục người dùng')
    },
  })

  const permanentDeleteMutation = useMutation({
    mutationFn: (id: number) => userService.permanentRemove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Xóa vĩnh viễn người dùng thành công')
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi xóa vĩnh viễn người dùng')
    },
  })

  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleRestore = (id: number) => {
    if (window.confirm('Bạn có muốn khôi phục người dùng này không?')) {
      restoreMutation.mutate(id)
    }
  }

  const handlePermanentDelete = (id: number) => {
    if (window.confirm('CẢNH BÁO: Người dùng này sẽ bị xóa vĩnh viễn. Bạn có chắc chắn?')) {
      permanentDeleteMutation.mutate(id)
    }
  }

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => userService.setStatus(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success(variables.isActive ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản')
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi thay đổi trạng thái tài khoản')
    },
  })

  const handleToggleActive = (id: number, currentStatus: boolean) => {
    if (window.confirm(`Bạn có chắc muốn ${currentStatus ? 'khóa' : 'mở khóa'} tài khoản này?`)) {
      toggleMutation.mutate({ id, isActive: !currentStatus })
    }
  }

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
    <div className='overflow-x-auto'>
      <Table>
        <TableHeader className='bg-muted/50'>
          <TableRow className='hover:bg-transparent border-b'>
            <TableHead className='px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider w-[80px]'>
              #ID
            </TableHead>
            <TableHead className='px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider'>
              Người dùng
            </TableHead>
            <TableHead className='px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider'>
              Quyền hạn
            </TableHead>
            <TableHead className='px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider'>
              Trạng thái
            </TableHead>
            <TableHead className='px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider text-right'>
              Hành động
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className='h-48 text-center'>
                <div className='flex flex-col items-center justify-center gap-3 text-muted-foreground'>
                  <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent shadow-sm' />
                  <span className='text-sm font-bold animate-pulse uppercase tracking-widest'>Đang tải...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className='h-48 text-center text-muted-foreground/60 font-medium italic'>
                Không tìm thấy người dùng nào phù hợp.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow
                key={user.id}
                className={cn(
                  'hover:bg-muted/30 transition-all border-b last:border-0 group',
                  user.deletedAt && 'bg-destructive/5 opacity-80'
                )}
              >
                <TableCell className='px-6 py-5 font-mono text-[11px] text-muted-foreground'>#{user.id}</TableCell>
                <TableCell className='px-6 py-5'>
                  <div className='flex items-center gap-4'>
                    <div className='h-10 w-10 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold shadow-sm border border-primary/10 transition-transform group-hover:scale-110'>
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className='flex flex-col gap-0.5'>
                      <span className='font-bold text-foreground group-hover:text-primary transition-colors leading-tight'>
                        {user.fullName}
                      </span>
                      <span className='text-[11px] text-muted-foreground font-mono flex items-center gap-1'>
                        <span className='opacity-50 font-sans'>@</span>
                        {user.email}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className='px-6 py-5'>
                  <div className='flex flex-wrap gap-1.5 max-w-[400px]'>
                    {PERMISSIONS.filter((p) => hasPermission(user.permissions, p.bit))
                      .slice(0, 3)
                      .map((p) => (
                        <Badge
                          key={p.label}
                          variant='secondary'
                          className='text-[10px] px-2 py-0.5 bg-muted/50 border-muted-foreground/5 font-bold uppercase tracking-tight text-muted-foreground'
                        >
                          {p.description}
                        </Badge>
                      ))}
                    {PERMISSIONS.filter((p) => hasPermission(user.permissions, p.bit)).length > 3 && (
                      <Badge variant='outline' className='text-[10px] font-bold text-muted-foreground/60 border-dashed'>
                        +{PERMISSIONS.filter((p) => hasPermission(user.permissions, p.bit)).length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className='px-6 py-5'>
                  {user.deletedAt ? (
                    <Badge
                      variant='destructive'
                      className='px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-tighter'
                    >
                      <XCircle className='h-3 w-3 mr-1' /> Đã xóa
                    </Badge>
                  ) : user.isActive ? (
                    <Badge className='bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-tighter shadow-xs'>
                      <CheckCircle2 className='h-3 w-3 mr-1' /> Hoạt động
                    </Badge>
                  ) : (
                    <Badge
                      variant='secondary'
                      className='bg-slate-500/10 text-slate-500 border-slate-500/20 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-tighter'
                    >
                      <XCircle className='h-3 w-3 mr-1' /> Đã khóa
                    </Badge>
                  )}
                </TableCell>
                <TableCell className='px-6 py-5 text-right'>
                  <div className='flex justify-end gap-1.5 transition-opacity'>
                    {permission.has(PERM_USERS_UPDATE) && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary transition-all active:scale-90'
                            onClick={() => onEditPermissions(user)}
                          >
                            <Shield className='h-4 w-4' />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className='rounded-lg font-bold'>Phân quyền</TooltipContent>
                      </Tooltip>
                    )}

                    {!user.deletedAt && permission.has(PERM_USERS_UPDATE) && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon'
                            className={cn(
                              'h-9 w-9 rounded-full transition-all active:scale-90',
                              user.isActive
                                ? 'hover:bg-rose-500/10 hover:text-rose-600'
                                : 'hover:bg-emerald-500/10 hover:text-emerald-600'
                            )}
                            onClick={() => handleToggleActive(user.id, user.isActive)}
                          >
                            {user.isActive ? <Lock className='h-4 w-4' /> : <Unlock className='h-4 w-4' />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className='rounded-lg font-bold'>
                          {user.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {permission.has(PERM_USERS_UPDATE) && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary transition-all active:scale-90'
                            onClick={() => onEdit(user)}
                          >
                            <Edit className='h-4 w-4' />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className='rounded-lg font-bold'>Chỉnh sửa</TooltipContent>
                      </Tooltip>
                    )}

                    {user.deletedAt ? (
                      <>
                        {permission.has(PERM_USERS_UPDATE) && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary transition-all'
                                onClick={() => handleRestore(user.id)}
                                disabled={restoreMutation.isPending}
                              >
                                <RotateCcw className='h-4 w-4' />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className='rounded-lg font-bold'>Khôi phục</TooltipContent>
                          </Tooltip>
                        )}

                        {permission.has(PERM_USERS_DELETE) && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all'
                                onClick={() => handlePermanentDelete(user.id)}
                                disabled={permanentDeleteMutation.isPending}
                              >
                                <XCircle className='h-4 w-4' />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className='rounded-lg font-bold'>Xóa vĩnh viễn</TooltipContent>
                          </Tooltip>
                        )}
                      </>
                    ) : (
                      permission.has(PERM_USERS_DELETE) && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all'
                              onClick={() => handleDelete(user.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className='rounded-lg font-bold'>Xóa người dùng</TooltipContent>
                        </Tooltip>
                      )
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
