import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard'
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
  getMe(@Req() req: Request) {
    return this.usersService.findOne((req.user as any).id)
  }
}
