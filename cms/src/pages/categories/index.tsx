import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { SharedPagination } from '@/components/shared/shared-pagination'
import { categoryService } from '@/services/category.service'
import { Category } from '@/types'
import { CategoryDialog } from './components/category-dialog'
import { CategoryFilters } from './components/category-filters'
import { CategoryHeader } from './components/category-header'
import { CategoryTable } from './components/category-table'

export default function CategoriesPage() {
  const [searchParams] = useSearchParams()
  const search = searchParams.get('search') || ''
  const trashMode = (searchParams.get('trashMode') as any) || 'active'
  const fromDate = searchParams.get('fromDate') || undefined
  const toDate = searchParams.get('toDate') || undefined
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '10', 10)

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: response, isLoading } = useQuery({
    queryKey: ['categories', search, trashMode, fromDate, toDate, page, limit],
    queryFn: () => categoryService.findAll({ search, trashMode, fromDate, toDate, page, limit }),
  })

  const categories = response?.data || []
  const meta = response?.meta

  const handleAdd = () => {
    setSelectedCategory(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setIsDialogOpen(true)
  }

  return (
    <div className='p-4 md:p-8 space-y-8 max-w-(--breakpoint-2xl) w-full mx-auto animate-in fade-in duration-500'>
      <CategoryHeader onAdd={handleAdd} />

      <div className='bg-card rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md border-muted/50'>
        <CategoryFilters />
        <CategoryTable categories={categories} isLoading={isLoading} onEdit={handleEdit} />
        {meta && <SharedPagination meta={meta} />}
      </div>

      <CategoryDialog category={selectedCategory} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  )
}
