import { StatusCodes } from 'http-status-codes'
import z from 'zod'

export const ApiSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    message: z.string(),
    data: dataSchema.optional(),
    code: z.number(),
  })

export function createApiResponse(schema: z.ZodTypeAny, description: string, statusCode = StatusCodes.OK) {
  return {
    [statusCode]: {
      description,
      content: {
        'application/json': {
          schema: ApiSchema(schema),
        },
      },
    },
  }
}
