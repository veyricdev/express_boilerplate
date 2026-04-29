import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsString } from 'class-validator'
import { PaginationDto } from '~/common/dtos/pagination.dto'
import { TrashMode } from '~/common/enums/trash-mode.enum'

export class FindTagsAdminDto extends PaginationDto {
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
}
