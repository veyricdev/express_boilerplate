import { Badge } from '@/components/ui/badge'

interface ContactHeaderProps {
  unreadCount: number
}

export function ContactHeader({ unreadCount }: ContactHeaderProps) {
  return (
    <div className='flex items-center justify-between'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Liên hệ</h1>
        <p className='text-muted-foreground text-sm'>
          Quản lý các tin nhắn liên hệ từ người dùng
          {unreadCount > 0 && (
            <Badge variant='destructive' className='ml-2'>
              {unreadCount} chưa đọc
            </Badge>
          )}
        </p>
      </div>
    </div>
  )
}
