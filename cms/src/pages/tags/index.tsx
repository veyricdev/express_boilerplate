import { useQuery } from '@tanstack/react-query'
import { Edit, Plus, Search, Tag as TagIcon, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { SharedPagination } from '@/components/shared/shared-pagination'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { tagService } from '@/services/tag.service'
import { Tag } from '@/types'

export default function TagsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchTerm = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '10', 10)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const { data: response, isLoading } = useQuery({
    queryKey: ['tags', searchTerm, page, limit],
    queryFn: () => tagService.findAll({ search: searchTerm, page, limit }),
  })

  const tags = response?.data || []
  const meta = response?.meta

  return (
    <div className='p-8 space-y-6'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent'>
            Thẻ (Tags)
          </h1>
          <p className='text-muted-foreground'>Quản lý các thẻ bài viết để tối ưu hóa tìm kiếm.</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className='shadow-lg shadow-primary/20'>
              <Plus className='mr-2 h-4 w-4' /> Thêm Tag
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[400px] rounded-3xl border-white/10 shadow-2xl overflow-hidden'>
            <div className='absolute inset-0 bg-linear-to-tr from-primary/5 via-transparent to-primary/5 pointer-events-none' />
            <DialogHeader className='relative'>
              <DialogTitle className='text-2xl font-bold'>Thêm Tag mới</DialogTitle>
              <DialogDescription className='text-muted-foreground/80'>
                Tạo một tag mới để đánh dấu nội dung bài viết.
              </DialogDescription>
            </DialogHeader>
            <div className='grid gap-6 py-6 relative'>
              <div className='grid gap-2.5'>
                <Label htmlFor='tag-name' className='ml-1 font-bold text-sm text-foreground/80 flex items-center gap-2'>
                  <TagIcon className='h-3.5 w-3.5 text-primary' />
                  Tên Tag
                </Label>
                <Input
                  id='tag-name'
                  placeholder='Ví dụ: ReactJS, NestJS...'
                  className='bg-background focus-visible:ring-primary/20 rounded-xl h-11 transition-all'
                />
              </div>
            </div>
            <DialogFooter className='relative gap-2'>
              <Button
                variant='ghost'
                onClick={() => setIsAddDialogOpen(false)}
                className='rounded-xl px-6 hover:bg-muted font-semibold text-muted-foreground'
              >
                Hủy
              </Button>
              <Button className='rounded-xl px-8 shadow-lg shadow-primary/20 font-bold bg-primary hover:scale-[1.02] transition-transform active:scale-95'>
                Lưu Tag
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className='bg-card rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md border-muted/50'>
        <div className='p-5 border-b bg-muted/30 flex flex-col sm:flex-row items-center gap-4'>
          <div className='relative flex-1 w-full'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60' />
            <Input
              placeholder='Tìm kiếm tag...'
              className='pl-10 bg-background border-muted-foreground/10 focus-visible:ring-primary/20 h-10 w-full rounded-xl'
              value={searchTerm}
              onChange={(e) => {
                const newParams = new URLSearchParams(searchParams)
                if (e.target.value) {
                  newParams.set('search', e.target.value)
                } else {
                  newParams.delete('search')
                }
                newParams.set('page', '1')
                setSearchParams(newParams, { replace: true })
              }}
            />
          </div>
        </div>

        <div className='overflow-x-auto'>
          <Table>
            <TableHeader className='bg-muted/50'>
              <TableRow className='hover:bg-transparent border-b'>
                <TableHead className='px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider'>
                  Tên Tag
                </TableHead>
                <TableHead className='px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider'>
                  Slug
                </TableHead>
                <TableHead className='px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider'>
                  Số bài viết
                </TableHead>
                <TableHead className='px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider text-right'>
                  Hành động
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className='h-48 text-center'>
                    <div className='flex flex-col items-center justify-center gap-3 text-muted-foreground'>
                      <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent shadow-sm' />
                      <span className='text-sm font-bold animate-pulse'>Đang tải tag...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : tags.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className='h-48 text-center text-muted-foreground/60 font-medium italic'>
                    Không tìm thấy tag nào phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                tags.map((tag: Tag) => (
                  <TableRow key={tag.id} className='hover:bg-muted/30 transition-all border-b last:border-0 group'>
                    <TableCell className='px-6 py-5'>
                      <Badge
                        variant='secondary'
                        className='bg-primary/5 text-primary border-primary/10 font-bold px-3 py-1 rounded-full group-hover:bg-primary/10 transition-colors'
                      >
                        # {tag.name}
                      </Badge>
                    </TableCell>
                    <TableCell className='px-6 py-5'>
                      <code className='text-[11px] bg-muted px-2 py-1 rounded-md text-muted-foreground font-mono font-medium'>
                        {tag.slug}
                      </code>
                    </TableCell>
                    <TableCell className='px-6 py-5'>
                      <Badge
                        variant='outline'
                        className='font-bold bg-muted/50 border-muted-foreground/10 text-[11px] rounded-lg px-2'
                      >
                        {tag.postCount} BÀI VIẾT
                      </Badge>
                    </TableCell>
                    <TableCell className='px-6 py-5 text-right'>
                      <div className='flex justify-end gap-1.5 transition-all'>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary transition-all active:scale-90'
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className='rounded-lg font-bold'>Chỉnh sửa</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all'
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className='rounded-lg font-bold'>Xóa tag</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {meta && <SharedPagination meta={meta} />}
      </div>
    </div>
  )
}
