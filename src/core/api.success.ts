import type { Response } from 'express'
import { StatusCodes } from 'http-status-codes'

class ApiSuccess<T> {
  message: string
  code: number
  data?: T | null

  constructor({
    message,
    code = StatusCodes.OK,
    reasonStatusCode = StatusCodes[StatusCodes.OK],
    data = null,
  }: {
    message?: string
    code?: number
    reasonStatusCode?: string
    data?: T | null
  }) {
    this.message = !message ? reasonStatusCode : message
    this.code = code
    this.data = data
  }

  send(res: Response) {
    return res.status(this.code).json(this)
  }
}

export default ApiSuccess
