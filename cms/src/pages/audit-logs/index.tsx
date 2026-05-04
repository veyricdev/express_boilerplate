import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Activity, Calendar, Eye, History, Search, Shield } from 'lucide-react'
import { useSearchParams } from 'react-router'
import { SharedPagination } from '@/components/shared/shared-pagination'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import api from '@/services/api'
import { AuditLog, PaginatedResponse } from '@/types'

export default function AuditLogsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchTerm = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '10', 10)

  const { data: response, isLoading } = useQuery({
    queryKey: ['audit-logs', searchTerm, page, limit],
    queryFn: () =>
      api.get<PaginatedResponse<AuditLog>>('/admin/audit-logs', {
        params: { search: searchTerm, page, limit },
      }) as unknown as PaginatedResponse<AuditLog>,
  })

  const logs = response?.data || []
  const meta = response?.meta

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
              onChange={(e) => {
                const newParams = new URLSearchParams(searchParams)
                if (e.target.value) {
                  newParams.set('search', e.target.value)
                } else {
                  newParams.delete('search')
                }
                newParams.set('page', '1')
                setSearchParams(newParams, { replace: true })
              }}
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
                      <div className='flex flex-col gap-1.5'>
                        <div className='flex items-center gap-1.5 px-2 py-0.5 rounded bg-muted/50 w-fit border border-muted-foreground/10'>
                          <Shield className='h-3 w-3 text-muted-foreground' />
                          <span className='font-mono text-[10px] font-semibold'>{log.entity}</span>
                          {log.entityId && (
                            <>
                              <span className='text-muted-foreground/40'>|</span>
                              <span className='font-mono text-[10px] text-muted-foreground'>#{log.entityId}</span>
                            </>
                          )}
                        </div>
                        <span
                          className='text-sm font-medium text-foreground line-clamp-2 max-w-[250px] whitespace-normal'
                          title={
                            log.newData?.title ||
                            log.newData?.name ||
                            log.newData?.email ||
                            log.newData?.key ||
                            log.oldData?.title ||
                            log.oldData?.name ||
                            log.oldData?.email ||
                            log.oldData?.key ||
                            ''
                          }
                        >
                          {log.newData?.title ||
                            log.newData?.name ||
                            log.newData?.email ||
                            log.newData?.key ||
                            log.oldData?.title ||
                            log.oldData?.name ||
                            log.oldData?.email ||
                            log.oldData?.key ||
                            (log.entityId ? `Bản ghi #${log.entityId}` : '---')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className='px-6 py-4 max-w-[200px]'>
                      {log.newData || log.oldData ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant='outline'
                              size='sm'
                              className='h-7 text-xs bg-muted/30 border-muted/50 hover:bg-muted/50 gap-1.5'
                            >
                              <Eye className='w-3.5 h-3.5' />
                              Xem payload
                            </Button>
                          </DialogTrigger>
                          <DialogContent className='sm:max-w-4xl max-h-[80vh] flex flex-col'>
                            <DialogHeader>
                              <DialogTitle>Chi tiết dữ liệu (Payload)</DialogTitle>
                              <DialogDescription>
                                Dữ liệu chi tiết của bản ghi {log.entity} {log.entityId ? `#${log.entityId}` : ''}
                              </DialogDescription>
                            </DialogHeader>
                            <div className='flex-1 overflow-auto mt-2 space-y-4'>
                              {log.newData && (
                                <div className='space-y-2'>
                                  <h4 className='text-sm font-semibold text-foreground'>Dữ liệu mới (New Data)</h4>
                                  <pre className='bg-muted/50 p-4 rounded-lg text-xs font-mono overflow-auto border border-muted'>
                                    {JSON.stringify(log.newData, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {log.oldData && (
                                <div className='space-y-2'>
                                  <h4 className='text-sm font-semibold text-foreground'>Dữ liệu cũ (Old Data)</h4>
                                  <pre className='bg-muted/50 p-4 rounded-lg text-xs font-mono overflow-auto border border-muted'>
                                    {JSON.stringify(log.oldData, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <span className='text-xs text-muted-foreground italic'>Không có dữ liệu</span>
                      )}
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
        {meta && <SharedPagination meta={meta} />}
      </div>
    </div>
  )
}
