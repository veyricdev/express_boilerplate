import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { User as AuthorIcon, Calendar, Clock, Edit, Eye, Filter, Plus, Search, Trash2 } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router'
import { SharedPagination } from '@/components/shared/shared-pagination'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { postService } from '@/services/post.service'
import { Post } from '@/types'
import { cn } from '@/utils/cn'

export default function PostsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchTerm = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '10', 10)
  const navigate = useNavigate()

  const { data: response, isLoading } = useQuery({
    queryKey: ['posts', searchTerm, page, limit],
    queryFn: () => postService.findAll({ search: searchTerm, page, limit }),
  })

  const posts = response?.data || []
  const meta = response?.meta

  const getStatusBadge = (status: string, deletedAt?: string | null) => {
    if (deletedAt)
      return (
        <Badge variant='destructive' className='px-2 py-0.5 rounded-full font-semibold'>
          Đã xóa
        </Badge>
      )

    switch (status) {
      case 'PUBLISHED':
        return (
          <Badge className='bg-emerald-500/15 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/25 px-2 py-0.5 rounded-full font-semibold transition-colors'>
            Công khai
          </Badge>
        )
      case 'DRAFT':
        return (
          <Badge
            variant='secondary'
            className='bg-slate-500/15 text-slate-500 border-slate-500/20 px-2 py-0.5 rounded-full font-semibold'
          >
            Nháp
          </Badge>
        )
      case 'SCHEDULED':
        return (
          <Badge className='bg-amber-500/15 text-amber-600 border-amber-500/20 px-2 py-0.5 rounded-full font-semibold'>
            Lên lịch
          </Badge>
        )
      default:
        return <Badge className='rounded-full'>{status}</Badge>
    }
  }

  return (
    <div className='p-8 space-y-6'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent'>
            Bài viết
          </h1>
          <p className='text-muted-foreground'>Quản lý nội dung bài viết và xuất bản.</p>
        </div>
        <Button className='shadow-lg shadow-primary/20' onClick={() => navigate('/posts/create')}>
          <Plus className='mr-2 h-4 w-4' /> Viết bài mới
        </Button>
      </div>

      <div className='bg-card rounded-2xl border shadow-sm overflow-hidden'>
        <div className='p-5 border-b bg-muted/30 flex flex-col sm:flex-row items-center gap-4'>
          <div className='relative flex-1 w-full'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Tìm kiếm tiêu đề bài viết...'
              className='pl-10 h-10 bg-background focus-visible:ring-primary/20 transition-all'
              value={searchTerm}
              onChange={(e) => {
                const newParams = new URLSearchParams(searchParams)
                if (e.target.value) {
                  newParams.set('search', e.target.value)
                } else {
                  newParams.delete('search')
                }
                newParams.set('page', '1')
                setSearchParams(newParams, { replace: true })
              }}
            />
          </div>
          <div className='flex items-center gap-2 w-full sm:w-auto'>
            <Button variant='outline' className='h-10 border-dashed'>
              <Filter className='mr-2 h-4 w-4' /> Lọc
            </Button>
          </div>
        </div>

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
                        <span className='font-semibold text-foreground leading-tight hover:text-primary cursor-pointer transition-colors'>
                          {post.title}
                        </span>
                        <span className='text-xs text-muted-foreground font-mono flex items-center gap-1'>
                          <span className='opacity-50'>/</span>
                          {post.slug}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className='px-6 py-4'>
                      <Badge variant='outline' className='bg-muted/50 border-muted-foreground/10 font-normal'>
                        {post.category?.name || 'Không có'}
                      </Badge>
                    </TableCell>
                    <TableCell className='px-6 py-4'>{getStatusBadge(post.status, post.deletedAt)}</TableCell>
                    <TableCell className='px-6 py-4'>
                      <div className='flex items-center gap-2.5'>
                        <div className='h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary'>
                          <AuthorIcon className='h-3.5 w-3.5' />
                        </div>
                        <span className='text-sm font-medium text-foreground/80'>
                          {post.author?.fullName || 'Ẩn danh'}
                        </span>
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
        {meta && <SharedPagination meta={meta} />}
      </div>
    </div>
  )
}
