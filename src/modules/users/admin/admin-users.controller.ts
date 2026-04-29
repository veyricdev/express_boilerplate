import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { PERM_USERS_DELETE, PERM_USERS_READ, PERM_USERS_UPDATE } from '~/common/constants/permissions'
import { ApiWrappedResponse } from '~/common/decorators/api-response.decorator'
import { RequirePermissions } from '~/common/decorators/require-permissions.decorator'
import { PaginationDto } from '~/common/dtos/pagination.dto'
import { JwtAuthGuard } from '~/common/guards/jwt-auth.guard'
import { PermissionsGuard } from '~/common/guards/permissions.guard'
import type { Prisma } from '~/prisma/generated/prisma'
import { CreateUserDto } from '../dto/create-user.dto'
import { FindUsersAdminDto } from '../dto/find-users-admin.dto'
import { UpdateUserDto } from '../dto/update-user.dto'
import { UserResponseDto } from '../dto/user-response.dto'
import { UsersService } from '../users.service'

@ApiTags('Admin Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions(PERM_USERS_READ)
  @ApiOperation({ summary: 'List all active users' })
  @ApiWrappedResponse(UserResponseDto, { isArray: true })
  findAll(@Query() query: FindUsersAdminDto) {
    return this.usersService.findAll(query)
  }

  @Get(':id')
  @RequirePermissions(PERM_USERS_READ)
  @ApiOperation({ summary: 'Get user details (includes soft-deleted for restore UI)' })
  @ApiWrappedResponse(UserResponseDto)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id)
  }

  @Post()
  @RequirePermissions(PERM_USERS_UPDATE) // Assuming admin who can update can also create
  @ApiOperation({ summary: 'Create new user' })
  @ApiWrappedResponse(UserResponseDto, { status: 201 })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto)
  }

  @Patch(':id')
  @RequirePermissions(PERM_USERS_UPDATE)
  @ApiOperation({ summary: 'Update user info or permissions' })
  @ApiWrappedResponse(UserResponseDto)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    const { permissions, ...rest } = dto
    const data: Prisma.UserUpdateInput = { ...rest }
    if (permissions) {
      data.permissions = BigInt(permissions)
    }
    return this.usersService.update(id, data)
  }

  @Patch(':id/toggle-active')
  @RequirePermissions(PERM_USERS_UPDATE)
  @ApiOperation({ summary: 'Toggle user active status' })
  @ApiWrappedResponse(UserResponseDto)
  toggleActive(@Param('id', ParseIntPipe) id: number, @Body('isActive') isActive: boolean) {
    return this.usersService.setStatus(id, isActive)
  }

  // ─── Soft Delete / Restore / Hard Delete ──────────────────────────────────

  @Delete(':id')
  @RequirePermissions(PERM_USERS_DELETE)
  @ApiOperation({ summary: 'Soft delete user (revokes tokens, moves to trash)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.delete(id)
    return null
  }

  @Post(':id/restore')
  @RequirePermissions(PERM_USERS_UPDATE)
  @ApiOperation({ summary: 'Restore a soft-deleted user' })
  @ApiWrappedResponse(UserResponseDto)
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.restore(id)
  }

  @Delete(':id/permanent')
  @RequirePermissions(PERM_USERS_DELETE)
  @ApiOperation({ summary: 'Permanently delete user (irreversible, cascades tokens)' })
  async hardDelete(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.hardDelete(id)
    return null
  }
}
