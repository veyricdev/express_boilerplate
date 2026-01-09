import type { NextFunction, Request, Response } from 'express'
import { Api404Error, BusinessLogicError } from '~/core/api.error'

class ErrorController {
  get404(_req: Request, _res: Response, _next: NextFunction) {
    throw new Api404Error('Page Not Found!')
  }

  async get500(_req: Request, _res: Response, _next: NextFunction) {
    throw new BusinessLogicError('Server Error!')
  }
}

export const errorController = new ErrorController()
