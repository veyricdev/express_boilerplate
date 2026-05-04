import { Calendar, Filter } from 'lucide-react'
import { useSearchParams } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function AdvancedFilterPopover() {
  const [searchParams, setSearchParams] = useSearchParams()
  const isActive = searchParams.get('isActive') || 'all'
  const fromDate = searchParams.get('fromDate') || ''
  const toDate = searchParams.get('toDate') || ''

  const updateParam = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams)
    if (value && value !== 'all') newParams.set(key, value)
    else newParams.delete(key)
    newParams.set('page', '1')
    setSearchParams(newParams, { replace: true })
  }

  const resetAll = () => {
    const newParams = new URLSearchParams()
    newParams.set('page', '1')
    setSearchParams(newParams, { replace: true })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className='h-10 px-4 border-muted-foreground/10 hover:bg-muted/50 rounded-xl gap-2 transition-all group shrink-0'
        >
          <Filter className='h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors' />
          <span className='hidden sm:inline font-medium text-sm'>Lọc nâng cao</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-80 p-0 rounded-2xl shadow-2xl border-muted-foreground/10 overflow-hidden'
        align='end'
      >
        <div className='p-4 border-b bg-muted/30 flex items-center justify-between'>
          <h3 className='font-semibold flex items-center gap-2'>
            <Filter className='h-4 w-4 text-primary' />
            Bộ lọc nâng cao
          </h3>
          <Button
            variant='ghost'
            size='sm'
            className='h-8 text-xs text-muted-foreground hover:text-primary transition-colors'
            onClick={resetAll}
          >
            Đặt lại tất cả
          </Button>
        </div>
        <div className='p-5 space-y-5'>
          {/* Status Filter */}
          <div className='space-y-2'>
            <Label className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70'>
              Trạng thái tài khoản
            </Label>
            <Select
              value={isActive}
              onValueChange={(val) => updateParam('isActive', val)}
            >
              <SelectTrigger className='w-full h-10! rounded-xl bg-muted/20 border-muted-foreground/10'>
                <SelectValue placeholder='Chọn trạng thái' />
              </SelectTrigger>
              <SelectContent className='rounded-xl shadow-xl border-muted-foreground/10'>
                <SelectItem value='all'>Tất cả trạng thái</SelectItem>
                <SelectItem value='true'>Đang hoạt động</SelectItem>
                <SelectItem value='false'>Đã khóa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className='space-y-2'>
            <Label className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70'>
              Khoảng ngày gia nhập
            </Label>
            <div className='grid grid-cols-2 gap-2'>
              <div className='relative'>
                <Calendar className='absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none' />
                <Input
                  type='date'
                  className='h-10! pl-9 rounded-xl bg-muted/20 border-muted-foreground/10 text-xs'
                  value={fromDate}
                  onChange={(e) => updateParam('fromDate', e.target.value)}
                />
              </div>
              <div className='relative'>
                <Calendar className='absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none' />
                <Input
                  type='date'
                  className='h-10! pl-9 rounded-xl bg-muted/20 border-muted-foreground/10 text-xs'
                  value={toDate}
                  onChange={(e) => updateParam('toDate', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
