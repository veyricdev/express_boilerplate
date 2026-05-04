import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrashMode } from '@/types'
import { AdvancedFilterPopover } from './advanced-filter-popover'

interface PostFiltersProps {
  trashMode: TrashMode
  searchTerm: string
  categories: any[]
  author: string
  fromDate: string
  toDate: string
  statusFilter: string | null
}

export function PostFilters({
  trashMode,
  searchTerm,
  categories,
  author,
  fromDate,
  toDate,
  statusFilter,
}: PostFiltersProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [localSearch, setLocalSearch] = useState(searchTerm)

  // Sync local search with prop (e.g. from Advanced Filter reset or direct URL change)
  useEffect(() => {
    setLocalSearch(searchTerm)
  }, [searchTerm])

  // Debounce update to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchTerm) {
        const newParams = new URLSearchParams(searchParams)
        if (localSearch) newParams.set('search', localSearch)
        else newParams.delete('search')
        newParams.set('page', '1')
        setSearchParams(newParams, { replace: true })
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [localSearch, searchParams, setSearchParams, searchTerm])

  return (
    <div className='px-6 py-4 border-b bg-muted/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
      <Tabs
        value={trashMode}
        onValueChange={(value) => {
          const newParams = new URLSearchParams(searchParams)
          newParams.set('trashMode', value)
          newParams.set('page', '1')
          setSearchParams(newParams, { replace: true })
        }}
        className='w-full lg:w-auto'
      >
        <TabsList className='bg-muted/50 border h-10! p-1 gap-1 rounded-xl shrink-0'>
          <TabsTrigger
            value={TrashMode.ALL}
            className='px-4 rounded-lg transition-all data-[state=active]:shadow-sm gap-2 h-full'
          >
            Tất cả
          </TabsTrigger>
          <TabsTrigger
            value={TrashMode.ACTIVE}
            className='px-4 rounded-lg transition-all data-[state=active]:shadow-sm gap-2 h-full'
          >
            Hoạt động
          </TabsTrigger>
          <TabsTrigger
            value={TrashMode.TRASH}
            className='px-4 rounded-lg transition-all data-[state=active]:shadow-sm gap-2 h-full'
          >
            Thùng rác
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className='flex items-center gap-3 w-full lg:w-auto'>
        <div className='relative flex-1 lg:w-72'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Tìm kiếm bài viết...'
            className='h-10! pl-9 pr-9 rounded-xl bg-muted/20 border-muted-foreground/10 focus-visible:ring-primary transition-all'
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          {localSearch && (
            <button
              type='button'
              onClick={() => {
                setLocalSearch('')
                const newParams = new URLSearchParams(searchParams)
                newParams.delete('search')
                newParams.set('page', '1')
                setSearchParams(newParams, { replace: true })
              }}
              className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors'
            >
              <X className='h-3.5 w-3.5' />
            </button>
          )}
        </div>

        <AdvancedFilterPopover
          categories={categories}
          author={author}
          fromDate={fromDate}
          toDate={toDate}
          statusFilter={statusFilter}
        />
      </div>
    </div>
  )
}
