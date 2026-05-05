import { ApiProperty } from '@nestjs/swagger'
import { IsString, MinLength } from 'class-validator'

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPass@123' })
  @IsString()
  oldPassword: string

  @ApiProperty({ example: 'NewPass@123', minLength: 6 })
  @IsString()
  @MinLength(6)
  newPassword: string
}
