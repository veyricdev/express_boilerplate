import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'
import { SharedPagination } from '@/components/shared/shared-pagination'
import { jobService } from '@/services/job.service'
import { JobStatus } from '@/types'
import { PERM_JOBS_READ } from '@shared/constants/permissions'
import { usePermission } from '@/hooks/use-permission'
import { toast } from 'sonner'
import { JobHeader } from './components/job-header'
import { JobFilters } from './components/job-filters'
import { JobTable } from './components/job-table'

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '20', 10)
  const status = (searchParams.get('status') as JobStatus) || undefined
  const queryClient = useQueryClient()
  const { has } = usePermission()

  const { data: response, isLoading } = useQuery({
    queryKey: ['jobs', page, limit, status],
    queryFn: () => jobService.findAll({ page, limit, status }),
    enabled: has(PERM_JOBS_READ),
  })

  const jobs = (response as any)?.data || []
  const total = (response as any)?.total || 0
  const totalPages = (response as any)?.totalPages || 1

  const deleteMutation = useMutation({
    mutationFn: (id: number) => jobService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Đã xóa tin tuyển dụng')
    },
    onError: () => toast.error('Không thể xóa'),
  })

  const restoreMutation = useMutation({
    mutationFn: (id: number) => jobService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Đã khôi phục tin tuyển dụng')
    },
  })

  const updateStatus = (value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value === 'ALL') next.delete('status')
    else next.set('status', value)
    next.set('page', '1')
    setSearchParams(next)
  }

  return (
    <div className='p-8 space-y-8 max-w-(--breakpoint-2xl) w-full mx-auto animate-in fade-in duration-500'>
      <JobHeader />

      <div className='bg-card rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md border-muted/50'>
        <JobFilters status={status} onStatusChange={updateStatus} />
        
        <JobTable 
          jobs={jobs} 
          isLoading={isLoading} 
          deleteMutation={deleteMutation} 
          restoreMutation={restoreMutation} 
        />

        {totalPages > 1 && (
          <div className='p-4 border-t'>
            <SharedPagination meta={{ total, lastPage: totalPages }} />
          </div>
        )}
      </div>
    </div>
  )
}
