import { PERM_CATS_DELETE, PERM_CATS_UPDATE, PERM_POSTS_READ } from '@shared/constants/permissions'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit, RotateCcw, Trash2, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { usePermission } from '@/hooks/use-permission'
import { categoryService } from '@/services/category.service'
import { Category } from '@/types'
import { cn } from '@/utils/cn'

interface CategoryTableProps {
  categories: Category[]
  isLoading: boolean
  onEdit: (category: Category) => void
}

export function CategoryTable({ categories, isLoading, onEdit }: CategoryTableProps) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const permission = usePermission()

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoryService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Xóa danh mục thành công')
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi xóa danh mục')
    },
  })

  const restoreMutation = useMutation({
    mutationFn: (id: number) => categoryService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Khôi phục danh mục thành công')
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi khôi phục danh mục')
    },
  })

  const permanentDeleteMutation = useMutation({
    mutationFn: (id: number) => categoryService.permanentRemove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Xóa vĩnh viễn danh mục thành công')
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi xóa vĩnh viễn danh mục')
    },
  })

  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleRestore = (id: number) => {
    if (window.confirm('Bạn có muốn khôi phục danh mục này không?')) {
      restoreMutation.mutate(id)
    }
  }

  const handlePermanentDelete = (id: number) => {
    if (window.confirm('CẢNH BÁO: Danh mục này sẽ bị xóa vĩnh viễn. Bạn có chắc chắn?')) {
      permanentDeleteMutation.mutate(id)
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
            <TableHead className='px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider w-[40%]'>
              Danh mục
            </TableHead>
            <TableHead className='px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider w-[25%]'>
              Chi tiết
            </TableHead>
            <TableHead className='px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider'>
              Thống kê
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
              <TableCell colSpan={6} className='h-48 text-center'>
                <div className='flex flex-col items-center justify-center gap-3 text-muted-foreground'>
                  <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent shadow-sm' />
                  <span className='text-sm font-bold animate-pulse uppercase tracking-widest'>Đang tải...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className='h-48 text-center text-muted-foreground/60 font-medium italic'>
                Không tìm thấy danh mục nào phù hợp.
              </TableCell>
            </TableRow>
          ) : (
            categories.map((category) => (
              <TableRow
                key={category.id}
                className={cn(
                  'hover:bg-muted/30 transition-all border-b last:border-0 group',
                  category.deletedAt && 'bg-destructive/5 opacity-80'
                )}
              >
                <TableCell className='px-6 py-5 font-mono text-[11px] text-muted-foreground'>#{category.id}</TableCell>
                <TableCell className='px-6 py-5'>
                  <div className='flex items-center gap-4'>
                    <div className='h-10 w-10 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold shadow-sm border border-primary/10 transition-transform group-hover:scale-110'>
                      {category.name.charAt(0).toUpperCase()}
                    </div>
                    <div className='flex flex-col gap-0.5'>
                      <span className='font-bold text-foreground group-hover:text-primary transition-colors leading-tight'>
                        {category.name}
                      </span>
                      <span className='text-[11px] text-muted-foreground font-mono flex items-center gap-1'>
                        <span className='opacity-50'>/</span>
                        {category.slug}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className='px-6 py-5'>
                  <span className='text-xs text-muted-foreground line-clamp-2 text-wrap max-w-[200px] italic'>
                    {category.description || 'Chưa có mô tả'}
                  </span>
                </TableCell>
                <TableCell className='px-6 py-5'>
                  <Badge
                    variant='outline'
                    className={cn(
                      'font-bold bg-muted/50 border-muted-foreground/10 text-[11px] rounded-lg px-2 py-1',
                      permission.has(PERM_POSTS_READ)
                        ? 'cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors'
                        : 'opacity-70 cursor-not-allowed'
                    )}
                    onClick={() => {
                      if (permission.has(PERM_POSTS_READ)) {
                        navigate(`/posts?categoryId=${category.id}`)
                      }
                    }}
                  >
                    {category.postCount} BÀI VIẾT
                  </Badge>
                </TableCell>
                <TableCell className='px-6 py-5'>
                  {category.deletedAt ? (
                    <Badge
                      variant='destructive'
                      className='px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-tighter'
                    >
                      Đã xóa
                    </Badge>
                  ) : (
                    <Badge className='bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-tighter shadow-xs'>
                      Hoạt động
                    </Badge>
                  )}
                </TableCell>
                <TableCell className='px-6 py-5 text-right'>
                  <div className='flex justify-end gap-1.5 transition-opacity'>
                    {permission.has(PERM_CATS_UPDATE) && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary transition-all active:scale-90'
                            onClick={() => onEdit(category)}
                          >
                            <Edit className='h-4 w-4' />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className='rounded-lg font-bold'>Chỉnh sửa</TooltipContent>
                      </Tooltip>
                    )}

                    {category.deletedAt ? (
                      <>
                        {permission.has(PERM_CATS_DELETE) && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary transition-all'
                                onClick={() => handleRestore(category.id)}
                                disabled={restoreMutation.isPending}
                              >
                                <RotateCcw className='h-4 w-4' />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className='rounded-lg font-bold'>Khôi phục</TooltipContent>
                          </Tooltip>
                        )}

                        {permission.has(PERM_CATS_DELETE) && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all'
                                onClick={() => handlePermanentDelete(category.id)}
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
                      <>
                        {permission.has(PERM_CATS_DELETE) && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all'
                                onClick={() => handleDelete(category.id)}
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className='rounded-lg font-bold'>Xóa danh mục</TooltipContent>
                          </Tooltip>
                        )}
                      </>
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
