import { useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { User as AuthorIcon, Calendar, Clock, Edit, Eye, RotateCcw, Trash2, XCircle } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { usePermission } from '@/hooks/use-permission'
import { PERM_POSTS_DELETE, PERM_POSTS_UPDATE } from '@shared/constants/permissions'
import { postService } from '@/services/post.service'
import { Post } from '@/types'
import { cn } from '@/utils/cn'
import { PostStatusBadge } from './post-status-badge'

interface PostTableProps {
  posts: Post[]
  isLoading: boolean
}

export function PostTable({ posts, isLoading }: PostTableProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const permission = usePermission()

  const deleteMutation = useMutation({
    mutationFn: (id: number) => postService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success('Xóa bài viết thành công')
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi xóa bài viết')
    },
  })

  const restoreMutation = useMutation({
    mutationFn: (id: number) => postService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success('Khôi phục bài viết thành công')
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi khôi phục bài viết')
    },
  })

  const permanentDeleteMutation = useMutation({
    mutationFn: (id: number) => postService.permanentRemove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success('Xóa vĩnh viễn bài viết thành công')
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi xóa vĩnh viễn bài viết')
    },
  })

  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleRestore = (id: number) => {
    if (window.confirm('Bạn có muốn khôi phục bài viết này không?')) {
      restoreMutation.mutate(id)
    }
  }

  const handlePermanentDelete = (id: number) => {
    if (window.confirm('CẢNH BÁO: Bài viết này sẽ bị xóa vĩnh viễn và không thể khôi phục. Bạn có chắc chắn?')) {
      permanentDeleteMutation.mutate(id)
    }
  }

  const handleViewDetails = () => {
    alert('Tính năng xem chi tiết bài viết đang được phát triển!')
  }

  return (
    <div className='overflow-x-auto'>
      <Table>
        <TableHeader className='bg-muted/50'>
          <TableRow className='hover:bg-transparent border-b'>
            <TableHead className='px-6 py-4 font-semibold text-foreground w-[80px]'>#ID</TableHead>
            <TableHead className='w-[30%] px-6 py-4 font-semibold text-foreground'>Tiêu đề</TableHead>
            <TableHead className='px-6 py-4 font-semibold text-foreground'>Danh mục</TableHead>
            <TableHead className='px-6 py-4 font-semibold text-foreground'>Tags</TableHead>
            <TableHead className='px-6 py-4 font-semibold text-foreground'>Trạng thái</TableHead>
            <TableHead className='px-6 py-4 font-semibold text-foreground'>Tác giả</TableHead>
            <TableHead className='px-6 py-4 font-semibold text-foreground text-right'>Ngày đăng</TableHead>
            <TableHead className='px-6 py-4 font-semibold text-foreground text-right'>Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className='h-32 text-center'>
                <div className='flex flex-col items-center gap-2 text-muted-foreground'>
                  <div className='animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent' />
                  <span>Đang tải dữ liệu...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : posts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className='h-32 text-center text-muted-foreground'>
                Không có bài viết nào phù hợp.
              </TableCell>
            </TableRow>
          ) : (
            posts.map((post: Post) => (
              <TableRow
                key={post.id}
                className={cn(
                  'hover:bg-muted/30 transition-colors border-b last:border-0',
                  post.deletedAt && 'bg-destructive/5 opacity-80'
                )}
              >
                <TableCell className='px-6 py-4 font-mono text-[11px] text-muted-foreground'>#{post.id}</TableCell>
                <TableCell className='px-6 py-4'>
                  <div className='flex flex-col gap-0.5'>
                    <span
                      className={cn(
                        'font-semibold text-foreground leading-tight transition-colors',
                        permission.has(PERM_POSTS_UPDATE) && 'hover:text-primary cursor-pointer'
                      )}
                      onClick={() => permission.has(PERM_POSTS_UPDATE) && navigate(`/posts/${post.id}/edit`)}
                    >
                      {post.title}
                    </span>
                    <span className='text-xs text-muted-foreground font-mono flex items-center gap-1'>
                      <span className='opacity-50'>/</span>
                      {post.slug}
                    </span>
                  </div>
                </TableCell>
                <TableCell className='px-6 py-4'>
                  <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted/50 border border-muted-foreground/10'>
                    {post.category?.name || 'Không có'}
                  </span>
                </TableCell>
                <TableCell className='px-6 py-4'>
                  <div className='flex flex-wrap gap-1.5'>
                    {post.postTags?.length ? (
                      post.postTags.map((pt) => (
                        <Badge
                          key={pt.tagId}
                          variant='secondary'
                          className='cursor-pointer text-[10px] font-semibold px-2 py-0 rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground border border-primary/20 dark:border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all duration-200'
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation()
                            const newParams = new URLSearchParams(window.location.search)
                            newParams.set('tagIds', pt.tagId.toString())
                            newParams.set('page', '1')
                            navigate(`?${newParams.toString()}`, { replace: true })
                          }}
                        >
                          #{pt.tag?.name}
                        </Badge>
                      ))
                    ) : (
                      <span className='text-xs text-muted-foreground/50 italic'>-</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className='px-6 py-4'>
                  <PostStatusBadge status={post.status} deletedAt={post.deletedAt} />
                </TableCell>
                <TableCell className='px-6 py-4'>
                  <div className='flex items-center gap-2.5'>
                    <div className='h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary'>
                      <AuthorIcon className='h-3.5 w-3.5' />
                    </div>
                    <span className='text-sm font-medium text-foreground/80'>{post.author?.fullName || 'Ẩn danh'}</span>
                  </div>
                </TableCell>
                <TableCell className='px-6 py-4 text-right'>
                  {post.publishedAt ? (
                    <div className='flex flex-col items-end gap-0.5'>
                      <div className='flex items-center gap-1.5 text-sm text-foreground/80 font-medium'>
                        <Calendar className='h-3 w-3 opacity-50' />
                        {format(new Date(post.publishedAt), 'dd/MM/yyyy', { locale: vi })}
                      </div>
                      <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                        <Clock className='h-3 w-3 opacity-50' />
                        {format(new Date(post.publishedAt), 'HH:mm', { locale: vi })}
                      </div>
                    </div>
                  ) : (
                    <span className='text-muted-foreground italic text-sm'>Chưa đăng</span>
                  )}
                </TableCell>
                <TableCell className='px-6 py-4 text-right'>
                  <div className='flex justify-end gap-1'>
                    {permission.has(PERM_POSTS_UPDATE) && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary'
                            onClick={() => navigate(`/posts/${post.id}/edit`)}
                          >
                            <Edit className='h-4 w-4' />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Chỉnh sửa</TooltipContent>
                      </Tooltip>
                    )}

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary'
                          onClick={handleViewDetails}
                        >
                          <Eye className='h-4 w-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Xem bài viết</TooltipContent>
                    </Tooltip>

                    {post.deletedAt ? (
                      <>
                        {permission.has(PERM_POSTS_DELETE) && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary'
                                onClick={() => handleRestore(post.id)}
                                disabled={restoreMutation.isPending}
                              >
                                <RotateCcw className='h-4 w-4' />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Khôi phục</TooltipContent>
                          </Tooltip>
                        )}

                        {permission.has(PERM_POSTS_DELETE) && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive'
                                onClick={() => handlePermanentDelete(post.id)}
                                disabled={permanentDeleteMutation.isPending}
                              >
                                <XCircle className='h-4 w-4' />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Xóa vĩnh viễn</TooltipContent>
                          </Tooltip>
                        )}
                      </>
                    ) : (
                      <>
                        {permission.has(PERM_POSTS_DELETE) && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive'
                                onClick={() => handleDelete(post.id)}
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Xóa bài viết</TooltipContent>
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
