import { Plus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function UserHeader() {
  return (
    <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent uppercase flex items-center gap-3'>
          <Users className='h-8 w-8 text-primary/60' /> Người dùng
        </h1>
        <p className='text-muted-foreground font-medium mt-1 uppercase text-[11px] tracking-widest'>
          Users • Quản lý tài khoản và phân quyền hệ thống.
        </p>
      </div>
      <Button className='shadow-lg shadow-primary/20 h-10 rounded-xl px-5 font-bold transition-all hover:scale-[1.02] active:scale-95'>
        <Plus className='mr-2 h-4 w-4' /> Thêm người dùng
      </Button>
    </div>
  )
}
