import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator'

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Kỹ thuật' })
  @IsString()
  @MaxLength(150)
  name: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ default: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
