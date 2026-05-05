import { motion } from 'framer-motion'
import { LucideIcon, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/utils/cn'

interface StatCardProps {
  title: string
  value: number | string
  description: string
  icon: LucideIcon
  color: string
  bgColor: string
  index: number
  className?: string
  isLoading?: boolean
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color,
  bgColor,
  index,
  className,
  isLoading,
}: StatCardProps) {
  if (isLoading) {
    return <Card className={cn('h-32 animate-pulse bg-muted/50', className)} />
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Card className='bg-card rounded-2xl border shadow-sm hover:shadow-md transition-all group overflow-hidden border-muted/50 h-full'>
        <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0 p-6'>
          <CardTitle className='text-sm font-semibold text-muted-foreground/80 tracking-wide uppercase'>
            {title}
          </CardTitle>
          <div className={cn('p-2 rounded-xl group-hover:scale-110 transition-transform duration-300', bgColor)}>
            <Icon className={cn('h-5 w-5', color)} />
          </div>
        </CardHeader>
        <CardContent className='p-6 pt-0'>
          <div className='text-3xl font-bold tracking-tight'>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          <div className='flex items-center mt-2.5 text-[11px] font-medium text-muted-foreground/70'>
            <TrendingUp className='h-3 w-3 mr-1 text-emerald-500' />
            {description}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
