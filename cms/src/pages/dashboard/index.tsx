import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Briefcase, Eye, FileText, Users } from 'lucide-react'
import { dashboardService } from '@/services/dashboard.service'
import { RecruitmentFunnelChart, ViewTrendChart } from './components/analytics-charts'
import { QuickActions } from './components/quick-actions'
import { RecentActivities } from './components/recent-activities'
import { StatCard } from './components/stat-cards'

export default function DashboardPage() {
  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => dashboardService.getSummary(),
  })

  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: () => dashboardService.getAnalytics(),
  })

  const { data: activities, isLoading: isActivitiesLoading } = useQuery({
    queryKey: ['dashboard-activities'],
    queryFn: () => dashboardService.getRecentActivities(),
  })

  return (
    <div className='p-4 md:p-8 space-y-8 max-w-(--breakpoint-2xl) w-full mx-auto'>
      <motion.div className='flex flex-col gap-1.5' initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className='text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent'>
          Bảng điều khiển
        </h1>
        <p className='text-muted-foreground font-medium'>Tổng quan hoạt động Nội dung và Tuyển dụng của bạn.</p>
      </motion.div>

      {/* Standard Bento Grid Layout */}
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6'>
        {/* Row 1: All 4 Stats */}
        <StatCard
          title='Tổng bài viết'
          value={summary?.posts?.total || 0}
          description={`${summary?.posts?.newThisMonth || 0} bài mới tháng này`}
          icon={FileText}
          color='text-blue-500'
          bgColor='bg-blue-500/10'
          index={0}
          isLoading={isSummaryLoading}
          className='xl:col-span-3'
        />
        <StatCard
          title='Tổng lượt xem'
          value={summary?.posts?.totalViews || 0}
          description='Tất cả thời gian'
          icon={Eye}
          color='text-emerald-500'
          bgColor='bg-emerald-500/10'
          index={1}
          isLoading={isSummaryLoading}
          className='xl:col-span-3'
        />
        <StatCard
          title='Công việc'
          value={summary?.recruitment?.activeJobs || 0}
          description='Đang hiển thị'
          icon={Briefcase}
          color='text-orange-500'
          bgColor='bg-orange-500/10'
          index={2}
          isLoading={isSummaryLoading}
          className='xl:col-span-3'
        />
        <StatCard
          title='Ứng viên'
          value={summary?.recruitment?.totalCandidates || 0}
          description={`Tỉ lệ: ${summary?.recruitment?.successRate || 0}%`}
          icon={Users}
          color='text-purple-500'
          bgColor='bg-purple-500/10'
          index={3}
          isLoading={isSummaryLoading}
          className='xl:col-span-3'
        />

        {/* Row 2: View Trend (Full width on tablet, 8/12 on desktop) */}
        <ViewTrendChart
          data={analytics?.viewTrend || []}
          isLoading={isAnalyticsLoading}
          className='md:col-span-2 xl:col-span-8 h-full'
        />

        {/* Column for Quick Actions on Desktop, but half-width on Tablet */}
        <QuickActions className='md:col-span-1 xl:col-span-4 h-full' />

        {/* Recruitment Funnel Chart - paired with Quick Actions on Tablet */}
        <RecruitmentFunnelChart
          data={analytics?.funnel || []}
          isLoading={isAnalyticsLoading}
          className='md:col-span-1 xl:col-span-4 h-full xl:order-last'
        />

        {/* Recent Activities (Full width on tablet, 8/12 on desktop) */}
        <RecentActivities
          data={activities}
          isLoading={isActivitiesLoading}
          className='md:col-span-2 xl:col-span-8 h-full'
        />
      </div>
    </div>
  )
}
