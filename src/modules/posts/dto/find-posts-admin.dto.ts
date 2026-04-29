import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator'
import { PaginationDto } from '~/common/dtos/pagination.dto'
import { TrashMode } from '~/common/enums/trash-mode.enum'
import { PostStatus } from '~/prisma/generated/prisma'

export class FindPostsAdminDto extends PaginationDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  categoryId?: number

  @ApiPropertyOptional({ enum: PostStatus })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus

  @ApiPropertyOptional({ example: 'search query' })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({
    enum: TrashMode,
    default: TrashMode.ACTIVE,
    description: 'Filter by deletion status: active (not deleted), trash (deleted only), all (both)',
  })
  @IsOptional()
  @IsEnum(TrashMode)
  trashMode?: TrashMode = TrashMode.ACTIVE
}
