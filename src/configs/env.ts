import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  APP_NAME: z.string().min(1).default('Express Boilerplate'),

  APP_URL: z.url().default('http://localhost:6606'),

  NODE_ENV: z.enum(['dev', 'prod', 'test']).default('dev'),

  HOST: z.string().min(1).default('localhost'),

  DATABASE_URL: z.string().min(1).default('postgresql://user:password@localhost:5432/mydb?schema=public'),
  REDIS_URL: z.string().min(1).default('localhost:6379'),

  JWT_ACCESS_SECRET: z.string().min(1).default('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: z.string().min(1).default('JWT_REFRESH_SECRET'),

  PORT: z.coerce.number().int().positive().default(6606),

  CORS_ORIGIN: z.url().default('http://localhost:6606'),

  COMMON_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(1000),

  COMMON_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(1000),

  TELE_BOT_TOKEN: z.string().default(''),

  TELE_CHAT_ID: z.string().default(''),

  DEBUG_CONSOLE: z.stringbool().default(true),

  DEBUG_FILE: z.stringbool().default(false),

  GOOGLE_CLIENT_ID: z.string().default(''),
  GOOGLE_CLIENT_SECRET: z.string().default(''),
  FACEBOOK_APP_ID: z.string().default(''),
  FACEBOOK_APP_SECRET: z.string().default(''),
  GITHUB_CLIENT_ID: z.string().default(''),
  GITHUB_CLIENT_SECRET: z.string().default(''),
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
