import { Injectable, UnauthorizedException } from '@nestjs/common'
import { Role } from '../../../prisma/generated/prisma/client'
import { PrismaService } from '../../../prisma/prisma.service'
import { UsersService } from '../../users/users.service'
import type { LoginDto } from '../dto/login.dto'
import { AuthCoreService } from '../shared/auth-core.service'

@Injectable()
export class AdminAuthService {
  constructor(
    private usersService: UsersService,
    private authCoreService: AuthCoreService,
    private prisma: PrismaService
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email)

    if (
      !user ||
      (user.role !== Role.SUPER_ADMIN && user.role !== Role.SITE_ADMIN) ||
      !(await this.authCoreService.comparePassword(dto.password, user.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid admin credentials')
    }

    const tokens = await this.authCoreService.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    })

    const hashedRefreshToken = await this.authCoreService.hashPassword(tokens.refreshToken)

    // Save refresh token to DB
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashedRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    })

    return tokens
  }
}
