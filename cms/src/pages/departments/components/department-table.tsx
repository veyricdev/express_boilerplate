import { PERM_DEPARTMENTS_DELETE, PERM_DEPARTMENTS_UPDATE } from '@shared/constants/permissions'
import { UseMutationResult } from '@tanstack/react-query'
import { Edit, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { usePermission } from '@/hooks/use-permission'
import { Department } from '@/types'

interface DepartmentTableProps {
  departments: Department[]
  isLoading: boolean
  onEdit: (dept: Department) => void
  deleteMutation: UseMutationResult<any, Error, number, unknown>
}

export function DepartmentTable({ departments, isLoading, onEdit, deleteMutation }: DepartmentTableProps) {
  const { has } = usePermission()

  return (
    <div className='overflow-x-auto'>
      <Table>
        <TableHeader className='bg-muted/50'>
          <TableRow className='hover:bg-transparent border-b'>
            <TableHead className='px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider w-[80px]'>
              #ID
            </TableHead>
            <TableHead className='w-[30%] px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider'>
              Tên phòng ban
            </TableHead>
            <TableHead className='px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider'>
              Mô tả
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
          ) : departments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className='h-48 text-center text-muted-foreground/60 font-medium italic'>
                Không tìm thấy phòng ban nào phù hợp.
              </TableCell>
            </TableRow>
          ) : (
            departments.map((dept) => (
              <TableRow key={dept.id} className='hover:bg-muted/30 transition-all border-b last:border-0 group'>
                <TableCell className='px-6 py-5 font-mono text-[11px] text-muted-foreground'>#{dept.id}</TableCell>
                <TableCell className='px-6 py-5 font-medium'>
                  <Badge
                    variant='secondary'
                    className='bg-primary/5 text-primary border-primary/10 font-bold px-3 py-1 rounded-lg group-hover:bg-primary group-hover:text-white transition-all duration-300'
                  >
                    {dept.name}
                  </Badge>
                </TableCell>
                <TableCell
                  className='px-6 py-5 text-muted-foreground text-sm max-w-[200px] truncate'
                  title={dept.description || ''}
                >
                  {dept.description || '-'}
                </TableCell>
                <TableCell className='px-6 py-5'>
                  {dept.isActive ? (
                    <Badge className='bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-tighter shadow-xs'>
                      Hoạt động
                    </Badge>
                  ) : (
                    <Badge
                      variant='destructive'
                      className='px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-tighter'
                    >
                      Tạm ngưng
                    </Badge>
                  )}
                </TableCell>
                <TableCell className='px-6 py-5 text-right'>
                  <div className='flex justify-end gap-1.5 transition-opacity'>
                    {has(PERM_DEPARTMENTS_UPDATE) && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size='icon'
                            variant='ghost'
                            className='h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary transition-all active:scale-90'
                            onClick={() => onEdit(dept)}
                          >
                            <Edit className='h-4 w-4' />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className='rounded-lg font-bold'>Chỉnh sửa</TooltipContent>
                      </Tooltip>
                    )}
                    {has(PERM_DEPARTMENTS_DELETE) && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size='icon'
                            variant='ghost'
                            className='h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all'
                            onClick={() => {
                              if (window.confirm('Bạn có chắc chắn muốn xóa phòng ban này?')) {
                                deleteMutation.mutate(dept.id)
                              }
                            }}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className='rounded-lg font-bold'>Xóa phòng ban</TooltipContent>
                      </Tooltip>
                    )}
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
