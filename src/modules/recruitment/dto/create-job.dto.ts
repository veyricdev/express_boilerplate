import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, MaxLength } from 'class-validator'
import { JobLevel, JobStatus, JobType } from '~/prisma/generated/prisma'

export class CreateJobDto {
  @ApiProperty({ example: 'Senior Backend Developer' })
  @IsString()
  @MaxLength(255)
  title: string

  @ApiProperty({ required: false, description: 'Department ID' })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  departmentId?: number

  @ApiProperty({ example: 'Mô tả công việc chi tiết...' })
  @IsString()
  description: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  requirements?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  benefits?: string

  @ApiProperty({ required: false, example: '15 - 25 triệu' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  salaryRange?: string

  @ApiProperty({ required: false, example: 'Hà Nội' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string

  @ApiProperty({ enum: JobType, default: JobType.FULL_TIME })
  @IsEnum(JobType)
  type: JobType = JobType.FULL_TIME

  @ApiProperty({ enum: JobLevel, default: JobLevel.MID })
  @IsEnum(JobLevel)
  level: JobLevel = JobLevel.MID

  @ApiProperty({ enum: JobStatus, default: JobStatus.DRAFT })
  @IsEnum(JobStatus)
  status: JobStatus = JobStatus.DRAFT

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  deadline?: string
}
