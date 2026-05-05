import { Briefcase, FilePlus, PlusCircle, Zap } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/utils/cn'

interface QuickActionsProps {
  className?: string
}

export function QuickActions({ className }: QuickActionsProps) {
  const navigate = useNavigate()

  const actions = [
    { label: 'Bài viết mới', icon: FilePlus, href: '/posts/create', color: 'bg-blue-500' },
    { label: 'Tuyển dụng mới', icon: Briefcase, href: '/jobs/new', color: 'bg-orange-500' },
    { label: 'Thêm ứng viên', icon: PlusCircle, href: '/candidates', color: 'bg-purple-500' },
  ]

  return (
    <Card
      className={cn(
        'bg-card rounded-2xl border shadow-sm transition-all hover:shadow-md border-muted/50 overflow-hidden h-full flex flex-col',
        className
      )}
    >
      <CardHeader className='border-b bg-muted/30 p-6'>
        <CardTitle className='flex items-center gap-3 text-lg font-bold'>
          <div className='p-2 rounded-lg bg-yellow-500/10'>
            <Zap className='h-5 w-5 text-yellow-500' />
          </div>
          Thao tác nhanh
        </CardTitle>
      </CardHeader>
      <CardContent className='p-6 flex-1'>
        <div className='grid grid-cols-1 gap-3 h-full'>
          {actions.map((action) => (
            <Button
              key={action.label}
              variant='outline'
              className='justify-start h-12 gap-3 rounded-xl hover:bg-muted/50 transition-all border-muted group'
              onClick={() => navigate(action.href)}
            >
              <div
                className={cn('p-1.5 rounded-lg text-white transition-transform group-hover:scale-110', action.color)}
              >
                <action.icon className='h-4 w-4' />
              </div>
              <span className='font-semibold'>{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
