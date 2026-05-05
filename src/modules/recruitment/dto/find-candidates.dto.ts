import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator'
import { CandidateStatus } from '~/prisma/generated/prisma'

export class FindCandidatesDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  limit?: number = 20

  @ApiPropertyOptional({ description: 'Filter by job ID' })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  jobId?: number

  @ApiPropertyOptional({ description: 'Filter by department ID' })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  departmentId?: number

  @ApiPropertyOptional({ enum: CandidateStatus })
  @IsOptional()
  @IsEnum(CandidateStatus)
  status?: CandidateStatus
}
