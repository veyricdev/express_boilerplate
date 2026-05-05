import { ApiProperty } from '@nestjs/swagger'

export class ContactResponseDto {
  @ApiProperty() id: number
  @ApiProperty() fullName: string
  @ApiProperty() email: string
  @ApiProperty({ nullable: true }) phone: string | null
  @ApiProperty() subject: string
  @ApiProperty() message: string
  @ApiProperty() isRead: boolean
  @ApiProperty() createdAt: Date
  @ApiProperty() updatedAt: Date
}
