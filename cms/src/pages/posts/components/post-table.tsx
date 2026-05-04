import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { User as AuthorIcon, Calendar, Clock, Edit, Eye, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Post } from '@/types'
import { cn } from '@/utils/cn'
import { PostStatusBadge } from './post-status-badge'

interface PostTableProps {
  posts: Post[]
  isLoading: boolean
}

export function PostTable({ posts, isLoading }: PostTableProps) {
  const navigate = useNavigate()

  return (
    <div className='overflow-x-auto'>
      <Table>
        <TableHeader className='bg-muted/50'>
          <TableRow className='hover:bg-transparent border-b'>
            <TableHead className='w-[40%] px-6 py-4 font-semibold text-foreground'>Tiêu đề</TableHead>
            <TableHead className='px-6 py-4 font-semibold text-foreground'>Danh mục</TableHead>
            <TableHead className='px-6 py-4 font-semibold text-foreground'>Trạng thái</TableHead>
            <TableHead className='px-6 py-4 font-semibold text-foreground'>Tác giả</TableHead>
            <TableHead className='px-6 py-4 font-semibold text-foreground text-right'>Ngày đăng</TableHead>
            <TableHead className='px-6 py-4 font-semibold text-foreground text-right'>Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className='h-32 text-center'>
                <div className='flex flex-col items-center gap-2 text-muted-foreground'>
                  <div className='animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent' />
                  <span>Đang tải dữ liệu...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : posts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className='h-32 text-center text-muted-foreground'>
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
                <TableCell className='px-6 py-4'>
                  <div className='flex flex-col gap-0.5'>
                    <span
                      className='font-semibold text-foreground leading-tight hover:text-primary cursor-pointer transition-colors'
                      onClick={() => navigate(`/posts/${post.id}/edit`)}
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

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary'
                        >
                          <Eye className='h-4 w-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Xem bài viết</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Xóa bài viết</TooltipContent>
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
