import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { UsersModule } from '../users/users.module'
import { AdminAuthController } from './admin/admin-auth.controller'
import { AdminAuthService } from './admin/admin-auth.service'
import { AuthCoreService } from './shared/auth-core.service'
import { JwtStrategy } from './shared/strategies/jwt.strategy'
import { RefreshTokenStrategy } from './shared/strategies/refresh-token.strategy'

@Module({
  imports: [UsersModule, PassportModule, JwtModule.register({})],
  providers: [AuthCoreService, JwtStrategy, RefreshTokenStrategy, AdminAuthService],
  controllers: [AdminAuthController],
  exports: [AuthCoreService],
})
export class AuthModule {}
