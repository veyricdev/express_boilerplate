import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator'

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<bigint[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true
    }

    const { user } = context.switchToHttp().getRequest()

    if (!user) {
      return false
    }

    // Owner bypasses all permission checks
    if (user.isOwner === true) {
      return true
    }

    if (user.permissions === undefined || user.permissions === null) {
      return false
    }

    try {
      const userPermissions = BigInt(user.permissions)

      // Check if user has ANY of the required permissions (OR logic)
      return requiredPermissions.some((perm) => (userPermissions & perm) === perm)
    } catch (error) {
      console.error('[PermissionsGuard] Error parsing permissions:', error)
      return false
    }
  }
}
