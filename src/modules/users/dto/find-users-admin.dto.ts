import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsString } from 'class-validator'
import { PaginationDto } from '~/common/dtos/pagination.dto'
import { TrashMode } from '~/common/enums/trash-mode.enum'

export class FindUsersAdminDto extends PaginationDto {
  @ApiPropertyOptional({
    enum: TrashMode,
    default: TrashMode.ACTIVE,
    description: 'Filter by deletion status',
  })
  @IsOptional()
  @IsEnum(TrashMode)
  trashMode?: TrashMode = TrashMode.ACTIVE

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  isActive?: boolean

  @ApiPropertyOptional({ description: 'Filter by start date' })
  @IsOptional()
  @IsString()
  fromDate?: string

  @ApiPropertyOptional({ description: 'Filter by end date' })
  @IsOptional()
  @IsString()
  toDate?: string
}
