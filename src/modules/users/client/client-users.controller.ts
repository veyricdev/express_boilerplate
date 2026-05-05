import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '~/common/decorators/current-user.decorator'
import { JwtAuthGuard } from '~/common/guards/jwt-auth.guard'
import type { IAuthUser } from '~/modules/auth/shared/interfaces/auth-user.interface'
import { ChangePasswordDto } from '../dto/change-password.dto'
import { UpdateProfileDto } from '../dto/update-profile.dto'
import { UserResponseDto } from '../dto/user-response.dto'
import { UsersService } from '../users.service'

@ApiTags('Client Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class ClientUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({ type: UserResponseDto })
  getMe(@CurrentUser() user: IAuthUser) {
    return this.usersService.findOne(user.id)
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiOkResponse({ type: UserResponseDto })
  updateMe(@CurrentUser('id') userId: number, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(userId, dto)
  }

  @Post('me/change-password')
  @ApiOperation({ summary: 'Change current user password' })
  changePassword(@CurrentUser('id') userId: number, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(userId, dto)
  }
}
