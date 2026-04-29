import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { PERM_TAGS_DELETE, PERM_TAGS_READ, PERM_TAGS_UPDATE, PERM_TAGS_WRITE } from '~/common/constants/permissions'
import { RequirePermissions } from '~/common/decorators/require-permissions.decorator'
import { JwtAuthGuard } from '~/common/guards/jwt-auth.guard'
import { PermissionsGuard } from '~/common/guards/permissions.guard'
import { FindTagsAdminDto } from '../dto/find-tags-admin.dto'
import { CreateTagDto, UpdateTagDto } from '../dto/tag.dto'
import { TagsService } from '../tags.service'

@ApiTags('Admin Tags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('admin/tags')
export class AdminTagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @RequirePermissions(PERM_TAGS_READ)
  @ApiOperation({ summary: 'List tags with filtering (active, trash, all)' })
  findAll(@Query() query: FindTagsAdminDto) {
    const { page, limit, trashMode, search } = query
    return this.tagsService.findAllAdmin({ page, limit }, { trashMode, search })
  }

  @Post()
  @RequirePermissions(PERM_TAGS_WRITE)
  @ApiOperation({ summary: 'Create tag (idempotent — returns existing if slug matches)' })
  create(@Body() dto: CreateTagDto) {
    return this.tagsService.create(dto)
  }

  @Patch(':id')
  @RequirePermissions(PERM_TAGS_UPDATE)
  @ApiOperation({ summary: 'Update tag' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTagDto) {
    return this.tagsService.update(id, dto)
  }

  // ─── Soft Delete / Restore / Hard Delete ──────────────────────────────────

  @Delete(':id')
  @RequirePermissions(PERM_TAGS_DELETE)
  @ApiOperation({ summary: 'Soft delete tag (moves to trash, restorable)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.tagsService.remove(id)
    return null
  }

  @Post(':id/restore')
  @RequirePermissions(PERM_TAGS_UPDATE)
  @ApiOperation({ summary: 'Restore a soft-deleted tag' })
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.tagsService.restore(id)
  }

  @Delete(':id/permanent')
  @RequirePermissions(PERM_TAGS_DELETE)
  @ApiOperation({ summary: 'Permanently delete tag (irreversible)' })
  async hardDelete(@Param('id', ParseIntPipe) id: number) {
    await this.tagsService.hardDelete(id)
    return null
  }
}
