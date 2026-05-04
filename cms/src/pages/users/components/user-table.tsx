import { CheckCircle2, ShieldCheck, Trash2, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { User } from '@/types'

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
  onEditPermissions: (user: User) => void
}

export function UserTable({ users, isLoading, onEditPermissions }: UserTableProps) {
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
              <TableCell colSpan={4} className='h-48 text-center'>
                <div className='flex flex-col items-center justify-center gap-3 text-muted-foreground'>
                  <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent shadow-sm' />
                  <span className='text-sm font-bold animate-pulse uppercase tracking-widest'>Đang tải...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className='h-48 text-center text-muted-foreground/60 font-medium italic'>
                Không tìm thấy người dùng nào phù hợp.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id} className='hover:bg-muted/30 transition-all border-b last:border-0 group'>
                <TableCell className='px-6 py-5'>
                  <div className='flex items-center gap-4'>
                    <div className='h-10 w-10 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold shadow-sm border border-primary/10 transition-transform group-hover:scale-110'>
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className='flex flex-col gap-0.5'>
                      <span className='font-bold text-foreground group-hover:text-primary transition-colors'>
                        {user.fullName}
                      </span>
                      <span className='text-[11px] text-muted-foreground font-medium'>{user.email}</span>
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
                      <Badge
                        variant='outline'
                        className='text-[10px] font-bold text-muted-foreground/60 border-dashed'
                      >
                        +{PERMISSIONS.filter((p) => hasPermission(user.permissions, p.bit)).length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className='px-6 py-5'>
                  {user.isActive ? (
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
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary transition-all active:scale-90'
                          onClick={() => onEditPermissions(user)}
                        >
                          <ShieldCheck className='h-4 w-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className='rounded-lg font-bold'>Phân quyền</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className='rounded-lg font-bold'>Xóa người dùng</TooltipContent>
                    </Tooltip>
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
