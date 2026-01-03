import type { NextFunction, Request, Response } from 'express'
import { Api404Error, BusinessLogicError } from '~/core/api.error'

const ErrorsController = {
  get404(_req: Request, _res: Response, _next: NextFunction) {
    throw new Api404Error('Page Not Found!')
  },

  get500: async (_req: Request, _res: Response, _next: NextFunction) => {
    throw new BusinessLogicError('Server Error!')
  },
}

export default ErrorsController
