import { Check, ChevronsUpDown, X } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface TaxonomyAccordionProps {
  categories: any[]
  tags: any[]
}

export function TaxonomyAccordion({ categories, tags }: TaxonomyAccordionProps) {
  const { watch, setValue } = useFormContext()
  const tagIds = watch('tagIds') || []
  const categoryId = watch('categoryId')

  return (
    <AccordionItem value='taxonomy' className='border rounded-2xl bg-card px-4 shadow-sm'>
      <AccordionTrigger className='font-semibold hover:no-underline'>Phân loại</AccordionTrigger>
      <AccordionContent className='h-auto space-y-4 pt-2 pb-4'>
        <div className='space-y-2'>
          <Label className='text-xs font-semibold text-muted-foreground'>Danh mục</Label>
          <Select
            value={categoryId?.toString() || ''}
            onValueChange={(value) => setValue('categoryId', value ? parseInt(value) : null)}
          >
            <SelectTrigger className='w-full h-10 rounded-xl'>
              <SelectValue placeholder='Chọn danh mục' />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat: any) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2 flex flex-col'>
          <Label className='text-xs font-semibold text-muted-foreground'>Thẻ (Tags)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                role='combobox'
                className={cn(
                  'w-full justify-between rounded-xl h-auto min-h-10 px-3 py-2',
                  tagIds.length === 0 && 'text-muted-foreground'
                )}
              >
                <div className='flex flex-wrap gap-1.5 items-center'>
                  {tagIds.length > 0 ? (
                    tagIds.map((id: number) => {
                      const tag = tags.find((t: any) => t.id === id)
                      return tag ? (
                        <Badge
                          variant='secondary'
                          key={id}
                          className='bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground border border-primary/20 dark:border-primary/30 transition-all rounded-full py-1 px-3 gap-1.5 font-medium group'
                          onClick={(e) => {
                            e.stopPropagation()
                            setValue(
                              'tagIds',
                              tagIds.filter((tId: number) => tId !== id)
                            )
                          }}
                        >
                          {tag.name}
                          <X className='size-3.5 cursor-pointer opacity-70 group-hover:opacity-100 transition-opacity' />
                        </Badge>
                      ) : null
                    })
                  ) : (
                    <span className='font-normal text-sm'>Chọn thẻ...</span>
                  )}
                </div>
                <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-[300px] p-0' align='start'>
              <Command>
                <CommandInput placeholder='Tìm kiếm thẻ...' />
                <CommandList>
                  <CommandEmpty>Không tìm thấy thẻ nào.</CommandEmpty>
                  <CommandGroup>
                    {tags.map((tag: any) => {
                      const isSelected = tagIds.includes(tag.id)
                      return (
                        <CommandItem
                          key={tag.id}
                          value={tag.name}
                          onSelect={() => {
                            if (isSelected) {
                              setValue(
                                'tagIds',
                                tagIds.filter((id: number) => id !== tag.id)
                              )
                            } else {
                              setValue('tagIds', [...tagIds, tag.id])
                            }
                          }}
                        >
                          <Check className={cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')} />
                          {tag.name}
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
