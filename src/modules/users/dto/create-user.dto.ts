import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator'

const VN_PHONE_REGEX = /(0[3|5|7|8|9])+([0-9]{8})\b/

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty({ example: 'johndoe', description: 'Unique username for login' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  username: string

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullName: string

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string

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
