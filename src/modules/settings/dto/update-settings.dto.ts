import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

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
