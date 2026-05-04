import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator'

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  fullName?: string

  @ApiPropertyOptional({ example: 'password123', minLength: 6 })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @ApiPropertyOptional({ example: '1024', description: 'Permissions as a stringified BigInt' })
  @IsOptional()
  @IsString()
  permissions?: string
}
