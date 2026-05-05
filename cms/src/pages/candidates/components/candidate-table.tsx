import { Eye } from 'lucide-react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Candidate, CandidateStatus } from '@/types'

export const STATUS_LABELS: Record<CandidateStatus, string> = {
  RECEIVED: 'Đã nhận',
  INTERVIEWING: 'Phỏng vấn',
  REJECTED: 'Từ chối',
  HIRED: 'Đã tuyển',
}

export const STATUS_VARIANTS: Record<CandidateStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  RECEIVED: 'outline',
  INTERVIEWING: 'default',
  REJECTED: 'destructive',
  HIRED: 'secondary',
}

interface CandidateTableProps {
  candidates: Candidate[]
  isLoading: boolean
}

export function CandidateTable({ candidates, isLoading }: CandidateTableProps) {
  return (
    <div className='overflow-x-auto'>
      <Table>
        <TableHeader className='bg-muted/50'>
          <TableRow className='hover:bg-transparent border-b'>
            <TableHead className='px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider w-[80px]'>
              #ID
            </TableHead>
            <TableHead className='w-[25%] px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider'>
              Ứng viên
            </TableHead>
            <TableHead className='px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider'>
              Liên hệ
            </TableHead>
            <TableHead className='px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider'>
              Vị trí ứng tuyển
            </TableHead>
            <TableHead className='px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider'>
              Trạng thái
            </TableHead>
            <TableHead className='px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider'>
              Ngày nộp
            </TableHead>
            <TableHead className='px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider text-right'>
              Hành động
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className='h-48 text-center'>
                <div className='flex flex-col items-center justify-center gap-3 text-muted-foreground'>
                  <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent shadow-sm' />
                  <span className='text-sm font-bold animate-pulse uppercase tracking-widest'>Đang tải...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : candidates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className='h-48 text-center text-muted-foreground/60 font-medium italic'>
                Không tìm thấy ứng viên nào phù hợp.
              </TableCell>
            </TableRow>
          ) : (
            candidates.map((c) => (
              <TableRow key={c.id} className='hover:bg-muted/30 transition-all border-b last:border-0 group'>
                <TableCell className='px-6 py-5 font-mono text-[11px] text-muted-foreground'>#{c.id}</TableCell>
                <TableCell className='px-6 py-5'>
                  <Link
                    to={`/candidates/${c.id}`}
                    className='font-bold text-foreground hover:text-primary transition-colors'
                  >
                    {c.fullName}
                  </Link>
                </TableCell>
                <TableCell className='px-6 py-5'>
                  <div className='flex flex-col gap-1 text-xs text-muted-foreground'>
                    <span className='flex items-center gap-1.5'>
                      <span className='w-3 flex justify-center'>📧</span>
                      <span className='truncate'>{c.email}</span>
                    </span>
                    {c.phone && (
                      <span className='flex items-center gap-1.5'>
                        <span className='w-3 flex justify-center'>📞</span>
                        <span>{c.phone}</span>
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className='px-6 py-5'>
                  <div className='flex flex-col gap-1'>
                    {c.job ? (
                      <>
                        <span className='font-bold text-sm'>{c.job.title}</span>
                        {c.job.department && (
                          <span className='text-[11px] text-muted-foreground font-medium'>
                            🏢 {c.job.department.name}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className='text-muted-foreground text-sm'>-</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className='px-6 py-5'>
                  <Badge
                    variant={STATUS_VARIANTS[c.status]}
                    className='text-[10px] uppercase tracking-tighter px-2 py-0.5 rounded-full font-bold shadow-xs'
                  >
                    {STATUS_LABELS[c.status]}
                  </Badge>
                </TableCell>
                <TableCell className='px-6 py-5 text-sm text-muted-foreground font-medium'>
                  {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                </TableCell>
                <TableCell className='px-6 py-5 text-right'>
                  <div className='flex justify-end gap-1.5 transition-opacity'>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary transition-all active:scale-90'
                          asChild
                        >
                          <Link to={`/candidates/${c.id}`}>
                            <Eye className='h-4 w-4' />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className='rounded-lg font-bold'>Xem chi tiết</TooltipContent>
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
