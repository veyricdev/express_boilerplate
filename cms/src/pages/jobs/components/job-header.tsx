import { PERM_JOBS_WRITE } from '@shared/constants/permissions'
import { Briefcase, Plus } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { usePermission } from '@/hooks/use-permission'

export function JobHeader() {
  const { has } = usePermission()

  return (
    <div className='flex items-center justify-between'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight flex items-center gap-2'>
          <Briefcase size={22} /> Tin tuyển dụng
        </h1>
        <p className='text-muted-foreground text-sm'>Quản lý các vị trí tuyển dụng</p>
      </div>
      {has(PERM_JOBS_WRITE) && (
        <Button
          asChild
          className='shadow-lg shadow-primary/20 h-10 rounded-xl px-5 font-bold transition-all hover:scale-[1.02] active:scale-95'
        >
          <Link to='/jobs/new'>
            <Plus size={14} className='mr-1' /> Tạo tin mới
          </Link>
        </Button>
      )}
    </div>
  )
}
