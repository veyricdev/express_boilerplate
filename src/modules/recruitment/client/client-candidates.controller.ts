import { BadRequestException, Controller, Param, ParseIntPipe, Post, Req } from '@nestjs/common'
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger'
import type { FastifyRequest } from 'fastify'
import { ApiWrappedResponse } from '~/common/decorators/api-response.decorator'
import { CandidateResponseDto } from '../dto/candidate-response.dto'
import { RecruitmentService } from '../recruitment.service'
import { UploadService } from '../upload.service'

@ApiTags('Jobs (Public)')
@Controller('jobs')
export class ClientCandidatesController {
  constructor(
    private readonly recruitmentService: RecruitmentService,
    private readonly uploadService: UploadService
  ) {}

  @Post(':id/apply')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Apply for a job with CV upload (public)' })
  @ApiWrappedResponse(CandidateResponseDto, { status: 201 })
  async apply(@Param('id', ParseIntPipe) id: number, @Req() req: FastifyRequest) {
    const parts = req.parts()
    const fields: Record<string, string> = {}
    let cvUrl: string | undefined

    for await (const part of parts) {
      if (part.type === 'file' && part.fieldname === 'cv') {
        cvUrl = await this.uploadService.saveCV(part)
      } else if (part.type === 'field') {
        fields[part.fieldname] = part.value as string
      }
    }

    if (!cvUrl) throw new BadRequestException('CV file is required')
    if (!fields.fullName || !fields.email) throw new BadRequestException('fullName and email are required')

    return this.recruitmentService.createCandidate(id, cvUrl, {
      fullName: fields.fullName,
      email: fields.email,
      phone: fields.phone,
      coverLetter: fields.coverLetter,
    })
  }
}
