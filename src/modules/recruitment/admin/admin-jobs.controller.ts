import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { PERM_JOBS_DELETE, PERM_JOBS_READ, PERM_JOBS_UPDATE, PERM_JOBS_WRITE } from '~/common/constants/permissions'
import { ApiWrappedResponse } from '~/common/decorators/api-response.decorator'
import { RequirePermissions } from '~/common/decorators/require-permissions.decorator'
import { JwtAuthGuard } from '~/common/guards/jwt-auth.guard'
import { PermissionsGuard } from '~/common/guards/permissions.guard'
import { CreateJobDto } from '../dto/create-job.dto'
import { FindJobsDto } from '../dto/find-jobs.dto'
import { JobResponseDto } from '../dto/job-response.dto'
import { UpdateJobDto } from '../dto/update-job.dto'
import { RecruitmentService } from '../recruitment.service'

@ApiTags('Admin Jobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('admin/jobs')
export class AdminJobsController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Get()
  @RequirePermissions(PERM_JOBS_READ)
  @ApiOperation({ summary: 'List all jobs (admin, includes DRAFT/CLOSED)' })
  findAll(@Query() query: FindJobsDto) {
    return this.recruitmentService.findAllJobsAdmin(query)
  }

  @Get(':id')
  @RequirePermissions(PERM_JOBS_READ)
  @ApiOperation({ summary: 'Get job detail by ID' })
  @ApiWrappedResponse(JobResponseDto)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.recruitmentService.findJobByIdAdmin(id)
  }

  @Post()
  @RequirePermissions(PERM_JOBS_WRITE)
  @ApiOperation({ summary: 'Create a new job posting' })
  @ApiWrappedResponse(JobResponseDto, { status: 201 })
  create(@Body() dto: CreateJobDto) {
    return this.recruitmentService.createJob(dto)
  }

  @Patch(':id')
  @RequirePermissions(PERM_JOBS_UPDATE)
  @ApiOperation({ summary: 'Update a job posting' })
  @ApiWrappedResponse(JobResponseDto)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateJobDto) {
    return this.recruitmentService.updateJob(id, dto)
  }

  @Delete(':id')
  @RequirePermissions(PERM_JOBS_DELETE)
  @ApiOperation({ summary: 'Soft delete a job posting' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.recruitmentService.softDeleteJob(id)
    return null
  }

  @Post(':id/restore')
  @RequirePermissions(PERM_JOBS_UPDATE)
  @ApiOperation({ summary: 'Restore a soft-deleted job posting' })
  @ApiWrappedResponse(JobResponseDto)
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.recruitmentService.restoreJob(id)
  }

  @Delete(':id/permanent')
  @RequirePermissions(PERM_JOBS_DELETE)
  @ApiOperation({ summary: 'Permanently delete a job posting' })
  async hardDelete(@Param('id', ParseIntPipe) id: number) {
    await this.recruitmentService.hardDeleteJob(id)
    return null
  }
}
