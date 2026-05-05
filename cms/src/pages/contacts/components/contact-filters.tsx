import { Button } from '@/components/ui/button'

interface ContactFiltersProps {
  currentFilter: string
  onFilterChange: (value: string) => void
}

export function ContactFilters({ currentFilter, onFilterChange }: ContactFiltersProps) {
  return (
    <div className='flex gap-2 p-4 border-b border-muted/50'>
      {[
        { value: 'all', label: 'Tất cả' },
        { value: 'false', label: 'Chưa đọc' },
        { value: 'true', label: 'Đã đọc' },
      ].map((f) => (
        <Button
          key={f.value}
          variant={currentFilter === f.value ? 'default' : 'outline'}
          size='sm'
          className={`rounded-xl font-bold transition-all ${currentFilter === f.value ? 'shadow-md shadow-primary/20' : ''}`}
          onClick={() => onFilterChange(f.value)}
        >
          {f.label}
        </Button>
      ))}
    </div>
  )
}
