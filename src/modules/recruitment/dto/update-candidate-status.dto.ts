import { ApiProperty } from '@nestjs/swagger'
import { CandidateStatus } from '~/prisma/generated/prisma'
import { IsEnum } from 'class-validator'

export class UpdateCandidateStatusDto {
  @ApiProperty({ enum: CandidateStatus })
  @IsEnum(CandidateStatus)
  status: CandidateStatus
}
