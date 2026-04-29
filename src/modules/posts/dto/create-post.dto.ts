import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsDate, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { PostStatus } from '~/prisma/generated/prisma'

export class CreatePostDto {
  @ApiProperty({ example: 'Hướng Dẫn NestJS' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string

  @ApiPropertyOptional({ example: 'huong-dan-nestjs' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string

  @ApiProperty({ example: '<p>Nội dung bài viết...</p>' })
  @IsNotEmpty()
  @IsString()
  content: string

  @ApiPropertyOptional({ example: 'Tóm tắt ngắn gọn về bài viết' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string

  @ApiPropertyOptional({ example: 'https://example.com/thumb.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  thumbnail?: string

  @ApiPropertyOptional({ type: String, enum: PostStatus, default: PostStatus.DRAFT })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus

  @ApiPropertyOptional({
    example: '2026-06-01T08:00:00.000Z',
    description: 'Schedule publish time. If omitted and status=PUBLISHED, defaults to now.',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  publishedAt?: Date

  @ApiPropertyOptional({ example: 'SEO Title' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaTitle?: string

  @ApiPropertyOptional({ example: 'SEO Description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  metaDescription?: string

  @ApiPropertyOptional({ example: 'keyword1, keyword2' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaKeywords?: string

  @ApiPropertyOptional({ example: 'https://example.com/meta-thumb.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  metaThumbnail?: string

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  categoryId?: number

  @ApiPropertyOptional({ example: [1, 2, 3] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tagIds?: number[]
}
