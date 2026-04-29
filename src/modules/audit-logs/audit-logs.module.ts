import { Module } from '@nestjs/common'
import { AdminAuditLogsController } from './admin/admin-audit-logs.controller'
import { AuditLogsService } from './audit-logs.service'

@Module({
  controllers: [AdminAuditLogsController],
  providers: [AuditLogsService],
  exports: [AuditLogsService],
})
export class AuditLogsModule {}
