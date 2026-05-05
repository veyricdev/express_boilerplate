import { format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import { PieChart as PieChartIcon, TrendingUp } from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/utils/cn'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

interface ChartProps {
  data: any[]
  isLoading: boolean
  className?: string
}

export function ViewTrendChart({ data, isLoading, className }: ChartProps) {
  if (isLoading) {
    return <Card className={cn('h-[400px] animate-pulse bg-muted/50', className)} />
  }

  return (
    <Card
      className={cn(
        'bg-card rounded-2xl border shadow-sm transition-all hover:shadow-md border-muted/50 overflow-hidden flex flex-col',
        className
      )}
    >
      <CardHeader className='border-b bg-muted/30 p-6 flex-none'>
        <CardTitle className='flex items-center gap-3 text-lg font-bold'>
          <div className='p-2 rounded-lg bg-blue-500/10'>
            <TrendingUp className='h-5 w-5 text-blue-500' />
          </div>
          Xu hướng truy cập (30 ngày)
        </CardTitle>
      </CardHeader>
      <CardContent className='p-6 flex-1 min-h-[300px]'>
        <div className='h-full w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={data}>
              <defs>
                <linearGradient id='colorViews' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.1} />
                  <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
                </linearGradient>
                <linearGradient id='colorPosts' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#10b981' stopOpacity={0.1} />
                  <stop offset='95%' stopColor='#10b981' stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#e2e8f0' />
              <XAxis
                dataKey='date'
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                minTickGap={40}
                tickFormatter={(value) => {
                  try {
                    return format(parseISO(value), 'dd/MM')
                  } catch {
                    return value
                  }
                }}
                dy={10}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} width={30} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid hsl(var(--border))',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  backgroundColor: 'hsl(var(--popover))',
                  padding: '12px',
                }}
                labelStyle={{ fontWeight: 'bold', color: 'hsl(var(--popover-foreground))', marginBottom: '4px' }}
                itemStyle={{ fontSize: '13px', fontWeight: '500', padding: '2px 0' }}
                labelFormatter={(value) => {
                  try {
                    return format(parseISO(value), 'dd MMMM, yyyy', { locale: vi })
                  } catch {
                    return value
                  }
                }}
              />
              <Area
                type='monotone'
                dataKey='views'
                name='Hoạt động'
                stroke='#3b82f6'
                fillOpacity={1}
                fill='url(#colorViews)'
                strokeWidth={3}
              />
              <Area
                type='monotone'
                dataKey='posts'
                name='Bài viết'
                stroke='#10b981'
                fillOpacity={1}
                fill='url(#colorPosts)'
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

const CANDIDATE_STATUS_MAP: Record<string, string> = {
  RECEIVED: 'Tiếp nhận',
  INTERVIEWING: 'Phỏng vấn',
  REJECTED: 'Từ chối',
  HIRED: 'Tuyển dụng',
}

export function RecruitmentFunnelChart({ data, isLoading, className }: ChartProps) {
  if (isLoading) {
    return <Card className={cn('h-[400px] animate-pulse bg-muted/50', className)} />
  }

  return (
    <Card
      className={cn(
        'bg-card rounded-2xl border shadow-sm transition-all hover:shadow-md border-muted/50 overflow-hidden flex flex-col',
        className
      )}
    >
      <CardHeader className='border-b bg-muted/30 p-6 flex-none'>
        <CardTitle className='flex items-center gap-3 text-lg font-bold'>
          <div className='p-2 rounded-lg bg-purple-500/10'>
            <PieChartIcon className='h-5 w-5 text-purple-500' />
          </div>
          Phân bổ ứng viên
        </CardTitle>
      </CardHeader>
      <CardContent className='p-6 flex-1 min-h-[300px]'>
        <div className='h-full w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={data} layout='vertical' margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray='3 3' horizontal={false} stroke='#e2e8f0' />
              <XAxis type='number' hide />
              <YAxis
                dataKey='status'
                type='category'
                width={100}
                axisLine={false}
                tickLine={false}
                style={{ fontSize: '12px', fontWeight: 'bold' }}
                tickFormatter={(value) => CANDIDATE_STATUS_MAP[value] || value}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid hsl(var(--border))',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  backgroundColor: 'hsl(var(--popover))',
                  padding: '12px',
                }}
                itemStyle={{ color: 'hsl(var(--popover-foreground))', fontSize: '13px', fontWeight: '500' }}
                labelStyle={{ fontWeight: 'bold', color: 'hsl(var(--popover-foreground))', marginBottom: '4px' }}
                labelFormatter={(value) => CANDIDATE_STATUS_MAP[value] || value}
              />
              <Bar dataKey='count' name='Số lượng' radius={[0, 4, 4, 0]} barSize={20}>
                {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
