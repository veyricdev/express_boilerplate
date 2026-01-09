import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import z from 'zod'
import { hashPassword } from '~/utils/helper'

extendZodWithOpenApi(z)

export const registerSchema = z
  .object({
    email: z.email(),
    username: z.string().min(1).max(10).trim(),
    giveName: z.string().min(1).max(50).trim(),
    password: z
      .string()
      .min(6)
      .max(25)
      .trim()
      .transform((value) => hashPassword(value)),
    phone: z.string().length(10).optional(),
    bio: z.string().length(300).optional(),
  })
  .strict()
  .strip()

export const loginSchema = z
  .object({
    username: z.string().trim().nonempty(),
    password: z.string().trim().nonempty(),
  })
  .strict()
  .strip()

export type RegisterType = z.infer<typeof registerSchema>
export type LoginType = z.infer<typeof loginSchema>
