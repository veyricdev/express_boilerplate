import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdvancedFilterPopover } from './advanced-filter-popover'

export function CategoryFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const trashMode = searchParams.get('trashMode') || 'active'
  const searchTerm = searchParams.get('search') || ''
  
  const [localSearch, setLocalSearch] = useState(searchTerm)

  // Sync local search with URL param
  useEffect(() => {
    setLocalSearch(searchTerm)
  }, [searchTerm])

  // Debounce update to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchTerm) {
        const newParams = new URLSearchParams(searchParams)
        if (localSearch) {
          newParams.set('search', localSearch)
        } else {
          newParams.delete('search')
        }
        newParams.set('page', '1')
        setSearchParams(newParams, { replace: true })
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [localSearch, searchTerm, searchParams, setSearchParams])

  const handleTrashModeChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('trashMode', value)
    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  return (
    <div className='px-6 py-4 border-b bg-muted/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
      <Tabs value={trashMode} onValueChange={handleTrashModeChange} className='w-full lg:w-auto'>
        <TabsList className='bg-muted/50 border h-10! p-1 gap-1 rounded-xl shrink-0'>
          <TabsTrigger value='all' className='px-4 rounded-lg transition-all data-[state=active]:shadow-sm gap-2 h-full'>
            Tất cả
          </TabsTrigger>
          <TabsTrigger value='active' className='px-4 rounded-lg transition-all data-[state=active]:shadow-sm gap-2 h-full'>
            Hoạt động
          </TabsTrigger>
          <TabsTrigger value='trash' className='px-4 rounded-lg transition-all data-[state=active]:shadow-sm gap-2 h-full'>
            Thùng rác
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className='flex items-center gap-3 w-full lg:w-auto'>
        <div className='relative flex-1 lg:w-72 group'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors' />
          <Input
            placeholder='Tìm kiếm danh mục...'
            className='pl-10 pr-10 bg-muted/20 border-muted-foreground/10 focus-visible:ring-primary h-10! w-full rounded-xl transition-all'
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          {localSearch && (
            <button
              type='button'
              onClick={() => setLocalSearch('')}
              className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 hover:text-foreground transition-colors'
            >
              <X className='h-3.5 w-3.5' />
            </button>
          )}
        </div>
        <AdvancedFilterPopover />
      </div>
    </div>
  )
}
