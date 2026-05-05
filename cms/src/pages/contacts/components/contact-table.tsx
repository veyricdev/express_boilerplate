import { PERM_CONTACTS_DELETE } from '@shared/constants/permissions'
import { UseMutationResult } from '@tanstack/react-query'
import { Eye, Mail, MailOpen, Trash2 } from 'lucide-react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { usePermission } from '@/hooks/use-permission'
import { ContactSubmission } from '@/types'

interface ContactTableProps {
  contacts: ContactSubmission[]
  isLoading: boolean
  deleteMutation: UseMutationResult<any, Error, number, unknown>
}

export function ContactTable({ contacts, isLoading, deleteMutation }: ContactTableProps) {
  const { has } = usePermission()

  return (
    <div className='overflow-x-auto'>
      <Table>
        <TableHeader className='bg-muted/50'>
          <TableRow className='hover:bg-transparent border-b'>
            <TableHead className='px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider w-[60px] text-center'></TableHead>
            <TableHead className='w-[25%] px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider'>
              Người gửi
            </TableHead>
            <TableHead className='w-[40%] px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider'>
              Chủ đề
            </TableHead>
            <TableHead className='px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider'>
              Ngày gửi
            </TableHead>
            <TableHead className='px-6 py-4 font-bold text-foreground h-12 uppercase text-[11px] tracking-wider text-right'>
              Hành động
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className='h-48 text-center'>
                <div className='flex flex-col items-center justify-center gap-3 text-muted-foreground'>
                  <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent shadow-sm' />
                  <span className='text-sm font-bold animate-pulse uppercase tracking-widest'>Đang tải...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : contacts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className='h-48 text-center text-muted-foreground/60 font-medium italic'>
                Không tìm thấy liên hệ nào phù hợp.
              </TableCell>
            </TableRow>
          ) : (
            contacts.map((contact) => (
              <TableRow
                key={contact.id}
                className={`hover:bg-muted/30 transition-all border-b last:border-0 group ${!contact.isRead ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''}`}
              >
                <TableCell className='px-6 py-5 text-center'>
                  {contact.isRead ? (
                    <Tooltip>
                      <TooltipTrigger>
                        <MailOpen size={18} className='text-muted-foreground/50 mx-auto' />
                      </TooltipTrigger>
                      <TooltipContent className='rounded-lg font-bold'>Đã đọc</TooltipContent>
                    </Tooltip>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger>
                        <Mail size={18} className='text-blue-500 mx-auto animate-pulse' />
                      </TooltipTrigger>
                      <TooltipContent className='rounded-lg font-bold'>Chưa đọc</TooltipContent>
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell className='px-6 py-5'>
                  <div className='flex flex-col gap-0.5'>
                    <div className='flex items-center gap-2'>
                      <Link
                        to={`/contacts/${contact.id}`}
                        className='font-bold text-foreground hover:text-primary transition-colors'
                      >
                        {contact.fullName}
                      </Link>
                      {!contact.isRead && (
                        <Badge
                          variant='secondary'
                          className='text-[10px] h-5 bg-blue-100 text-blue-700 hover:bg-blue-200 border-transparent px-2'
                        >
                          Mới
                        </Badge>
                      )}
                    </div>
                    <span className='text-xs text-muted-foreground mt-1'>{contact.email}</span>
                  </div>
                </TableCell>
                <TableCell className='px-6 py-5'>
                  <div className='text-sm text-foreground font-medium max-w-[300px] truncate' title={contact.subject}>
                    {contact.subject}
                  </div>
                </TableCell>
                <TableCell className='px-6 py-5'>
                  <span className='text-sm text-muted-foreground'>
                    {new Date(contact.createdAt).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </TableCell>
                <TableCell className='px-6 py-5 text-right'>
                  <div className='flex justify-end gap-1.5 transition-opacity'>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary transition-all active:scale-90'
                          asChild
                        >
                          <Link to={`/contacts/${contact.id}`}>
                            <Eye className='h-4 w-4' />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className='rounded-lg font-bold'>Xem chi tiết</TooltipContent>
                    </Tooltip>
                    {has(PERM_CONTACTS_DELETE) && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all'
                            onClick={() => {
                              if (window.confirm('Bạn có chắc chắn muốn xóa liên hệ này?')) {
                                deleteMutation.mutate(contact.id)
                              }
                            }}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className='rounded-lg font-bold'>Xóa liên hệ</TooltipContent>
                      </Tooltip>
                    )}
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
