import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit, RotateCcw, Trash2, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { usePermission } from '@/hooks/use-permission'
import { PERM_POSTS_READ, PERM_TAGS_DELETE, PERM_TAGS_UPDATE } from '@shared/constants/permissions'
import { tagService } from '@/services/tag.service'
import { Tag } from '@/types'
import { cn } from '@/utils/cn'

interface TagTableProps {
  tags: Tag[]
  isLoading: boolean
  onEdit: (tag: Tag) => void
}

export function TagTable({ tags, isLoading, onEdit }: TagTableProps) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const permission = usePermission()

  const deleteMutation = useMutation({
    mutationFn: (id: number) => tagService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      toast.success('Xóa tag thành công')
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi xóa tag')
    },
  })

  const restoreMutation = useMutation({
    mutationFn: (id: number) => tagService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      toast.success('Khôi phục tag thành công')
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi khôi phục tag')
    },
  })

  const permanentDeleteMutation = useMutation({
    mutationFn: (id: number) => tagService.permanentRemove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      toast.success('Xóa vĩnh viễn tag thành công')
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi xóa vĩnh viễn tag')
    },
  })

  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tag này?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleRestore = (id: number) => {
    if (window.confirm('Bạn có muốn khôi phục tag này không?')) {
      restoreMutation.mutate(id)
    }
  }

  const handlePermanentDelete = (id: number) => {
    if (window.confirm('CẢNH BÁO: Tag này sẽ bị xóa vĩnh viễn. Bạn có chắc chắn?')) {
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
              Tag
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
              <TableCell colSpan={5} className='h-48 text-center'>
                <div className='flex flex-col items-center justify-center gap-3 text-muted-foreground'>
                  <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent shadow-sm' />
                  <span className='text-sm font-bold animate-pulse uppercase tracking-widest'>Đang tải...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : tags.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className='h-48 text-center text-muted-foreground/60 font-medium italic'>
                Không tìm thấy tag nào phù hợp.
              </TableCell>
            </TableRow>
          ) : (
            tags.map((tag) => (
              <TableRow
                key={tag.id}
                className={cn(
                  'hover:bg-muted/30 transition-all border-b last:border-0 group',
                  tag.deletedAt && 'bg-destructive/5 opacity-80'
                )}
              >
                <TableCell className='px-6 py-5 font-mono text-[11px] text-muted-foreground'>#{tag.id}</TableCell>
                <TableCell className='px-6 py-5'>
                  <div className='flex flex-col gap-0.5'>
                    <div className='flex items-center gap-2'>
                      <Badge
                        variant='secondary'
                        className='bg-primary/5 text-primary border-primary/10 font-bold px-3 py-1 rounded-lg group-hover:bg-primary group-hover:text-white transition-all duration-300'
                      >
                        # {tag.name}
                      </Badge>
                    </div>
                    <span className='text-[11px] text-muted-foreground font-mono flex items-center gap-1 mt-1 px-1'>
                      <span className='opacity-50'>/</span>
                      {tag.slug}
                    </span>
                  </div>
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
                        navigate(`/posts?tagIds=${tag.id}`)
                      }
                    }}
                  >
                    {tag.postCount} BÀI VIẾT
                  </Badge>
                </TableCell>
                <TableCell className='px-6 py-5'>
                  {tag.deletedAt ? (
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
                    {permission.has(PERM_TAGS_UPDATE) && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary transition-all active:scale-90'
                            onClick={() => onEdit(tag)}
                          >
                            <Edit className='h-4 w-4' />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className='rounded-lg font-bold'>Chỉnh sửa</TooltipContent>
                      </Tooltip>
                    )}

                    {tag.deletedAt ? (
                      <>
                        {permission.has(PERM_TAGS_DELETE) && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary transition-all'
                                onClick={() => handleRestore(tag.id)}
                                disabled={restoreMutation.isPending}
                              >
                                <RotateCcw className='h-4 w-4' />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className='rounded-lg font-bold'>Khôi phục</TooltipContent>
                          </Tooltip>
                        )}

                        {permission.has(PERM_TAGS_DELETE) && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all'
                                onClick={() => handlePermanentDelete(tag.id)}
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
                        {permission.has(PERM_TAGS_DELETE) && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all'
                                onClick={() => handleDelete(tag.id)}
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className='rounded-lg font-bold'>Xóa tag</TooltipContent>
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
