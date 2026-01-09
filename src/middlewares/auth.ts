import type { NextFunction, Request, Response } from 'express'
import { jwtVerify } from 'jose'
import { cache } from '~/configs/cache'
import { jwtSecret } from '~/configs/jwt'
import { ROLES } from '~/configs/permission'
import { ApiForbiddenError, ApiUnauthorizedError } from '~/core/api.error'
import { cacheBlacklistKey } from '~/utils/helper'
import { PermissionManager } from '~/utils/permission.helper'

export const authentication = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader) throw new ApiUnauthorizedError()

  const token = authHeader.split(' ')[1]

  const { payload } = await jwtVerify(token, jwtSecret.access)

  // 🔥 CHECK BLACKLIST
  const jti = payload.jti as string
  if (jti) {
    const isBlacklisted = await cache.get(cacheBlacklistKey(jti))
    if (isBlacklisted) throw new ApiUnauthorizedError()
  }

  res.locals.userId = payload.userId

  next()
}

/** Middleware checks permission */
export const requirePermission =
  (...requiredPermissions: number[]) =>
  (_req: Request, _res: Response, next: NextFunction) => {
    // const userId = res.locals.userId
    // TODO: get user permission

    const userPermissions = ROLES.SUPER_ADMIN

    if (!PermissionManager.hasAllPermissions(userPermissions, requiredPermissions)) throw new ApiForbiddenError()

    next()
  }

/** Middleware checks that it has at least one permission */
export const requireAnyPermission =
  (...permissions: number[]) =>
  (_req: Request, _res: Response, next: NextFunction) => {
    // const userId = res.locals.userId
    // TODO: get user permission

    const userPermissions = 18
    const combinedPermissions = permissions.reduce((acc, perm) => acc | perm, 0)
    console.log(combinedPermissions)
    if (!PermissionManager.hasAnyPermission(userPermissions, combinedPermissions)) throw new ApiForbiddenError()

    next()
  }
