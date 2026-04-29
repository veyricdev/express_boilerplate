import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { PaginationDto } from '~/common/dtos/pagination.dto'
import { PostsService } from '../posts.service'

@ApiTags('Posts')
@Controller('posts')
export class ClientPostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ApiOperation({ summary: 'List all published posts' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiQuery({ name: 'tagId', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query() pagination: PaginationDto,
    @Query('categoryId') categoryId?: number,
    @Query('tagId') tagId?: number,
    @Query('search') search?: string
  ) {
    return this.postsService.findAllPublished(pagination, { categoryId, tagId, search })
  }

  @Get('s/:slug')
  @ApiOperation({ summary: 'Get published post by slug (SEO-friendly)' })
  findBySlug(@Param('slug') slug: string) {
    return this.postsService.findBySlug(slug)
  }
}
