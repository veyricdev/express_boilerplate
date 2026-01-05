import type { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { env } from '~/configs/env'
import { logger } from '~/configs/logger'
import bot from '~/configs/telegraf'
import ApiError from '~/core/api.error'
import { Prisma } from '~/prisma/generated/prisma/client'

export default function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  const statusCode = err instanceof ApiError ? err.code : StatusCodes.INTERNAL_SERVER_ERROR

  let message = err.message || err
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') message = 'A record with this value already exists'
    if (err.code === 'P2025') message = 'Record not found'
  }

  if (err instanceof Prisma.PrismaClientValidationError) message = 'Validation error'

  const data = {
    code: statusCode,
    message: message,
  }

  if (env.TELE_BOT_TOKEN && env.TELE_CHAT_ID) {
    bot.telegram
      .sendMessage(
        env.TELE_CHAT_ID,
        `
							[${env.NODE_ENV.toUpperCase()}] ${env.APP_NAME}
							Error:
								code: \`${statusCode}\`
								message: \`${err.message}\`
								stack:
									\`\`\`
										${err.stack}
									\`\`\`
						`,
        {
          parse_mode: 'MarkdownV2',
        }
      )
      .catch((err) => {
        logger.error(err)
      })
  }

  logger.error(err)
  res.status(statusCode).json(data)
}
