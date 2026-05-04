import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'
import { SharedPagination } from '@/components/shared/shared-pagination'
import api from '@/services/api'
import { AuditLog, PaginatedResponse } from '@/types'
import { AuditFilters } from './components/audit-filters'
import { AuditHeader } from './components/audit-header'
import { AuditTable } from './components/audit-table'

export default function AuditLogsPage() {
  const [searchParams] = useSearchParams()
  const search = searchParams.get('search') || ''
  const entity = searchParams.get('entity') || undefined
  const action = searchParams.get('action') || undefined
  const fromDate = searchParams.get('fromDate') || undefined
  const toDate = searchParams.get('toDate') || undefined
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '10', 10)

  const { data: response, isLoading } = useQuery({
    queryKey: ['audit-logs', search, entity, action, fromDate, toDate, page, limit],
    queryFn: () =>
      api.get<PaginatedResponse<AuditLog>>('/admin/audit-logs', {
        params: { search, entity, action, fromDate, toDate, page, limit },
      }) as unknown as PaginatedResponse<AuditLog>,
  })

  const logs = response?.data || []
  const meta = response?.meta

  return (
    <div className='p-8 space-y-8 max-w-(--breakpoint-2xl) w-full mx-auto animate-in fade-in duration-500'>
      <AuditHeader />

      <div className='bg-card rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md border-muted/50'>
        <AuditFilters />
        <AuditTable logs={logs} isLoading={isLoading} />
        {meta && <SharedPagination meta={meta} />}
      </div>
    </div>
  )
}
