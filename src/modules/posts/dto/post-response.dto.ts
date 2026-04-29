import { ApiProperty } from '@nestjs/swagger'

export class PostResponseDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  title: string

  @ApiProperty()
  slug: string

  @ApiProperty({ required: false })
  content?: string

  @ApiProperty({ required: false })
  excerpt?: string

  @ApiProperty({ required: false })
  coverImage?: string

  @ApiProperty()
  authorId: number

  @ApiProperty()
  categoryId: number

  @ApiProperty()
  status: string

  @ApiProperty()
  isFeatured: boolean

  @ApiProperty({ required: false })
  publishedAt?: Date

  @ApiProperty({ required: false })
  deletedAt?: Date

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
