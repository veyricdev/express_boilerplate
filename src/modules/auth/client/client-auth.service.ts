import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { Role } from '../../../prisma/generated/prisma/client'
import { PrismaService } from '../../../prisma/prisma.service'
import { UsersService } from '../../users/users.service'
import type { LoginDto } from '../dto/login.dto'
import type { RegisterDto } from '../dto/register.dto'
import { AuthCoreService } from '../shared/auth-core.service'

@Injectable()
export class ClientAuthService {
  constructor(
    private usersService: UsersService,
    private authCoreService: AuthCoreService,
    private prisma: PrismaService
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email)
    if (existing) throw new ConflictException('Email already exists')

    const hashedPassword = await this.authCoreService.hashPassword(dto.password)
    return this.usersService.create({
      email: dto.email,
      passwordHash: hashedPassword,
      fullName: dto.fullName,
      role: Role.EDITOR, // Default role for client
    })
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email)

    if (!user || !(await this.authCoreService.comparePassword(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials')
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
