import { PERM_JOBS_DELETE, PERM_JOBS_UPDATE } from '@shared/constants/permissions'
import { UseMutationResult } from '@tanstack/react-query'
import { Edit, RotateCcw, Trash2 } from 'lucide-react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { usePermission } from '@/hooks/use-permission'
import { Job, JobLevel, JobStatus } from '@/types'

export const STATUS_LABELS: Record<JobStatus, string> = {
  DRAFT: 'Nháp',
  OPEN: 'Đang tuyển',
  CLOSED: 'Đã đóng',
}

export const STATUS_VARIANTS: Record<JobStatus, 'default' | 'secondary' | 'outline'> = {
  DRAFT: 'outline',
  OPEN: 'default',
  CLOSED: 'secondary',
}

export const LEVEL_LABELS: Record<JobLevel, string> = {
  INTERN: 'Thực tập',
  JUNIOR: 'Junior',
  MID: 'Middle',
  SENIOR: 'Senior',
  LEAD: 'Lead',
  MANAGER: 'Manager',
}

interface JobTableProps {
  jobs: Job[]
  isLoading: boolean
  deleteMutation: UseMutationResult<any, Error, number, unknown>
  restoreMutation: UseMutationResult<any, Error, number, unknown>
}

export function JobTable({ jobs, isLoading, deleteMutation, restoreMutation }: JobTableProps) {
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
              Vị trí / Chức danh
            </TableHead>
            <TableHead className='px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider'>
              Phòng ban
            </TableHead>
            <TableHead className='px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider'>
              Level
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
              <TableCell colSpan={6} className='h-48 text-center'>
                <div className='flex flex-col items-center justify-center gap-3 text-muted-foreground'>
                  <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent shadow-sm' />
                  <span className='text-sm font-bold animate-pulse uppercase tracking-widest'>Đang tải...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : jobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className='h-48 text-center text-muted-foreground/60 font-medium italic'>
                Không tìm thấy tin tuyển dụng nào phù hợp.
              </TableCell>
            </TableRow>
          ) : (
            jobs.map((job) => (
              <TableRow
                key={job.id}
                className={`hover:bg-muted/30 transition-all border-b last:border-0 group ${job.deletedAt ? 'bg-destructive/5 opacity-80' : ''}`}
              >
                <TableCell className='px-6 py-5 font-mono text-[11px] text-muted-foreground'>#{job.id}</TableCell>
                <TableCell className='px-6 py-5'>
                  <div className='flex flex-col gap-0.5'>
                    <Link
                      to={`/jobs/${job.id}/edit`}
                      className='font-bold text-foreground hover:text-primary transition-colors'
                    >
                      {job.title}
                    </Link>
                    <div className='flex items-center gap-2 text-xs text-muted-foreground mt-1'>
                      {job.location && <span className='inline-flex items-center'>📍 {job.location}</span>}
                      {job.salaryRange && <span className='inline-flex items-center'>💰 {job.salaryRange}</span>}
                    </div>
                  </div>
                </TableCell>
                <TableCell className='px-6 py-5'>
                  <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-muted/50 border border-muted-foreground/10'>
                    {job.department?.name || '-'}
                  </span>
                </TableCell>
                <TableCell className='px-6 py-5'>
                  <span className='text-sm font-medium'>{LEVEL_LABELS[job.level]}</span>
                </TableCell>
                <TableCell className='px-6 py-5'>
                  <Badge
                    variant={STATUS_VARIANTS[job.status]}
                    className='text-[10px] uppercase tracking-tighter px-2 py-0.5 rounded-full font-bold shadow-xs'
                  >
                    {STATUS_LABELS[job.status]}
                  </Badge>
                  {job.deletedAt && (
                    <Badge
                      variant='destructive'
                      className='text-[10px] uppercase tracking-tighter px-2 py-0.5 rounded-full font-bold ml-2'
                    >
                      Đã xóa
                    </Badge>
                  )}
                </TableCell>
                <TableCell className='px-6 py-5 text-right'>
                  <div className='flex justify-end gap-1.5 transition-opacity'>
                    {has(PERM_JOBS_UPDATE) && !job.deletedAt && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary transition-all active:scale-90'
                            asChild
                          >
                            <Link to={`/jobs/${job.id}/edit`}>
                              <Edit className='h-4 w-4' />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className='rounded-lg font-bold'>Chỉnh sửa</TooltipContent>
                      </Tooltip>
                    )}
                    {job.deletedAt
                      ? has(PERM_JOBS_UPDATE) && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary transition-all active:scale-90'
                                onClick={() => {
                                  if (window.confirm('Bạn có muốn khôi phục tin tuyển dụng này không?')) {
                                    restoreMutation.mutate(job.id)
                                  }
                                }}
                              >
                                <RotateCcw className='h-4 w-4' />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className='rounded-lg font-bold'>Khôi phục</TooltipContent>
                          </Tooltip>
                        )
                      : has(PERM_JOBS_DELETE) && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all'
                                onClick={() => {
                                  if (window.confirm('Bạn có chắc chắn muốn xóa tin tuyển dụng này?')) {
                                    deleteMutation.mutate(job.id)
                                  }
                                }}
                              >
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className='rounded-lg font-bold'>Xóa tin</TooltipContent>
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
