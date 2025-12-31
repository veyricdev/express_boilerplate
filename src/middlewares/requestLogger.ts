import path from 'node:path'
import { StatusCodes } from 'http-status-codes'
import pino, { type TransportTargetOptions } from 'pino'
import pinoHttp from 'pino-http'
import { env } from '~/configs/env'

const getLogLevel = (status: number) => {
  if (status >= StatusCodes.INTERNAL_SERVER_ERROR) return 'error'
  if (status >= StatusCodes.BAD_REQUEST) return 'warn'
  return 'info'
}

const requestLogger = pinoHttp({
  logger: pino({
    level: env.isProduction ? 'info' : 'debug',
    timestamp: pino.stdTimeFunctions.isoTime,
    transport: env.isProduction
      ? undefined
      : {
          targets: [
            env.DEBUG_FILE
              ? {
                  target: 'pino-roll',
                  options: {
                    file: path.join(__dirname, '..', 'logs/date/app'),
                    frequency: 'daily',
                    mkdir: true,
                    dateFormat: 'yyyy-MM-dd',
                  },
                }
              : undefined,
            env.DEBUG_CONSOLE
              ? {
                  target: 'pino-pretty',
                }
              : undefined,
          ].filter(Boolean) as TransportTargetOptions<Record<string, any>>[],
        },
  }),
  genReqId: (req, res) => {
    const existingID = req.id ?? req.headers['x-request-id']
    if (existingID) return existingID
    const id = crypto.randomUUID()
    res.setHeader('X-Request-Id', id)
    return id
  },
  customLogLevel: (_req, res) => getLogLevel(res.statusCode),
  customSuccessMessage: (req, res) => `${req.method} ${res.statusCode} ${req.url} completed`,
  customErrorMessage: (_req, res) => `Request failed with status code: ${res.statusCode}`,
  customAttributeKeys: {
    req: 'request',
    res: 'response',
    err: 'error',
  },
  // Define custom serializers
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      id: req.id,
    }),
  },
})

export default requestLogger
