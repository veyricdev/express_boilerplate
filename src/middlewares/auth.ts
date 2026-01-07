import type { NextFunction, Request, Response } from 'express'
import { jwtVerify } from 'jose'
import { cache } from '~/configs/cache'
import { jwtSecret } from '~/configs/jwt'
import { ApiUnauthorizedError } from '~/core/api.error'
import { cacheBlacklistKey } from '~/utils/helper'

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
