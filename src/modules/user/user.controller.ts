import type { Request, Response } from 'express'
import ApiSuccess from '~/core/api.success'

class UserController {
  index(_req: Request, res: Response) {
    return new ApiSuccess({ data: res.locals.data }).send(res)
  }

  createOrUpdate(_req: Request, res: Response) {
    return new ApiSuccess({ data: res.locals.data }).send(res)
  }

  destroy(_req: Request, res: Response) {
    return new ApiSuccess({ data: res.locals.data }).send(res)
  }
}

export const userController = new UserController()
