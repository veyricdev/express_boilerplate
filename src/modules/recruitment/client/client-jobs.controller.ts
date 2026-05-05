import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiWrappedResponse } from '~/common/decorators/api-response.decorator'
import { FindJobsDto } from '../dto/find-jobs.dto'
import { JobResponseDto } from '../dto/job-response.dto'
import { RecruitmentService } from '../recruitment.service'

@ApiTags('Jobs (Public)')
@Controller('jobs')
export class ClientJobsController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Get()
  @ApiOperation({ summary: 'List open job postings (public)' })
  findAll(@Query() query: FindJobsDto) {
    return this.recruitmentService.findAllJobsPublic(query)
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get job detail by slug (public)' })
  @ApiWrappedResponse(JobResponseDto)
  findOne(@Param('slug') slug: string) {
    return this.recruitmentService.findJobBySlugPublic(slug)
  }
}
