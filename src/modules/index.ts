import type { Express } from 'express'
import baseRouter from './base/base.routes'
import errorRouter from './error/error.routes'
import userRouter from './user/user.routes'

export const router = (app: Express) => {
  app.use(baseRouter.PATH, baseRouter.router)
  app.use(userRouter.PATH, userRouter.router)
  app.use(errorRouter.PATH, errorRouter.router)
}

export default router
