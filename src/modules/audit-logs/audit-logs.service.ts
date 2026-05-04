import { Injectable, NotFoundException } from '@nestjs/common'
import { paginate } from '~/common/helpers/pagination.helper'
import { PrismaService } from '~/prisma/prisma.service'
import type { FindAuditLogsDto } from './dto/find-audit-logs.dto'

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: FindAuditLogsDto) {
    const { page, limit, entity, action, userId, entityId, search, fromDate, toDate } = query

    return paginate(
      this.prisma.db.auditLog,
      {
        where: {
          entity,
          action,
          userId,
          entityId,
          OR: search
            ? [
                { entity: { contains: search } },
                { action: { contains: search } },
                { user: { fullName: { contains: search } } },
                { user: { email: { contains: search } } },
              ]
            : undefined,
          createdAt:
            fromDate || toDate
              ? {
                  ...(fromDate ? { gte: new Date(fromDate) } : {}),
                  ...(toDate ? { lte: new Date(new Date(toDate).setHours(23, 59, 59, 999)) } : {}),
                }
              : undefined,
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
