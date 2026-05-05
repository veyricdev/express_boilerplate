import { ApiProperty } from '@nestjs/swagger'
import { CandidateStatus } from '~/prisma/generated/prisma'
import { JobResponseDto } from './job-response.dto'

export class CandidateResponseDto {
  @ApiProperty() id: number
  @ApiProperty() jobId: number
  @ApiProperty({ nullable: true, type: () => JobResponseDto }) job: Omit<JobResponseDto, 'candidates'> | null
  @ApiProperty() fullName: string
  @ApiProperty() email: string
  @ApiProperty({ nullable: true }) phone: string | null
  @ApiProperty() cvUrl: string
  @ApiProperty({ nullable: true }) coverLetter: string | null
  @ApiProperty({ enum: CandidateStatus }) status: CandidateStatus
  @ApiProperty() createdAt: Date
  @ApiProperty() updatedAt: Date
}
