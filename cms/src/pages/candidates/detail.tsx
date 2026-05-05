import { PERM_CANDIDATES_READ, PERM_CANDIDATES_UPDATE } from '@shared/constants/permissions'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Download } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { usePermission } from '@/hooks/use-permission'
import { candidateService } from '@/services/candidate.service'
import { Candidate, CandidateStatus } from '@/types'

const STATUS_LABELS: Record<CandidateStatus, string> = {
  RECEIVED: 'Đã nhận',
  INTERVIEWING: 'Phỏng vấn',
  REJECTED: 'Từ chối',
  HIRED: 'Đã tuyển',
}

const STATUS_VARIANTS: Record<CandidateStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  RECEIVED: 'outline',
  INTERVIEWING: 'default',
  REJECTED: 'destructive',
  HIRED: 'secondary',
}

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const { has } = usePermission()

  const { data: candidate, isLoading } = useQuery({
    queryKey: ['candidates', id],
    queryFn: () => candidateService.findOne(Number(id)),
    enabled: !!id && has(PERM_CANDIDATES_READ),
  })

  const updateStatusMutation = useMutation({
    mutationFn: (status: CandidateStatus) => candidateService.updateStatus(Number(id), status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      toast.success('Đã cập nhật trạng thái')
    },
    onError: () => toast.error('Không thể cập nhật trạng thái'),
  })

  const c = candidate as any as Candidate | undefined

  return (
    <div className='p-4 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-(--breakpoint-2xl) w-full mx-auto'>
      <div className='flex items-center gap-3'>
        <Button variant='ghost' size='sm' asChild>
          <Link to='/candidates'>
            <ArrowLeft size={16} className='mr-1' /> Quay lại
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className='text-center py-12 text-muted-foreground text-sm'>Đang tải...</div>
      ) : !c ? (
        <div className='text-center py-12 text-destructive text-sm'>Không tìm thấy ứng viên</div>
      ) : (
        <div className='bg-card rounded-2xl border shadow-sm p-6 space-y-5'>
          {/* Header */}
          <div className='flex items-start justify-between gap-4'>
            <div>
              <h1 className='text-xl font-bold'>{c.fullName}</h1>
              <p className='text-sm text-muted-foreground'>{c.email}</p>
              {c.phone && <p className='text-sm text-muted-foreground'>{c.phone}</p>}
            </div>
            <Badge variant={STATUS_VARIANTS[c.status]}>{STATUS_LABELS[c.status]}</Badge>
          </div>

          {/* Job info */}
          {c.job && (
            <div className='bg-muted/40 rounded-lg p-3 text-sm space-y-1'>
              <p className='font-medium'>{c.job.title}</p>
              {c.job.department && <p className='text-muted-foreground text-xs'>🏢 {c.job.department.name}</p>}
            </div>
          )}

          {/* CV Download */}
          <div>
            <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2'>Hồ sơ (CV)</p>
            <a
              href={c.cvUrl.startsWith('http') ? c.cvUrl : `${window.location.origin}${c.cvUrl}`}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-1.5 text-sm text-primary hover:underline'
            >
              <Download size={14} /> Tải CV
            </a>
          </div>

          {/* Cover letter */}
          {c.coverLetter && (
            <div>
              <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2'>Thư xin việc</p>
              <p className='text-sm whitespace-pre-wrap leading-relaxed'>{c.coverLetter}</p>
            </div>
          )}

          {/* Status change */}
          {has(PERM_CANDIDATES_UPDATE) && (
            <div className='border-t pt-4'>
              <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2'>
                Cập nhật trạng thái
              </p>
              <Select
                value={c.status}
                onValueChange={(v) => updateStatusMutation.mutate(v as CandidateStatus)}
                disabled={updateStatusMutation.isPending}
              >
                <SelectTrigger className='w-48'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className='border-t pt-4 text-xs text-muted-foreground'>
            Nộp hồ sơ: {new Date(c.createdAt).toLocaleString('vi-VN')}
          </div>
        </div>
      )}
    </div>
  )
}
