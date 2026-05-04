import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
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

  @ApiPropertyOptional({ enum: TrashMode, default: TrashMode.ACTIVE })
  @IsOptional()
  @IsEnum(TrashMode)
  trashMode?: TrashMode = TrashMode.ACTIVE

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  author?: string

  @ApiPropertyOptional({ example: [1, 2], isArray: true, type: Number })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') return value.split(',').map(Number)
    if (Array.isArray(value)) return value.map(Number)
    return value
  })
  @IsInt({ each: true })
  tagIds?: number[]

  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @Type(() => Date)
  fromDate?: Date

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsOptional()
  @Type(() => Date)
  toDate?: Date
}
