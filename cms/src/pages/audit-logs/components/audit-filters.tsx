import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Input } from '@/components/ui/input'
import { AdvancedFilterPopover } from './advanced-filter-popover'

export function AuditFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
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

  return (
    <div className='px-6 py-4 border-b bg-muted/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
      <div className='flex items-center gap-3 w-full'>
        <div className='relative flex-1 group'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors' />
          <Input
            placeholder='Tìm kiếm hành động, người dùng, tài nguyên...'
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
