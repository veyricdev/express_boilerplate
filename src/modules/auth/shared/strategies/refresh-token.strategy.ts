import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import type { FastifyRequest } from 'fastify'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>('jwt.refreshSecret'),
      passReqToCallback: true,
    })
  }

  validate(req: FastifyRequest, payload: any) {
    const authHeader = req.headers.authorization
    const refreshToken = authHeader ? authHeader.replace('Bearer', '').trim() : ''
    return { id: payload.sub, email: payload.email, permissions: payload.permissions, refreshToken }
  }
}
