import type { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

class IndexController {
  public ping(_req: Request, res: Response) {
    return res.status(StatusCodes.OK).send('pong!')
  }
}

export const indexController = new IndexController()
