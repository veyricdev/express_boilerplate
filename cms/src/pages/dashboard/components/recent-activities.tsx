import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { History, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { DashboardActivity } from '@/types'

interface RecentActivitiesProps {
  data?: DashboardActivity[]
  isLoading: boolean
  className?: string
}

export function RecentActivities({ data, isLoading, className }: RecentActivitiesProps) {
  if (isLoading) {
    return <Card className={cn('h-[400px] animate-pulse bg-muted/50', className)} />
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={cn('h-full', className)}>
      <Card className='bg-card rounded-2xl border shadow-sm transition-all hover:shadow-md border-muted/50 overflow-hidden h-full'>
        <CardHeader className='border-b bg-muted/30 p-6'>
          <CardTitle className='flex items-center gap-3 text-lg font-bold'>
            <div className='p-2 rounded-lg bg-orange-500/10'>
              <History className='h-5 w-5 text-orange-500' />
            </div>
            Hoạt động gần đây
          </CardTitle>
        </CardHeader>
        <CardContent className='p-6'>
          <div className='space-y-6'>
            {data && data.length > 0 ? (
              data.map((activity) => (
                <div key={activity.id} className='flex items-start gap-4 group'>
                  <Avatar className='h-9 w-9 border'>
                    <AvatarImage src={activity.user?.avatarUrl || undefined} />
                    <AvatarFallback className='bg-muted'>
                      <User className='h-4 w-4 text-muted-foreground' />
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex-1 space-y-1'>
                    <p className='text-sm font-medium leading-none'>
                      <span className='font-bold'>{activity.user?.fullName || 'Hệ thống'}</span>{' '}
                      {getActionText(activity.action)}{' '}
                      <span className='text-primary font-semibold'>{activity.entity}</span>
                    </p>
                    <p className='text-xs text-muted-foreground flex items-center gap-1'>
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true, locale: vi })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className='text-sm text-center text-muted-foreground py-8'>Chưa có hoạt động nào.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function getActionText(action: string) {
  switch (action) {
    case 'CREATE':
      return 'đã tạo mới'
    case 'UPDATE':
      return 'đã cập nhật'
    case 'DELETE':
      return 'đã xóa'
    case 'LOGIN':
      return 'đã đăng nhập vào'
    default:
      return 'đã thực hiện thao tác trên'
  }
}
