import { ApiProperty } from '@nestjs/swagger'

export class UserResponseDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  email: string

  @ApiProperty()
  fullName: string

  @ApiProperty({ type: 'string', example: '127' })
  permissions: string

  @ApiProperty()
  isActive: boolean

  @ApiProperty()
  lastLoginAt?: Date

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
