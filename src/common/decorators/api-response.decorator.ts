import { applyDecorators, type HttpStatus, type Type } from '@nestjs/common'
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { ApiResponseDto } from '../dtos/api-response.dto'

export const ApiWrappedResponse = <TModel extends Type<any>>(
  model: TModel,
  options: {
    status?: HttpStatus
    description?: string
    isArray?: boolean
  } = {}
) => {
  const { status = 200, description, isArray = false } = options

  return applyDecorators(
    ApiExtraModels(ApiResponseDto, model),
    ApiResponse({
      status,
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              data: isArray
                ? {
                    type: 'array',
                    items: { $ref: getSchemaPath(model) },
                  }
                : { $ref: getSchemaPath(model) },
            },
          },
        ],
      },
    })
  )
}
