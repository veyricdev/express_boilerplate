import type { Request, Response } from 'express'
import ApiSuccess from '~/core/api.success'
import { userService } from './user.service'

class UserController {
  async index(_req: Request, res: Response) {
    return new ApiSuccess({ data: await userService.findAll(res.locals.data) }).send(res)
  }

  async show(_req: Request, res: Response) {
    return new ApiSuccess({ data: await userService.findById(res.locals.data.id, res.locals.data.withTrashed) }).send(
      res
    )
  }

  async createOrUpdate(_req: Request, res: Response) {
    return new ApiSuccess({ data: await userService.createOrUpdate(res.locals.data) }).send(res)
  }

  async delete(_req: Request, res: Response) {
    return new ApiSuccess({ data: await userService.delete(res.locals.data.id) }).send(res)
  }

  async destroy(_req: Request, res: Response) {
    return new ApiSuccess({ data: await userService.destroy(res.locals.data.id) }).send(res)
  }

  async restore(_req: Request, res: Response) {
    return new ApiSuccess({ data: await userService.restore(res.locals.data.id) }).send(res)
  }
}

export const userController = new UserController()
