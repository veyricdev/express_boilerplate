import { Controller, Get, Param, ParseIntPipe, Patch, Query, Body, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { PERM_CANDIDATES_READ, PERM_CANDIDATES_UPDATE } from '~/common/constants/permissions'
import { ApiWrappedResponse } from '~/common/decorators/api-response.decorator'
import { RequirePermissions } from '~/common/decorators/require-permissions.decorator'
import { JwtAuthGuard } from '~/common/guards/jwt-auth.guard'
import { PermissionsGuard } from '~/common/guards/permissions.guard'
import { CandidateResponseDto } from '../dto/candidate-response.dto'
import { FindCandidatesDto } from '../dto/find-candidates.dto'
import { UpdateCandidateStatusDto } from '../dto/update-candidate-status.dto'
import { RecruitmentService } from '../recruitment.service'

@ApiTags('Admin Candidates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('admin/candidates')
export class AdminCandidatesController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Get()
  @RequirePermissions(PERM_CANDIDATES_READ)
  @ApiOperation({ summary: 'List all candidates (filter by jobId, departmentId, status)' })
  findAll(@Query() query: FindCandidatesDto) {
    return this.recruitmentService.findAllCandidates(query)
  }

  @Get(':id')
  @RequirePermissions(PERM_CANDIDATES_READ)
  @ApiOperation({ summary: 'Get candidate detail' })
  @ApiWrappedResponse(CandidateResponseDto)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.recruitmentService.findOneCandidate(id)
  }

  @Patch(':id/status')
  @RequirePermissions(PERM_CANDIDATES_UPDATE)
  @ApiOperation({ summary: 'Update candidate application status' })
  @ApiWrappedResponse(CandidateResponseDto)
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCandidateStatusDto) {
    return this.recruitmentService.updateCandidateStatus(id, dto)
  }
}
