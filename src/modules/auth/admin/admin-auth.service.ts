import { Injectable, UnauthorizedException } from '@nestjs/common'
import { hasPermission, PERM_ADMIN } from '~/common/constants/permissions'
import { UsersService } from '~/modules/users/users.service'
import { PrismaService } from '~/prisma/prisma.service'
import type { LoginDto } from '../dto/login.dto'
import { AuthCoreService } from '../shared/auth-core.service'

@Injectable()
export class AdminAuthService {
  constructor(
    private usersService: UsersService,
    private authCoreService: AuthCoreService,
    private prisma: PrismaService
  ) {}

  // ─── Login ────────────────────────────────────

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.usersService.findByEmail(dto.email)

    if (
      !user?.isActive ||
      !hasPermission(user.permissions, PERM_ADMIN) ||
      !(await this.authCoreService.comparePassword(dto.password, user.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid admin credentials')
    }

    const tokens = await this.authCoreService.generateTokens({
      sub: user.id,
      email: user.email,
      permissions: user.permissions.toString(),
    })

    const hashedRefreshToken = await this.authCoreService.hashPassword(tokens.refreshToken)

    await this.prisma.unfiltered.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashedRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        ipAddress,
        userAgent,
      },
    })

    await this.prisma.unfiltered.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    return tokens
  }

  // ─── Refresh ──────────────────────────────────

  async refresh(rawRefreshToken: string, ipAddress?: string, userAgent?: string) {
    // Find ALL active tokens for this user (strategy gives us the payload)
    // We need to find the DB record that matches. Strategy already verified the JWT signature,
    // so rawRefreshToken is the original Bearer token from the Authorization header.

    // Look up by trying each stored token hash (brute-force search is OK at this scale,
    // or store a jti/tokenId in JWT claims for O(1) lookup in production).
    const allTokens = await this.prisma.unfiltered.refreshToken.findMany({
      where: {
        revoked: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    })

    let matchedToken: (typeof allTokens)[0] | undefined
    for (const token of allTokens) {
      const isMatch = await this.authCoreService.comparePassword(rawRefreshToken, token.tokenHash)
      if (isMatch) {
        matchedToken = token
        break
      }
    }

    if (!matchedToken) {
      throw new UnauthorizedException('Refresh token is invalid or revoked')
    }

    // Revoke the used token (rotation strategy)
    await this.prisma.unfiltered.refreshToken.update({
      where: { id: matchedToken.id },
      data: { revoked: true },
    })

    const user = matchedToken.user
    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled')
    }

    // Issue new token pair
    const tokens = await this.authCoreService.generateTokens({
      sub: user.id,
      email: user.email,
      permissions: user.permissions.toString(),
    })

    const hashedNewToken = await this.authCoreService.hashPassword(tokens.refreshToken)
    await this.prisma.unfiltered.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashedNewToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ipAddress,
        userAgent,
      },
    })

    return tokens
  }

  // ─── Logout ───────────────────────────────────

  async logout(rawRefreshToken: string) {
    // Find and revoke the matching DB token
    const allTokens = await this.prisma.unfiltered.refreshToken.findMany({
      where: { revoked: false },
    })

    for (const token of allTokens) {
      const isMatch = await this.authCoreService.comparePassword(rawRefreshToken, token.tokenHash)
      if (isMatch) {
        await this.prisma.unfiltered.refreshToken.update({
          where: { id: token.id },
          data: { revoked: true },
        })
        return { message: 'Logged out successfully' }
      }
    }

    // If token not found, still return success (idempotent logout)
    return { message: 'Logged out successfully' }
  }

  // ─── Logout All ───────────────────────────────

  async logoutAll(userId: number) {
    await this.prisma.unfiltered.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    })
    return { message: 'All sessions revoked successfully' }
  }
}
