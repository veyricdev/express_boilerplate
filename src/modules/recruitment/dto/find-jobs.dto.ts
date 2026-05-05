import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator'
import { JobLevel, JobStatus, JobType } from '~/prisma/generated/prisma'

export class FindJobsDto {
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

  @ApiPropertyOptional({ enum: JobStatus })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus

  @ApiPropertyOptional({ enum: JobType })
  @IsOptional()
  @IsEnum(JobType)
  type?: JobType

  @ApiPropertyOptional({ enum: JobLevel })
  @IsOptional()
  @IsEnum(JobLevel)
  level?: JobLevel

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  departmentId?: number
}
