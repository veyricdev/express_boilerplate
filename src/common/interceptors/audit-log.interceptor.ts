import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable, tap } from 'rxjs'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest()
    const { method, url, body, user, ip } = request
    const userAgent = request.headers['user-agent']

    // Only log write operations for Admin routes
    const isAdminRoute = url.includes('/admin/')
    const isWriteOperation = ['POST', 'PATCH', 'DELETE'].includes(method)

    // Skip login actions from generic audit (handle specially in AuthService if needed)
    const isLogin = url.includes('/auth/login')

    if (!isAdminRoute || !isWriteOperation || isLogin) {
      return next.handle()
    }

    const entity = this.extractEntity(url)
    const action = this.mapAction(method)
    const urlEntityId = this.extractEntityId(url)

    return next.handle().pipe(
      tap(async (data) => {
        try {
          const resolvedEntityId =
            data?.id ||
            data?.key ||
            body?.id ||
            body?.key ||
            urlEntityId ||
            (typeof data === 'number' ? data : undefined)
          // entityId in Prisma is Int?, so we must ensure it's a number. If it's a string key like 'site_name', it becomes null.
          const numericEntityId =
            resolvedEntityId && !Number.isNaN(Number(resolvedEntityId)) ? Number(resolvedEntityId) : null

          await this.prisma.unfiltered.auditLog.create({
            data: {
              userId: user?.id,
              action,
              entity,
              entityId: numericEntityId,
              newData: body ? JSON.parse(JSON.stringify(body)) : null, // Clone to avoid ref issues
              ipAddress: typeof ip === 'string' ? ip : JSON.stringify(ip),
              userAgent: userAgent || null,
            },
          })
        } catch (error) {
          console.error('[AuditLogInterceptor] Error:', error)
        }
      })
    )
  }

  private extractEntity(url: string): string {
    const parts = url.split('?')[0].split('/')
    const adminIndex = parts.indexOf('admin')
    if (adminIndex !== -1 && parts[adminIndex + 1]) {
      return parts[adminIndex + 1].toUpperCase()
    }
    return 'SYSTEM'
  }

  private extractEntityId(url: string): string | undefined {
    const parts = url.split('?')[0].split('/')
    const adminIndex = parts.indexOf('admin')
    // /admin/users/123 -> parts[adminIndex + 2] is '123'
    if (adminIndex !== -1 && parts[adminIndex + 2] && parts[adminIndex + 2] !== 'bulk') {
      return parts[adminIndex + 2]
    }
    return undefined
  }

  private mapAction(method: string): string {
    switch (method) {
      case 'POST':
        return 'CREATE'
      case 'PATCH':
      case 'PUT':
        return 'UPDATE'
      case 'DELETE':
        return 'DELETE'
      default:
        return method
    }
  }
}
