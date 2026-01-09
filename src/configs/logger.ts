import path from 'node:path'
import pino, { type TransportTargetOptions } from 'pino'
import { env } from './env'

export const logger = pino({
  level: env.isProduction ? 'info' : 'debug',
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: {
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
})
