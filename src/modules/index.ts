import type { Express } from 'express'
import baseRouter from './base/base.routes'
import errorRouter from './error/error.routes'

export const router = (app: Express) => {
  app.use(baseRouter.PATH, baseRouter.router)
  app.use(errorRouter.PATH, errorRouter.router)
}

export default router
