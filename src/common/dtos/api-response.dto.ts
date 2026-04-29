import { ApiProperty } from '@nestjs/swagger'

export class ApiResponseDto<T> {
  @ApiProperty({ example: 200 })
  statusCode: number

  @ApiProperty({ example: '2026-04-29T07:07:55Z' })
  timestamp: string

  @ApiProperty({ example: '/api/v1/resource' })
  path: string

  @ApiProperty({ example: 'Success' })
  message: string

  @ApiProperty()
  data: T
}
