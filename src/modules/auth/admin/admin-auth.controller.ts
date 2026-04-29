import { Body, Controller, Headers, HttpCode, HttpStatus, Ip, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '~/common/decorators/current-user.decorator'
import { JwtAuthGuard } from '~/common/guards/jwt-auth.guard'
import { JwtRefreshGuard } from '~/common/guards/jwt-refresh.guard'
import { LoginResponseDto } from '../dto/auth-response.dto'
import { LoginDto } from '../dto/login.dto'
import { AdminAuthService } from './admin-auth.service'

@ApiTags('Admin Auth')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly authService: AdminAuthService) {}

  /**
   * POST admin/auth/login — public
   */
  @Post('login')
  @ApiOperation({ summary: 'Admin login → returns access + refresh token' })
  @ApiOkResponse({ type: LoginResponseDto })
  login(@Body() dto: LoginDto, @Ip() ip: string, @Headers('user-agent') ua: string) {
    return this.authService.login(dto, ip, ua)
  }

  /**
   * POST admin/auth/refresh — requires valid Refresh Token in Bearer header
   * Strategy extracts the raw token and puts it on req.user.refreshToken
   */
  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token → returns new token pair' })
  refresh(@CurrentUser('refreshToken') refreshToken: string, @Ip() ip: string, @Headers('user-agent') ua: string) {
    return this.authService.refresh(refreshToken, ip, ua)
  }

  /**
   * POST admin/auth/logout — requires valid Refresh Token in Bearer header
   * Revokes the specific session (refresh token)
   */
  @Post('logout')
  @UseGuards(JwtRefreshGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout → revoke current refresh token' })
  logout(@CurrentUser('refreshToken') refreshToken: string) {
    return this.authService.logout(refreshToken)
  }

  /**
   * POST admin/auth/logout-all — requires valid Access Token
   * Revokes ALL sessions for the authenticated admin
   */
  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout all → revoke every refresh token for current user' })
  logoutAll(@CurrentUser('id') userId: number) {
    return this.authService.logoutAll(userId)
  }
}
