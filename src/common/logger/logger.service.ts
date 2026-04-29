import { join } from 'node:path'
import { Injectable, type LoggerService as NestLoggerService } from '@nestjs/common'
import * as winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger

  constructor() {
    const logDir = join(process.cwd(), 'logs')

    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf((info) => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`)
    )

    this.logger = winston.createLogger({
      format: logFormat,
      transports: [
        // Console logging
        new winston.transports.Console({
          format: winston.format.combine(winston.format.colorize(), logFormat),
        }),
        // Daily rotate file for errors
        new DailyRotateFile({
          dirname: logDir,
          filename: 'error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxFiles: '30d',
          zippedArchive: true,
        }),
        // Daily rotate file for all logs
        new DailyRotateFile({
          dirname: logDir,
          filename: 'combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxFiles: '30d',
          zippedArchive: true,
        }),
      ],
    })
  }

  log(message: string) {
    this.logger.info(message)
  }

  error(message: string, trace: string) {
    this.logger.error(`${message} -> ${trace}`)
  }

  warn(message: string) {
    this.logger.warn(message)
  }

  debug(message: string) {
    this.logger.debug(message)
  }

  verbose(message: string) {
    this.logger.verbose(message)
  }
}
