import { Building2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PERM_DEPARTMENTS_WRITE } from '@shared/constants/permissions'
import { usePermission } from '@/hooks/use-permission'

interface DepartmentHeaderProps {
  onAdd: () => void
}

export function DepartmentHeader({ onAdd }: DepartmentHeaderProps) {
  const { has } = usePermission()

  return (
    <div className='flex items-center justify-between'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight flex items-center gap-2'>
          <Building2 size={22} /> Phòng ban
        </h1>
        <p className='text-muted-foreground text-sm'>Quản lý các phòng ban / bộ phận</p>
      </div>
      {has(PERM_DEPARTMENTS_WRITE) && (
        <Button 
          onClick={onAdd}
          className='shadow-lg shadow-primary/20 h-10 rounded-xl px-5 font-bold transition-all hover:scale-[1.02] active:scale-95'
        >
          <Plus className='mr-2 h-4 w-4' /> Thêm phòng ban
        </Button>
      )}
    </div>
  )
}
