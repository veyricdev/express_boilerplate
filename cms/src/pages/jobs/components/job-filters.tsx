import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { JobStatus } from '@/types'
import { STATUS_LABELS } from './job-table'

interface JobFiltersProps {
  status?: JobStatus
  onStatusChange: (status: string) => void
}

export function JobFilters({ status, onStatusChange }: JobFiltersProps) {
  return (
    <div className='flex gap-3 p-4 border-b border-muted/50 flex-wrap'>
      <Select value={status || 'ALL'} onValueChange={onStatusChange}>
        <SelectTrigger className='w-40 rounded-xl'>
          <SelectValue placeholder='Trạng thái' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='ALL'>Tất cả</SelectItem>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>{label as string}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
