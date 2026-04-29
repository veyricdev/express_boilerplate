import { motion } from 'framer-motion'
import {
  ArrowDownRight,
  ArrowUpRight,
  FileText,
  FolderTree,
  History,
  Shield,
  Tag,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/utils/cn'

const stats = [
  { title: 'Tổng bài viết', value: '124', change: '+12%', icon: FileText, color: 'text-blue-500' },
  { title: 'Danh mục', value: '12', change: '+2', icon: FolderTree, color: 'text-orange-500' },
  { title: 'Thẻ (Tags)', value: '48', change: '+5', icon: Tag, color: 'text-purple-500' },
  { title: 'Người dùng', value: '8', change: '0%', icon: Users, color: 'text-green-500' },
]

export default function DashboardPage() {
  return (
    <div className='p-8 space-y-8'>
      <div className='flex flex-col gap-1.5'>
        <h1 className='text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent'>
          Tổng quan
        </h1>
        <p className='text-muted-foreground font-medium'>
          Chào mừng bạn trở lại! Dưới đây là thống kê mới nhất về hệ thống.
        </p>
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4, ease: 'easeOut' }}
          >
            <Card className='bg-card rounded-2xl border shadow-sm hover:shadow-md transition-all group overflow-hidden border-muted/50'>
              <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0 p-6'>
                <CardTitle className='text-sm font-semibold text-muted-foreground/80 tracking-wide uppercase'>
                  {stat.title}
                </CardTitle>
                <div
                  className={cn(
                    'p-2 rounded-xl bg-muted/50 group-hover:scale-110 transition-transform duration-300',
                    stat.color.replace('text-', 'bg-').replace('500', '500/10')
                  )}
                >
                  <stat.icon className={cn('h-5 w-5', stat.color)} />
                </div>
              </CardHeader>
              <CardContent className='p-6 pt-0'>
                <div className='text-3xl font-bold tracking-tight'>{stat.value}</div>
                <div className='flex items-center mt-2.5'>
                  {stat.change.startsWith('+') ? (
                    <div className='flex items-center gap-1 text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[11px] font-bold'>
                      <ArrowUpRight className='h-3 w-3' /> {stat.change}
                    </div>
                  ) : stat.change === '0%' ? (
                    <div className='text-muted-foreground/70 text-[11px] font-medium bg-muted px-2 py-0.5 rounded-full'>
                      Không đổi
                    </div>
                  ) : (
                    <div className='flex items-center gap-1 text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-full text-[11px] font-bold'>
                      <ArrowDownRight className='h-3 w-3' /> {stat.change}
                    </div>
                  )}
                  <span className='text-muted-foreground/60 ml-2 text-[11px] font-medium italic'>
                    so với tháng trước
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-7'>
        <Card className='lg:col-span-4 bg-card rounded-2xl border shadow-sm transition-all hover:shadow-md border-muted/50 overflow-hidden'>
          <CardHeader className='border-b bg-muted/30 p-6'>
            <CardTitle className='flex items-center gap-3 text-lg font-bold'>
              <div className='p-2 rounded-lg bg-primary/10'>
                <TrendingUp className='h-5 w-5 text-primary' />
              </div>
              Hoạt động gần đây
            </CardTitle>
          </CardHeader>
          <CardContent className='p-6'>
            <div className='space-y-6'>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className='flex items-start gap-4 group cursor-default'>
                  <div className='mt-1.5 h-2 w-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors ring-4 ring-primary/5' />
                  <div className='flex-1 space-y-1.5'>
                    <p className='text-sm font-semibold leading-tight text-foreground/90 group-hover:text-primary transition-colors'>
                      Người dùng Admin vừa cập nhật bài viết "Next.js 15 features"
                    </p>
                    <div className='flex items-center gap-2 text-xs text-muted-foreground/70 font-medium'>
                      <History className='h-3 w-3' />2 giờ trước
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant='ghost'
              className='w-full mt-6 text-muted-foreground hover:text-primary font-semibold text-xs border-t pt-4 h-auto rounded-none'
            >
              Xem tất cả nhật ký
            </Button>
          </CardContent>
        </Card>

        <Card className='lg:col-span-3 bg-card rounded-2xl border shadow-sm transition-all hover:shadow-md border-muted/50 overflow-hidden'>
          <CardHeader className='border-b bg-muted/30 p-6'>
            <CardTitle className='flex items-center gap-3 text-lg font-bold'>
              <div className='p-2 rounded-lg bg-primary/10'>
                <Shield className='h-5 w-5 text-primary' />
              </div>
              Lịch sử truy cập
            </CardTitle>
          </CardHeader>
          <CardContent className='p-6'>
            <div className='space-y-4'>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className='flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-muted/50 group hover:bg-muted/50 transition-all'
                >
                  <div className='h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform'>
                    <Users className='h-5 w-5 text-primary' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-bold truncate'>Admin User</p>
                    <p className='text-[11px] text-muted-foreground font-medium truncate flex items-center gap-1.5'>
                      <span className='w-1.5 h-1.5 rounded-full bg-emerald-500' />
                      192.168.1.1 • Windows • Chrome
                    </p>
                  </div>
                  <Badge
                    variant='outline'
                    className='text-[10px] font-bold bg-emerald-500/5 text-emerald-600 border-emerald-500/20 px-2 rounded-full'
                  >
                    Thành công
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
