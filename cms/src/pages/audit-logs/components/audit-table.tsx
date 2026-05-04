import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Activity, Calendar, Eye, History, Shield } from 'lucide-react'
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AuditLog } from '@/types'

interface AuditTableProps {
  logs: AuditLog[]
  isLoading: boolean
}

export function AuditTable({ logs, isLoading }: AuditTableProps) {
  const getActionBadge = (action: string) => {
    const actionUpper = action.toUpperCase()
    let styles = ''
    switch (actionUpper) {
      case 'CREATE':
        styles = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
        break
      case 'UPDATE':
        styles = 'bg-sky-500/10 text-sky-600 border-sky-500/20'
        break
      case 'DELETE':
      case 'SOFT_DELETE':
      case 'HARD_DELETE':
        styles = 'bg-rose-500/10 text-rose-600 border-rose-500/20'
        break
      case 'LOGIN':
        styles = 'bg-amber-500/10 text-amber-600 border-amber-500/20'
        break
      case 'RESTORE':
        styles = 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
        break
      default:
        styles = 'bg-slate-500/10 text-slate-600 border-slate-500/20'
    }

    return (
      <Badge
        variant='outline'
        className={`${styles} px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider border shadow-xs`}
      >
        {actionUpper}
      </Badge>
    )
  }

  const getEntityBadge = (entity: string, entityId?: string) => {
    const entityUpper = entity.toUpperCase()
    let styles = ''
    switch (entityUpper) {
      case 'POST':
      case 'POSTS':
        styles = 'bg-blue-500/10 text-blue-600 border-blue-500/20'
        break
      case 'CATEGORY':
      case 'CATEGORIES':
        styles = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
        break
      case 'TAG':
      case 'TAGS':
        styles = 'bg-rose-500/10 text-rose-600 border-rose-500/20'
        break
      case 'USER':
      case 'USERS':
      case 'AUTH':
        styles = 'bg-amber-500/10 text-amber-600 border-amber-500/20'
        break
      case 'SETTING':
      case 'SETTINGS':
        styles = 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20'
        break
      case 'AUDIT_LOG':
      case 'AUDIT-LOGS':
        styles = 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
        break
      default:
        styles = 'bg-slate-500/10 text-slate-600 border-slate-500/20'
    }

    return (
      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border ${styles} w-fit shadow-xs`}>
        <Shield className='h-3 w-3 opacity-70' />
        <span className='font-mono text-[10px] font-bold uppercase tracking-tight'>{entityUpper}</span>
        {entityId && (
          <>
            <span className='opacity-30 mx-0.5 text-[10px]'>|</span>
            <span className='font-mono text-[10px] font-bold opacity-90'>#{entityId}</span>
          </>
        )}
      </div>
    )
  }

  return (
    <div className='overflow-x-auto'>
      <Table>
        <TableHeader className='bg-muted/50'>
          <TableRow className='hover:bg-transparent border-b'>
            <TableHead className='px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider w-[150px]'>
              Hành động
            </TableHead>
            <TableHead className='px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider'>
              Người thực hiện
            </TableHead>
            <TableHead className='px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider'>
              Tài nguyên
            </TableHead>
            <TableHead className='px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider'>
              Dữ liệu
            </TableHead>
            <TableHead className='px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider'>
              IP / Thiết bị
            </TableHead>
            <TableHead className='px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider text-right'>
              Thời gian
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className='h-48 text-center'>
                <div className='flex flex-col items-center justify-center gap-3 text-muted-foreground'>
                  <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent shadow-sm' />
                  <span className='text-sm font-bold animate-pulse uppercase tracking-widest'>Đang tải...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className='h-48 text-center text-muted-foreground/60 font-medium italic'>
                Không có nhật ký hoạt động nào được tìm thấy.
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id} className='hover:bg-muted/30 transition-all border-b last:border-0 group'>
                <TableCell className='px-6 py-5'>{getActionBadge(log.action)}</TableCell>
                <TableCell className='px-6 py-5'>
                  <div className='flex items-center gap-3'>
                    <div className='h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-[11px] font-bold text-muted-foreground border shadow-xs'>
                      {(log.user?.fullName || 'S').charAt(0).toUpperCase()}
                    </div>
                    <div className='flex flex-col gap-0.5'>
                      <span className='font-bold text-foreground group-hover:text-primary transition-colors'>
                        {log.user?.fullName || 'Hệ thống'}
                      </span>
                      <span className='text-[10px] text-muted-foreground font-medium uppercase tracking-tighter'>
                        {log.user?.email || 'SYSTEM'}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className='px-6 py-5'>
                  <div className='flex flex-col gap-1.5'>
                    {getEntityBadge(log.entity, log.entityId?.toString())}
                    <span className='text-xs font-bold text-foreground/80 line-clamp-1 max-w-[200px]'>
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
                <TableCell className='px-6 py-5'>
                  {log.newData || log.oldData ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant='outline'
                          size='sm'
                          className='h-8 px-3 text-[11px] font-bold bg-muted/50 border-muted-foreground/10 hover:bg-primary/10 hover:text-primary hover:border-primary/20 rounded-xl transition-all'
                        >
                          <Eye className='w-3.5 h-3.5 mr-1.5' /> Payload
                        </Button>
                      </DialogTrigger>
                      <DialogContent className='sm:max-w-4xl max-h-[85vh] flex flex-col rounded-3xl border-white/10 shadow-2xl overflow-hidden p-0 animate-in zoom-in-95 duration-200'>
                        <div className='absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none' />
                        <div className='p-8 space-y-6 relative flex flex-col h-full'>
                          <DialogHeader>
                            <DialogTitle className='text-2xl font-bold flex items-center gap-3'>
                              <div className='h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary'>
                                <Activity className='h-6 w-6' />
                              </div>
                              Chi tiết dữ liệu nhật ký
                            </DialogTitle>
                            <DialogDescription className='text-muted-foreground font-medium pt-2'>
                              Chi tiết payload cho hành động{' '}
                              <span className='text-foreground font-bold uppercase'>{log.action}</span> trên{' '}
                              <span className='text-foreground font-bold uppercase'>{log.entity}</span>{' '}
                              {log.entityId && `(#${log.entityId})`}
                            </DialogDescription>
                          </DialogHeader>
                          <div className='flex-1 overflow-auto space-y-6 pr-2 custom-scrollbar'>
                            {log.newData && (
                              <div className='space-y-3'>
                                <div className='flex items-center gap-2'>
                                  <Badge className='bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold'>
                                    DỮ LIỆU MỚI
                                  </Badge>
                                </div>
                                <pre className='bg-muted/30 p-5 rounded-2xl text-[11px] font-mono overflow-auto border border-muted text-foreground/80 leading-relaxed shadow-xs'>
                                  {JSON.stringify(log.newData, null, 2)}
                                </pre>
                              </div>
                            )}
                            {log.oldData && (
                              <div className='space-y-3'>
                                <div className='flex items-center gap-2'>
                                  <Badge className='bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold'>
                                    DỮ LIỆU CŨ
                                  </Badge>
                                </div>
                                <pre className='bg-muted/30 p-5 rounded-2xl text-[11px] font-mono overflow-auto border border-muted text-foreground/80 leading-relaxed shadow-xs'>
                                  {JSON.stringify(log.oldData, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <span className='text-[10px] text-muted-foreground italic font-medium uppercase'>N/A</span>
                  )}
                </TableCell>
                <TableCell className='px-6 py-5'>
                  <div className='flex flex-col gap-1'>
                    <div className='flex items-center gap-1.5 text-xs font-bold text-foreground/70'>
                      <div className='h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse' />
                      {log.ipAddress}
                    </div>
                    <span className='text-[10px] text-muted-foreground font-medium truncate max-w-[150px] italic'>
                      {log.userAgent}
                    </span>
                  </div>
                </TableCell>
                <TableCell className='px-6 py-5 text-right'>
                  <div className='flex flex-col items-end gap-0.5'>
                    <div className='flex items-center gap-1.5 font-bold text-foreground text-sm'>
                      <History className='h-3.5 w-3.5 text-primary/60' />
                      {format(new Date(log.createdAt), 'HH:mm:ss', { locale: vi })}
                    </div>
                    <div className='flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase tracking-tighter'>
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
  )
}
