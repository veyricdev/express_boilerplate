import { PERM_CONTACTS_DELETE, PERM_CONTACTS_READ } from '@shared/constants/permissions'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Mail, MailOpen, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { usePermission } from '@/hooks/use-permission'
import { contactService } from '@/services/contact.service'

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { has } = usePermission()

  const { data: contact, isLoading } = useQuery({
    queryKey: ['contacts', id],
    queryFn: () => contactService.findOne(Number(id)),
    enabled: !!id && has(PERM_CONTACTS_READ),
  })

  const toggleMutation = useMutation({
    mutationFn: () => contactService.toggleRead(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast.success('Cập nhật trạng thái thành công')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => contactService.remove(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast.success('Đã xóa liên hệ')
      navigate('/contacts')
    },
    onError: () => toast.error('Không thể xóa liên hệ'),
  })

  const c = contact as any

  return (
    <div className='p-4 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-(--breakpoint-2xl) w-full mx-auto'>
      <div className='flex items-center gap-3'>
        <Button variant='ghost' size='sm' asChild>
          <Link to='/contacts'>
            <ArrowLeft size={16} className='mr-1' /> Quay lại
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className='text-muted-foreground text-sm text-center py-12'>Đang tải...</div>
      ) : !c ? (
        <div className='text-destructive text-sm text-center py-12'>Không tìm thấy liên hệ</div>
      ) : (
        <div className='bg-card rounded-2xl border shadow-sm p-6 space-y-5'>
          <div className='flex items-start justify-between gap-4'>
            <div className='space-y-1'>
              <div className='flex items-center gap-2'>
                <h1 className='text-xl font-bold'>{c.fullName}</h1>
                {c.isRead ? (
                  <Badge variant='outline' className='text-xs'>
                    Đã đọc
                  </Badge>
                ) : (
                  <Badge variant='secondary' className='text-xs text-blue-600'>
                    Chưa đọc
                  </Badge>
                )}
              </div>
              <p className='text-sm text-muted-foreground'>{c.email}</p>
              {c.phone && <p className='text-sm text-muted-foreground'>{c.phone}</p>}
            </div>
            <div className='flex gap-2 shrink-0'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => toggleMutation.mutate()}
                disabled={toggleMutation.isPending}
              >
                {c.isRead ? <Mail size={14} className='mr-1' /> : <MailOpen size={14} className='mr-1' />}
                {c.isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
              </Button>
              {has(PERM_CONTACTS_DELETE) && (
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={() => {
                    if (window.confirm('Bạn có chắc chắn muốn xóa liên hệ này?')) {
                      deleteMutation.mutate()
                    }
                  }}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 size={14} />
                </Button>
              )}
            </div>
          </div>

          <div className='border-t pt-4 space-y-3'>
            <div>
              <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>Tiêu đề</p>
              <p className='mt-1 text-sm font-medium'>{c.subject}</p>
            </div>
            <div>
              <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>Nội dung</p>
              <p className='mt-1 text-sm whitespace-pre-wrap leading-relaxed'>{c.message}</p>
            </div>
          </div>

          <div className='border-t pt-4 text-xs text-muted-foreground'>
            Gửi lúc: {new Date(c.createdAt).toLocaleString('vi-VN')}
          </div>
        </div>
      )}
    </div>
  )
}
