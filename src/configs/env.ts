import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  APP_NAME: z.string().min(1).default('Express Boilerplate'),

  NODE_ENV: z.enum(['dev', 'prod', 'test']).default('dev'),

  HOST: z.string().min(1).default('localhost'),

  PORT: z.coerce.number().int().positive().default(6606),

  CORS_ORIGIN: z.url().default('http://localhost:6606'),

  COMMON_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(1000),

  COMMON_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(1000),

  TELE_BOT_TOKEN: z.string().default(''),

  TELE_CHAT_ID: z.string().default(''),

  DEBUG_CONSOLE: z.stringbool().default(true),

  DEBUG_FILE: z.stringbool().default(false),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format())
  throw new Error('Invalid environment variables')
}

export const env = {
  ...parsedEnv.data,
  isDevelopment: parsedEnv.data.NODE_ENV === 'dev',
  isProduction: parsedEnv.data.NODE_ENV === 'prod',
  isTest: parsedEnv.data.NODE_ENV === 'test',
}
