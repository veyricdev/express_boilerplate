import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Activity, Calendar, History, Search, Shield } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import api from '@/services/api'
import { AuditLog, PaginatedResponse } from '@/types'

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const { data: response, isLoading } = useQuery({
    queryKey: ['audit-logs', searchTerm],
    queryFn: () =>
      api.get<PaginatedResponse<AuditLog>>('/admin/audit-logs', {
        params: { search: searchTerm },
      }) as unknown as PaginatedResponse<AuditLog>,
  })

  const logs = response?.data || []

  const getActionBadge = (action: string) => {
    const actionUpper = action.toUpperCase()
    switch (actionUpper) {
      case 'CREATE':
        return (
          <Badge className='bg-blue-500/10 text-blue-600 border-blue-500/20 px-2 py-0.5 rounded-full font-bold text-[10px]'>
            {actionUpper}
          </Badge>
        )
      case 'UPDATE':
        return (
          <Badge className='bg-amber-500/10 text-amber-600 border-amber-500/20 px-2 py-0.5 rounded-full font-bold text-[10px]'>
            {actionUpper}
          </Badge>
        )
      case 'DELETE':
        return (
          <Badge className='bg-rose-500/10 text-rose-600 border-rose-500/20 px-2 py-0.5 rounded-full font-bold text-[10px]'>
            {actionUpper}
          </Badge>
        )
      case 'LOGIN':
        return (
          <Badge className='bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-2 py-0.5 rounded-full font-bold text-[10px]'>
            {actionUpper}
          </Badge>
        )
      default:
        return (
          <Badge className='bg-slate-500/10 text-slate-600 border-slate-500/20 px-2 py-0.5 rounded-full font-bold text-[10px]'>
            {actionUpper}
          </Badge>
        )
    }
  }

  return (
    <div className='p-8 space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent'>
          Audit Logs
        </h1>
        <p className='text-muted-foreground font-medium mt-1'>Theo dõi mọi hoạt động thay đổi trong hệ thống.</p>
      </div>

      <div className='bg-card rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md'>
        <div className='p-5 border-b bg-muted/30 flex flex-col sm:flex-row items-start sm:items-center gap-4'>
          <div className='relative flex-1 w-full'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Tìm kiếm hành động, người dùng, tài nguyên...'
              className='pl-10 bg-background/50 border-muted-foreground/20 focus-visible:ring-primary/20 h-10 w-full'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className='overflow-x-auto'>
          <Table>
            <TableHeader className='bg-muted/50'>
              <TableRow className='hover:bg-transparent border-b'>
                <TableHead className='px-6 py-4 font-semibold text-foreground/80 h-12 w-[140px]'>Hành động</TableHead>
                <TableHead className='px-6 py-4 font-semibold text-foreground/80 h-12'>Người thực hiện</TableHead>
                <TableHead className='px-6 py-4 font-semibold text-foreground/80 h-12'>Tài nguyên</TableHead>
                <TableHead className='px-6 py-4 font-semibold text-foreground/80 h-12'>Chi tiết</TableHead>
                <TableHead className='px-6 py-4 font-semibold text-foreground/80 h-12'>IP / Thiết bị</TableHead>
                <TableHead className='px-6 py-4 font-semibold text-foreground/80 h-12 text-right'>Thời gian</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className='h-40 text-center'>
                    <div className='flex flex-col items-center justify-center gap-2 text-muted-foreground'>
                      <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                      <span className='text-sm font-medium'>Đang tải nhật ký...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className='h-40 text-center text-muted-foreground'>
                    Không có nhật ký hoạt động nào.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log: AuditLog) => (
                  <TableRow key={log.id} className='hover:bg-muted/30 transition-colors border-b last:border-0 group'>
                    <TableCell className='px-6 py-4'>{getActionBadge(log.action)}</TableCell>
                    <TableCell className='px-6 py-4'>
                      <div className='flex flex-col gap-0.5'>
                        <span className='font-semibold text-foreground group-hover:text-primary transition-colors'>
                          {log.user?.fullName || 'Hệ thống'}
                        </span>
                        <span className='text-[11px] text-muted-foreground/80 font-medium'>
                          {log.user?.email || 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className='px-6 py-4'>
                      <div className='flex items-center gap-2 px-2 py-1 rounded bg-muted/50 w-fit border border-muted-foreground/10'>
                        <Shield className='h-3.5 w-3.5 text-muted-foreground' />
                        <span className='font-mono text-xs font-semibold'>{log.entity}</span>
                      </div>
                    </TableCell>
                    <TableCell className='px-6 py-4 max-w-[200px]'>
                      <div className='text-xs text-muted-foreground/90 font-mono line-clamp-2 bg-muted/30 p-2 rounded border border-muted/20'>
                        {log.newData ? JSON.stringify(log.newData) : '---'}
                      </div>
                    </TableCell>
                    <TableCell className='px-6 py-4'>
                      <div className='flex flex-col gap-1'>
                        <div className='flex items-center gap-1.5 text-xs font-semibold text-foreground/80'>
                          <Activity className='h-3 w-3' /> {log.ipAddress}
                        </div>
                        <span className='text-[10px] text-muted-foreground leading-tight truncate max-w-[150px] italic'>
                          {log.userAgent}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className='px-6 py-4 text-right'>
                      <div className='flex flex-col items-end gap-0.5'>
                        <div className='flex items-center gap-1.5 font-bold text-foreground text-sm'>
                          <History className='h-3.5 w-3.5 text-primary/60' />
                          {format(new Date(log.createdAt), 'HH:mm:ss', { locale: vi })}
                        </div>
                        <div className='flex items-center gap-1 text-[11px] text-muted-foreground/80 font-medium'>
                          <Calendar className='h-3 w-3' />
                          {format(new Date(log.createdAt), 'dd/MM/yyyy', { locale: vi })}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
