import { StatusCodes } from 'http-status-codes'
import pinoHttp from 'pino-http'
import { logger } from '~/configs/logger'

export const getLogLevel = (status: number) => {
  if (status >= StatusCodes.INTERNAL_SERVER_ERROR) return 'error'
  if (status >= StatusCodes.BAD_REQUEST) return 'warn'
  return 'info'
}

const requestLogger = pinoHttp({
  logger,
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
