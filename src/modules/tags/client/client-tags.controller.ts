import { Controller, Get, Query } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { PaginationDto } from '~/common/dtos/pagination.dto'
import { TagsService } from '../tags.service'

@ApiTags('Tags')
@Controller('tags')
export class ClientTagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @ApiOperation({ summary: 'List all tags (public)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  findAll(@Query() pagination: PaginationDto) {
    return this.tagsService.findAll(pagination)
  }
}
