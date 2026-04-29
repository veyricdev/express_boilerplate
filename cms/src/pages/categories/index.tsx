import { useQuery } from '@tanstack/react-query'
import { Edit, Filter, FolderTree, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { categoryService } from '@/services/category.service'
import { Category } from '@/types'
import { cn } from '@/utils/cn'

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const { data: response, isLoading } = useQuery({
    queryKey: ['categories', searchTerm, page],
    queryFn: () => categoryService.findAll({ search: searchTerm, page, limit: 10 }),
  })

  const categories = response?.data || []
  const meta = response?.meta

  const renderPagination = () => {
    if (!meta || meta.lastPage <= 1) return null

    const pages = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(meta.lastPage, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return (
      <div className='p-4 border-t bg-muted/20'>
        <Pagination className='justify-end'>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href='#'
                text='Trước'
                onClick={(e) => {
                  e.preventDefault()
                  if (page > 1) setPage(page - 1)
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
                      setPage(1)
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
                    setPage(p)
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
                      setPage(meta.lastPage)
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
                  if (page < meta.lastPage) setPage(page + 1)
                }}
                className={cn(page === meta.lastPage && 'pointer-events-none opacity-50')}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    )
  }

  return (
    <div className='p-8 space-y-6'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent'>
            Danh mục
          </h1>
          <p className='text-muted-foreground'>Quản lý các danh mục bài viết trong hệ thống.</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className='shadow-lg shadow-primary/20'>
              <Plus className='mr-2 h-4 w-4' /> Thêm danh mục
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[425px] rounded-3xl border-white/10 shadow-2xl overflow-hidden'>
            <div className='absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none' />
            <DialogHeader className='relative'>
              <DialogTitle className='text-2xl font-bold'>Thêm danh mục mới</DialogTitle>
              <DialogDescription className='text-muted-foreground/80'>
                Tạo một danh mục mới để phân loại bài viết của bạn một cách khoa học.
              </DialogDescription>
            </DialogHeader>
            <div className='grid gap-6 py-6 relative'>
              <div className='grid gap-2.5'>
                <Label htmlFor='name' className='ml-1 font-bold text-sm text-foreground/80 flex items-center gap-2'>
                  <FolderTree className='h-3.5 w-3.5 text-primary' />
                  Tên danh mục
                </Label>
                <Input
                  id='name'
                  placeholder='Ví dụ: Công nghệ'
                  className='bg-background focus-visible:ring-primary/20 rounded-xl h-11 transition-all'
                />
              </div>
              <div className='grid gap-2.5'>
                <Label htmlFor='description' className='ml-1 font-bold text-sm text-foreground/80'>
                  Mô tả ngắn
                </Label>
                <textarea
                  id='description'
                  placeholder='Mô tả ngắn gọn về danh mục này...'
                  className='min-h-[100px] w-full bg-background border border-input focus-visible:ring-2 focus-visible:ring-primary/20 rounded-xl p-3 text-sm transition-all resize-none'
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
                Lưu danh mục
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
              placeholder='Tìm kiếm danh mục...'
              className='pl-10 bg-background border-muted-foreground/10 focus-visible:ring-primary/20 h-10 w-full rounded-xl'
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <Button variant='outline' className='h-10 border-dashed rounded-xl px-4 text-muted-foreground'>
            <Filter className='mr-2 h-4 w-4' /> Lọc
          </Button>
        </div>

        <div className='overflow-x-auto'>
          <Table>
            <TableHeader className='bg-muted/50'>
              <TableRow className='hover:bg-transparent border-b'>
                <TableHead className='px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider'>
                  Tên danh mục
                </TableHead>
                <TableHead className='px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider'>
                  Slug
                </TableHead>
                <TableHead className='px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider'>
                  Thống kê
                </TableHead>
                <TableHead className='px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider'>
                  Trạng thái
                </TableHead>
                <TableHead className='px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider text-right'>
                  Hành động
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className='h-48 text-center'>
                    <div className='flex flex-col items-center justify-center gap-3 text-muted-foreground'>
                      <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent shadow-sm' />
                      <span className='text-sm font-bold animate-pulse'>Đang tải danh mục...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className='h-48 text-center text-muted-foreground/60 font-medium italic'>
                    Không tìm thấy danh mục nào phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category: Category) => (
                  <TableRow key={category.id} className='hover:bg-muted/30 transition-all border-b last:border-0 group'>
                    <TableCell className='px-6 py-5'>
                      <div className='flex items-center gap-3'>
                        <div className='h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shadow-sm border border-primary/5'>
                          {category.name.charAt(0).toUpperCase()}
                        </div>
                        <span className='font-bold text-foreground group-hover:text-primary transition-colors'>
                          {category.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className='px-6 py-5'>
                      <code className='text-[11px] bg-muted px-2 py-1 rounded-md text-muted-foreground font-mono font-medium'>
                        {category.slug}
                      </code>
                    </TableCell>
                    <TableCell className='px-6 py-5'>
                      <Badge
                        variant='outline'
                        className='font-bold bg-muted/50 border-muted-foreground/10 text-[11px] rounded-lg px-2'
                      >
                        {category.postCount} BÀI VIẾT
                      </Badge>
                    </TableCell>
                    <TableCell className='px-6 py-5'>
                      {category.deletedAt ? (
                        <Badge
                          variant='destructive'
                          className='px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-tighter'
                        >
                          Đã xóa
                        </Badge>
                      ) : (
                        <Badge className='bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-tighter shadow-xs'>
                          Hoạt động
                        </Badge>
                      )}
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
                          <TooltipContent className='rounded-lg font-bold'>Xóa danh mục</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {renderPagination()}
      </div>
    </div>
  )
}
