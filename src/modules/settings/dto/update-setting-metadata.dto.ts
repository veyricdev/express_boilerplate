import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsString } from 'class-validator'
import { SettingGroup, SettingType } from '~/prisma/generated/prisma'

export class UpdateSettingMetadataDto {
  @ApiProperty({ example: 'Banner khuyến mãi', required: false })
  @IsString()
  @IsOptional()
  label?: string

  @ApiProperty({ example: 'Nội dung chạy trên banner trang chủ', required: false })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ example: 'Hello World', nullable: true, required: false })
  @IsString()
  @IsOptional()
  value?: string | null

  @ApiProperty({ enum: SettingType, required: false })
  @IsEnum(SettingType)
  @IsOptional()
  type?: SettingType

  @ApiProperty({ enum: SettingGroup, required: false })
  @IsEnum(SettingGroup)
  @IsOptional()
  group?: SettingGroup
}
