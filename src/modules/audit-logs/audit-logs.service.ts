import { Injectable, NotFoundException } from '@nestjs/common'
import { paginate } from '~/common/helpers/pagination.helper'
import { PrismaService } from '~/prisma/prisma.service'
import type { FindAuditLogsDto } from './dto/find-audit-logs.dto'

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: FindAuditLogsDto) {
    const { page, limit, entity, action, userId, entityId } = query

    return paginate(
      this.prisma.db.auditLog,
      {
        where: {
          entity,
          action,
          userId,
          entityId,
        },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      },
      { page, limit }
    )
  }

  async findOne(id: bigint) {
    const log = await this.prisma.db.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    })

    if (!log) throw new NotFoundException('Audit log not found')

    return log
  }
}
