import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class LoginDto {
  @ApiProperty({ example: 'admin@cms.com', description: 'Email hoặc Username' })
  @IsString()
  @IsNotEmpty()
  identifier: string

  @ApiProperty({ example: 'Admin@123' })
  @IsString()
  password: string
}
