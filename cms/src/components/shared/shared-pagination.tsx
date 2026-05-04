import { useSearchParams } from 'react-router'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/utils/cn'

interface SharedPaginationProps {
  meta?: {
    lastPage: number
    total?: number
    from?: number
    to?: number
  }
}

export function SharedPagination({ meta }: SharedPaginationProps) {
  const [searchParams, setSearchParams] = useSearchParams()

  if (!meta) return null

  // Get current page and limit from URL or default
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '10', 10)

  const from = (meta.total || 0) === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, meta.total || 0)

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('page', newPage.toString())
    setSearchParams(newParams)
  }

  const handleLimitChange = (newLimit: string) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('limit', newLimit)
    newParams.set('page', '1') // Reset to page 1 when limit changes
    setSearchParams(newParams)
  }

  const pages = []
  const maxVisiblePages = 3
  let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2))
  const endPage = Math.min(meta.lastPage, startPage + maxVisiblePages - 1)

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return (
    <div className='p-3 md:p-4 border-t bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4'>
      <div className='flex items-center gap-3'>
        <div className='flex items-center gap-2'>
          <Select value={limit.toString()} onValueChange={handleLimitChange}>
            <SelectTrigger className='w-[70px] bg-background rounded-xl'>
              <SelectValue placeholder={limit} />
            </SelectTrigger>
            <SelectContent align='start' className='min-w-[65px]'>
              <SelectItem value='10'>10</SelectItem>
              <SelectItem value='20'>20</SelectItem>
              <SelectItem value='50'>50</SelectItem>
              <SelectItem value='100'>100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {meta.total !== undefined && (
          <span className='text-sm text-muted-foreground whitespace-nowrap'>
            {from}-{to} <span className='mx-1 opacity-50'>/</span> {meta.total}
          </span>
        )}
      </div>

      {meta.lastPage > 1 && (
        <Pagination className='justify-end w-auto mx-0'>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href='#'
                text='Trước'
                onClick={(e) => {
                  e.preventDefault()
                  if (page > 1) handlePageChange(page - 1)
                }}
                className={cn(page === 1 && 'pointer-events-none opacity-50')}
              />
            </PaginationItem>

            {startPage > 1 && (
              <>
                <PaginationItem>
                  <PaginationLink
                    href='#'
                    onClick={(e) => {
                      e.preventDefault()
                      handlePageChange(1)
                    }}
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
                {startPage > 2 && <PaginationEllipsis />}
              </>
            )}

            {pages.map((p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  href='#'
                  isActive={p === page}
                  onClick={(e) => {
                    e.preventDefault()
                    handlePageChange(p)
                  }}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}

            {endPage < meta.lastPage && (
              <>
                {endPage < meta.lastPage - 1 && <PaginationEllipsis />}
                <PaginationItem>
                  <PaginationLink
                    href='#'
                    onClick={(e) => {
                      e.preventDefault()
                      handlePageChange(meta.lastPage)
                    }}
                  >
                    {meta.lastPage}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}

            <PaginationItem>
              <PaginationNext
                href='#'
                text='Sau'
                onClick={(e) => {
                  e.preventDefault()
                  if (page < meta.lastPage) handlePageChange(page + 1)
                }}
                className={cn(page === meta.lastPage && 'pointer-events-none opacity-50')}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
