import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsString } from 'class-validator'
import { PaginationDto } from '~/common/dtos/pagination.dto'
import { TrashMode } from '~/common/enums/trash-mode.enum'

export class FindCategoriesAdminDto extends PaginationDto {
  @ApiPropertyOptional({
    enum: TrashMode,
    default: TrashMode.ACTIVE,
    description: 'Filter by deletion status: active (not deleted), trash (deleted only), all (both)',
  })
  @IsOptional()
  @IsEnum(TrashMode)
  trashMode?: TrashMode = TrashMode.ACTIVE

  @ApiPropertyOptional({ description: 'Search by name' })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({ description: 'Filter by start date' })
  @IsOptional()
  @IsString()
  fromDate?: string

  @ApiPropertyOptional({ description: 'Filter by end date' })
  @IsOptional()
  @IsString()
  toDate?: string
}
