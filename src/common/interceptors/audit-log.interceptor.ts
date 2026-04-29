import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable, tap } from 'rxjs'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
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

    return next.handle().pipe(
      tap(async (data) => {
        try {
          const entity = this.extractEntity(url)
          const action = this.mapAction(method)

          // For BigInt serialization in Json field, we might need to be careful
          // but Prisma Json field handles standard objects.
          // Body might contain BigInt if we're not careful, but usually it's just JSON.

          await this.prisma.unfiltered.auditLog.create({
            data: {
              userId: user?.id,
              action,
              entity,
              entityId: data?.id || body?.id || (typeof data === 'number' ? data : undefined),
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
