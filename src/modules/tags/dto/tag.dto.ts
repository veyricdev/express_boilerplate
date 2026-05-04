import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

export class CreateTagDto {
  @ApiProperty({ example: 'nestjs' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string

  @ApiPropertyOptional({ example: 'nestjs' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  slug?: string
}

export class UpdateTagDto {
  @ApiPropertyOptional({ example: 'nestjs-v10' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string

  @ApiPropertyOptional({ example: 'nestjs-v10' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  slug?: string
}
