import { ReasonPhrases, StatusCodes } from 'http-status-codes'

export default class ApiError extends Error {
  code: number
  constructor(message: string, code = StatusCodes.INTERNAL_SERVER_ERROR) {
    super(message)

    Object.setPrototypeOf(this, new.target.prototype)
    this.name = 'ApiError'

    // Assign our http status code here
    this.code = code

    // Record the Stack Trace to facilitate debugging
    Error.captureStackTrace(this, this.constructor)
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string = ReasonPhrases.BAD_REQUEST, code = StatusCodes.BAD_REQUEST) {
    super(message, code)
  }
}

export class Api404Error extends ApiError {
  constructor(message: string = ReasonPhrases.NOT_FOUND, code = StatusCodes.NOT_FOUND) {
    super(message, code)
  }
}

export class BusinessLogicError extends ApiError {
  constructor(message: string = ReasonPhrases.INTERNAL_SERVER_ERROR, code = StatusCodes.INTERNAL_SERVER_ERROR) {
    super(message, code)
  }
}
