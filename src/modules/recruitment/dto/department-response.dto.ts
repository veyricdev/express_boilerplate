import { ApiProperty } from '@nestjs/swagger'

export class DepartmentResponseDto {
  @ApiProperty() id: number
  @ApiProperty() name: string
  @ApiProperty({ nullable: true }) description: string | null
  @ApiProperty() isActive: boolean
  @ApiProperty() createdAt: Date
  @ApiProperty() updatedAt: Date
}
