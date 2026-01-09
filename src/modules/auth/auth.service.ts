import { jwtVerify } from 'jose'
import { omit } from 'lodash'
import { v7 as uuidv7 } from 'uuid'
import { cache } from '~/configs/cache'
import { prisma } from '~/configs/db'
import { jwtSecret } from '~/configs/jwt'
import { REFRESH_TOKEN_EXPIRED } from '~/constants'
import { ApiUnauthorizedError } from '~/core/api.error'
import { cacheBlacklistKey, cacheRefreshTokenKey, isValidPassword } from '~/utils/helper'
import { generateTokens, verifyRefreshToken } from '~/utils/token'
import { userService } from '../user/user.service'
import type { LoginType, RegisterType } from './auth.schema'

class AuthService {
  private readonly authOmit = {
    deletedAt: true,
  }

  async register(user: RegisterType) {
    return await prisma.user.create({
      data: user,
      omit: this.authOmit,
    })
  }

  async login({ username, password }: LoginType, ip: string, ua: string) {
    const msg = 'Invalid username or password!'
    const user = await this.findByUsernameOrEmail(username)

    if (!user || !isValidPassword(password, user.password) || user.deletedAt !== null)
      throw new ApiUnauthorizedError(msg)

    const uuid = uuidv7()
    const [accessToken, refreshToken] = await generateTokens(user.id, uuid)

    // ⏱ TTL 30 day
    await cache.set(cacheRefreshTokenKey(uuid), user.id, 'EX', REFRESH_TOKEN_EXPIRED)

    await prisma.loginHistory.create({
      data: { userId: user.id, ipAddress: ip, userAgent: ua },
    })

    return {
      user: omit(user, ['password', 'createdAt', 'updatedAt', 'deletedAt']),
      accessToken,
      refreshToken,
    }
  }

  async findByUsernameOrEmail(username: string) {
    return await prisma.user.findFirst({
      where: {
        OR: [
          {
            username,
          },
          { email: username },
        ],
      },
    })
  }

  async profile(userId: number) {
    return await userService.findById(userId)
  }

  async refresh(token: string) {
    const { tokenId } = await verifyRefreshToken(token)

    const redisKey = cacheRefreshTokenKey(tokenId)
    const userId = await cache.get(redisKey)

    if (!userId) throw new ApiUnauthorizedError()

    // ❌ revoke token old
    await cache.del(redisKey)

    // ✅ new token
    const newTokenId = uuidv7()

    await cache.set(cacheRefreshTokenKey(newTokenId), userId, 'EX', REFRESH_TOKEN_EXPIRED)

    const [newAccessToken, newRefreshToken] = await generateTokens(userId, newTokenId)

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    }
  }

  async logout(accessToken?: string, refreshToken?: string) {
    if (accessToken) {
      try {
        const { payload } = await jwtVerify(accessToken, jwtSecret.access)

        const jti = payload.jti as string
        const exp = payload.exp as number // seconds
        const now = Math.floor(Date.now() / 1000)

        const ttl = exp - now
        if (ttl > 0) await cache.set(cacheBlacklistKey(jti), '1', 'EX', ttl)
      } catch {}
    }

    if (refreshToken) {
      try {
        const { tokenId } = await verifyRefreshToken(refreshToken)

        await cache.del(`refresh_token:${tokenId}`)
      } catch {}
    }
    return true
  }
}

export const authService = new AuthService()
