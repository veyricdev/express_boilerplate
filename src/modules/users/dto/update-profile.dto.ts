import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator'

const VN_PHONE_REGEX = /(0[3|5|7|8|9])+([0-9]{8})\b/

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional({ example: 'johndoe' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username?: string

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  fullName?: string

  @ApiPropertyOptional({ example: '0912345678' })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.phone && o.phone !== '')
  @Matches(VN_PHONE_REGEX, { message: 'Phone must be a valid Vietnam number' })
  phone?: string

  @ApiPropertyOptional({ example: '123 Nguyen Hue, Q1, HCM' })
  @IsOptional()
  @IsString()
  address?: string
}
