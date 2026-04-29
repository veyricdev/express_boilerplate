import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Plus, Search, ShieldCheck, Trash2, XCircle } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
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

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const { data: response, isLoading } = useQuery({
    queryKey: ['users', searchTerm, page],
    queryFn: () => userService.findAll({ search: searchTerm, page, limit: 10 }),
  })

  const users = response?.data || []
  const meta = response?.meta

  const hasPermission = (permissions: string | undefined | null, bit: number) => {
    if (!permissions) return false
    try {
      const p = BigInt(permissions)
      return (p & (1n << BigInt(bit))) !== 0n
    } catch {
      return false
    }
  }

  const renderPagination = () => {
    if (!meta || meta.lastPage <= 1) return null

    const pages = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(meta.lastPage, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return (
      <div className='p-4 border-t bg-muted/20'>
        <Pagination className='justify-end'>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href='#'
                text='Trước'
                onClick={(e) => {
                  e.preventDefault()
                  if (page > 1) setPage(page - 1)
                }}
                className={cn(page === 1 && 'pointer-events-none opacity-50')}
              />
            </PaginationItem>

            {startPage > 1 && (
              <>
                <PaginationItem>
                  <PaginationLink
                    href='#'
                    onClick={(e) => {
                      e.preventDefault()
                      setPage(1)
                    }}
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
                {startPage > 2 && <PaginationEllipsis />}
              </>
            )}

            {pages.map((p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  href='#'
                  isActive={p === page}
                  onClick={(e) => {
                    e.preventDefault()
                    setPage(p)
                  }}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}

            {endPage < meta.lastPage && (
              <>
                {endPage < meta.lastPage - 1 && <PaginationEllipsis />}
                <PaginationItem>
                  <PaginationLink
                    href='#'
                    onClick={(e) => {
                      e.preventDefault()
                      setPage(meta.lastPage)
                    }}
                  >
                    {meta.lastPage}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}

            <PaginationItem>
              <PaginationNext
                href='#'
                text='Sau'
                onClick={(e) => {
                  e.preventDefault()
                  if (page < meta.lastPage) setPage(page + 1)
                }}
                className={cn(page === meta.lastPage && 'pointer-events-none opacity-50')}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    )
  }

  return (
    <div className='p-8 space-y-6'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent'>
            Người dùng
          </h1>
          <p className='text-muted-foreground'>Quản lý tài khoản và phân quyền hệ thống.</p>
        </div>
        <Button className='shadow-lg shadow-primary/20 rounded-xl font-bold'>
          <Plus className='mr-2 h-4 w-4' /> Thêm người dùng
        </Button>
      </div>

      <div className='bg-card rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md border-muted/50'>
        <div className='p-5 border-b bg-muted/30 flex flex-col sm:flex-row items-center gap-4'>
          <div className='relative flex-1 w-full'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60' />
            <Input
              placeholder='Tìm theo tên hoặc email...'
              className='pl-10 bg-background border-muted-foreground/10 focus-visible:ring-primary/20 h-10 w-full rounded-xl'
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(1)
              }}
            />
          </div>
        </div>

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
                      <span className='text-sm font-bold animate-pulse'>Đang tải người dùng...</span>
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
                users.map((user: User) => (
                  <TableRow key={user.id} className='hover:bg-muted/30 transition-all border-b last:border-0 group'>
                    <TableCell className='px-6 py-5'>
                      <div className='flex items-center gap-4'>
                        <div className='h-10 w-10 rounded-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold shadow-sm border border-primary/10 transition-transform group-hover:scale-110'>
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className='flex flex-col gap-0.5'>
                          <span className='font-bold text-foreground group-hover:text-primary transition-colors'>
                            {user.fullName}
                          </span>
                          <span className='text-xs text-muted-foreground font-medium'>{user.email}</span>
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
                      <div className='flex justify-end gap-1.5 transition-all'>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary transition-all active:scale-90'
                              onClick={() => {
                                setSelectedUser(user)
                                setIsEditDialogOpen(true)
                              }}
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
        {renderPagination()}
      </div>

      {/* Edit Permissions Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='sm:max-w-2xl rounded-3xl border-white/10 shadow-2xl overflow-hidden p-0'>
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
                  {selectedUser?.fullName}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 py-2 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar'>
              {PERMISSIONS.map((perm) => (
                <div
                  key={perm.bit}
                  className={cn(
                    'flex flex-row items-start space-x-3 space-y-0 rounded-2xl border p-4 transition-all cursor-pointer group hover:shadow-sm',
                    hasPermission(selectedUser?.permissions, perm.bit)
                      ? 'bg-primary/5 border-primary/20 shadow-xs'
                      : 'bg-card border-muted/50 hover:bg-muted/30'
                  )}
                  onClick={() => {
                    // TODO: Toggle permission logic
                  }}
                >
                  <Checkbox
                    id={`perm-${perm.bit}`}
                    checked={selectedUser ? hasPermission(selectedUser.permissions, perm.bit) : false}
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
                onClick={() => setIsEditDialogOpen(false)}
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
    </div>
  )
}
