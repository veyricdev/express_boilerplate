import { PERM_CANDIDATES_READ } from '@shared/constants/permissions'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'
import { SharedPagination } from '@/components/shared/shared-pagination'
import { usePermission } from '@/hooks/use-permission'
import { candidateService } from '@/services/candidate.service'
import { Candidate, CandidateStatus } from '@/types'
import { CandidateFilters } from './components/candidate-filters'
import { CandidateHeader } from './components/candidate-header'
import { CandidateTable } from './components/candidate-table'

export default function CandidatesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '20', 10)
  const status = (searchParams.get('status') as CandidateStatus) || undefined
  const { has } = usePermission()

  const { data: response, isLoading } = useQuery({
    queryKey: ['candidates', page, limit, status],
    queryFn: () => candidateService.findAll({ page, limit, status }),
    enabled: has(PERM_CANDIDATES_READ),
  })

  const candidates = (response as any)?.data || []
  const total = (response as any)?.total || 0
  const totalPages = (response as any)?.totalPages || 1

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value === 'ALL') next.delete(key)
    else next.set(key, value)
    next.set('page', '1')
    setSearchParams(next)
  }

  return (
    <div className='p-4 md:p-8 space-y-8 max-w-(--breakpoint-2xl) w-full mx-auto animate-in fade-in duration-500'>
      <CandidateHeader total={total} />

      <div className='bg-card rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md border-muted/50'>
        <CandidateFilters status={status} onStatusChange={(v) => updateFilter('status', v)} />

        <CandidateTable candidates={candidates as Candidate[]} isLoading={isLoading} />

        {totalPages > 1 && (
          <div className='p-4 border-t'>
            <SharedPagination meta={{ total, lastPage: totalPages }} />
          </div>
        )}
      </div>
    </div>
  )
}
