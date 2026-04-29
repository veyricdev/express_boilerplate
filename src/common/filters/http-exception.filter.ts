import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { LoggerService } from '../logger/logger.service'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<FastifyReply>()
    const request = ctx.getRequest<FastifyRequest>()

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : 'Internal server error'

    const message =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as any).message || (exceptionResponse as any).error || JSON.stringify(exceptionResponse)
        : exceptionResponse

    // Log the exception details to the file
    this.logError(exception, request, status)

    // Simplified response for the user
    response.status(status).send({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: status === HttpStatus.INTERNAL_SERVER_ERROR ? 'Internal server error' : message,
      data: null,
    })
  }

  private logError(exception: unknown, request: FastifyRequest, status: number) {
    const { method, url, body, query, headers } = request
    const userAgent = headers['user-agent']
    const ip = request.ip

    const logMessage = `[${method}] ${url} - Status: ${status} - IP: ${ip} - UA: ${userAgent}`
    const stack = exception instanceof Error ? exception.stack : JSON.stringify(exception)

    const details = {
      body,
      query,
      exception: exception instanceof Error ? exception.message : exception,
    }

    this.logger.error(`${logMessage} - Details: ${JSON.stringify(details)}`, stack || 'No stack trace')
  }
}
