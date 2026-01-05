import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { pick } from 'lodash'
import z from 'zod'
import { commonValidations } from '~/utils/schema.helper'

extendZodWithOpenApi(z)

export const createUserSchema = z
  .object({
    email: z.email(),
    username: z.string().min(1).max(10).trim(),
    giveName: z.string().min(1).max(50).trim(),
    password: z.string().min(6).max(25).trim(),
    phone: z.string().length(10).optional(),
  })
  .strict()
  .strip()

export const updateUserSchema = createUserSchema.partial().strict().strip()

export const userSchema = z
  .object(pick(commonValidations, ['id', 'createdAt', 'updatedAt']))
  .extend(createUserSchema.shape)

export type User = z.infer<typeof userSchema>
