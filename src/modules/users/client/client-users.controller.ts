import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '~/common/decorators/current-user.decorator'
import { JwtAuthGuard } from '~/common/guards/jwt-auth.guard'
import type { IAuthUser } from '~/modules/auth/shared/interfaces/auth-user.interface'
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
}
