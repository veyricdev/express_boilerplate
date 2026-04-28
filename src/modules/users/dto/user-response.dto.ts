import { ApiProperty } from '@nestjs/swagger'
import { Role } from '~/prisma/generated/prisma/client'

export class UserResponseDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  email: string

  @ApiProperty()
  fullName: string

  @ApiProperty({ enum: Role })
  role: Role

  @ApiProperty()
  isActive: boolean

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
