import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import z from 'zod'

extendZodWithOpenApi(z)

export const commonValidations = {
  id: z.coerce.number().int().positive(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  // ... other common validations
}

export const paramsWithIdSchema = z.object({
  id: commonValidations.id,
})
