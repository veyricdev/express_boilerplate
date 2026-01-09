import type { CorsOptions } from 'cors'
import { StatusCodes } from 'http-status-codes'

import ApiError from '~/core/api.error'
import { env } from './env'

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || !env.isProduction) return callback(null, true)

    // check domain is in whitelist domain
    if (env.CORS_ORIGIN.split(',').filter(Boolean).includes(origin)) return callback(null, true)

    // If the domain is not accepted, an error is returned
    return callback(new ApiError(`${origin} not allowed by our CORS Policy.`, StatusCodes.FORBIDDEN))
  },

  // Some legacy browsers (IE11, various SmartTVs) choke on 204
  optionsSuccessStatus: StatusCodes.OK,

  // CORS will allow receiving cookies from requests, (Tease :D | In the MERN Stack Advance advanced direct learning course, I will guide you to attach jwt access token and refresh token to httpOnly Cookies)
  credentials: true,
}
