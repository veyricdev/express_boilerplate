import { Injectable } from '@nestjs/common'
import { format, subDays } from 'date-fns'
import { CandidateStatus, JobStatus } from '~/prisma/generated/prisma'
import { PrismaService } from '~/prisma/prisma.service'

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [totalPosts, newPostsThisMonth, totalViews, activeJobs, totalCandidates, onboardedCandidates] =
      await Promise.all([
        this.prisma.db.post.count(),
        this.prisma.db.post.count({
          where: {
            createdAt: { gte: firstDayOfMonth },
          },
        }),
        this.prisma.db.post.aggregate({
          _sum: { views: true },
        }),
        this.prisma.db.job.count({
          where: { status: JobStatus.OPEN },
        }),
        this.prisma.db.candidate.count(),
        this.prisma.db.candidate.count({
          where: { status: CandidateStatus.HIRED },
        }),
      ])

    return {
      posts: {
        total: totalPosts,
        newThisMonth: newPostsThisMonth,
        totalViews: totalViews._sum.views || 0,
      },
      recruitment: {
        activeJobs,
        totalCandidates,
        onboardedCandidates,
        successRate: totalCandidates > 0 ? Math.round((onboardedCandidates / totalCandidates) * 100) : 0,
      },
    }
  }

  async getAnalytics() {
    const thirtyDaysAgo = subDays(new Date(), 30)

    // Get real daily post counts
    const postCounts: any[] = await this.prisma.db.$queryRaw`
      SELECT DATE(created_at) as date, COUNT(*) as count 
      FROM posts 
      WHERE created_at >= ${thirtyDaysAgo}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `

    // Get real daily activity counts (as a proxy for views/traffic)
    const activityCounts: any[] = await this.prisma.db.$queryRaw`
      SELECT DATE(created_at) as date, COUNT(*) as count 
      FROM audit_logs 
      WHERE created_at >= ${thirtyDaysAgo}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `

    const last30Days = Array.from({ length: 30 })
      .map((_, i) => {
        const d = subDays(new Date(), i)
        return format(d, 'yyyy-MM-dd')
      })
      .reverse()

    const viewTrend = last30Days.map((date) => {
      const postMatch = postCounts.find((p) => format(new Date(p.date), 'yyyy-MM-dd') === date)
      const activityMatch = activityCounts.find((a) => format(new Date(a.date), 'yyyy-MM-dd') === date)

      return {
        date,
        views: Number(activityMatch?.count || 0),
        posts: Number(postMatch?.count || 0),
      }
    })

    const funnelGroup = await this.prisma.db.candidate.groupBy({
      by: ['status'],
      _count: true,
    })

    return {
      viewTrend,
      funnel: funnelGroup.map((f: any) => ({ status: f.status, count: f._count })),
    }
  }

  async getRecentActivities() {
    return this.prisma.db.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    })
  }
}
