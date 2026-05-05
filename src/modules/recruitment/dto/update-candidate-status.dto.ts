import { ApiProperty } from '@nestjs/swagger'
import { IsEnum } from 'class-validator'
import { CandidateStatus } from '~/prisma/generated/prisma'

export class UpdateCandidateStatusDto {
  @ApiProperty({ enum: CandidateStatus })
  @IsEnum(CandidateStatus)
  status: CandidateStatus
}
