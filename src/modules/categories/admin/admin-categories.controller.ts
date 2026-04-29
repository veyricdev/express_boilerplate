import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { PERM_CATS_DELETE, PERM_CATS_READ, PERM_CATS_UPDATE, PERM_CATS_WRITE } from '~/common/constants/permissions'
import { RequirePermissions } from '~/common/decorators/require-permissions.decorator'
import { JwtAuthGuard } from '~/common/guards/jwt-auth.guard'
import { PermissionsGuard } from '~/common/guards/permissions.guard'
import { CategoriesService } from '../categories.service'
import { CreateCategoryDto } from '../dto/create-category.dto'
import { FindCategoriesAdminDto } from '../dto/find-categories-admin.dto'
import { UpdateCategoryDto } from '../dto/update-category.dto'

@ApiTags('Admin Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('admin/categories')
export class AdminCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @RequirePermissions(PERM_CATS_READ)
  @ApiOperation({ summary: 'List categories with filtering (active, trash, all)' })
  findAll(@Query() query: FindCategoriesAdminDto) {
    const { page, limit, trashMode, search } = query
    return this.categoriesService.findAllAdmin({ page, limit }, { trashMode, search })
  }

  @Get(':id')
  @RequirePermissions(PERM_CATS_READ)
  @ApiOperation({ summary: 'Get category by ID (includes soft-deleted)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOneAdmin(id)
  }

  @Post()
  @RequirePermissions(PERM_CATS_WRITE)
  @ApiOperation({ summary: 'Create category (auto-generate slug)' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto)
  }

  @Patch(':id')
  @RequirePermissions(PERM_CATS_UPDATE)
  @ApiOperation({ summary: 'Update category' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto)
  }

  // ─── Soft Delete / Restore / Hard Delete ──────────────────────────────────

  @Delete(':id')
  @RequirePermissions(PERM_CATS_DELETE)
  @ApiOperation({ summary: 'Soft delete category (detaches posts, moves to trash)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.categoriesService.remove(id)
    return null
  }

  @Post(':id/restore')
  @RequirePermissions(PERM_CATS_UPDATE)
  @ApiOperation({ summary: 'Restore a soft-deleted category' })
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.restore(id)
  }

  @Delete(':id/permanent')
  @RequirePermissions(PERM_CATS_DELETE)
  @ApiOperation({ summary: 'Permanently delete category (irreversible)' })
  async hardDelete(@Param('id', ParseIntPipe) id: number) {
    await this.categoriesService.hardDelete(id)
    return null
  }
}
