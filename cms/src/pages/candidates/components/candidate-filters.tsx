import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CandidateStatus } from '@/types'
import { STATUS_LABELS } from './candidate-table'

interface CandidateFiltersProps {
  status?: CandidateStatus
  onStatusChange: (status: string) => void
}

export function CandidateFilters({ status, onStatusChange }: CandidateFiltersProps) {
  return (
    <div className='flex gap-3 p-4 border-b border-muted/50 flex-wrap'>
      <Select value={status || 'ALL'} onValueChange={onStatusChange}>
        <SelectTrigger className='w-40 rounded-xl'>
          <SelectValue placeholder='Trạng thái' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='ALL'>Tất cả</SelectItem>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label as string}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
