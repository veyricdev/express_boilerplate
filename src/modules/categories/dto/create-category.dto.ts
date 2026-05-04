import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

export class CreateCategoryDto {
  @ApiProperty({ example: 'Công Nghệ' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  name: string

  @ApiPropertyOptional({ example: 'cong-nghe' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  slug?: string

  @ApiPropertyOptional({ example: 'Các bài viết về công nghệ' })
  @IsOptional()
  @IsString()
  description?: string

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
}
