import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { SharedPagination } from '@/components/shared/shared-pagination'
import { tagService } from '@/services/tag.service'
import { Tag } from '@/types'
import { TagDialog } from './components/tag-dialog'
import { TagFilters } from './components/tag-filters'
import { TagHeader } from './components/tag-header'
import { TagTable } from './components/tag-table'

export default function TagsPage() {
  const [searchParams] = useSearchParams()
  const search = searchParams.get('search') || ''
  const trashMode = (searchParams.get('trashMode') as any) || 'active'
  const fromDate = searchParams.get('fromDate') || undefined
  const toDate = searchParams.get('toDate') || undefined
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '10', 10)

  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: response, isLoading } = useQuery({
    queryKey: ['tags', search, trashMode, fromDate, toDate, page, limit],
    queryFn: () => tagService.findAll({ search, trashMode, fromDate, toDate, page, limit }),
  })

  const tags = response?.data || []
  const meta = response?.meta

  const handleAdd = () => {
    setSelectedTag(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (tag: Tag) => {
    setSelectedTag(tag)
    setIsDialogOpen(true)
  }

  return (
    <div className='p-4 md:p-8 space-y-8 max-w-(--breakpoint-2xl) w-full mx-auto animate-in fade-in duration-500'>
      <TagHeader onAdd={handleAdd} />

      <div className='bg-card rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md border-muted/50'>
        <TagFilters />
        <TagTable tags={tags} isLoading={isLoading} onEdit={handleEdit} />
        {meta && <SharedPagination meta={meta} />}
      </div>

      <TagDialog tag={selectedTag} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  )
}
