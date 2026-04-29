import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { PERM_AUDIT_READ } from '~/common/constants/permissions'
import { RequirePermissions } from '~/common/decorators/require-permissions.decorator'
import { JwtAuthGuard } from '~/common/guards/jwt-auth.guard'
import { PermissionsGuard } from '~/common/guards/permissions.guard'
import { AuditLogsService } from '../audit-logs.service'
import { FindAuditLogsDto } from '../dto/find-audit-logs.dto'

@ApiTags('Admin: Audit Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('admin/audit-logs')
export class AdminAuditLogsController {
  constructor(private auditLogsService: AuditLogsService) {}

  @Get()
  @RequirePermissions(PERM_AUDIT_READ)
  @ApiOperation({ summary: 'List all audit logs' })
  findAll(@Query() query: FindAuditLogsDto) {
    return this.auditLogsService.findAll(query)
  }

  @Get(':id')
  @RequirePermissions(PERM_AUDIT_READ)
  @ApiOperation({ summary: 'Get audit log details' })
  findOne(@Param('id') id: string) {
    // BigInt comes as string from Param, but we need it for Prisma
    return this.auditLogsService.findOne(BigInt(id))
  }
}
