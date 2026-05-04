import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator'

export class BulkUpdateSettingDto {
  @ApiProperty({ example: 'site_name' })
  @IsString()
  @IsNotEmpty()
  key: string

  @ApiProperty({ example: 'My Website', nullable: true })
  @IsOptional()
  @IsString()
  value?: string | null
}

export class BulkUpdateSettingsDto {
  @ApiProperty({ type: [BulkUpdateSettingDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUpdateSettingDto)
  settings: BulkUpdateSettingDto[]
}
