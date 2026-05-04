import { History } from 'lucide-react'

export function AuditHeader() {
  return (
    <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent uppercase flex items-center gap-3'>
          <History className='h-8 w-8 text-primary/60' /> Nhật ký hệ thống
        </h1>
        <p className='text-muted-foreground font-medium mt-1 uppercase text-[11px] tracking-widest'>
          Audit Logs • Theo dõi mọi hoạt động thay đổi trong hệ thống.
        </p>
      </div>
    </div>
  )
}
