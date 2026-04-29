import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { PaginationDto } from '~/common/dtos/pagination.dto'
import { CategoriesService } from '../categories.service'

@ApiTags('Categories')
@Controller('categories')
export class ClientCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List all categories (public)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  findAll(@Query() pagination: PaginationDto) {
    return this.categoriesService.findAllPublic(pagination)
  }

  @Get('s/:slug')
  @ApiOperation({ summary: 'Get category by slug with published posts' })
  findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug)
  }
}
