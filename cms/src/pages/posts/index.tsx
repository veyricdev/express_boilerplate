import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'
import { SharedPagination } from '@/components/shared/shared-pagination'
import { postService } from '@/services/post.service'
import { PostStatus, TrashMode } from '@/types'
import { PostFilters } from './components/post-filters'
import { PostHeader } from './components/post-header'
import { PostTable } from './components/post-table'

export default function PostsPage() {
  const [searchParams] = useSearchParams()

  const searchTerm = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '10', 10)
  const statusFilter = searchParams.get('status')
  const trashMode = (searchParams.get('trashMode') as TrashMode) || TrashMode.ACTIVE
  const categoryId = searchParams.get('categoryId')
  const author = searchParams.get('author') || ''
  const fromDate = searchParams.get('fromDate') || ''
  const toDate = searchParams.get('toDate') || ''
  const tagIds = searchParams.get('tagIds')?.split(',').map(Number).filter(Boolean) || []

  const { data: response, isLoading } = useQuery({
    queryKey: ['posts', searchTerm, page, limit, statusFilter, trashMode, categoryId, author, fromDate, toDate, tagIds],
    queryFn: () =>
      postService.findAll({
        search: searchTerm,
        page,
        limit,
        status: statusFilter as PostStatus,
        trashMode,
        categoryId: categoryId ? parseInt(categoryId, 10) : undefined,
        author,
        fromDate,
        toDate,
        tagIds,
      }),
  })

  const posts = response?.data || []
  const meta = response?.meta

  return (
    <div className='p-4 md:p-8 space-y-8 max-w-(--breakpoint-2xl) w-full mx-auto animate-in fade-in duration-500'>
      <PostHeader />

      <div className='bg-card rounded-2xl border shadow-sm overflow-hidden'>
        <PostFilters
          trashMode={trashMode}
          searchTerm={searchTerm}
          author={author}
          fromDate={fromDate}
          toDate={toDate}
          statusFilter={statusFilter}
          tagIds={tagIds}
        />

        <PostTable posts={posts} isLoading={isLoading} />

        {meta && <SharedPagination meta={meta} />}
      </div>
    </div>
  )
}
