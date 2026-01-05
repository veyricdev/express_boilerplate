import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import z from 'zod'

extendZodWithOpenApi(z)

export const commonValidations = {
  id: z.coerce.number().int().positive(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().optional(),
  withTrashed: z.stringbool().optional(),
  limit: z.coerce.number().int().positive().optional().default(10),
  page: z.coerce.number().int().positive().optional().default(1),
  // ... other common validations
} as const

export const paramsWithIdSchema = z.object({
  id: commonValidations.id,
})
