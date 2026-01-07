import { env } from './env'

const encoder = new TextEncoder()

export const jwtSecret = {
  access: encoder.encode(env.JWT_ACCESS_SECRET!),
  refresh: encoder.encode(env.JWT_REFRESH_SECRET!),
}
