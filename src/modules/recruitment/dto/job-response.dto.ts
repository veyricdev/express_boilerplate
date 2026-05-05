import { ApiProperty } from '@nestjs/swagger'
import { JobLevel, JobStatus, JobType } from '~/prisma/generated/prisma'
import { DepartmentResponseDto } from './department-response.dto'

export class JobResponseDto {
  @ApiProperty() id: number
  @ApiProperty() title: string
  @ApiProperty() slug: string
  @ApiProperty({ nullable: true }) departmentId: number | null
  @ApiProperty({ nullable: true, type: () => DepartmentResponseDto }) department: DepartmentResponseDto | null
  @ApiProperty() description: string
  @ApiProperty({ nullable: true }) requirements: string | null
  @ApiProperty({ nullable: true }) benefits: string | null
  @ApiProperty({ nullable: true }) salaryRange: string | null
  @ApiProperty({ nullable: true }) location: string | null
  @ApiProperty({ enum: JobType }) type: JobType
  @ApiProperty({ enum: JobLevel }) level: JobLevel
  @ApiProperty({ enum: JobStatus }) status: JobStatus
  @ApiProperty({ nullable: true }) deadline: Date | null
  @ApiProperty({ nullable: true }) deletedAt: Date | null
  @ApiProperty() createdAt: Date
  @ApiProperty() updatedAt: Date
}
