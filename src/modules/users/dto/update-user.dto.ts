import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator'

const VN_PHONE_REGEX = /(0[3|5|7|8|9])+([0-9]{8})\b/

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional({ example: 'johndoe', description: 'Unique username for login' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username?: string

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  fullName?: string

  @ApiPropertyOptional({ example: 'password123', minLength: 6 })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string

  @ApiPropertyOptional({ example: '0912345678', description: 'Vietnam phone number' })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.phone && o.phone !== '')
  @Matches(VN_PHONE_REGEX, { message: 'Phone must be a valid Vietnam number (e.g. 0912345678)' })
  phone?: string

  @ApiPropertyOptional({ example: '123 Nguyen Hue, Q1, HCM' })
  @IsOptional()
  @IsString()
  address?: string

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @ApiPropertyOptional({ example: '1024', description: 'Permissions as a stringified BigInt' })
  @IsOptional()
  @IsString()
  permissions?: string
}
