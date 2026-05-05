import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator'

export class CreateContactDto {
  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString()
  @MaxLength(150)
  fullName: string

  @ApiProperty({ example: 'nguyen@example.com' })
  @IsEmail()
  email: string

  @ApiProperty({ example: '0901234567', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string

  @ApiProperty({ example: 'Hỏi về dịch vụ' })
  @IsString()
  @MaxLength(255)
  subject: string

  @ApiProperty({ example: 'Tôi muốn biết thêm về...' })
  @IsString()
  message: string
}
