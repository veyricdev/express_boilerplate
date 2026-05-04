import { Edit, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Category } from '@/types'

interface CategoryTableProps {
  categories: Category[]
  isLoading: boolean
}

export function CategoryTable({ categories, isLoading }: CategoryTableProps) {
  return (
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
                  <span className='text-sm font-bold animate-pulse uppercase tracking-widest'>Đang tải...</span>
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
            categories.map((category) => (
              <TableRow key={category.id} className='hover:bg-muted/30 transition-all border-b last:border-0 group'>
                <TableCell className='px-6 py-5'>
                  <div className='flex items-center gap-3'>
                    <div className='h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shadow-sm border border-primary/5 transition-transform group-hover:scale-110'>
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
                    className='font-bold bg-muted/50 border-muted-foreground/10 text-[11px] rounded-lg px-2 py-1'
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
                  <div className='flex justify-end gap-1.5 transition-opacity'>
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
  )
}
