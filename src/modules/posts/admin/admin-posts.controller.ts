import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { PERM_POSTS_DELETE, PERM_POSTS_READ, PERM_POSTS_UPDATE, PERM_POSTS_WRITE } from '~/common/constants/permissions'
import { ApiWrappedResponse } from '~/common/decorators/api-response.decorator'
import { CurrentUser } from '~/common/decorators/current-user.decorator'
import { RequirePermissions } from '~/common/decorators/require-permissions.decorator'
import { JwtAuthGuard } from '~/common/guards/jwt-auth.guard'
import { PermissionsGuard } from '~/common/guards/permissions.guard'
import type { IAuthUser } from '~/modules/auth/shared/interfaces/auth-user.interface'
import { CreatePostDto } from '../dto/create-post.dto'
import { FindPostsAdminDto } from '../dto/find-posts-admin.dto'
import { PostResponseDto } from '../dto/post-response.dto'
import { UpdatePostDto } from '../dto/update-post.dto'
import { PostsService } from '../posts.service'

@ApiTags('Admin Posts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('admin/posts')
export class AdminPostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @RequirePermissions(PERM_POSTS_READ)
  @ApiOperation({ summary: 'List posts with filtering (active, trash, all)' })
  @ApiWrappedResponse(PostResponseDto, { isArray: true })
  findAll(@Query() query: FindPostsAdminDto) {
    const { page, limit, ...filters } = query
    return this.postsService.findAllAdmin({ page, limit }, filters)
  }

  @Get(':id')
  @RequirePermissions(PERM_POSTS_READ)
  @ApiOperation({ summary: 'Get post detail by ID (includes soft-deleted for restore UI)' })
  @ApiWrappedResponse(PostResponseDto)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOneAdmin(id)
  }

  @Post()
  @RequirePermissions(PERM_POSTS_WRITE)
  @ApiOperation({ summary: 'Create new post. Set publishedAt to schedule future publication.' })
  @ApiWrappedResponse(PostResponseDto, { status: 201 })
  create(@CurrentUser() user: IAuthUser, @Body() dto: CreatePostDto) {
    return this.postsService.create(user.id, dto)
  }

  @Patch(':id')
  @RequirePermissions(PERM_POSTS_UPDATE)
  @ApiOperation({ summary: 'Update post' })
  @ApiWrappedResponse(PostResponseDto)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePostDto) {
    return this.postsService.update(id, dto)
  }

  // ─── Soft Delete / Restore / Hard Delete ──────────────────────────────────

  @Delete(':id')
  @RequirePermissions(PERM_POSTS_DELETE)
  @ApiOperation({ summary: 'Soft delete post (moves to trash, restorable)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.postsService.remove(id)
    return null
  }

  @Post(':id/restore')
  @RequirePermissions(PERM_POSTS_UPDATE)
  @ApiOperation({ summary: 'Restore a soft-deleted post from trash' })
  @ApiWrappedResponse(PostResponseDto)
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.restore(id)
  }

  @Delete(':id/permanent')
  @RequirePermissions(PERM_POSTS_DELETE)
  @ApiOperation({ summary: 'Permanently delete post (irreversible)' })
  async hardDelete(@Param('id', ParseIntPipe) id: number) {
    await this.postsService.hardDelete(id)
    return null
  }
}
