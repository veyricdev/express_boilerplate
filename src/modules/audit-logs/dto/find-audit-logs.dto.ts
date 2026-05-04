import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsString } from 'class-validator'
import { PaginationDto } from '~/common/dtos/pagination.dto'

export class FindAuditLogsDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'POST' })
  @IsOptional()
  @IsString()
  entity?: string

  @ApiPropertyOptional({ example: 'keyword' })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({ example: 'SOFT_DELETE' })
  @IsOptional()
  @IsString()
  action?: string

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  entityId?: number

  @ApiPropertyOptional({ description: 'Filter by start date' })
  @IsOptional()
  @IsString()
  fromDate?: string

  @ApiPropertyOptional({ description: 'Filter by end date' })
  @IsOptional()
  @IsString()
  toDate?: string
}
