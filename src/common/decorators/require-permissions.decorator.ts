import { SetMetadata } from '@nestjs/common'

export const PERMISSIONS_KEY = 'permissions'

/**
 * Decorator to require specific bit flags permissions
 * @param permissions List of permissions (BigInt)
 */
export const RequirePermissions = (...permissions: bigint[]) => SetMetadata(PERMISSIONS_KEY, permissions)
