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

    // Skip generic refresh token logs as they are too noisy
    const isRefresh = url.includes('/auth/refresh')

    if (!isAdminRoute || !isWriteOperation || isRefresh) {
      return next.handle()
    }

    const entity = this.extractEntity(url)
    const action = this.mapAction(method, url)
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

          let sanitizedBody = null
          if (body) {
            sanitizedBody = JSON.parse(JSON.stringify(body))
            // Remove sensitive fields
            const sensitiveFields = ['password', 'passwordConfirm', 'currentPassword', 'newPassword']
            for (const field of sensitiveFields) {
              if (field in sanitizedBody) {
                sanitizedBody[field] = '***REDACTED***'
              }
            }
          }

          await this.prisma.db.auditLog.create({
            data: {
              userId: user?.id,
              action,
              entity,
              entityId: numericEntityId,
              newData: sanitizedBody,
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

  private mapAction(method: string, url: string): string {
    if (url.includes('/auth/login')) return 'LOGIN'
    if (url.includes('/auth/logout')) return 'LOGOUT'
    
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
