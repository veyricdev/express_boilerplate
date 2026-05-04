import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { SettingGroup, SettingType } from '~/prisma/generated/prisma'

export class CreateSettingDto {
  @ApiProperty({ example: 'custom_promo_banner' })
  @IsString()
  @IsNotEmpty()
  key: string

  @ApiProperty({ example: 'Banner khuyến mãi' })
  @IsString()
  @IsNotEmpty()
  label: string

  @ApiProperty({ example: 'Nội dung chạy trên banner trang chủ', required: false })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ example: 'Hello World', nullable: true, required: false })
  @IsString()
  @IsOptional()
  value?: string | null

  @ApiProperty({ enum: SettingType, default: SettingType.TEXT })
  @IsEnum(SettingType)
  @IsOptional()
  type?: SettingType

  @ApiProperty({ enum: SettingGroup, default: SettingGroup.GENERAL })
  @IsEnum(SettingGroup)
  @IsOptional()
  group?: SettingGroup
}
