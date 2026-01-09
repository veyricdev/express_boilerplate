import type { Request, Response } from 'express'
import { cache } from '~/configs/cache'
import { env } from '~/configs/env'
import { A_SECOND, REFRESH_TOKEN_EXPIRED } from '~/constants'
import { ApiUnauthorizedError } from '~/core/api.error'
import ApiSuccess from '~/core/api.success'
import { authService } from './auth.service'

class AuthController {
  async register(_req: Request, res: Response) {
    return new ApiSuccess({
      data: await authService.register(res.locals.data),
      message: 'Register Successfully!',
    }).send(res)
  }

  async login(req: Request, res: Response) {
    const { user, accessToken, refreshToken } = await authService.login(
      res.locals.data,
      req.ip || 'unknown',
      req.headers['user-agent'] || 'unknown'
    )

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: 'strict',
      maxAge: A_SECOND * REFRESH_TOKEN_EXPIRED,
    })
    return new ApiSuccess({
      data: {
        user,
        accessToken,
      },
      message: 'Login Successfully!',
    }).send(res)
  }

  async profile(_req: Request, res: Response) {
    return new ApiSuccess({
      data: await authService.profile(res.locals.userId),
      message: 'Get Profile Successfully!',
    }).send(res)
  }

  async refresh(req: Request, res: Response) {
    const token = req.cookies.refresh_token
    if (!token) throw new ApiUnauthorizedError()

    const { accessToken, refreshToken } = await authService.refresh(token)

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: 'strict',
      maxAge: A_SECOND * REFRESH_TOKEN_EXPIRED,
    })
    return new ApiSuccess({
      data: { accessToken },
      message: 'Refresh Token Successfully!',
    }).send(res)
  }

  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies.refresh_token
    const authHeader = req.headers.authorization
    const accessToken = authHeader?.split(' ')?.[1]

    res.clearCookie('refresh_token')
    return new ApiSuccess({
      data: authService.logout(accessToken, refreshToken),
      message: 'Logout Successfully!',
    }).send(res)
  }

  async logoutAll(_req: Request, res: Response) {
    const userId = res.locals.userId

    // ❌ Delete all refresh tokens for the user.
    const keys = await cache.keys(`refresh_token:*`)
    for (const key of keys) {
      const value = await cache.get(key)
      if (value === userId) await cache.del(key)
    }

    res.clearCookie('refresh_token')
    return new ApiSuccess({
      message: 'Logout Successfully!',
    }).send(res)
  }

  async authCallback(req: Request, res: Response) {
    return new ApiSuccess({
      data: req.user,
      message: 'Login Social Successfully!',
    }).send(res)
  }
}

export const authController = new AuthController()
