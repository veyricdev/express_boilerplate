import { z } from 'zod'

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),

  // Database
  DATABASE_HOST: z.string().default('localhost'),
  DATABASE_PORT: z.coerce.number().default(3306),
  DATABASE_USER: z.string(),
  DATABASE_PASSWORD: z.string().optional().default(''),
  DATABASE_NAME: z.string(),
  DATABASE_URL: z.string(),

  // Auth
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('3600s'),
  JWT_REFRESH_SECRET: z.string(),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Security
  CORS_ORIGINS: z.string().optional().default('*'),

  // Cache (optional Redis — falls back to in-memory)
  REDIS_URL: z.string().url().optional(),
})

export type Env = z.infer<typeof envSchema>

export function validate(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config)

  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.format())
    throw new Error('Invalid environment variables')
  }

  return result.data
}
