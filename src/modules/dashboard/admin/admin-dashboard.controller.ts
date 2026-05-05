import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '~/common/guards/jwt-auth.guard'
import { DashboardService } from '../dashboard.service'

@ApiTags('Admin Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get dashboard summary stats' })
  getSummary() {
    return this.dashboardService.getSummary()
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get dashboard analytics data for charts' })
  getAnalytics() {
    return this.dashboardService.getAnalytics()
  }

  @Get('activities')
  @ApiOperation({ summary: 'Get recent activities from audit logs' })
  getRecentActivities() {
    return this.dashboardService.getRecentActivities()
  }
}
