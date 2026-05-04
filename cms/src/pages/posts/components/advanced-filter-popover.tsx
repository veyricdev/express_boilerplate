import { User as AuthorIcon, Calendar, Check, ChevronsUpDown, Filter, Loader2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { useSearchParams } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDebounce } from '@/hooks/use-debounce'
import { useInfiniteCategories, useInfiniteTags } from '@/hooks/use-infinite-taxonomies'
import { cn } from '@/lib/utils'
import { PostStatus } from '@/types'

interface AdvancedFilterPopoverProps {
  author: string
  fromDate: string
  toDate: string
  statusFilter: string | null
  tagIds: number[]
}

export function AdvancedFilterPopover({ author, fromDate, toDate, statusFilter, tagIds }: AdvancedFilterPopoverProps) {
  const [searchParams, setSearchParams] = useSearchParams()

  // -- Categories Infinite Scroll --
  const {
    data: catData,
    fetchNextPage: fetchNextCatPage,
    hasNextPage: hasNextCatPage,
    isFetchingNextPage: isFetchingNextCatPage,
  } = useInfiniteCategories()

  const categories = catData?.pages.flatMap((page) => page.data) || []
  const { ref: catRef, inView: catInView } = useInView()

  useEffect(() => {
    if (catInView && hasNextCatPage && !isFetchingNextCatPage) {
      fetchNextCatPage()
    }
  }, [catInView, hasNextCatPage, isFetchingNextCatPage, fetchNextCatPage])

  // -- Tags Infinite Scroll & Search --
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 500)

  const {
    data: tagData,
    fetchNextPage: fetchNextTagPage,
    hasNextPage: hasNextTagPage,
    isFetchingNextPage: isFetchingNextTagPage,
  } = useInfiniteTags(debouncedSearch)

  const tags = tagData?.pages.flatMap((page) => page.data) || []
  const { ref: tagRef, inView: tagInView } = useInView()

  useEffect(() => {
    if (tagInView && hasNextTagPage && !isFetchingNextTagPage) {
      fetchNextTagPage()
    }
  }, [tagInView, hasNextTagPage, isFetchingNextTagPage, fetchNextTagPage])

  // Local state for selected tag names
  const [selectedTagsMap, setSelectedTagsMap] = useState<Record<number, string>>({})

  useEffect(() => {
    const newMap = { ...selectedTagsMap }
    let changed = false
    tagIds.forEach((id: number) => {
      if (!newMap[id]) {
        const found = tags.find((t: any) => t.id === id)
        if (found) {
          newMap[id] = found.name
          changed = true
        }
      }
    })
    if (changed) {
      setSelectedTagsMap(newMap)
    }
  }, [tags, tagIds, selectedTagsMap])

  const updateParam = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) newParams.set(key, value)
    else newParams.delete(key)
    newParams.set('page', '1')
    setSearchParams(newParams, { replace: true })
  }

  const toggleTag = (tagId: number, tagName?: string) => {
    const newParams = new URLSearchParams(searchParams)
    let currentTagIds = searchParams.get('tagIds')?.split(',').map(Number).filter(Boolean) || []

    if (currentTagIds.includes(tagId)) {
      currentTagIds = currentTagIds.filter((id) => id !== tagId)
    } else {
      currentTagIds = [...currentTagIds, tagId]
      if (tagName) {
        setSelectedTagsMap((prev) => ({ ...prev, [tagId]: tagName }))
      }
    }

    if (currentTagIds.length > 0) {
      newParams.set('tagIds', currentTagIds.join(','))
    } else {
      newParams.delete('tagIds')
    }

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
          {tagIds.length > 0 && (
            <Badge
              variant='secondary'
              className='h-5 px-1.5 rounded-md bg-primary/10 text-primary border-none text-[10px]'
            >
              {tagIds.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-96 p-0 rounded-2xl shadow-2xl border-muted-foreground/10 overflow-hidden'
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
        <div className='p-5 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar'>
          {/* Category Filter */}
          <div className='space-y-2'>
            <Label className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70'>Danh mục</Label>
            <Select
              value={searchParams.get('categoryId') || 'all'}
              onValueChange={(val) => updateParam('categoryId', val === 'all' ? null : val)}
            >
              <SelectTrigger className='w-full h-10! rounded-xl bg-muted/20 border-muted-foreground/10'>
                <SelectValue placeholder='Chọn danh mục' />
              </SelectTrigger>
              <SelectContent className='rounded-xl shadow-xl border-muted-foreground/10'>
                <SelectItem value='all'>Tất cả danh mục</SelectItem>
                {categories.map((cat: any) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
                {hasNextCatPage && (
                  <div ref={catRef} className='py-2 flex justify-center items-center'>
                    <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Tags Filter */}
          <div className='space-y-2'>
            <Label className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70'>
              Thẻ (Tags)
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  role='combobox'
                  className={cn(
                    'w-full justify-between rounded-xl h-auto min-h-10 px-3 py-2 bg-muted/20 border-muted-foreground/10 hover:bg-muted/30 transition-colors',
                    tagIds.length === 0 && 'text-muted-foreground'
                  )}
                >
                  <div className='flex flex-wrap gap-1.5 items-center'>
                    {tagIds.length > 0 ? (
                      tagIds.map((id) => {
                        const tagName = selectedTagsMap[id] || `Thẻ #${id}`
                        return (
                          <Badge
                            variant='secondary'
                            key={id}
                            className='bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground border border-primary/20 dark:border-primary/30 rounded-full py-1 px-3 gap-1.5 font-medium text-[10px] transition-all'
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleTag(id)
                            }}
                          >
                            {tagName}
                            <X className='size-3 cursor-pointer opacity-70 hover:opacity-100 transition-opacity' />
                          </Badge>
                        )
                      })
                    ) : (
                      <span className='font-normal text-sm'>Chọn thẻ...</span>
                    )}
                  </div>
                  <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-[300px] p-0 rounded-xl shadow-2xl border-muted-foreground/10' align='start'>
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder='Tìm kiếm thẻ...'
                    className='h-9'
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                  />
                  <CommandList className='max-h-60'>
                    <CommandEmpty>Không tìm thấy thẻ nào.</CommandEmpty>
                    <CommandGroup>
                      {tags.map((tag: any) => {
                        const isSelected = tagIds.includes(tag.id)
                        return (
                          <CommandItem
                            key={tag.id}
                            value={tag.id.toString()}
                            onSelect={() => toggleTag(tag.id, tag.name)}
                            className='rounded-lg mx-1 my-0.5'
                          >
                            <Check
                              className={cn('mr-2 h-4 w-4 text-primary', isSelected ? 'opacity-100' : 'opacity-0')}
                            />
                            {tag.name}
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                    {hasNextTagPage && (
                      <div ref={tagRef} className='py-2 flex justify-center items-center'>
                        <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
                      </div>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Author Filter */}
          <div className='space-y-2'>
            <Label className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70'>Tác giả</Label>
            <div className='relative'>
              <AuthorIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground' />
              <Input
                placeholder='Tìm theo tên hoặc email tác giả...'
                className='h-10! pl-9 rounded-xl bg-muted/20 border-muted-foreground/10 focus-visible:ring-primary'
                value={author}
                onChange={(e) => updateParam('author', e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className='space-y-2'>
            <Label className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70'>
              Trạng thái
            </Label>
            <Select
              value={statusFilter || 'all'}
              onValueChange={(val) => updateParam('status', val === 'all' ? null : val)}
            >
              <SelectTrigger className='w-full h-10! rounded-xl bg-muted/20 border-muted-foreground/10'>
                <SelectValue placeholder='Trạng thái' />
              </SelectTrigger>
              <SelectContent className='rounded-xl shadow-xl border-muted-foreground/10'>
                <SelectItem value='all'>Tất cả</SelectItem>
                <SelectItem value={PostStatus.PUBLISHED}>Công khai</SelectItem>
                <SelectItem value={PostStatus.DRAFT}>Bản nháp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className='space-y-2'>
            <Label className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70'>
              Khoảng ngày đăng
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
