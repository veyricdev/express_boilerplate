import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Roles } from '~/common/decorators/roles.decorator'
import { JwtAuthGuard } from '~/common/guards/jwt-auth.guard'
import { RolesGuard } from '~/common/guards/roles.guard'
import { Role } from '~/prisma/generated/prisma/client'
import { UserResponseDto } from '../dto/user-response.dto'
import { UsersService } from '../users.service'

@ApiTags('Admin Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiOkResponse({ type: [UserResponseDto] })
  findAll() {
    return this.usersService.findAll()
  }
}
