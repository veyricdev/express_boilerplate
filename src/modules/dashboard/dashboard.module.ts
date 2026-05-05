import { Module } from '@nestjs/common'
import { AdminDashboardController } from './admin/admin-dashboard.controller'
import { DashboardService } from './dashboard.service'

@Module({
  controllers: [AdminDashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
